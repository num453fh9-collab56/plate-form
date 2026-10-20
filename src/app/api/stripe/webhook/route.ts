import type Stripe from "stripe";
import { getAdminSupabase, getStripe } from "@/lib/stripe-server";

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

    if (session.payment_status === "paid" && session.metadata?.invoice_id) {
      await admin.from("invoices").update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_payment_id: session.id,
        updated_at: new Date().toISOString(),
      }).eq("id", session.metadata.invoice_id);
    }

    if (session.payment_status === "paid" && session.metadata?.type) {
      await admin.from("payments").insert({
        stripe_session_id: session.id,
        amount: session.amount_total,
        currency: session.currency,
        status: "paid",
        metadata: session.metadata,
      });
    }
  }

  return new Response("ok", { status: 200 });
}
