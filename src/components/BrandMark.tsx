"use client";

import { useId } from "react";

/* Hirelyx mark: a blue "H" whose crossbar is a green arrow rising up and to the
   right (growth), with a node where it crosses (people connecting).
   Source of truth for the shape; /public/logo-mark.svg and the app icons are
   generated from the same geometry. */
export default function BrandMark({ className }: { className?: string }) {
  // Unique gradient id so several marks on one page don't clash.
  const gradientId = `hx-arrow-${useId().replace(/:/g, "")}`;
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#15803d" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect x="8" y="10" width="11" height="44" rx="5.5" fill="#0066cc" />
      <rect x="45" y="31" width="11" height="23" rx="5.5" fill="#0066cc" />
      <path d="M13.5 45 L48 15" stroke={`url(#${gradientId})`} strokeWidth="8" strokeLinecap="round" />
      <path
        d="M35 11 H53 V27"
        stroke={`url(#${gradientId})`}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="31" cy="30" r="5" fill="#ffffff" stroke="#0066cc" strokeWidth="3.5" />
    </svg>
  );
}
