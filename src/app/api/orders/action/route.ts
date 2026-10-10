import { getAdminSupabase, getStripe, getUserFromRequest } from "@/lib/stripe-server";
import { sellerNet } from "@/lib/fees";

export const runtime = "nodejs";

type Action = "deliver" | "accept" | "revision" | "cancel";

interface OrderRow {
  id: string;
  buyer_id: string;
  seller_id: string | null;
  status: string;
  revision_count: number | null;
  amount: number | null;
  currency: string | null;
  stripe_payment_intent: string | null;
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

  let body: { orderId?: string; action?: Action; note?: string } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { orderId, action } = body;
  const note = (body.note ?? "").toString().slice(0, 2000);
  if (!orderId || !action || !["deliver", "accept", "revision", "cancel"].includes(action)) {
    return Response.json({ error: "Missing fields." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("orders")
    .select("id, buyer_id, seller_id, status, revision_count, amount, currency, stripe_payment_intent")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  const order = data as OrderRow;
  const isBuyer = order.buyer_id === user.id;
  const isSeller = order.seller_id === user.id;

  const notify = async (userId: string | null, title: string, body: string) => {
    if (!userId) return;
    await admin.from("notifications").insert({
      user_id: userId,
      type: "order",
      title,
      body,
      link: `/orders`,
    });
    const { getEmailForUser, sendEmail } = await import("@/lib/email");
    const email = await getEmailForUser(admin, userId);
    await sendEmail(email, `Hirelyx — ${title}`, `<p><strong>${title}</strong></p><p>${body}</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/orders">View your orders</a></p>`);
  };

  if (action === "deliver") {
    if (!isSeller) return Response.json({ error: "Only the seller can deliver." }, { status: 403 });
    if (order.status !== "paid" && order.status !== "revision") {
      return Response.json({ error: `Cannot deliver while status is "${order.status}".` }, { status: 409 });
    }
    await admin
      .from("orders")
      .update({ status: "delivered", delivery_note: note || null, delivered_at: new Date().toISOString() })
      .eq("id", orderId);
    await notify(order.buyer_id, "Order delivered", note ? `Seller shared: ${note.slice(0, 120)}` : "Your order was delivered.");
    return Response.json({ ok: true, status: "delivered" });
  }

  if (action === "accept") {
    if (!isBuyer) return Response.json({ error: "Only the buyer can accept." }, { status: 403 });
    if (order.status !== "delivered") {
      return Response.json({ error: "Order has not been delivered yet." }, { status: 409 });
    }
    await admin.from("orders").update({ status: "completed" }).eq("id", orderId);

    const gross = Number(order.amount ?? 0);
    const sellerPayout = sellerNet(gross);
    let payoutStatus = "pending";
    let transferId: string | null = null;

    if (order.seller_id && sellerPayout > 0) {
      const { data: sellerProfile } = await admin
        .from("profiles")
        .select("stripe_account_id")
        .eq("user_id", order.seller_id)
        .maybeSingle();

      const stripeAccountId = (sellerProfile as { stripe_account_id?: string } | null)
        ?.stripe_account_id;

      const stripe = getStripe();
      if (stripeAccountId && stripe) {
        try {
          const transfer = await stripe.transfers.create({
            amount: Math.round(sellerPayout * 100),
            currency: order.currency ?? "usd",
            destination: stripeAccountId,
            metadata: { order_id: orderId },
          });
          transferId = transfer.id;
          payoutStatus = "paid";
        } catch {
          payoutStatus = "failed";
        }
      }

      await admin.from("payouts").insert({
        order_id: orderId,
        seller_id: order.seller_id,
        amount: sellerPayout,
        currency: order.currency ?? "usd",
        status: payoutStatus,
        stripe_transfer_id: transferId,
      });
    }

    await notify(order.seller_id, "Order completed", "The buyer accepted your delivery. Payout created.");
    return Response.json({ ok: true, status: "completed", payout: payoutStatus });
  }

  if (action === "revision") {
    if (!isBuyer) return Response.json({ error: "Only the buyer can request a revision." }, { status: 403 });
    if (order.status !== "delivered") {
      return Response.json({ error: "Order has not been delivered yet." }, { status: 409 });
    }
    await admin
      .from("orders")
      .update({
        status: "revision",
        revision_note: note || null,
        revision_count: (order.revision_count ?? 0) + 1,
      })
      .eq("id", orderId);
    await notify(order.seller_id, "Revision requested", note || "The buyer requested a revision.");
    return Response.json({ ok: true, status: "revision" });
  }

  if (action === "cancel") {
    if (!isBuyer && !isSeller) return Response.json({ error: "Not your order." }, { status: 403 });
    if (["completed", "cancelled"].includes(order.status)) {
      return Response.json({ error: `Cannot cancel a ${order.status} order.` }, { status: 409 });
    }
    if (order.status === "paid" || order.status === "delivered" || order.status === "revision") {
      try {
        const stripe = getStripe();
        if (stripe && order.stripe_payment_intent) {
          await stripe.refunds.create({ payment_intent: order.stripe_payment_intent });
        }
      } catch {
        return Response.json({ error: "Refund failed. Contact support." }, { status: 502 });
      }
    }
    await admin.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    await notify(isBuyer ? order.seller_id : order.buyer_id, "Order cancelled", "An order was cancelled and refunded if it was paid.");
    return Response.json({ ok: true, status: "cancelled" });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
