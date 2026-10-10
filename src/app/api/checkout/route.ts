import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getAdminSupabase,
  getStripe,
  getUserFromRequest,
} from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";
import { PACKAGE_KEYS, quoteOrder } from "@/lib/gig-model";
import type { GigExtra, GigPackage, PackageKey } from "@/lib/types";

export const runtime = "nodejs";

/* One checkout for three ways to buy: a gig package, a seller's custom offer
   (from chat) or a proposal on the buyer's own request. The price is always
   read from the database — never from the browser. */

interface CheckoutBody {
  gigId?: string;
  offerId?: string;
  proposalId?: string;
  requirements?: string;
  packageKey?: string;
  extras?: string[];
}

interface Purchase {
  title: string;
  description: string;
  total: number;
  days: number;
  sellerId: string | null;
  gigId: string | null;
  cancelPath: string;
  order: Record<string, unknown>;
}

type Resolved = Purchase | { error: string; status: number };

async function fromGig(admin: SupabaseClient, userId: string, body: CheckoutBody): Promise<Resolved> {
  const { data: gig } = await admin
    .from("gigs")
    .select("id, title, price, delivery_days, seller_id, status, packages, extras")
    .eq("id", body.gigId)
    .maybeSingle();
  if (!gig) return { error: "Gig not found.", status: 404 };
  if (gig.seller_id && gig.seller_id === userId) return { error: "You cannot order your own gig.", status: 400 };
  if (gig.status && gig.status !== "published") return { error: "This gig is not taking orders right now.", status: 400 };

  const packages = (gig.packages ?? undefined) as Partial<Record<PackageKey, GigPackage>> | undefined;
  const requestedKey = PACKAGE_KEYS.find((key) => key === body.packageKey) ?? null;
  const packageKey = requestedKey && Number(packages?.[requestedKey]?.price) > 0 ? requestedKey : null;
  const gigExtras = (Array.isArray(gig.extras) ? gig.extras : []) as GigExtra[];
  const extraLabels = (Array.isArray(body.extras) ? body.extras : []).filter((label) =>
    gigExtras.some((extra) => extra.label === label),
  );
  const quote = quoteOrder(
    { price: Number(gig.price), packages, extras: gigExtras, delivery: String(gig.delivery_days ?? 1) },
    packageKey,
    extraLabels,
  );
  const packageName = packageKey ? packages?.[packageKey]?.name || packageKey : null;
  return {
    title: gig.title,
    description: [
      packageName ? `${packageName} package` : null,
      extraLabels.length ? `Extras: ${extraLabels.join(", ")}` : null,
      `${quote.days}-day delivery`,
    ]
      .filter(Boolean)
      .join(" · "),
    total: quote.total,
    days: quote.days,
    sellerId: gig.seller_id ?? null,
    gigId: gig.id,
    cancelPath: `/gig/${gig.id}?canceled=1`,
    order: {
      package_key: packageKey,
      extras: gigExtras.filter((extra) => extraLabels.includes(extra.label)),
    },
  };
}

async function fromOffer(admin: SupabaseClient, userId: string, offerId: string): Promise<Resolved> {
  const { data: offer } = await admin
    .from("offers")
    .select("id, buyer_id, seller_id, gig_id, title, description, amount, delivery_days, revisions, milestones, status, expires_at")
    .eq("id", offerId)
    .maybeSingle();
  if (!offer || offer.buyer_id !== userId) return { error: "Offer not found.", status: 404 };
  if (offer.status !== "pending") return { error: `This offer is ${offer.status}.`, status: 409 };
  if (offer.expires_at && new Date(offer.expires_at).getTime() < Date.now()) {
    await admin.from("offers").update({ status: "expired" }).eq("id", offer.id);
    return { error: "This offer has expired. Ask the seller for a new one.", status: 409 };
  }
  const milestoneCount = Array.isArray(offer.milestones) ? offer.milestones.length : 0;
  return {
    title: offer.title,
    description: [
      "Custom offer",
      milestoneCount ? `${milestoneCount} milestones` : null,
      `${offer.delivery_days}-day delivery`,
    ]
      .filter(Boolean)
      .join(" · "),
    total: Number(offer.amount),
    days: Number(offer.delivery_days) || 1,
    sellerId: offer.seller_id,
    gigId: offer.gig_id ?? null,
    cancelPath: "/orders?canceled=1",
    order: { offer_id: offer.id, requirements: offer.description.slice(0, 4000) },
  };
}

async function fromProposal(admin: SupabaseClient, userId: string, proposalId: string): Promise<Resolved> {
  const { data: proposal } = await admin
    .from("proposals")
    .select("id, job_id, seller_id, amount, delivery_days, status, cover_letter")
    .eq("id", proposalId)
    .maybeSingle();
  if (!proposal) return { error: "Proposal not found.", status: 404 };
  const { data: job } = await admin
    .from("job_posts")
    .select("id, buyer_id, title, description, status")
    .eq("id", proposal.job_id)
    .maybeSingle();
  if (!job || job.buyer_id !== userId) return { error: "Proposal not found.", status: 404 };
  if (job.status !== "open") return { error: "This request is no longer open.", status: 409 };
  if (proposal.status === "declined" || proposal.status === "hired") {
    return { error: `This proposal is ${proposal.status}.`, status: 409 };
  }
  return {
    title: job.title,
    description: `Hired from your request · ${proposal.delivery_days}-day delivery`,
    total: Number(proposal.amount),
    days: Number(proposal.delivery_days) || 1,
    sellerId: proposal.seller_id,
    gigId: null,
    cancelPath: `/requests/${job.id}?canceled=1`,
    order: { proposal_id: proposal.id, requirements: String(job.description).slice(0, 4000) },
  };
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const admin = getAdminSupabase();
  if (!stripe || !admin) {
    return Response.json({ error: "Payments are not configured yet." }, { status: 503 });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Please sign in to place an order." }, { status: 401 });
  }

  const limited = await rateLimit(request, "checkout", 10, 60, user.id);
  if (limited) return limited;

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const resolved = body.offerId
    ? await fromOffer(admin, user.id, body.offerId)
    : body.proposalId
      ? await fromProposal(admin, user.id, body.proposalId)
      : body.gigId
        ? await fromGig(admin, user.id, body)
        : { error: "Nothing to buy.", status: 400 };
  if ("error" in resolved) {
    return Response.json({ error: resolved.error }, { status: resolved.status });
  }
  if (resolved.sellerId === user.id) {
    return Response.json({ error: "You cannot buy from yourself." }, { status: 400 });
  }
  if (!resolved.total || resolved.total < 1) {
    return Response.json({ error: "This item has no price set." }, { status: 400 });
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      gig_id: resolved.gigId,
      buyer_id: user.id,
      seller_id: resolved.sellerId,
      title: resolved.title,
      amount: resolved.total,
      currency: "usd",
      status: "pending",
      requirements: (body.requirements ?? "").slice(0, 4000),
      delivery_days: resolved.days,
      ...resolved.order,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return Response.json({ error: "Could not create the order." }, { status: 500 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(resolved.total * 100),
            product_data: { name: resolved.title, description: resolved.description },
          },
        },
      ],
      success_url: `${origin}/orders?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${resolved.cancelPath}`,
      metadata: { order_id: order.id, buyer_id: user.id, seller_id: resolved.sellerId ?? "" },
    });

    await admin.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);
    return Response.json({ url: session.url, orderId: order.id });
  } catch (error) {
    await admin.from("orders").delete().eq("id", order.id);
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
