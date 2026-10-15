import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  const url = new URL(request.url);
  const sellerId = url.searchParams.get("sellerId");

  if (sellerId) {
    const user = await getUserFromRequest(request);
    if (!user || user.id !== sellerId) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await admin
      .from("promoted_gigs")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
    return Response.json({ promotions: data ?? [] });
  }

  const { data } = await admin
    .from("promoted_gigs")
    .select("gig_id")
    .eq("status", "active")
    .gt("budget", 0);
  return Response.json({ promotedGigIds: (data ?? []).map((r) => (r as { gig_id: string }).gig_id) });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await rateLimit(request, "promote", 10, 60, user.id);
  if (limited) return limited;

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  let body: { action?: string; gigId?: string; budget?: number; dailyBudget?: number; promotionId?: string } = {};
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid" }, { status: 400 }); }

  if (body.action === "create" && body.gigId) {
    const { data: gig } = await admin
      .from("gigs")
      .select("seller_id")
      .eq("id", body.gigId)
      .maybeSingle();
    if (!gig || (gig as { seller_id: string }).seller_id !== user.id) {
      return Response.json({ error: "Not your gig." }, { status: 403 });
    }

    const budget = Math.min(1000, Math.max(5, Number(body.budget) || 20));
    const dailyBudget = Math.min(100, Math.max(1, Number(body.dailyBudget) || 10));

    const { data: promo, error } = await admin
      .from("promoted_gigs")
      .insert({
        gig_id: body.gigId,
        seller_id: user.id,
        budget,
        daily_budget: dailyBudget,
      })
      .select("id")
      .single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, promotionId: (promo as { id: string }).id });
  }

  if (body.action === "pause" && body.promotionId) {
    await admin.from("promoted_gigs").update({ status: "paused" }).eq("id", body.promotionId).eq("seller_id", user.id);
    return Response.json({ ok: true });
  }

  if (body.action === "resume" && body.promotionId) {
    await admin.from("promoted_gigs").update({ status: "active" }).eq("id", body.promotionId).eq("seller_id", user.id);
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
