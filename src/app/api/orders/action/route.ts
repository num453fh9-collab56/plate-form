import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminSupabase, getStripe, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";
import { notifyUser } from "@/lib/notify";
import { releasePayout } from "@/lib/payouts";

export const runtime = "nodejs";

/* Order lifecycle (all state changes are validated here, server-side):
   pending → paid → delivered ⇄ revision → completed
   milestone orders: each milestone pending → delivered → approved
   any paid state → disputed (resolved by an admin, see /api/disputes)

   Cancelling: the seller may cancel (full refund) any time before completion.
   The buyer may cancel an unpaid order, or a paid one only once it is past its
   due date and not yet delivered — otherwise they must open a dispute. This
   stops buyers from taking the work and refunding themselves. */

const ACTIONS = [
  "deliver",
  "accept",
  "revision",
  "cancel",
  "deliver-milestone",
  "approve-milestone",
  "open-dispute",
] as const;
type Action = (typeof ACTIONS)[number];

interface OrderRow {
  id: string;
  buyer_id: string;
  seller_id: string | null;
  status: string;
  revision_count: number | null;
  amount: number | null;
  currency: string | null;
  stripe_payment_intent: string | null;
  paid_at: string | null;
  delivery_days: number | null;
  title: string | null;
}

interface MilestoneRow {
  id: string;
  position: number;
  title: string;
  amount: number;
  status: string;
}

const DISPUTE_REASONS = [
  "not_delivered",
  "poor_quality",
  "not_as_described",
  "buyer_unresponsive",
  "other",
];

async function notifyAdmins(admin: SupabaseClient, title: string, body: string, link: string) {
  const { data } = await admin.from("admins").select("user_id");
  await Promise.all((data ?? []).map((row) => notifyUser(admin, row.user_id as string, title, body, link)));
}

export async function POST(request: Request) {
  const admin = getAdminSupabase();
  if (!admin) {
    return Response.json({ error: "Backend not configured." }, { status: 503 });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const limited = await rateLimit(request, "order-action", 30, 60, user.id);
  if (limited) return limited;

  let body: { orderId?: string; action?: Action; note?: string; milestoneId?: string; reason?: string } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { orderId, action } = body;
  const note = (body.note ?? "").toString().slice(0, 2000);
  if (!orderId || !action || !ACTIONS.includes(action)) {
    return Response.json({ error: "Missing fields." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("orders")
    .select("id, buyer_id, seller_id, status, revision_count, amount, currency, stripe_payment_intent, paid_at, delivery_days, title")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  const order = data as OrderRow;
  const isBuyer = order.buyer_id === user.id;
  const isSeller = order.seller_id === user.id;
  if (!isBuyer && !isSeller) return Response.json({ error: "Not your order." }, { status: 403 });
  if (order.status === "disputed" && action !== "open-dispute") {
    return Response.json({ error: "This order is under dispute. An admin will resolve it." }, { status: 409 });
  }

  const link = `/orders/${order.id}`;
  const label = order.title ? `"${order.title}"` : "your order";

  const { data: milestoneData } = await admin
    .from("order_milestones")
    .select("id, position, title, amount, status")
    .eq("order_id", order.id)
    .order("position");
  const milestones = (milestoneData ?? []) as MilestoneRow[];
  const hasMilestones = milestones.length > 0;

  if (action === "deliver") {
    if (!isSeller) return Response.json({ error: "Only the seller can deliver." }, { status: 403 });
    if (hasMilestones) return Response.json({ error: "Deliver this order milestone by milestone." }, { status: 409 });
    if (order.status !== "paid" && order.status !== "revision") {
      return Response.json({ error: `Cannot deliver while status is "${order.status}".` }, { status: 409 });
    }
    await admin
      .from("orders")
      .update({ status: "delivered", delivery_note: note || null, delivered_at: new Date().toISOString() })
      .eq("id", orderId);
    await notifyUser(admin, order.buyer_id, "Order delivered", note ? `Seller shared: ${note.slice(0, 200)}` : `${label} was delivered.`, link);
    return Response.json({ ok: true, status: "delivered" });
  }

  if (action === "accept") {
    if (!isBuyer) return Response.json({ error: "Only the buyer can accept." }, { status: 403 });
    if (hasMilestones) return Response.json({ error: "Approve each milestone instead." }, { status: 409 });
    if (order.status !== "delivered") {
      return Response.json({ error: "Order has not been delivered yet." }, { status: 409 });
    }
    const { data: flipped } = await admin
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId)
      .eq("status", "delivered")
      .select("id")
      .maybeSingle();
    if (!flipped) return Response.json({ error: "Order already updated." }, { status: 409 });
    const payout = await releasePayout(admin, {
      orderId: order.id,
      sellerId: order.seller_id,
      gross: Number(order.amount ?? 0),
      currency: order.currency,
    });
    await notifyUser(admin, order.seller_id, "Order completed", `The buyer accepted ${label}. Your payout is on its way.`, link);
    return Response.json({ ok: true, status: "completed", payout });
  }

  if (action === "revision") {
    if (!isBuyer) return Response.json({ error: "Only the buyer can request a revision." }, { status: 403 });
    if (order.status !== "delivered") {
      return Response.json({ error: "Order has not been delivered yet." }, { status: 409 });
    }
    if (!note.trim()) return Response.json({ error: "Explain what needs to change." }, { status: 400 });
    if (hasMilestones) {
      // Send the milestone under review back to the seller.
      await admin
        .from("order_milestones")
        .update({ status: "pending" })
        .eq("order_id", order.id)
        .eq("status", "delivered");
    }
    await admin
      .from("orders")
      .update({
        status: "revision",
        revision_note: note,
        revision_count: (order.revision_count ?? 0) + 1,
      })
      .eq("id", orderId);
    await notifyUser(admin, order.seller_id, "Revision requested", note.slice(0, 200), link);
    return Response.json({ ok: true, status: "revision" });
  }

  if (action === "deliver-milestone" || action === "approve-milestone") {
    const milestone = milestones.find((m) => m.id === body.milestoneId);
    if (!milestone) return Response.json({ error: "Milestone not found." }, { status: 404 });
    if (!["paid", "revision", "delivered"].includes(order.status)) {
      return Response.json({ error: `Order is ${order.status}.` }, { status: 409 });
    }

    if (action === "deliver-milestone") {
      if (!isSeller) return Response.json({ error: "Only the seller can deliver." }, { status: 403 });
      const firstOpen = milestones.find((m) => m.status !== "approved");
      if (firstOpen?.id !== milestone.id) {
        return Response.json({ error: "Milestones are delivered in order." }, { status: 409 });
      }
      if (milestone.status === "delivered") return Response.json({ error: "Already delivered." }, { status: 409 });
      await admin
        .from("order_milestones")
        .update({ status: "delivered", delivery_note: note || null, delivered_at: new Date().toISOString() })
        .eq("id", milestone.id);
      await admin
        .from("orders")
        .update({ status: "delivered", delivered_at: new Date().toISOString() })
        .eq("id", order.id);
      await notifyUser(admin, order.buyer_id, "Milestone delivered", `"${milestone.title}" is ready for your review.`, link);
      return Response.json({ ok: true });
    }

    if (!isBuyer) return Response.json({ error: "Only the buyer can approve." }, { status: 403 });
    if (milestone.status !== "delivered") {
      return Response.json({ error: "This milestone has not been delivered yet." }, { status: 409 });
    }
    const { data: approved } = await admin
      .from("order_milestones")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", milestone.id)
      .eq("status", "delivered")
      .select("id")
      .maybeSingle();
    if (!approved) return Response.json({ error: "Milestone already updated." }, { status: 409 });
    const payout = await releasePayout(admin, {
      orderId: order.id,
      sellerId: order.seller_id,
      gross: Number(milestone.amount),
      currency: order.currency,
      memo: `milestone ${milestone.position + 1}`,
    });
    await admin.from("order_milestones").update({ payout_status: payout }).eq("id", milestone.id);
    const allDone = milestones.every((m) => m.id === milestone.id || m.status === "approved");
    await admin
      .from("orders")
      .update({ status: allDone ? "completed" : "paid" })
      .eq("id", order.id);
    await notifyUser(
      admin,
      order.seller_id,
      allDone ? "Order completed" : "Milestone approved",
      allDone ? `All milestones of ${label} are approved.` : `"${milestone.title}" was approved and paid out.`,
      link,
    );
    return Response.json({ ok: true, status: allDone ? "completed" : "paid", payout });
  }

  if (action === "open-dispute") {
    if (!["paid", "delivered", "revision"].includes(order.status)) {
      return Response.json({ error: "Disputes can only be opened on active paid orders." }, { status: 409 });
    }
    const reason = DISPUTE_REASONS.includes(body.reason ?? "") ? body.reason! : "other";
    if (note.trim().length < 20) {
      return Response.json({ error: "Describe the problem in at least 20 characters." }, { status: 400 });
    }
    const { data: dispute, error: disputeError } = await admin
      .from("disputes")
      .insert({
        order_id: order.id,
        opened_by: user.id,
        reason,
        details: note,
        previous_status: order.status,
      })
      .select("id")
      .single();
    if (disputeError || !dispute) {
      return Response.json({ error: "A dispute is already open for this order." }, { status: 409 });
    }
    await admin.from("orders").update({ status: "disputed" }).eq("id", order.id);
    await Promise.all([
      notifyUser(admin, isBuyer ? order.seller_id : order.buyer_id, "Dispute opened", `A dispute was opened on ${label}. Share your side in the resolution center.`, link),
      notifyAdmins(admin, "New dispute", `Order ${order.id.slice(0, 8)}: ${reason.replace(/_/g, " ")}`, "/admin"),
    ]);
    return Response.json({ ok: true, status: "disputed", disputeId: dispute.id });
  }

  // action === "cancel"
  if (["completed", "cancelled"].includes(order.status)) {
    return Response.json({ error: `Cannot cancel a ${order.status} order.` }, { status: 409 });
  }
  const paid = order.status !== "pending";
  if (paid && isBuyer) {
    const dueAt = order.paid_at
      ? new Date(order.paid_at).getTime() + (order.delivery_days ?? 1) * 86400000
      : Infinity;
    const late = Date.now() > dueAt && order.status !== "delivered";
    if (!late) {
      return Response.json(
        { error: "Paid orders can't be cancelled by the buyer before the due date. Ask the seller to cancel, or open a dispute." },
        { status: 403 },
      );
    }
  }
  if (paid) {
    // Refund only what has not already been paid out through milestones.
    const released = milestones.filter((m) => m.status === "approved").reduce((s, m) => s + Number(m.amount), 0);
    const refundable = Math.max(0, Number(order.amount ?? 0) - released);
    try {
      const stripe = getStripe();
      if (stripe && order.stripe_payment_intent && refundable > 0) {
        await stripe.refunds.create({
          payment_intent: order.stripe_payment_intent,
          ...(released > 0 ? { amount: Math.round(refundable * 100) } : {}),
        });
      }
    } catch {
      return Response.json({ error: "Refund failed. Contact support." }, { status: 502 });
    }
  }
  await admin.from("orders").update({ status: "cancelled" }).eq("id", orderId);
  await notifyUser(
    admin,
    isBuyer ? order.seller_id : order.buyer_id,
    "Order cancelled",
    paid ? `${label} was cancelled and the buyer refunded.` : `${label} was cancelled.`,
    link,
  );
  return Response.json({ ok: true, status: "cancelled" });
}
