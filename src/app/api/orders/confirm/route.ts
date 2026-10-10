import { getAdminSupabase, getStripe, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";
import { markOrderPaid } from "@/lib/order-paid";

export const runtime = "nodejs";

/**
 * Called when the buyer returns from Stripe Checkout. Verifies the session
 * directly with Stripe and marks the order paid. This complements the webhook
 * so local testing works without Stripe CLI.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const admin = getAdminSupabase();
  if (!stripe || !admin) {
    return Response.json({ error: "Payments are not configured." }, { status: 503 });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const limited = await rateLimit(request, "order-confirm", 20, 60, user.id);
  if (limited) return limited;

  let sessionId = "";
  try {
    const body = (await request.json()) as { sessionId?: string };
    sessionId = body.sessionId ?? "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!sessionId) {
    return Response.json({ error: "Missing session." }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = session.metadata?.order_id;
  if (!orderId || session.metadata?.buyer_id !== user.id) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  if (session.payment_status === "paid") {
    await markOrderPaid(admin, orderId, {
      paymentIntent: session.payment_intent ? String(session.payment_intent) : null,
      amountTotal: session.amount_total ?? null,
    });
    return Response.json({ ok: true, status: "paid" });
  }

  return Response.json({ ok: true, status: session.payment_status });
}
