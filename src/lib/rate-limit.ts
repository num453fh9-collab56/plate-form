import { getAdminSupabase } from "./stripe-server";

/* Server-only: per-client request limits for API routes.
   Counters live in Postgres (`check_rate_limit`, migration 0010) so every
   serverless instance shares them. If the database call fails we fall back to
   an in-memory window so a limiter outage never takes the API down. */

const memory = new Map<string, { start: number; hits: number }>();

function memoryLimit(key: string, max: number, windowSeconds: number): boolean {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || now - entry.start > windowSeconds * 1000) {
    memory.set(key, { start: now, hits: 1 });
    if (memory.size > 5000) memory.clear();
    return true;
  }
  entry.hits += 1;
  return entry.hits <= max;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Returns a 429 Response when the caller is over the limit, otherwise null.
 * `identity` defaults to the client IP; pass a user id for per-account limits.
 */
export async function rateLimit(
  request: Request,
  name: string,
  max: number,
  windowSeconds: number,
  identity?: string,
): Promise<Response | null> {
  const key = `${name}:${identity ?? clientIp(request)}`;
  let allowed: boolean;
  const admin = getAdminSupabase();
  if (admin) {
    const { data, error } = await admin.rpc("check_rate_limit", {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    allowed = error ? memoryLimit(key, max, windowSeconds) : data !== false;
  } else {
    allowed = memoryLimit(key, max, windowSeconds);
  }
  if (allowed) return null;
  return Response.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(windowSeconds) } },
  );
}
