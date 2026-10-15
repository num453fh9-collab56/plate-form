import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function generateCode(): string {
  return "HLX" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  const { data: profile } = await admin
    .from("profiles")
    .select("referral_code, referral_credits")
    .eq("user_id", user.id)
    .maybeSingle();

  let code = (profile as { referral_code?: string } | null)?.referral_code;
  if (!code) {
    code = generateCode();
    await admin.from("profiles").update({ referral_code: code }).eq("user_id", user.id);
  }

  const { data: referrals } = await admin
    .from("referrals")
    .select("id, referred_id, status, referrer_credit, created_at")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  const credits = Number((profile as { referral_credits?: number } | null)?.referral_credits ?? 0);

  return Response.json({
    code,
    credits,
    referrals: referrals ?? [],
    totalReferred: (referrals ?? []).length,
    totalEarned: (referrals ?? []).reduce((s, r) => s + Number((r as { referrer_credit: number }).referrer_credit ?? 0), 0),
  });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await rateLimit(request, "referral", 10, 60, user.id);
  if (limited) return limited;

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  let body: { action?: string; code?: string } = {};
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid" }, { status: 400 }); }

  if (body.action === "apply" && body.code) {
    const { data: existing } = await admin
      .from("profiles")
      .select("referred_by")
      .eq("user_id", user.id)
      .maybeSingle();
    if ((existing as { referred_by?: string } | null)?.referred_by) {
      return Response.json({ error: "You've already used a referral code." }, { status: 409 });
    }

    const { data: referrer } = await admin
      .from("profiles")
      .select("user_id, referral_code")
      .eq("referral_code", body.code.toUpperCase())
      .maybeSingle();
    if (!referrer) return Response.json({ error: "Invalid referral code." }, { status: 404 });
    const referrerId = (referrer as { user_id: string }).user_id;
    if (referrerId === user.id) return Response.json({ error: "You can't refer yourself." }, { status: 400 });

    await admin.from("profiles").update({ referred_by: body.code.toUpperCase() }).eq("user_id", user.id);
    await admin.from("referrals").insert({
      referrer_id: referrerId,
      referred_id: user.id,
      referral_code: body.code.toUpperCase(),
      status: "signed_up",
      referrer_credit: 10,
      referred_credit: 5,
    });
    await admin.rpc("increment_referral_credits", { uid: referrerId, amt: 10 }).then(() => {});
    await admin.rpc("increment_referral_credits", { uid: user.id, amt: 5 }).then(() => {});

    return Response.json({ ok: true, credit: 5 });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
