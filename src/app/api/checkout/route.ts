import {
  getAdminSupabase,
  getStripe,
  getUserFromRequest,
} from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";
import { PACKAGE_KEYS, quoteOrder } from "@/lib/gig-model";
import type { GigExtra, GigPackage, PackageKey } from "@/lib/types";

export const runtime = "nodejs";

interface CheckoutBody {
  gigId?: string;
  requirements?: string;
  packageKey?: string;
  extras?: string[];
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const admin = getAdminSupabase();
  if (!stripe || !admin) {
    return Response.json(
      { error: "Payments are not configured yet." },
      { status: 503 },
    );
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

  const gigId = body.gigId;
  if (!gigId) {
    return Response.json({ error: "Missing gig." }, { status: 400 });
  }

  const { data: gig, error: gigError } = await admin
    .from("gigs")
    .select("id, title, price, delivery_days, seller_id, status, packages, extras")
    .eq("id", gigId)
    .maybeSingle();

  if (gigError || !gig) {
    return Response.json({ error: "Gig not found." }, { status: 404 });
  }
  if (gig.seller_id && gig.seller_id === user.id) {
    return Response.json({ error: "You cannot order your own gig." }, { status: 400 });
  }
  if (gig.status && gig.status !== "published") {
    return Response.json({ error: "This gig is not taking orders right now." }, { status: 400 });
  }

  const packages = (gig.packages ?? undefined) as Partial<Record<PackageKey, GigPackage>> | undefined;
  const requestedKey = PACKAGE_KEYS.find((key) => key === body.packageKey) ?? null;
  const packageKey =
    requestedKey && Number(packages?.[requestedKey]?.price) > 0 ? requestedKey : null;
  const gigExtras = (Array.isArray(gig.extras) ? gig.extras : []) as GigExtra[];
  const extraLabels = (Array.isArray(body.extras) ? body.extras : []).filter((label) =>
    gigExtras.some((extra) => extra.label === label),
  );
  const quote = quoteOrder(
    {
      price: Number(gig.price),
      packages,
      extras: gigExtras,
      delivery: String(gig.delivery_days ?? 1),
    },
    packageKey,
    extraLabels,
  );
  if (!quote.total || quote.total <= 0) {
    return Response.json({ error: "This gig has no price set." }, { status: 400 });
  }

  const amount = Math.round(quote.total * 100);
  const packageName = packageKey ? packages?.[packageKey]?.name || packageKey : null;

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      gig_id: gig.id,
      buyer_id: user.id,
      seller_id: gig.seller_id ?? null,
      amount: quote.total,
      currency: "usd",
      status: "pending",
      requirements: (body.requirements ?? "").slice(0, 4000),
      delivery_days: quote.days,
      package_key: packageKey,
      extras: gigExtras.filter((extra) => extraLabels.includes(extra.label)),
    })
    .select("*")
    .single();

  if (orderError || !order) {
    return Response.json({ error: "Could not create the order." }, { status: 500 });
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name: gig.title,
              description: [
                packageName ? `${packageName} package` : null,
                extraLabels.length ? `Extras: ${extraLabels.join(", ")}` : null,
                `${quote.days}-day delivery`,
              ]
                .filter(Boolean)
                .join(" · "),
            },
          },
        },
      ],
      success_url: `${origin}/orders?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/gig/${gig.id}?canceled=1`,
      metadata: { order_id: order.id, buyer_id: user.id, seller_id: gig.seller_id ?? "" },
    });

    await admin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return Response.json({ url: session.url, orderId: order.id });
  } catch (error) {
    await admin.from("orders").delete().eq("id", order.id);
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
