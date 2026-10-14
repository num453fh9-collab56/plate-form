"use client";

import { getSupabase } from "./supabase";
import { rowToGig } from "./gig-model";
import type { GigRow } from "./gig-model";
import type { Gig } from "./types";

/* ==========================================================================
   HIRELYX · DATA API
   Small async helpers that read the public marketplace data from Supabase.
   ========================================================================== */

export interface PublicProfile {
  userId: string;
  fullName: string;
  title: string;
  primaryCategory: string;
  bio: string;
  country: string;
  languages: string;
  avatar: string;
  skills: string[];
  hourlyRate: string;
  availability: string;
  portfolio: string;
  introVideo: string;
  introVideoName: string;
  idVerified: boolean;
  paymentVerified: boolean;
}

export interface GigReview {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  sellerReply: string | null;
  sellerRepliedAt: string | null;
  createdAt: string;
}

interface ProfileRow {
  user_id: string;
  full_name: string | null;
  title: string | null;
  primary_category: string | null;
  bio: string | null;
  country: string | null;
  languages: string | null;
  avatar: string | null;
  skills: string[] | null;
  hourly_rate: number | null;
  availability: string | null;
  portfolio: string | null;
  intro_video: string | null;
  intro_video_name: string | null;
  id_verified: boolean | null;
  payment_verified: boolean | null;
}

function rowToProfile(row: ProfileRow): PublicProfile {
  return {
    userId: row.user_id,
    fullName: row.full_name ?? "",
    title: row.title ?? "",
    primaryCategory: row.primary_category ?? "",
    bio: row.bio ?? "",
    country: row.country ?? "",
    languages: row.languages ?? "",
    avatar: row.avatar ?? "",
    skills: Array.isArray(row.skills) ? row.skills : [],
    hourlyRate: row.hourly_rate != null ? String(row.hourly_rate) : "",
    availability: row.availability ?? "",
    portfolio: row.portfolio ?? "",
    introVideo: row.intro_video ?? "",
    introVideoName: row.intro_video_name ?? "",
    idVerified: Boolean(row.id_verified),
    paymentVerified: Boolean(row.payment_verified),
  };
}

export async function fetchGigById(id: string): Promise<Gig | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("gigs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToGig(data as GigRow);
}

/** Count a gig page view (server function ignores drafts/paused gigs). */
export async function recordGigView(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await Promise.all([
    supabase.rpc("increment_gig_views", { gig: id }),
    supabase.rpc("record_gig_click", { gig: id }),
  ]);
}

/** Batch-record impressions when gigs appear in search/browse results. */
export async function recordGigImpressions(gigIds: string[]): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || gigIds.length === 0) return;
  await supabase.rpc("record_gig_impressions", { gig_ids: gigIds });
}

export interface GigAnalytics {
  gig_id: string;
  impressions: number;
  clicks: number;
  orders: number;
  cancellations: number;
}

/** Fetch per-gig analytics for a seller within a date range. */
export async function fetchSellerGigAnalytics(
  sellerId: string,
  since: string,
  until: string,
): Promise<GigAnalytics[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_seller_gig_analytics", {
    p_seller: sellerId,
    p_since: since,
    p_until: until,
  });
  if (error || !data) return [];
  return data as GigAnalytics[];
}

export async function fetchGigsBySeller(sellerId: string): Promise<Gig[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("gigs")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => rowToGig(row as GigRow));
}

export async function fetchPublicProfile(userId: string): Promise<PublicProfile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToProfile(data as ProfileRow);
}

export interface SearchParams {
  q?: string;
  category?: string;
  skills?: string[];
  limit?: number;
  offset?: number;
  maxPrice?: number;
  minPrice?: number;
  maxDeliveryDays?: number;
  sellerLevel?: string;
  minRating?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "best_selling" | "top_rated";
}

export async function searchGigs({
  q,
  category,
  skills,
  limit = 12,
  offset = 0,
  maxPrice,
  minPrice,
  maxDeliveryDays,
  sellerLevel,
  minRating,
  sort = "newest",
}: SearchParams): Promise<{ items: Gig[]; count: number }> {
  const supabase = getSupabase();
  if (!supabase) return { items: [], count: 0 };

  let query = supabase
    .from("gigs")
    .select("*", { count: "exact" })
    .eq("status", "published");

  if (category && category !== "All") {
    query = query.eq("category", category);
  }
  if (skills && skills.length > 0) {
    query = query.contains("skills", skills);
  }
  if (maxPrice != null && Number.isFinite(maxPrice)) {
    query = query.lte("price", maxPrice);
  }
  if (minPrice != null && Number.isFinite(minPrice)) {
    query = query.gte("price", minPrice);
  }
  if (maxDeliveryDays != null && Number.isFinite(maxDeliveryDays)) {
    query = query.lte("delivery_days", maxDeliveryDays);
  }
  if (sellerLevel && sellerLevel !== "all") {
    query = query.eq("badge", sellerLevel);
  }
  if (minRating != null && Number.isFinite(minRating)) {
    query = query.gte("rating", minRating);
  }
  const term = (q ?? "").trim().replace(/[,()%]/g, " ");
  if (term) {
    query = query.or(
      `title.ilike.%${term}%,description.ilike.%${term}%,seller_name.ilike.%${term}%`,
    );
  }

  const orderColumn =
    sort === "price_asc" || sort === "price_desc" ? "price" :
    sort === "top_rated" ? "rating" :
    sort === "best_selling" ? "views" :
    "created_at";
  const ascending = sort === "price_asc";

  const { data, count, error } = await query
    .order(orderColumn, { ascending })
    .range(offset, offset + limit - 1);

  if (error || !data) return { items: [], count: 0 };
  return { items: data.map((row) => rowToGig(row as GigRow)), count: count ?? data.length };
}

export async function fetchGigReviews(gigId: string): Promise<GigReview[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, reviewer_id, seller_reply, seller_replied_at, created_at")
    .eq("gig_id", gigId)
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return [];

  const reviewerIds = [...new Set((data as { reviewer_id: string }[]).map((r) => r.reviewer_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", reviewerIds);
  const names = Object.fromEntries(
    (profiles ?? []).map((p: { user_id: string; full_name: string | null }) => [
      p.user_id,
      p.full_name ?? "User",
    ]),
  );

  return (data as {
    id: string;
    rating: number;
    comment: string | null;
    reviewer_id: string;
    seller_reply: string | null;
    seller_replied_at: string | null;
    created_at: string;
  }[]).map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment ?? "",
    reviewerName: names[row.reviewer_id] ?? "User",
    sellerReply: row.seller_reply ?? null,
    sellerRepliedAt: row.seller_replied_at ?? null,
    createdAt: row.created_at,
  }));
}

export async function fetchOrderReview(orderId: string): Promise<GigReview | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, reviewer_id, seller_reply, seller_replied_at, created_at")
    .eq("order_id", orderId)
    .maybeSingle();
  if (!data) return null;
  const row = data as {
    id: string;
    rating: number;
    comment: string | null;
    reviewer_id: string;
    seller_reply: string | null;
    seller_replied_at: string | null;
    created_at: string;
  };
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", row.reviewer_id)
    .maybeSingle();
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment ?? "",
    reviewerName: (profile as { full_name?: string } | null)?.full_name ?? "User",
    sellerReply: row.seller_reply ?? null,
    sellerRepliedAt: row.seller_replied_at ?? null,
    createdAt: row.created_at,
  };
}

export async function fetchSellerReviews(sellerId: string): Promise<GigReview[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, reviewer_id, seller_reply, seller_replied_at, created_at")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error || !data || data.length === 0) return [];

  const reviewerIds = [...new Set((data as { reviewer_id: string }[]).map((r) => r.reviewer_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", reviewerIds);
  const names = Object.fromEntries(
    (profiles ?? []).map((p: { user_id: string; full_name: string | null }) => [
      p.user_id,
      p.full_name ?? "User",
    ]),
  );

  return (data as {
    id: string;
    rating: number;
    comment: string | null;
    reviewer_id: string;
    seller_reply: string | null;
    seller_replied_at: string | null;
    created_at: string;
  }[]).map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment ?? "",
    reviewerName: names[row.reviewer_id] ?? "User",
    sellerReply: row.seller_reply ?? null,
    sellerRepliedAt: row.seller_replied_at ?? null,
    createdAt: row.created_at,
  }));
}

export function reviewAverage(reviews: GigReview[]): { average: number; count: number } {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}
