import type { Instrumentation } from "next";

/* Server-side error tracking: every error Next.js catches while rendering a
   page or running an API route is written to public.error_logs. */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { logError } = await import("@/lib/error-log");
  const message = err instanceof Error ? err.message : String(err);
  const digest =
    typeof err === "object" && err !== null && "digest" in err
      ? String((err as { digest: unknown }).digest)
      : undefined;
  const userAgent = request.headers["user-agent"];
  await logError({
    source: context.routeType === "route" ? "api" : "server",
    message,
    digest,
    path: `${request.method} ${request.path}`,
    userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
    context: {
      routePath: context.routePath,
      routeType: context.routeType,
      stack: err instanceof Error ? err.stack?.slice(0, 4000) : undefined,
    },
  });
};
