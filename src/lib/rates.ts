/* ==========================================================================
   HIRELYX · RATE GUIDANCE
   Suggested hourly ranges (USD) per category, used only as a starting point
   in the rates calculator. They are editorial guidance, not live market data —
   update them here as the marketplace collects real order prices.
   ========================================================================== */

export interface RateRange {
  low: number;
  high: number;
}

/* Keyed by category label (the value stored in `primaryCategory`). */
const RATE_GUIDE: Record<string, RateRange> = {
  "Programming & Tech": { low: 15, high: 60 },
  "Mobile Apps": { low: 18, high: 65 },
  "AI Services": { low: 25, high: 90 },
  "UI/UX Design": { low: 15, high: 55 },
  "Graphics & Design": { low: 10, high: 40 },
  "Video & Animation": { low: 12, high: 45 },
  "Digital Marketing": { low: 12, high: 50 },
  "Writing & Translation": { low: 8, high: 35 },
};

const FALLBACK: RateRange = { low: 10, high: 50 };

export function rateRangeFor(category: string): RateRange {
  return RATE_GUIDE[category] ?? FALLBACK;
}

/* Representative hours for each WEEKLY_HOURS bucket. */
const HOURS_BY_BUCKET: Record<string, number> = {
  lt10: 8,
  "10-20": 15,
  "20-30": 25,
  "30-40": 35,
  "40plus": 40,
};

export const DEFAULT_WEEKLY_HOURS = 20;

export function hoursForBucket(bucket: string): number | undefined {
  return HOURS_BY_BUCKET[bucket];
}

/** Average weeks per month (52 / 12). */
export const WEEKS_PER_MONTH = 4.33;
