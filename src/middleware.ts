import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const nonce = crypto.randomUUID().replace(/-/g, "");

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://accounts.google.com https://apis.google.com https://js.stripe.com https://cdn.jsdelivr.net`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com https://flagcdn.com https://*.stripe.com`,
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.deepseek.com https://api.stripe.com https://open.er-api.com`,
    `frame-src https://accounts.google.com https://js.stripe.com https://meet.jit.si`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Nonce", nonce);

  const url = request.nextUrl;

  if (url.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (request.method !== "GET" && origin && origin !== new URL(siteUrl).origin) {
      if (!url.pathname.startsWith("/api/stripe/webhook")) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.png|manifest.webmanifest|hero/|portfolio/|videos/).*)",
  ],
};
