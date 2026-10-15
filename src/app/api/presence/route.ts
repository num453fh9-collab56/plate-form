import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  await admin
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString(), is_online: true })
    .eq("user_id", user.id);

  return Response.json({ ok: true });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  const { data } = await admin
    .from("profiles")
    .select("last_seen_at, is_online")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return Response.json({ online: false, lastSeen: null });

  const row = data as { last_seen_at: string | null; is_online: boolean | null };
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const isOnline = row.is_online && row.last_seen_at && new Date(row.last_seen_at).getTime() > fiveMinAgo;

  return Response.json({ online: Boolean(isOnline), lastSeen: row.last_seen_at });
}
