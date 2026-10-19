import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminSupabase } from "@/lib/stripe-server";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ valid: false, error: "missing" });
    }

    const admin = getAdminSupabase();
    if (!admin) {
      return NextResponse.json({ valid: false, error: "config" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");

    const { data } = await admin
      .from("email_otps")
      .select("otp_hash, expires_at")
      .eq("email", cleanEmail)
      .single();

    if (!data) {
      return NextResponse.json({ valid: false, error: "not_found" });
    }

    if (new Date(data.expires_at) < new Date()) {
      await admin.from("email_otps").delete().eq("email", cleanEmail);
      return NextResponse.json({ valid: false, error: "expired" });
    }

    if (data.otp_hash !== otpHash) {
      return NextResponse.json({ valid: false, error: "invalid" });
    }

    await admin.from("email_otps").delete().eq("email", cleanEmail);
    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false, error: "failed" });
  }
}
