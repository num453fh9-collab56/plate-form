/* ==========================================================================
   HIRELYX · SITE MEDIA
   Marketing videos used by the landing page. Two of them, matching the live
   site: one plays behind the hero headline, one in the "Hirelyx in motion"
   band further down. To swap a clip, drop the .mp4 in /public/videos/ and
   point the constant at it; set a constant to null and that block falls back
   to the branded gradient, so the page never looks broken.
   ========================================================================== */

/** Muted, looping clip behind the landing headline. */
export const HERO_VIDEO: string | null = "/videos/hero-1.mp4";

/** Muted, looping clip in the mid-page band. */
export const SHOWREEL_VIDEO: string | null = "/videos/hero-2.mp4";

/* ── Legacy pre-redesign components (Landing.tsx, Cta.tsx) ──────────────── */

/** Played one after another behind the old landing hero. */
export const LANDING_VIDEOS: string[] = [
  "/videos/hero-1.mp4",
  "/videos/hero-3.mp4",
  "/videos/hero-2.mp4",
];

/** Looping video beside the old call-to-action section. */
export const CTA_VIDEO: string | null = "/videos/hero-2.mp4";
