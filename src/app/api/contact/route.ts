import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { verifyRecaptcha } from "@/lib/recaptcha-server";

export const runtime = "nodejs";

const SUPPORT_EMAIL = "support@hirelyx.com";

export async function POST(request: Request) {
  const limited = await rateLimit(request, "contact-form", 3, 300);
  if (limited) return limited;

  let body: { name?: string; email?: string; subject?: string; message?: string; captchaToken?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const captcha = await verifyRecaptcha(body.captchaToken, "contact");
  if (!captcha.pass) {
    return Response.json({ error: "Bot verification failed. Please try again." }, { status: 403 });
  }

  const name = String(body.name ?? "").trim().slice(0, 100);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const subject = String(body.subject ?? "General Inquiry").trim().slice(0, 200);
  const message = String(body.message ?? "").trim().slice(0, 5000);

  if (!name || !email || !message) {
    return Response.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const html = `
    <h2>New Contact Form Message</h2>
    <p><strong>Name:</strong> ${name.replace(/</g, "&lt;")}</p>
    <p><strong>Email:</strong> ${email.replace(/</g, "&lt;")}</p>
    <p><strong>Subject:</strong> ${subject.replace(/</g, "&lt;")}</p>
    <hr />
    <p>${message.replace(/</g, "&lt;").replace(/\n/g, "<br />")}</p>
  `;

  await sendEmail(SUPPORT_EMAIL, `[Hirelyx Contact] ${subject}`, html);

  return Response.json({ ok: true });
}
