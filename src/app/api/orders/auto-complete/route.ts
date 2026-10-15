import { getAdminSupabase } from "@/lib/stripe-server";
import { notifyUser } from "@/lib/notify";
import { releasePayout } from "@/lib/payouts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  const { data: orders } = await admin
    .from("orders")
    .select("id, buyer_id, seller_id, amount, currency, title, auto_complete_at")
    .eq("status", "delivered")
    .not("auto_complete_at", "is", null)
    .lte("auto_complete_at", new Date().toISOString())
    .limit(50);

  let completed = 0;
  for (const order of (orders ?? []) as { id: string; buyer_id: string; seller_id: string | null; amount: number; currency: string; title: string | null }[]) {
    const { data: flipped } = await admin
      .from("orders")
      .update({ status: "completed" })
      .eq("id", order.id)
      .eq("status", "delivered")
      .select("id")
      .maybeSingle();
    if (!flipped) continue;

    await releasePayout(admin, {
      orderId: order.id,
      sellerId: order.seller_id,
      gross: Number(order.amount ?? 0),
      currency: order.currency,
      memo: "auto-completed",
    });

    const label = order.title ? `"${order.title}"` : "your order";
    const link = `/orders/${order.id}`;
    await Promise.all([
      notifyUser(admin, order.buyer_id, "Order auto-completed", `${label} was automatically completed after 3 days. Payment released to seller.`, link, {
        template: "order_completed",
        orderTitle: order.title ?? undefined,
      }),
      notifyUser(admin, order.seller_id, "Order completed", `${label} was auto-completed. Your payout is on its way.`, link, {
        template: "order_completed",
        orderTitle: order.title ?? undefined,
      }),
    ]);
    completed++;
  }

  return Response.json({ ok: true, completed });
}
