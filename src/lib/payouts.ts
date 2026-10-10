import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "./stripe-server";
import { sellerNet } from "./fees";

/* Server-only: pay a seller their share of `gross` (platform fee deducted)
   via Stripe Connect, and record it in `payouts`. Used for whole orders,
   single milestones and dispute resolutions. */
export async function releasePayout(
  admin: SupabaseClient,
  input: { orderId: string; sellerId: string | null; gross: number; currency?: string | null; memo?: string },
): Promise<"paid" | "pending" | "failed" | "skipped"> {
  const amount = sellerNet(input.gross);
  if (!input.sellerId || amount <= 0) return "skipped";
  const currency = input.currency ?? "usd";

  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_account_id")
    .eq("user_id", input.sellerId)
    .maybeSingle();
  const destination = (profile as { stripe_account_id?: string } | null)?.stripe_account_id;

  let status: "paid" | "pending" | "failed" = "pending";
  let transferId: string | null = null;
  const stripe = getStripe();
  if (destination && stripe) {
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency,
        destination,
        metadata: { order_id: input.orderId, memo: input.memo ?? "" },
      });
      transferId = transfer.id;
      status = "paid";
    } catch {
      status = "failed";
    }
  }

  await admin.from("payouts").insert({
    order_id: input.orderId,
    seller_id: input.sellerId,
    amount,
    currency,
    status,
    stripe_transfer_id: transferId,
  });
  return status;
}
