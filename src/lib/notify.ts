import type { SupabaseClient } from "@supabase/supabase-js";
import { getEmailForUser, sendEmail } from "./email";

/* Server-only: in-app notification + matching email. User-written text is
   HTML-escaped before it reaches the email body. */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function notifyUser(
  admin: SupabaseClient,
  userId: string | null | undefined,
  title: string,
  body: string,
  link = "/orders",
): Promise<void> {
  if (!userId) return;
  await admin.from("notifications").insert({
    user_id: userId,
    type: "order",
    title,
    body,
    link,
  });
  const email = await getEmailForUser(admin, userId);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  await sendEmail(
    email,
    `Hirelyx — ${title}`,
    `<p><strong>${escapeHtml(title)}</strong></p><p>${escapeHtml(body)}</p>` +
      `<p><a href="${site}${link}">Open Hirelyx</a></p>`,
  );
}
