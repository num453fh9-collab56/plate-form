"use client";

import { getSupabase } from "./supabase";

const SESSION_KEY = "wv_visitor_id";
const HEARTBEAT_MS = 30_000;

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (id) return id;
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `anon_${Date.now().toString(36)}`;
  }
}

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

function sendHeartbeat(visitorId: string, userId: string | null) {
  const supabase = getSupabase();
  if (!supabase) return;
  void supabase.from("active_sessions").upsert(
    {
      id: visitorId,
      user_id: userId || null,
      last_seen: new Date().toISOString(),
      path: window.location.pathname,
    },
    { onConflict: "id" },
  );
}

function removeSession(visitorId: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  void supabase.from("active_sessions").delete().eq("id", visitorId);
}

export function startTracking(userId: string | null) {
  const supabase = getSupabase();
  if (!supabase || typeof window === "undefined") return;

  const visitorId = getVisitorId();

  void supabase.from("page_views").insert({
    visitor_id: visitorId,
    path: window.location.pathname,
    referrer: document.referrer || null,
  });

  sendHeartbeat(visitorId, userId);

  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => sendHeartbeat(visitorId, userId), HEARTBEAT_MS);

  const cleanup = () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    removeSession(visitorId);
  };
  window.addEventListener("beforeunload", cleanup);

  return () => {
    window.removeEventListener("beforeunload", cleanup);
    cleanup();
  };
}

export interface AnalyticsSummary {
  online_now: number;
  today: number;
  this_week: number;
  this_month: number;
  total_views_today: number;
  total_views_month: number;
}

export async function fetchAnalytics(): Promise<AnalyticsSummary | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("get_analytics_summary");
  if (error || !data) return null;
  return data as AnalyticsSummary;
}
