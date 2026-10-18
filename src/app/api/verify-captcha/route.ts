import { verifyRecaptcha } from "@/lib/recaptcha-server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = await rateLimit(request, "verify-captcha", 10, 60);
  if (limited) return limited;

  let body: { token?: string; action?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = String(body.token ?? "");
  const action = String(body.action ?? "");

  if (!token || !action) {
    return Response.json({ error: "Missing captcha token." }, { status: 400 });
  }

  const result = await verifyRecaptcha(token, action);

  if (!result.pass) {
    return Response.json(
      { error: "Captcha verification failed. Please try again." },
      { status: 403 },
    );
  }

  return Response.json({ ok: true, score: result.score });
}
