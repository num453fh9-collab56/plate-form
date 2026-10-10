"use client";

import { getSupabase } from "./supabase";

/* Buyer requests (job posts) and seller proposals. Reads go straight to
   Supabase (RLS decides who sees what); writes go through /api/jobs. */

export interface JobPost {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  category: string | null;
  skills: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  deliveryDays: number | null;
  status: "open" | "closed" | "hired";
  proposalsCount: number;
  createdAt: string;
}

export interface Proposal {
  id: string;
  jobId: string;
  sellerId: string;
  coverLetter: string;
  amount: number;
  deliveryDays: number;
  status: "pending" | "shortlisted" | "declined" | "hired";
  createdAt: string;
  sellerName?: string;
  sellerTitle?: string | null;
}

interface JobRow {
  id: string;
  buyer_id: string;
  title: string;
  description: string;
  category: string | null;
  skills: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  delivery_days: number | null;
  status: JobPost["status"];
  proposals_count: number;
  created_at: string;
}

interface ProposalRow {
  id: string;
  job_id: string;
  seller_id: string;
  cover_letter: string;
  amount: number;
  delivery_days: number;
  status: Proposal["status"];
  created_at: string;
}

const toJob = (row: JobRow): JobPost => ({
  id: row.id,
  buyerId: row.buyer_id,
  title: row.title,
  description: row.description,
  category: row.category,
  skills: Array.isArray(row.skills) ? row.skills : [],
  budgetMin: row.budget_min == null ? null : Number(row.budget_min),
  budgetMax: row.budget_max == null ? null : Number(row.budget_max),
  deliveryDays: row.delivery_days,
  status: row.status,
  proposalsCount: row.proposals_count ?? 0,
  createdAt: row.created_at,
});

const toProposal = (row: ProposalRow): Proposal => ({
  id: row.id,
  jobId: row.job_id,
  sellerId: row.seller_id,
  coverLetter: row.cover_letter,
  amount: Number(row.amount),
  deliveryDays: row.delivery_days,
  status: row.status,
  createdAt: row.created_at,
});

export async function fetchOpenJobs(opts: { category?: string; q?: string } = {}): Promise<JobPost[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  let query = supabase.from("job_posts").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(60);
  if (opts.category && opts.category !== "All") query = query.eq("category", opts.category);
  const term = (opts.q ?? "").trim().replace(/[,()%]/g, " ");
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  const { data } = await query;
  return ((data ?? []) as JobRow[]).map(toJob);
}

export async function fetchMyJobs(userId: string): Promise<JobPost[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("job_posts")
    .select("*")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as JobRow[]).map(toJob);
}

export async function fetchJob(id: string): Promise<JobPost | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("job_posts").select("*").eq("id", id).maybeSingle();
  return data ? toJob(data as JobRow) : null;
}

/** Proposals visible to the caller: all of them for the owner, only their own for a seller. */
export async function fetchProposals(jobId: string): Promise<Proposal[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("proposals")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });
  const proposals = ((data ?? []) as ProposalRow[]).map(toProposal);
  if (proposals.length === 0) return proposals;
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, title")
    .in("user_id", proposals.map((p) => p.sellerId));
  const byId = new Map(
    ((profiles ?? []) as { user_id: string; full_name: string | null; title: string | null }[]).map((p) => [p.user_id, p]),
  );
  return proposals.map((p) => ({
    ...p,
    sellerName: byId.get(p.sellerId)?.full_name ?? "Freelancer",
    sellerTitle: byId.get(p.sellerId)?.title ?? null,
  }));
}

export async function jobAction<T = { ok: boolean }>(body: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  const supabase = getSupabase();
  const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
  if (!token) return { error: "Please sign in." };
  try {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
    if (!response.ok) return { error: payload.error ?? "Something went wrong." };
    return { data: payload };
  } catch {
    return { error: "Network error." };
  }
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const units: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [size, name] of units) {
    if (seconds >= size) {
      const n = Math.floor(seconds / size);
      return `${n} ${name}${n === 1 ? "" : "s"} ago`;
    }
  }
  return "just now";
}
