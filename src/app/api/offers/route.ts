import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";
import { notifyUser } from "@/lib/notify";

export const runtime = "nodejs";

/* Custom offers sent inside a conversation.
   create   — seller only; appears as an offer card in the chat
   withdraw — seller, while pending
   decline  — buyer, while pending
   (Accepting = paying: POST /api/checkout { offerId }.) */

interface MilestoneInput {
  title?: string;
  amount?: number;
  days?: number;
}

interface OfferBody {
  action?: "create" | "withdraw" | "decline";
  conversationId?: string;
  offerId?: string;
  title?: string;
  description?: string;
  amount?: number;
  deliveryDays?: number;
  revisions?: number;
  expiresInDays?: number;
  milestones?: MilestoneInput[];
}

const MIN_AMOUNT = 5;
const MAX_AMOUNT = 50000;

export async function POST(request: Request) {
  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Backend not configured." }, { status: 503 });
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Not authenticated." }, { status: 401 });
  const limited = await rateLimit(request, "offers", 20, 60, user.id);
  if (limited) return limited;

  let body: OfferBody;
  try {
    body = (await request.json()) as OfferBody;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.action === "create") {
    const { data: conversation } = await admin
      .from("conversations")
      .select("id, buyer_id, seller_id, gig_id")
      .eq("id", body.conversationId ?? "")
      .maybeSingle();
    if (!conversation) return Response.json({ error: "Conversation not found." }, { status: 404 });
    if (conversation.seller_id !== user.id) {
      return Response.json({ error: "Only the seller in this chat can send offers." }, { status: 403 });
    }

    const title = (body.title ?? "").trim().slice(0, 120);
    if (title.length < 5) return Response.json({ error: "Give the offer a clear title." }, { status: 400 });

    const milestones = (Array.isArray(body.milestones) ? body.milestones : [])
      .map((m) => ({
        title: String(m.title ?? "").trim().slice(0, 120),
        amount: Math.round(Number(m.amount) * 100) / 100,
        days: Math.round(Number(m.days)),
      }))
      .filter((m) => m.title);
    if (milestones.length > 10) return Response.json({ error: "Up to 10 milestones." }, { status: 400 });
    if (milestones.some((m) => !(m.amount >= MIN_AMOUNT) || !(m.days >= 1))) {
      return Response.json({ error: `Each milestone needs at least $${MIN_AMOUNT} and 1 day.` }, { status: 400 });
    }

    // With milestones, the total and timeline are the sum of the parts.
    const amount = milestones.length
      ? milestones.reduce((sum, m) => sum + m.amount, 0)
      : Math.round(Number(body.amount) * 100) / 100;
    const deliveryDays = milestones.length
      ? milestones.reduce((sum, m) => sum + m.days, 0)
      : Math.round(Number(body.deliveryDays));
    if (!(amount >= MIN_AMOUNT) || amount > MAX_AMOUNT) {
      return Response.json({ error: `Offer must be between $${MIN_AMOUNT} and $${MAX_AMOUNT}.` }, { status: 400 });
    }
    if (!(deliveryDays >= 1) || deliveryDays > 365) {
      return Response.json({ error: "Delivery must be 1–365 days." }, { status: 400 });
    }
    const expiresIn = Math.min(14, Math.max(1, Math.round(Number(body.expiresInDays) || 7)));

    const { data: offer, error } = await admin
      .from("offers")
      .insert({
        conversation_id: conversation.id,
        seller_id: conversation.seller_id,
        buyer_id: conversation.buyer_id,
        gig_id: conversation.gig_id,
        title,
        description: (body.description ?? "").trim().slice(0, 2000),
        amount,
        delivery_days: deliveryDays,
        revisions: Math.min(20, Math.max(0, Math.round(Number(body.revisions) || 0))),
        milestones,
        expires_at: new Date(Date.now() + expiresIn * 86400000).toISOString(),
      })
      .select("id")
      .single();
    if (error || !offer) return Response.json({ error: "Could not create the offer." }, { status: 500 });

    await Promise.all([
      admin.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        body: `Custom offer: ${title} — $${amount}`,
        kind: "offer",
        meta: { offer_id: offer.id },
      }),
      admin.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversation.id),
      notifyUser(admin, conversation.buyer_id, "New custom offer", `${title} — $${amount}, ${deliveryDays} days`, "/orders"),
    ]);
    return Response.json({ ok: true, offerId: offer.id });
  }

  if (body.action === "withdraw" || body.action === "decline") {
    const { data: offer } = await admin
      .from("offers")
      .select("id, seller_id, buyer_id, status, title")
      .eq("id", body.offerId ?? "")
      .maybeSingle();
    if (!offer) return Response.json({ error: "Offer not found." }, { status: 404 });
    const allowed = body.action === "withdraw" ? offer.seller_id === user.id : offer.buyer_id === user.id;
    if (!allowed) return Response.json({ error: "Not allowed." }, { status: 403 });
    if (offer.status !== "pending") return Response.json({ error: `This offer is already ${offer.status}.` }, { status: 409 });
    const status = body.action === "withdraw" ? "withdrawn" : "declined";
    await admin.from("offers").update({ status }).eq("id", offer.id).eq("status", "pending");
    if (body.action === "decline") {
      await notifyUser(admin, offer.seller_id, "Offer declined", `The buyer declined "${offer.title}".`, "/orders");
    }
    return Response.json({ ok: true, status });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
