"use client";

import { getSupabase } from "./supabase";

export async function startCheckout(
  gigId: string,
  requirements: string,
  choice: { packageKey?: string | null; extras?: string[] } = {},
): Promise<{ url?: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Backend not configured." };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return { error: "Please sign in to place an order." };

  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      gigId,
      requirements,
      packageKey: choice.packageKey ?? undefined,
      extras: choice.extras ?? [],
    }),
  });

  let payload: { url?: string; error?: string } = {};
  try {
    payload = (await response.json()) as { url?: string; error?: string };
  } catch {
    payload = {};
  }

  if (!response.ok || !payload.url) {
    return { error: payload.error ?? "Could not start checkout." };
  }
  return { url: payload.url };
}
