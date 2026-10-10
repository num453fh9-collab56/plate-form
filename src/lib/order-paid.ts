import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyUser } from "./notify";

/* Server-only: everything that happens once Stripe confirms payment. Called
   from both the webhook and the return-page confirm route; only the call that
   actually flips the order from pending → paid runs the side effects, so it
   is safe if both fire. */
export async function markOrderPaid(
  admin: SupabaseClient,
  orderId: string,
  payment: { paymentIntent: string | null; amountTotal: number | null },
): Promise<boolean> {
  const { data: flipped } = await admin
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent: payment.paymentIntent,
      ...(payment.amountTotal != null ? { amount: payment.amountTotal / 100 } : {}),
    })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("id, buyer_id, seller_id, amount, offer_id, proposal_id")
    .maybeSingle();
  if (!flipped) return false;

  const order = flipped as {
    id: string;
    buyer_id: string;
    seller_id: string | null;
    amount: number;
    offer_id: string | null;
    proposal_id: string | null;
  };

  if (order.offer_id) {
    const { data: offer } = await admin
      .from("offers")
      .update({ status: "accepted", order_id: order.id })
      .eq("id", order.offer_id)
      .select("milestones")
      .maybeSingle();
    const milestones = (offer as { milestones?: { title: string; amount: number; days: number }[] } | null)
      ?.milestones;
    if (Array.isArray(milestones) && milestones.length > 0) {
      await admin.from("order_milestones").insert(
        milestones.map((m, position) => ({
          order_id: order.id,
          position,
          title: String(m.title).slice(0, 200),
          amount: Number(m.amount) || 0,
          days: Math.max(1, Number(m.days) || 1),
        })),
      );
    }
  }

  if (order.proposal_id) {
    const { data: proposal } = await admin
      .from("proposals")
      .update({ status: "hired" })
      .eq("id", order.proposal_id)
      .select("job_id")
      .maybeSingle();
    const jobId = (proposal as { job_id?: string } | null)?.job_id;
    if (jobId) await admin.from("job_posts").update({ status: "hired" }).eq("id", jobId);
  }

  await Promise.all([
    notifyUser(admin, order.buyer_id, "Payment confirmed", "Your order is confirmed. The seller will start soon.", `/orders/${order.id}`),
    notifyUser(admin, order.seller_id, "New paid order", `You received a paid order ($${order.amount}). Please review the requirements and deliver on time.`, `/orders/${order.id}`),
  ]);
  return true;
}
