import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/stripe-server";

export const runtime = "nodejs";

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "Hirelyx <support@hirelyx.com>";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(payload: EmailPayload) {
  if (!RESEND_KEY) return { ok: false, error: "No API key" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, ...payload }),
  });
  if (!res.ok) return { ok: false, error: await res.text() };
  return { ok: true };
}

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
<div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
<div style="text-align:center;margin-bottom:24px">
<h1 style="font-size:20px;font-weight:800;color:#0066cc;margin:0">Hirelyx</h1>
</div>
<h2 style="font-size:18px;font-weight:700;color:#1a1a2e;margin:0 0 16px">${title}</h2>
${body}
</div>
<p style="text-align:center;font-size:12px;color:#8898aa;margin-top:24px">
Hirelyx — Professional Services Team<br>
<a href="https://plate-form-4hmb.vercel.app" style="color:#0066cc;text-decoration:none">hirelyx.com</a>
</p>
</div></body></html>`;
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, data } = await req.json();

  if (type === "booking-confirmation") {
    const { clientEmail, clientName, date, time, service } = data;
    if (!clientEmail) return NextResponse.json({ error: "No email" }, { status: 400 });
    const result = await sendEmail({
      to: clientEmail,
      subject: "Booking Confirmed — Hirelyx",
      html: baseTemplate("Booking Confirmed! ✅", `
        <p style="color:#4a5568;line-height:1.6;margin:0 0 16px">Hi ${clientName || "there"},</p>
        <p style="color:#4a5568;line-height:1.6;margin:0 0 16px">Your consultation has been confirmed:</p>
        <div style="background:#f7f7fb;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="margin:4px 0;font-size:14px"><strong>📅 Date:</strong> ${date}</p>
          <p style="margin:4px 0;font-size:14px"><strong>🕐 Time:</strong> ${time}</p>
          ${service ? `<p style="margin:4px 0;font-size:14px"><strong>🏷️ Service:</strong> ${service}</p>` : ""}
        </div>
        <p style="color:#4a5568;line-height:1.6;margin:0 0 16px">We'll reach out before the meeting. If you need to reschedule, reply to this email.</p>
        <p style="color:#4a5568;margin:0">— Hirelyx Team</p>
      `),
    });
    return NextResponse.json(result);
  }

  if (type === "invoice-sent") {
    const { clientEmail, clientName, invoiceNumber, total, currency, dueDate } = data;
    if (!clientEmail) return NextResponse.json({ error: "No email" }, { status: 400 });
    const sym = currency === "PKR" ? "Rs " : "$";
    const result = await sendEmail({
      to: clientEmail,
      subject: `${invoiceNumber} — New Invoice from Hirelyx`,
      html: baseTemplate("New Invoice", `
        <p style="color:#4a5568;line-height:1.6;margin:0 0 16px">Hi ${clientName || "there"},</p>
        <p style="color:#4a5568;line-height:1.6;margin:0 0 16px">A new invoice has been created for you:</p>
        <div style="background:#f7f7fb;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="margin:4px 0;font-size:14px"><strong>Invoice #:</strong> ${invoiceNumber}</p>
          <p style="margin:4px 0;font-size:14px"><strong>Amount:</strong> ${sym}${total}</p>
          ${dueDate ? `<p style="margin:4px 0;font-size:14px"><strong>Due:</strong> ${dueDate}</p>` : ""}
        </div>
        <a href="https://plate-form-4hmb.vercel.app/invoices" style="display:inline-block;background:#0066cc;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;margin:0 0 16px">View Invoice</a>
        <p style="color:#4a5568;margin:0">— Hirelyx Team</p>
      `),
    });
    return NextResponse.json(result);
  }

  if (type === "project-update") {
    const { clientEmail, clientName, projectTitle, stage, message } = data;
    if (!clientEmail) return NextResponse.json({ error: "No email" }, { status: 400 });
    const result = await sendEmail({
      to: clientEmail,
      subject: `Project Update: ${projectTitle} — Hirelyx`,
      html: baseTemplate("Project Update", `
        <p style="color:#4a5568;line-height:1.6;margin:0 0 16px">Hi ${clientName || "there"},</p>
        <p style="color:#4a5568;line-height:1.6;margin:0 0 16px">Your project <strong>${projectTitle}</strong> has been updated:</p>
        <div style="background:#f7f7fb;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="margin:4px 0;font-size:14px"><strong>Current Stage:</strong> ${stage}</p>
          ${message ? `<p style="margin:4px 0;font-size:14px"><strong>Note:</strong> ${message}</p>` : ""}
        </div>
        <a href="https://plate-form-4hmb.vercel.app/projects" style="display:inline-block;background:#0066cc;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;margin:0 0 16px">View Project</a>
        <p style="color:#4a5568;margin:0">— Hirelyx Team</p>
      `),
    });
    return NextResponse.json(result);
  }

  if (type === "quote-sent") {
    const { clientEmail, clientName, quoteNumber, total, currency } = data;
    if (!clientEmail) return NextResponse.json({ error: "No email" }, { status: 400 });
    const sym = currency === "PKR" ? "Rs " : "$";
    const result = await sendEmail({
      to: clientEmail,
      subject: `${quoteNumber} — Quote from Hirelyx`,
      html: baseTemplate("New Quote", `
        <p style="color:#4a5568;line-height:1.6;margin:0 0 16px">Hi ${clientName || "there"},</p>
        <p style="color:#4a5568;line-height:1.6;margin:0 0 16px">We've prepared a quote for you:</p>
        <div style="background:#f7f7fb;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="margin:4px 0;font-size:14px"><strong>Quote #:</strong> ${quoteNumber}</p>
          <p style="margin:4px 0;font-size:14px"><strong>Total:</strong> ${sym}${total}</p>
        </div>
        <a href="https://plate-form-4hmb.vercel.app/invoices" style="display:inline-block;background:#0066cc;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;margin:0 0 16px">View Quote</a>
        <p style="color:#4a5568;margin:0">— Hirelyx Team</p>
      `),
    });
    return NextResponse.json(result);
  }

  if (type === "welcome") {
    const { clientEmail, clientName } = data;
    if (!clientEmail) return NextResponse.json({ error: "No email" }, { status: 400 });
    const result = await sendEmail({
      to: clientEmail,
      subject: "Welcome to Hirelyx! 🚀",
      html: baseTemplate("Welcome to Hirelyx! 🚀", `
        <p style="color:#4a5568;line-height:1.6;margin:0 0 16px">Hi ${clientName || "there"},</p>
        <p style="color:#4a5568;line-height:1.6;margin:0 0 16px">Welcome aboard! We're a team of developers, marketers, and AI specialists ready to help you build something amazing.</p>
        <p style="color:#4a5568;line-height:1.6;margin:0 0 16px">Here's what you can do:</p>
        <ul style="color:#4a5568;line-height:1.8;padding-left:20px;margin:0 0 16px">
          <li>📊 Track your projects in real-time</li>
          <li>📅 Book consultations with our team</li>
          <li>📄 View quotes and invoices</li>
          <li>💬 Chat with us directly</li>
        </ul>
        <a href="https://plate-form-4hmb.vercel.app/dashboard" style="display:inline-block;background:#0066cc;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;margin:0 0 16px">Go to Dashboard</a>
        <p style="color:#4a5568;margin:0">— Hirelyx Team</p>
      `),
    });
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown notification type" }, { status: 400 });
}
