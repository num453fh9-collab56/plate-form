"use client";

import { getSupabase } from "./supabase";

/* Seller levels are computed in Postgres (`seller_stats`, migration 0013)
   from completed orders, rating, on-time delivery and account age. */

export type SellerLevel = "new" | "level_1" | "level_2" | "top_rated";

export interface SellerStats {
  sellerId: string;
  completed: number;
  rating: number;
  reviews: number;
  /** On-time delivery %, or null when nothing has been delivered yet. */
  onTime: number | null;
  memberSince: string | null;
  level: SellerLevel;
}

export const LEVEL_META: Record<SellerLevel, { label: string; short: string; className: string }> = {
  new: { label: "New Seller", short: "New", className: "lvl-new" },
  level_1: { label: "Level 1 Seller", short: "Level 1", className: "lvl-1" },
  level_2: { label: "Level 2 Seller", short: "Level 2", className: "lvl-2" },
  top_rated: { label: "Top Rated Seller", short: "Top Rated", className: "lvl-top" },
};

/** What a seller needs for each level (shown on the seller's dashboard). */
export const LEVEL_RULES: { level: SellerLevel; orders: number; rating: number; days: number; onTime?: number }[] = [
  { level: "level_1", orders: 10, rating: 4.4, days: 60 },
  { level: "level_2", orders: 50, rating: 4.6, days: 120, onTime: 85 },
  { level: "top_rated", orders: 100, rating: 4.8, days: 180, onTime: 90 },
];

interface StatsRow {
  seller_id: string;
  completed: number;
  rating: number | string;
  reviews: number;
  on_time: number | null;
  member_since: string | null;
  level: SellerLevel;
}

export async function fetchSellerStats(ids: string[]): Promise<Record<string, SellerStats>> {
  const supabase = getSupabase();
  const unique = [...new Set(ids.filter(Boolean))];
  if (!supabase || unique.length === 0) return {};
  const { data, error } = await supabase.rpc("seller_stats", { uids: unique });
  if (error || !Array.isArray(data)) return {};
  return Object.fromEntries(
    (data as StatsRow[]).map((row) => [
      row.seller_id,
      {
        sellerId: row.seller_id,
        completed: Number(row.completed) || 0,
        rating: Number(row.rating) || 0,
        reviews: Number(row.reviews) || 0,
        onTime: row.on_time == null ? null : Number(row.on_time),
        memberSince: row.member_since,
        level: row.level ?? "new",
      },
    ]),
  );
}

export function LevelBadge({ level, compact = false }: { level: SellerLevel; compact?: boolean }) {
  const meta = LEVEL_META[level];
  return (
    <span className={`lvl-badge ${meta.className}`} title={meta.label}>
      {level === "top_rated" ? "★ " : level === "new" ? "" : "◆ "}
      {compact ? meta.short : meta.label}
    </span>
  );
}
