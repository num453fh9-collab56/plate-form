import type { SupabaseClient } from "@supabase/supabase-js";
import { getEmailForUser, sendTemplateEmail } from "./email";
import type { EmailData, EmailTemplate } from "./email";

/* Server-only: in-app notification + matching email. */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface NotifyOptions {
  template?: EmailTemplate;
  orderTitle?: string;
  amount?: string;
  counterpart?: string;
  linkLabel?: string;
}

export async function notifyUser(
  admin: SupabaseClient,
  userId: string | null | undefined,
  title: string,
  body: string,
  link = "/orders",
  typeOrOpts: string | NotifyOptions = "order",
): Promise<void> {
  if (!userId) return;
  const opts: NotifyOptions = typeof typeOrOpts === "string" ? {} : typeOrOpts;
  const type = typeof typeOrOpts === "string" ? typeOrOpts : "order";

  await admin.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    link,
  });

  const email = await getEmailForUser(admin, userId);
  const emailData: EmailData = {
    template: opts.template ?? "generic",
    title,
    body,
    link,
    linkLabel: opts.linkLabel ?? "View on Hirelyx",
    orderTitle: opts.orderTitle,
    amount: opts.amount,
    counterpart: opts.counterpart,
  };
  await sendTemplateEmail(email, emailData);
}
