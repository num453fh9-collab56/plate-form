import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "otp-secret";
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

function createHash(email: string, otp: string, expiry: number): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(`${email.toLowerCase()}:${otp}:${expiry}`)
    .digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "missing" }, { status: 400 });
    }

    const otp = generateOtp();
    const expiry = Date.now() + OTP_EXPIRY_MS;
    const hash = createHash(email, otp, expiry);

    await sendEmail(
      email,
      "Hirelyx — Verify your email",
      `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">
<tr><td style="background:#0d9488;padding:24px 32px">
<span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">Hirelyx</span>
</td></tr>
<tr><td style="padding:32px;text-align:center">
<h2 style="margin:0 0 8px;font-size:20px;color:#18181b">Verify your email</h2>
<p style="margin:0 0 24px;font-size:15px;color:#3f3f46">Enter this code to create your account:</p>
<div style="background:#f4f4f5;border-radius:12px;padding:20px;display:inline-block;margin:0 0 24px">
<span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0d9488">${otp}</span>
</div>
<p style="margin:0;font-size:13px;color:#71717a">This code expires in 10 minutes.</p>
</td></tr>
<tr><td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;text-align:center">
<p style="margin:0">If you didn't request this, ignore this email.</p>
</td></tr>
</table></td></tr></table></body></html>`,
    );

    return NextResponse.json({ hash, expiry });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
