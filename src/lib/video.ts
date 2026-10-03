"use client";

/* ==========================================================================
   APEX · VIDEO HELPERS
   Resolve the many shapes a freelancer can paste or upload — data URLs,
   public MP4/WebM files, or a YouTube / Vimeo link — into something an
   HTML5 <video> or an <iframe> can actually play, plus a poster thumbnail.
   ========================================================================== */

export type VideoKind = "file" | "embed";

export interface ParsedVideo {
  kind: VideoKind;
  src: string;
  poster?: string;
}

const YOUTUBE = /(?:youtube\.com\/(?:watch\?[^#]*?\bv=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i;
const VIMEO = /vimeo\.com\/(?:video\/)?(\d+)/i;

export function isVideoValue(value: string): boolean {
  return /^(data:video\/|blob:|https?:\/\/|\/|\.\/)/i.test(value.trim());
}

export function isExternalVideoLink(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export function parseVideo(src: string, poster?: string): ParsedVideo {
  const value = src.trim();

  const youtube = value.match(YOUTUBE);
  if (youtube) {
    return {
      kind: "embed",
      src: `https://www.youtube.com/embed/${youtube[1]}?rel=0&autoplay=1`,
      poster: poster || `https://i.ytimg.com/vi/${youtube[1]}/hqdefault.jpg`,
    };
  }

  const vimeo = value.match(VIMEO);
  if (vimeo) {
    return {
      kind: "embed",
      src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`,
      poster,
    };
  }

  return { kind: "file", src: value, poster };
}
