/* Server-only: send transactional email via Resend. No-op if not configured. */
import type { SupabaseClient } from "@supabase/supabase-js";

export async function sendEmail(to: string | null | undefined, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Hirelyx <onboarding@resend.dev>";
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
  } catch {
    /* email best-effort */
  }
}

export async function getEmailForUser(admin: SupabaseClient, userId: string): Promise<string | null> {
  try {
    const { data } = await admin.auth.admin.getUserById(userId);
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}
