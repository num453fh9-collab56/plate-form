import type Stripe from "stripe";
import { getAdminSupabase, getStripe } from "@/lib/stripe-server";
import { getEmailForUser, sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const admin = getAdminSupabase();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !admin || !secret) {
    return new Response("Webhook not configured", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await admin
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent: session.payment_intent
            ? String(session.payment_intent)
            : null,
          amount: (session.amount_total ?? 0) / 100,
        })
        .eq("id", orderId)
        .eq("status", "pending");
      const { data: order } = await admin
        .from("orders")
        .select("buyer_id, seller_id, amount")
        .eq("id", orderId)
        .maybeSingle();
      if (order) {
        const buyerEmail = await getEmailForUser(admin, order.buyer_id);
        await sendEmail(buyerEmail, "Apex — Payment confirmed", `<p>Your order is confirmed. The seller will deliver soon.</p>`);
        if (order.seller_id) {
          const sellerEmail = await getEmailForUser(admin, order.seller_id);
          await sendEmail(sellerEmail, "Apex — New paid order", `<p>A buyer just paid for your gig. Please review the requirements and deliver on time.</p>`);
          await admin.from("notifications").insert({ user_id: order.seller_id, type: "order", title: "New paid order", body: `You received a paid order ($${order.amount}).`, link: "/dashboard" });
        }
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await admin
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
        .eq("status", "pending");
    }
  }

  return new Response("ok", { status: 200 });
}
