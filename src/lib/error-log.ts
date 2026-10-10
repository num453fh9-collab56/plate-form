import { getAdminSupabase } from "./stripe-server";

/* Server-only: persist an error to `public.error_logs` (migration 0010).
   Never throws — logging must not create new failures. */

export interface ErrorLogEntry {
  source: "client" | "server" | "api";
  message: string;
  digest?: string | null;
  path?: string | null;
  userId?: string | null;
  userAgent?: string | null;
  context?: Record<string, unknown>;
}

const clip = (value: string | null | undefined, max: number) =>
  value ? String(value).slice(0, max) : null;

export async function logError(entry: ErrorLogEntry): Promise<void> {
  try {
    const admin = getAdminSupabase();
    if (!admin) return;
    await admin.from("error_logs").insert({
      source: entry.source,
      message: clip(entry.message, 2000) ?? "Unknown error",
      digest: clip(entry.digest, 200),
      path: clip(entry.path, 500),
      user_id: entry.userId ?? null,
      user_agent: clip(entry.userAgent, 300),
      context: entry.context ?? {},
    });
  } catch {
    /* swallow — see header comment */
  }
}
