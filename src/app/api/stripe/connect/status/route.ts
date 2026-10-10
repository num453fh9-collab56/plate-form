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

  const limited = await rateLimit(request, "stripe-status", 30, 60, user.id);
  if (limited) return limited;

  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_account_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const accountId = (profile as { stripe_account_id?: string } | null)?.stripe_account_id;
  if (!accountId) {
    return Response.json({ connected: false, chargesEnabled: false });
  }

  const account = await stripe.accounts.retrieve(accountId);
  return Response.json({
    connected: true,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  });
}
