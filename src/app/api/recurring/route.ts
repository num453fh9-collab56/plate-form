import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Frequency = "weekly" | "biweekly" | "monthly" | "quarterly";
const FREQ_DAYS: Record<Frequency, number> = { weekly: 7, biweekly: 14, monthly: 30, quarterly: 90 };

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  const { data } = await admin
    .from("recurring_orders")
    .select("*")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return Response.json({ recurring: data ?? [] });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await rateLimit(request, "recurring", 10, 60, user.id);
  if (limited) return limited;

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  let body: { action?: string; gigId?: string; sellerId?: string; title?: string; amount?: number; frequency?: Frequency; recurringId?: string } = {};
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid" }, { status: 400 }); }

  if (body.action === "create") {
    if (!body.sellerId || !body.title || !body.amount || !body.frequency) {
      return Response.json({ error: "Missing fields." }, { status: 400 });
    }
    if (!FREQ_DAYS[body.frequency]) return Response.json({ error: "Invalid frequency." }, { status: 400 });

    const nextCharge = new Date(Date.now() + FREQ_DAYS[body.frequency] * 86400000).toISOString();
    const { data: rec, error } = await admin
      .from("recurring_orders")
      .insert({
        gig_id: body.gigId ?? null,
        buyer_id: user.id,
        seller_id: body.sellerId,
        title: body.title,
        amount: body.amount,
        frequency: body.frequency,
        next_charge_at: nextCharge,
      })
      .select("id")
      .single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, recurringId: (rec as { id: string }).id });
  }

  if (body.action === "pause" && body.recurringId) {
    await admin.from("recurring_orders").update({ status: "paused" }).eq("id", body.recurringId).or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
    return Response.json({ ok: true });
  }

  if (body.action === "cancel" && body.recurringId) {
    await admin.from("recurring_orders").update({ status: "cancelled" }).eq("id", body.recurringId).or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
