import { NextResponse } from "next/server";
import crypto from "crypto";

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "otp-secret";

function createHash(email: string, otp: string, expiry: number): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(`${email.toLowerCase()}:${otp}:${expiry}`)
    .digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email, otp, hash, expiry } = await req.json();
    if (!email || !otp || !hash || !expiry) {
      return NextResponse.json({ valid: false, error: "missing" });
    }

    if (Date.now() > expiry) {
      return NextResponse.json({ valid: false, error: "expired" });
    }

    const expected = createHash(email, otp, expiry);
    if (hash !== expected) {
      return NextResponse.json({ valid: false, error: "invalid" });
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false, error: "failed" });
  }
}
