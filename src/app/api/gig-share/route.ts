import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  const user = await getUserFromRequest(request).catch(() => null);

  let body: { gigId?: string; platform?: string } = {};
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid" }, { status: 400 }); }

  if (!body.gigId || !body.platform) return Response.json({ error: "Missing fields" }, { status: 400 });

  await admin.from("gig_shares").insert({
    gig_id: body.gigId,
    user_id: user?.id ?? null,
    platform: body.platform.slice(0, 50),
  });

  return Response.json({ ok: true });
}
