"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const SUPABASE_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export const SUPABASE_CONFIGURED =
  SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_CONFIGURED) return null;
  if (!cached) {
    cached = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return cached;
}
