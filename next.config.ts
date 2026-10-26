import type { NextConfig } from "next";

/* Security headers sent with every response. No strict CSP yet: the app
   loads Google sign-in, Stripe, Supabase and YouTube embeds, so a CSP needs
   its own careful rollout. */
const securityHeaders = [
  // Force HTTPS for two years (browsers remember it).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Stop browsers from guessing file types (blocks some upload attacks).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nobody can put the site inside an iframe (clickjacking). CSP frame-ancestors in middleware also blocks this.
  { key: "X-Frame-Options", value: "DENY" },
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
  /* Scale the number of build workers to free memory instead of to CPU
     count. Without this, `next build` spawns one worker per core and runs
     out of heap while prerendering on machines with ~8 GB of RAM. Safe to
     remove on a build machine with plenty of memory. */
  experimental: { memoryBasedWorkersCount: true },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/hero/:path*", headers: mediaCache },
      { source: "/portfolio/:path*", headers: mediaCache },
      { source: "/videos/:path*", headers: mediaCache },
    ];
  },
  /* Permanent redirects for the service URLs that changed in the 2026
     redesign. `permanent: true` emits a 308, the method-preserving
     equivalent of a 301 — search engines treat it the same way and it is
     what Next.js issues for permanent redirects.

     Do not remove these: the old paths are indexed and linked. */
  async redirects() {
    return [
      { source: "/services/programming", destination: "/services/python-development", permanent: true },
      { source: "/services/marketing", destination: "/services/digital-marketing", permanent: true },
      { source: "/services/prompt", destination: "/services/prompt-engineering", permanent: true },
      // Social-media AI and animation work now sits inside Digital Marketing.
      { source: "/services/social-ai", destination: "/services/digital-marketing", permanent: true },
      // n8n and workflow automation are now presented as a solution.
      { source: "/services/n8n", destination: "/solutions/business-process-automation", permanent: true },
      // "Insights" is the navigation label for the existing blog.
      { source: "/insights", destination: "/blog", permanent: true },
      { source: "/insights/:slug", destination: "/blog/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
