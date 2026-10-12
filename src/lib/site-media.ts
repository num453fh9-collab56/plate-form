/* ==========================================================================
   HIRELYX · SITE MEDIA
   Marketing videos for the landing hero and the CTA block.
   To add a video: put the .mp4 in /public/videos/ and add its path here,
   e.g. "/videos/hirelyx-hero-1.mp4". While a list is empty the section shows
   a branded gradient instead, so the page never looks broken.
   ========================================================================== */

/** Played one after another (muted, looping) behind the landing headline. */
export const LANDING_VIDEOS: string[] = [
  "/videos/hero-1.mp4",
  "/videos/hero-3.mp4",
  "/videos/hero-2.mp4",
];

/** Looping video beside the "become a seller / post a gig" call to action. */
export const CTA_VIDEO: string | null = "/videos/hero-2.mp4";
