import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function generateAffCode(): string {
  return "AFF" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  const { data: aff } = await admin
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!aff) return Response.json({ enrolled: false });

  const { data: conversions } = await admin
    .from("affiliate_conversions")
    .select("id, commission, status, created_at")
    .eq("affiliate_id", (aff as { id: string }).id)
    .order("created_at", { ascending: false })
    .limit(20);

  return Response.json({
    enrolled: true,
    affiliate: aff,
    conversions: conversions ?? [],
  });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await rateLimit(request, "affiliate", 10, 60, user.id);
  if (limited) return limited;

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  let body: { action?: string } = {};
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid" }, { status: 400 }); }

  if (body.action === "enroll") {
    const { data: existing } = await admin
      .from("affiliates")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) return Response.json({ error: "Already enrolled." }, { status: 409 });

    const code = generateAffCode();
    const { data: aff, error } = await admin
      .from("affiliates")
      .insert({ user_id: user.id, affiliate_code: code })
      .select("id, affiliate_code")
      .single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, affiliate: aff });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
