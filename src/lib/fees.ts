/* ==========================================================================
   HIRELYX · PLATFORM FEES
   Single source of truth for the marketplace commission. Used by the payout
   route (server) and the rates calculator (client), so what a freelancer is
   shown during onboarding is exactly what the payout code deducts.
   ========================================================================== */

export const PLATFORM_FEE_RATE = 0.1;

export function sellerNet(gross: number): number {
  return Math.max(0, gross * (1 - PLATFORM_FEE_RATE));
}
