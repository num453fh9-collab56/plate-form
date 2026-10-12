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

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
  if (/mobile|iphone|ipod|android.*mobile|opera m(ob|in)i/i.test(ua)) return "Mobile";
  return "Desktop";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  return "Other";
}

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

function sendHeartbeat(visitorId: string, userId: string | null, device: string, country: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  void supabase.from("active_sessions").upsert(
    {
      id: visitorId,
      user_id: userId || null,
      last_seen: new Date().toISOString(),
      path: window.location.pathname,
      device,
      country,
    },
    { onConflict: "id" },
  );
}

function removeSession(visitorId: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  void supabase.from("active_sessions").delete().eq("id", visitorId);
}

async function detectCountry(): Promise<string> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "force-cache" });
    return ""; // We'll get country from Vercel headers server-side instead
  } catch {
    return "";
  }
}

export function startTracking(userId: string | null) {
  const supabase = getSupabase();
  if (!supabase || typeof window === "undefined") return;

  const visitorId = getVisitorId();
  const device = detectDevice();
  const browser = detectBrowser();

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  const country = tzToCountry(tz);

  void supabase.from("page_views").insert({
    visitor_id: visitorId,
    path: window.location.pathname,
    referrer: document.referrer || null,
    device,
    browser,
    country: country || null,
    user_id: userId || null,
  });

  sendHeartbeat(visitorId, userId, device, country);

  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => sendHeartbeat(visitorId, userId, device, country), HEARTBEAT_MS);

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

const TZ_MAP: Record<string, string> = {
  "Asia/Karachi": "Pakistan",
  "Asia/Dubai": "UAE",
  "Asia/Riyadh": "Saudi Arabia",
  "Asia/Kolkata": "India",
  "Asia/Calcutta": "India",
  "Europe/London": "UK",
  "America/New_York": "USA",
  "America/Chicago": "USA",
  "America/Denver": "USA",
  "America/Los_Angeles": "USA",
  "America/Toronto": "Canada",
  "America/Vancouver": "Canada",
  "Europe/Berlin": "Germany",
  "Europe/Paris": "France",
  "Europe/Istanbul": "Turkey",
  "Asia/Shanghai": "China",
  "Asia/Tokyo": "Japan",
  "Asia/Seoul": "South Korea",
  "Asia/Singapore": "Singapore",
  "Asia/Dhaka": "Bangladesh",
  "Asia/Kabul": "Afghanistan",
  "Asia/Tehran": "Iran",
  "Asia/Baghdad": "Iraq",
  "Asia/Kuwait": "Kuwait",
  "Asia/Muscat": "Oman",
  "Asia/Qatar": "Qatar",
  "Asia/Bahrain": "Bahrain",
  "Africa/Cairo": "Egypt",
  "Africa/Lagos": "Nigeria",
  "Africa/Nairobi": "Kenya",
  "Australia/Sydney": "Australia",
  "Australia/Melbourne": "Australia",
  "Pacific/Auckland": "New Zealand",
  "Europe/Rome": "Italy",
  "Europe/Madrid": "Spain",
  "Europe/Amsterdam": "Netherlands",
  "Europe/Stockholm": "Sweden",
  "Europe/Oslo": "Norway",
  "Asia/Manila": "Philippines",
  "Asia/Jakarta": "Indonesia",
  "Asia/Kuala_Lumpur": "Malaysia",
};

function tzToCountry(tz: string): string {
  if (TZ_MAP[tz]) return TZ_MAP[tz];
  const region = tz.split("/")[0];
  if (region === "Asia") return tz.split("/")[1]?.replace(/_/g, " ") ?? "";
  if (region === "Europe") return tz.split("/")[1]?.replace(/_/g, " ") ?? "";
  if (region === "America") return "Americas";
  if (region === "Africa") return "Africa";
  if (region === "Australia") return "Australia";
  return "";
}

/* ── Types ── */

export interface AnalyticsSummary {
  online_now: number;
  online_logged_in: number;
  today: number;
  yesterday: number;
  this_week: number;
  this_month: number;
  total_views_today: number;
  total_views_month: number;
  total_all_time: number;
}

export interface TopPage { path: string; views: number; visitors: number }
export interface HourlyData { hour: number; views: number }
export interface DailyData { day: string; visitors: number; views: number }
export interface DeviceData { device: string; views: number }
export interface BrowserData { browser: string; views: number }
export interface CountryData { country: string; views: number; visitors: number }
export interface ReferrerData { source: string; views: number }
export interface LiveVisitor { id: string; path: string; device: string; country: string; last_seen: string; logged_in: boolean }

export async function fetchAnalytics(): Promise<AnalyticsSummary | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("get_analytics_summary");
  if (error || !data) return null;
  return data as AnalyticsSummary;
}

export async function fetchTopPages(): Promise<TopPage[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.rpc("get_top_pages");
  return (data ?? []) as TopPage[];
}

export async function fetchHourlyTraffic(): Promise<HourlyData[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.rpc("get_hourly_traffic");
  return (data ?? []) as HourlyData[];
}

export async function fetchDailyVisitors(): Promise<DailyData[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.rpc("get_daily_visitors");
  return (data ?? []) as DailyData[];
}

export async function fetchDeviceStats(): Promise<DeviceData[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.rpc("get_device_stats");
  return (data ?? []) as DeviceData[];
}

export async function fetchBrowserStats(): Promise<BrowserData[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.rpc("get_browser_stats");
  return (data ?? []) as BrowserData[];
}

export async function fetchCountryStats(): Promise<CountryData[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.rpc("get_country_stats");
  return (data ?? []) as CountryData[];
}

export async function fetchReferrerStats(): Promise<ReferrerData[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.rpc("get_referrer_stats");
  return (data ?? []) as ReferrerData[];
}

export async function fetchLiveVisitors(): Promise<LiveVisitor[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.rpc("get_live_visitors");
  return (data ?? []) as LiveVisitor[];
}
