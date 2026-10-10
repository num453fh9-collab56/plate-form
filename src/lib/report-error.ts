"use client";

import { getSupabase } from "./supabase";

/* Browser-side error reporter → POST /api/log-error. Deduplicates repeats and
   caps volume per page load so a render loop cannot flood the log. */

const seen = new Set<string>();
let sent = 0;
const MAX_PER_PAGE = 10;

export async function reportError(
  error: unknown,
  extra: { digest?: string; kind?: string } = {},
): Promise<void> {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;
  const err = error instanceof Error ? error : new Error(String(error));
  const signature = `${err.message}|${window.location.pathname}`;
  if (seen.has(signature) || sent >= MAX_PER_PAGE) return;
  seen.add(signature);
  sent += 1;

  try {
    const supabase = getSupabase();
    const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
    await fetch("/api/log-error", {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message: err.message || "Unknown error",
        stack: err.stack,
        digest: extra.digest,
        kind: extra.kind,
        path: window.location.pathname + window.location.search,
      }),
    });
  } catch {
    /* never let reporting throw */
  }
}
