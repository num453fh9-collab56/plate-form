"use client";

import { useId } from "react";

/* Hirelyx mark — "Ascend H".
   An espresso tile carries its own background, so the mark holds up on the
   dark header, on cream sections, in email and as a favicon without a second
   artwork. Inside it: an H whose stems are deliberately unequal, bottom-
   aligned on a shared baseline, with a bronze crossbar that rises left to
   right. The baseline rule echoes the Hire_lyx_ wordmark.
   Source of truth for the shape; /public/logo-mark.svg and src/app/icon.svg
   are the same geometry with fixed gradient ids. */
export default function BrandMark({ className }: { className?: string }) {
  // Unique gradient ids so several marks on one page don't clash.
  const uid = useId().replace(/:/g, "");
  const tile = `hx-tile-${uid}`;
  const bar = `hx-bar-${uid}`;

  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={tile} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2e1f16" />
          <stop offset="1" stopColor="#1a120e" />
        </linearGradient>
        <linearGradient id={bar} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#6b4a2e" />
          <stop offset="1" stopColor="#c4a585" />
        </linearGradient>
      </defs>

      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill={`url(#${tile})`}
        stroke="rgba(213,196,174,0.14)"
        strokeWidth="1.25"
      />

      {/* Unequal stems, bottom-aligned: the right one carries the growth. */}
      <rect x="18" y="21" width="6.5" height="22" rx="3.25" fill="#d5c4ae" />
      <rect x="39.5" y="14.5" width="6.5" height="28.5" rx="3.25" fill="#d5c4ae" />

      {/* Crossbar — bronze, level, and tucked into both stems so the H stays
          unambiguous. The growth lives in the stem heights, not in an angle. */}
      <rect x="21" y="28.75" width="22" height="5.5" rx="2.75" fill={`url(#${bar})`} />

      {/* Baseline rule — the underscore from the wordmark. */}
      <rect x="18" y="46.5" width="28" height="3" rx="1.5" fill="#a88462" />
    </svg>
  );
}
