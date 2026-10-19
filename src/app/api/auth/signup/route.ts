import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminSupabase } from "@/lib/stripe-server";

export async function POST(req: Request) {
  try {
    const { email, password, name, otp } = await req.json();
    if (!email || !password || !name || !otp) {
      return NextResponse.json({ error: "missing" }, { status: 400 });
    }

    const admin = getAdminSupabase();
    if (!admin) {
      return NextResponse.json({ error: "config" }, { status: 500 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");

    const { data: otpData } = await admin
      .from("email_otps")
      .select("otp_hash, expires_at")
      .eq("email", cleanEmail)
      .single();

    if (!otpData || otpData.otp_hash !== otpHash || new Date(otpData.expires_at) < new Date()) {
      return NextResponse.json({ error: "otp_invalid" }, { status: 400 });
    }

    await admin.from("email_otps").delete().eq("email", cleanEmail);

    const { data: existingUsers } = await admin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail,
    );

    if (existing) {
      if (existing.email_confirmed_at) {
        return NextResponse.json({ error: "exists" }, { status: 400 });
      }
      await admin.auth.admin.updateUserById(existing.id, {
        email_confirm: true,
        password,
        user_metadata: { full_name: name },
      });
    } else {
      const { error } = await admin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
