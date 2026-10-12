import { getUserFromRequest } from "@/lib/stripe-server";
import { logError } from "@/lib/error-log";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface ClientErrorBody {
  message?: string;
  digest?: string;
  path?: string;
  stack?: string;
  kind?: string;
}

/* Receives browser errors from src/lib/report-error.ts. */
export async function POST(request: Request) {
  const limited = await rateLimit(request, "log-error", 10, 60);
  if (limited) return limited;

  let body: ClientErrorBody;
  try {
    body = (await request.json()) as ClientErrorBody;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const message = String(body.message ?? "").slice(0, 1000);
  if (!message) return Response.json({ ok: false }, { status: 400 });

  const user = await getUserFromRequest(request);
  await logError({
    source: "client",
    message,
    digest: body.digest ? String(body.digest).slice(0, 200) : undefined,
    path: body.path ? String(body.path).slice(0, 500) : undefined,
    userId: user?.id,
    userAgent: request.headers.get("user-agent"),
    context: {
      kind: body.kind ?? "error",
      stack: body.stack ? String(body.stack).slice(0, 2000) : undefined,
    },
  });
  return Response.json({ ok: true });
}
