import { getAdminSupabase, getStripe, getUserFromRequest } from "@/lib/stripe-server";

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
    await admin
      .from("orders")
      .update({
        status: "paid",
        stripe_payment_intent: session.payment_intent ? String(session.payment_intent) : null,
        amount: (session.amount_total ?? 0) / 100,
      })
      .eq("id", orderId)
      .in("status", ["pending", "paid"]);
    const { data: order } = await admin
      .from("orders")
      .select("buyer_id, seller_id, amount")
      .eq("id", orderId)
      .maybeSingle();
    if (order) {
      const { getEmailForUser, sendEmail } = await import("@/lib/email");
      const buyerEmail = await getEmailForUser(admin, order.buyer_id);
      await sendEmail(buyerEmail, "Hirelyx — Payment confirmed", `<p>Your order is confirmed. The seller will deliver soon.</p>`);
      if (order.seller_id) {
        const sellerEmail = await getEmailForUser(admin, order.seller_id);
        await sendEmail(sellerEmail, "Hirelyx — New paid order", `<p>A buyer just paid ($${order.amount}). Please deliver on time.</p>`);
        await admin.from("notifications").insert({ user_id: order.seller_id, type: "order", title: "New paid order", body: `You received a paid order ($${order.amount}).`, link: "/dashboard" });
      }
    }
    return Response.json({ ok: true, status: "paid" });
  }

  return Response.json({ ok: true, status: session.payment_status });
}
