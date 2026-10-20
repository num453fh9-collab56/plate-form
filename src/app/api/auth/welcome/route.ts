import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/stripe-server";
import { sendTemplateEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { userId, name, email } = await req.json();
    if (!userId || !email) {
      return NextResponse.json({ error: "missing" }, { status: 400 });
    }

    const admin = getAdminSupabase();
    if (admin) {
      await admin.from("notifications").insert({
        user_id: userId,
        type: "system",
        title: "Welcome to Hirelyx!",
        body: `Hi ${name || "there"}, your account is ready. Explore our services and let's build something great together.`,
        link: "/services",
      });
    }

    await sendTemplateEmail(email, {
      template: "welcome",
      title: "Welcome to Hirelyx!",
      body: `Hi ${name || "there"}, your account is ready. Explore our services and let's build something great together.`,
      link: "/dashboard",
      linkLabel: "Go to Dashboard",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
