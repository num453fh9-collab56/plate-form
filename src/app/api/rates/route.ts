/* USD exchange rates for display-only price conversion. Cached at the CDN edge
   for 12h (s-maxage) and in memory per instance; falls back to rough static
   rates if the free rates API is unreachable. Payments are always in USD. */

const SUPPORTED = ["USD", "PKR", "AED", "SAR", "EUR", "GBP", "INR", "CAD", "AUD"] as const;

const FALLBACK: Record<string, number> = {
  USD: 1,
  PKR: 280,
  AED: 3.67,
  SAR: 3.75,
  EUR: 0.92,
  GBP: 0.79,
  INR: 84,
  CAD: 1.37,
  AUD: 1.52,
};

let cache: { at: number; rates: Record<string, number> } | null = null;
const TTL = 12 * 60 * 60 * 1000;

export async function GET() {
  if (!cache || Date.now() - cache.at > TTL) {
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
      const payload = (await response.json()) as { result?: string; rates?: Record<string, number> };
      if (payload.result === "success" && payload.rates) {
        const rates = Object.fromEntries(
          SUPPORTED.map((code) => [code, Number(payload.rates?.[code]) || FALLBACK[code]]),
        );
        cache = { at: Date.now(), rates };
      }
    } catch {
      /* keep previous cache or fall back below */
    }
  }
  return Response.json(
    { base: "USD", rates: cache?.rates ?? FALLBACK, live: Boolean(cache) },
    { headers: { "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400" } },
  );
}
