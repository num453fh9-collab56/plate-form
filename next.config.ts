import type { NextConfig } from "next";

/* Security headers sent with every response. No strict CSP yet: the app
   loads Google sign-in, Stripe, Supabase and YouTube embeds, so a CSP needs
   its own careful rollout. */
const securityHeaders = [
  // Force HTTPS for two years (browsers remember it).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Stop browsers from guessing file types (blocks some upload attacks).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nobody can put the site inside an iframe (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Camera/mic only for our own intro-video recorder; no location, etc.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), browsing-topics=()" },
  // Keeps Google sign-in popups working while isolating the window.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

/* Static media in /public: cache at the CDN edge and in the browser for a
   day, then serve stale while refreshing in the background for a week. */
const mediaCache = [
  { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/hero/:path*", headers: mediaCache },
      { source: "/portfolio/:path*", headers: mediaCache },
      { source: "/videos/:path*", headers: mediaCache },
    ];
  },
};

export default nextConfig;
