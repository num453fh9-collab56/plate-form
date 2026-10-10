import { getAdminSupabase, getStripe, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";
import { notifyUser } from "@/lib/notify";
import { releasePayout } from "@/lib/payouts";

export const runtime = "nodejs";

/* Resolution center.
   message  — buyer, seller or admin adds to the dispute thread
   withdraw — the person who opened it closes it; order goes back to its
              previous status
   resolve  — admin only: refund_full | refund_partial | release_seller.
              Money already paid out through milestones is never refunded. */

interface DisputeBody {
  action?: "message" | "withdraw" | "resolve";
  disputeId?: string;
  body?: string;
  resolution?: "refund_full" | "refund_partial" | "release_seller";
  refundAmount?: number;
  adminNote?: string;
}

export async function POST(request: Request) {
  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Backend not configured." }, { status: 503 });
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Not authenticated." }, { status: 401 });
  const limited = await rateLimit(request, "disputes", 30, 60, user.id);
  if (limited) return limited;

  let body: DisputeBody;
  try {
    body = (await request.json()) as DisputeBody;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { data: dispute } = await admin
    .from("disputes")
    .select("id, order_id, opened_by, status, previous_status")
    .eq("id", body.disputeId ?? "")
    .maybeSingle();
  if (!dispute) return Response.json({ error: "Dispute not found." }, { status: 404 });

  const { data: order } = await admin
    .from("orders")
    .select("id, buyer_id, seller_id, amount, currency, stripe_payment_intent, title")
    .eq("id", dispute.order_id)
    .maybeSingle();
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });

  const { data: adminRow } = await admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  const isAdmin = Boolean(adminRow);
  const isParty = order.buyer_id === user.id || order.seller_id === user.id;
  if (!isAdmin && !isParty) return Response.json({ error: "Not allowed." }, { status: 403 });

  const link = `/orders/${order.id}`;
  const others = [order.buyer_id, order.seller_id].filter((id) => id && id !== user.id) as string[];

  if (body.action === "message") {
    const text = (body.body ?? "").trim().slice(0, 2000);
    if (!text) return Response.json({ error: "Write a message." }, { status: 400 });
    if (dispute.status !== "open") return Response.json({ error: "This dispute is closed." }, { status: 409 });
    await admin.from("dispute_messages").insert({
      dispute_id: dispute.id,
      sender_id: user.id,
      body: text,
      is_admin: isAdmin && !isParty,
    });
    await Promise.all(
      others.map((id) => notifyUser(admin, id, "New message in dispute", text.slice(0, 160), link)),
    );
    return Response.json({ ok: true });
  }

  if (body.action === "withdraw") {
    if (dispute.opened_by !== user.id) {
      return Response.json({ error: "Only the person who opened it can withdraw." }, { status: 403 });
    }
    if (dispute.status !== "open") return Response.json({ error: "This dispute is closed." }, { status: 409 });
    await admin
      .from("disputes")
      .update({ status: "resolved", resolution: "withdrawn", resolved_at: new Date().toISOString() })
      .eq("id", dispute.id);
    await admin.from("orders").update({ status: dispute.previous_status ?? "paid" }).eq("id", order.id);
    await Promise.all(others.map((id) => notifyUser(admin, id, "Dispute withdrawn", "The dispute was withdrawn and the order continues.", link)));
    return Response.json({ ok: true });
  }

  if (body.action === "resolve") {
    if (!isAdmin) return Response.json({ error: "Admins only." }, { status: 403 });
    if (dispute.status !== "open") return Response.json({ error: "This dispute is closed." }, { status: 409 });
    const resolution = body.resolution;
    if (!resolution || !["refund_full", "refund_partial", "release_seller"].includes(resolution)) {
      return Response.json({ error: "Choose a resolution." }, { status: 400 });
    }

    const { data: milestones } = await admin
      .from("order_milestones")
      .select("amount, status")
      .eq("order_id", order.id);
    const released = (milestones ?? [])
      .filter((m) => m.status === "approved")
      .reduce((sum, m) => sum + Number(m.amount), 0);
    const remaining = Math.max(0, Math.round((Number(order.amount ?? 0) - released) * 100) / 100);

    let refund = 0;
    if (resolution === "refund_full") refund = remaining;
    if (resolution === "refund_partial") {
      refund = Math.round(Number(body.refundAmount) * 100) / 100;
      if (!(refund > 0) || refund >= remaining) {
        return Response.json({ error: `Partial refund must be between $0 and $${remaining}.` }, { status: 400 });
      }
    }
    const toSeller = Math.max(0, Math.round((remaining - refund) * 100) / 100);

    // Claim the dispute first so two admins can never pay out twice.
    const { data: claimed } = await admin
      .from("disputes")
      .update({ status: "resolving" })
      .eq("id", dispute.id)
      .eq("status", "open")
      .select("id")
      .maybeSingle();
    if (!claimed) return Response.json({ error: "Another admin is resolving this dispute." }, { status: 409 });

    if (refund > 0) {
      const stripe = getStripe();
      if (stripe && order.stripe_payment_intent) {
        try {
          await stripe.refunds.create({
            payment_intent: order.stripe_payment_intent,
            amount: Math.round(refund * 100),
          });
        } catch (error) {
          await admin.from("disputes").update({ status: "open" }).eq("id", dispute.id);
          const message = error instanceof Error ? error.message : "Refund failed.";
          return Response.json({ error: message }, { status: 502 });
        }
      }
    }
    if (toSeller > 0) {
      await releasePayout(admin, {
        orderId: order.id,
        sellerId: order.seller_id,
        gross: toSeller,
        currency: order.currency,
        memo: "dispute resolution",
      });
    }

    const adminNote = (body.adminNote ?? "").trim().slice(0, 2000) || null;
    await admin
      .from("disputes")
      .update({
        status: "resolved",
        resolution,
        refund_amount: refund,
        admin_note: adminNote,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", dispute.id);
    await admin
      .from("orders")
      .update({ status: resolution === "refund_full" ? "cancelled" : "completed" })
      .eq("id", order.id);

    const summary =
      resolution === "refund_full"
        ? `The buyer was refunded $${refund}.`
        : resolution === "release_seller"
          ? `$${toSeller} was released to the seller.`
          : `The buyer was refunded $${refund} and $${toSeller} released to the seller.`;
    await Promise.all(
      [order.buyer_id, order.seller_id].map((id) =>
        notifyUser(admin, id, "Dispute resolved", `${summary}${adminNote ? ` Note: ${adminNote}` : ""}`, link),
      ),
    );
    return Response.json({ ok: true, refund, toSeller });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
