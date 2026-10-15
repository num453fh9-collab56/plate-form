import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  const { data } = await admin
    .from("wishlists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return Response.json({ wishlists: data ?? [] });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await rateLimit(request, "wishlists", 20, 60, user.id);
  if (limited) return limited;

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  let body: { action?: string; name?: string; wishlistId?: string; gigId?: string } = {};
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid" }, { status: 400 }); }

  if (body.action === "create") {
    const name = (body.name ?? "").trim().slice(0, 100) || "My List";
    const { data, error } = await admin
      .from("wishlists")
      .insert({ user_id: user.id, name, gig_ids: [] })
      .select("id, name")
      .single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, wishlist: data });
  }

  if (body.action === "add-gig" && body.wishlistId && body.gigId) {
    const { data: wl } = await admin
      .from("wishlists")
      .select("gig_ids")
      .eq("id", body.wishlistId)
      .eq("user_id", user.id)
      .single();
    if (!wl) return Response.json({ error: "Not found" }, { status: 404 });
    const ids: string[] = ((wl as { gig_ids: string[] }).gig_ids ?? []);
    if (!ids.includes(body.gigId)) ids.push(body.gigId);
    await admin.from("wishlists").update({ gig_ids: ids }).eq("id", body.wishlistId);
    return Response.json({ ok: true });
  }

  if (body.action === "remove-gig" && body.wishlistId && body.gigId) {
    const { data: wl } = await admin
      .from("wishlists")
      .select("gig_ids")
      .eq("id", body.wishlistId)
      .eq("user_id", user.id)
      .single();
    if (!wl) return Response.json({ error: "Not found" }, { status: 404 });
    const ids = ((wl as { gig_ids: string[] }).gig_ids ?? []).filter((g: string) => g !== body.gigId);
    await admin.from("wishlists").update({ gig_ids: ids }).eq("id", body.wishlistId);
    return Response.json({ ok: true });
  }

  if (body.action === "delete" && body.wishlistId) {
    await admin.from("wishlists").delete().eq("id", body.wishlistId).eq("user_id", user.id);
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
