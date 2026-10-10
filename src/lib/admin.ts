"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "./supabase";

/* Client helpers for the admin panel. `useIsAdmin` only decides whether to
   show admin UI — the /api/admin route re-checks every request on the server. */

export function useIsAdmin(userId: string | undefined): boolean | null {
  const [state, setState] = useState<{ id: string; admin: boolean } | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userId) return;
    let cancelled = false;
    void supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setState({ id: userId, admin: Boolean(data) });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!userId) return false;
  return state && state.id === userId ? state.admin : null;
}

export async function adminFetch<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown } = {},
): Promise<{ data?: T; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Backend not configured." };
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return { error: "Please sign in." };
  try {
    const response = await fetch(path, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
    if (!response.ok) return { error: payload.error ?? `Request failed (${response.status}).` };
    return { data: payload };
  } catch {
    return { error: "Network error." };
  }
}
