import { getAdminSupabase, getStripe, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const admin = getAdminSupabase();
  if (!stripe || !admin) {
    return Response.json({ error: "Payments are not configured." }, { status: 503 });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const limited = await rateLimit(request, "stripe-connect", 10, 60, user.id);
  if (limited) return limited;

  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_account_id, email_masked")
    .eq("user_id", user.id)
    .maybeSingle();

  const body = (await request.json().catch(() => ({}))) as { returnUrl?: string };
  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  const returnUrl = body.returnUrl ?? `${origin}/earnings`;

  let accountId = (profile as { stripe_account_id?: string } | null)?.stripe_account_id ?? null;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      email: user.email ?? undefined,
    });
    accountId = account.id;
    await admin.from("profiles").update({ stripe_account_id: accountId }).eq("user_id", user.id);
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/earnings?onboarding=refresh`,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return Response.json({ url: link.url });
}
