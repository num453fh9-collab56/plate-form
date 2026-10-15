/* Server-only: send transactional email via Resend. No-op if not configured. */
import type { SupabaseClient } from "@supabase/supabase-js";

const SITE = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://hirelyx.com";
const BRAND = "#0d9488";

function emailLayout(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">
<tr><td style="background:${BRAND};padding:24px 32px">
<a href="${SITE()}" style="color:#fff;font-size:22px;font-weight:700;text-decoration:none;letter-spacing:-0.5px">Hirelyx</a>
</td></tr>
<tr><td style="padding:32px">${body}</td></tr>
<tr><td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;text-align:center">
<p style="margin:0">You received this because you have an account on <a href="${SITE()}" style="color:${BRAND}">Hirelyx</a>.</p>
<p style="margin:8px 0 0"><a href="${SITE()}/notifications" style="color:${BRAND}">Manage notification settings</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
}

function btn(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 28px;background:${BRAND};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px">${label}</a>`;
}

export type EmailTemplate =
  | "order_paid"
  | "order_delivered"
  | "order_completed"
  | "revision_requested"
  | "order_cancelled"
  | "dispute_opened"
  | "dispute_resolved"
  | "review_received"
  | "tip_received"
  | "extension_requested"
  | "payout_sent"
  | "welcome"
  | "generic";

export interface EmailData {
  template: EmailTemplate;
  title: string;
  body: string;
  link?: string;
  linkLabel?: string;
  amount?: string;
  orderTitle?: string;
  counterpart?: string;
}

function buildHtml(data: EmailData): string {
  const h = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const link = data.link ? `${SITE()}${data.link}` : SITE();
  const linkLabel = data.linkLabel ?? "View on Hirelyx";

  let content = `<h2 style="margin:0 0 16px;font-size:20px;color:#18181b">${h(data.title)}</h2>`;
  content += `<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6">${h(data.body)}</p>`;

  if (data.orderTitle) {
    content += `<div style="background:#f4f4f5;border-radius:8px;padding:14px 18px;margin:0 0 16px">
      <p style="margin:0;font-size:13px;color:#71717a">Order</p>
      <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#18181b">${h(data.orderTitle)}</p>
      ${data.amount ? `<p style="margin:4px 0 0;font-size:14px;color:${BRAND};font-weight:600">${h(data.amount)}</p>` : ""}
      ${data.counterpart ? `<p style="margin:4px 0 0;font-size:13px;color:#71717a">with ${h(data.counterpart)}</p>` : ""}
    </div>`;
  }

  content += `<p style="margin:16px 0 0">${btn(linkLabel, link)}</p>`;
  return emailLayout(content);
}

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

export async function sendTemplateEmail(to: string | null | undefined, data: EmailData): Promise<void> {
  await sendEmail(to, `Hirelyx — ${data.title}`, buildHtml(data));
}

export async function getEmailForUser(admin: SupabaseClient, userId: string): Promise<string | null> {
  try {
    const { data } = await admin.auth.admin.getUserById(userId);
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}
