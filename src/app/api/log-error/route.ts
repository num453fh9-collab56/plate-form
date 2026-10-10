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
  const limited = await rateLimit(request, "log-error", 20, 60);
  if (limited) return limited;

  let body: ClientErrorBody;
  try {
    body = (await request.json()) as ClientErrorBody;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (!body.message) return Response.json({ ok: false }, { status: 400 });

  const user = await getUserFromRequest(request);
  await logError({
    source: "client",
    message: body.message,
    digest: body.digest,
    path: body.path,
    userId: user?.id,
    userAgent: request.headers.get("user-agent"),
    context: {
      kind: body.kind ?? "error",
      stack: body.stack ? String(body.stack).slice(0, 4000) : undefined,
    },
  });
  return Response.json({ ok: true });
}
