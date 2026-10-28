import type { GlyphId } from "@/lib/content/types";

/* ==========================================================================
   HIRELYX · SERVICE & SOLUTION GLYPHS
   --------------------------------------------------------------------------
   A single hand-built line-art set drawn on a 32×32 grid with a consistent
   1.6px stroke and a secondary 0.4-opacity layer for depth. Using one grid
   and one stroke weight is what makes the set read as a family rather than
   assorted icons. Decorative — the surrounding heading carries the meaning.
   ========================================================================== */

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const PATHS: Record<GlyphId, React.ReactNode> = {
  /* Nested braces around a validated core — typed Python services. */
  python: (
    <>
      <path d="M11 6.5C8.5 6.5 7.5 8 7.5 10.5v2c0 1.5-.8 2.5-2.5 3 1.7.5 2.5 1.5 2.5 3v2c0 2.5 1 4 3.5 4" />
      <path d="M21 6.5c2.5 0 3.5 1.5 3.5 4v2c0 1.5.8 2.5 2.5 3-1.7.5-2.5 1.5-2.5 3v2c0 2.5-1 4-3.5 4" />
      <circle cx="16" cy="16" r="3.2" />
      <path d="M16 11v1.8M16 19.2V21" opacity="0.4" />
    </>
  ),

  /* Layered page stack with a block grid — WordPress / CMS builds. */
  wordpress: (
    <>
      <rect x="5" y="6" width="22" height="20" rx="2.5" />
      <path d="M5 11.5h22" />
      <path d="M9.5 16h6v6h-6zM19 16h3.5M19 19h3.5M19 22h2" />
      <circle cx="8.3" cy="8.8" r="0.9" opacity="0.4" />
      <circle cx="11.3" cy="8.8" r="0.9" opacity="0.4" />
    </>
  ),

  /* Rising bars crossed by a trend line — measured marketing. */
  marketing: (
    <>
      <path d="M5 26h22" />
      <path d="M9 26v-6M15 26v-11M21 26v-7" />
      <path d="M6.5 15.5 13 10l4.5 3.5L26 6" opacity="0.4" />
      <path d="M21.5 6H26v4.5" opacity="0.4" />
    </>
  ),

  /* Core with orbiting tool nodes — a scoped agent with real tools. */
  "ai-agent": (
    <>
      <rect x="11" y="11" width="10" height="10" rx="3" />
      <path d="M16 11V6.5M16 21v4.5M11 16H6.5M21 16h4.5" />
      <circle cx="16" cy="5" r="1.8" />
      <circle cx="16" cy="27" r="1.8" opacity="0.4" />
      <circle cx="5" cy="16" r="1.8" opacity="0.4" />
      <circle cx="27" cy="16" r="1.8" />
      <path d="M14.5 15.5h3M14.5 18h1.5" opacity="0.4" />
    </>
  ),

  /* A socket and plug — one protocol, many clients. */
  mcp: (
    <>
      <rect x="4" y="9" width="12" height="14" rx="3" />
      <path d="M8 13v6M12 13v6" opacity="0.4" />
      <path d="M16 16h5" />
      <path d="M21 11h4a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-4z" />
      <path d="M24.5 11V7.5M24.5 24.5V21" opacity="0.4" />
    </>
  ),

  /* Instruction block with a graded result marker — tested prompts. */
  prompt: (
    <>
      <path d="M26 19.5a2.5 2.5 0 0 1-2.5 2.5H11l-5 4V8.5A2.5 2.5 0 0 1 8.5 6h15A2.5 2.5 0 0 1 26 8.5z" />
      <path d="M10.5 11h11M10.5 14.5h7.5" opacity="0.4" />
      <path d="m10.5 18.5 2 2 4-4.5" />
    </>
  ),

  /* Chained steps with a branch — workflow automation. */
  automation: (
    <>
      <rect x="4" y="12.5" width="7" height="7" rx="2" />
      <rect x="21" y="5" width="7" height="7" rx="2" />
      <rect x="21" y="20" width="7" height="7" rx="2" />
      <path d="M11 16h5v-7.5h5" />
      <path d="M16 16v7.5h5" opacity="0.4" />
    </>
  ),

  /* Window with a cursor and a data pane — custom software. */
  software: (
    <>
      <rect x="4" y="6" width="24" height="20" rx="2.5" />
      <path d="M4 11h24" />
      <path d="M9 16h6.5M9 20h4.5" opacity="0.4" />
      <path d="m18.5 15 5 3.5-2.2.9-.9 2.2z" />
      <circle cx="7.2" cy="8.5" r="0.85" opacity="0.4" />
    </>
  ),

  /* Funnel narrowing into a growth arrow. */
  growth: (
    <>
      <path d="M5 7h22l-7.5 9v8l-7 3v-11z" />
      <path d="M22 26l5-5M27 21v4.5h-4.5" opacity="0.4" />
    </>
  ),

  /* Headset ring with an escalation arrow. */
  support: (
    <>
      <path d="M6.5 18v-2.5a9.5 9.5 0 0 1 19 0V18" />
      <rect x="4" y="17" width="5" height="7" rx="2" />
      <rect x="23" y="17" width="5" height="7" rx="2" />
      <path d="M25.5 24v1a3 3 0 0 1-3 3H17" opacity="0.4" />
      <path d="M19 26.5 17 28l2 1.5" opacity="0.4" />
    </>
  ),

  /* Blueprint columns and a spanning beam — architecture. */
  architecture: (
    <>
      <path d="M4 10h24" />
      <path d="M7 10v16M16 10v16M25 10v16" />
      <path d="M4 18h24" opacity="0.4" />
      <path d="M11 6.5 16 4l5 2.5" />
    </>
  ),

  /* Two systems joined by a verified link. */
  integration: (
    <>
      <rect x="3.5" y="11" width="9" height="10" rx="2.5" />
      <rect x="19.5" y="11" width="9" height="10" rx="2.5" />
      <path d="M12.5 16h7" />
      <circle cx="16" cy="16" r="2.6" />
      <path d="M8 11V7.5M24 21v3.5" opacity="0.4" />
    </>
  ),

  /* Dashboard tiles with a sparkline. */
  analytics: (
    <>
      <rect x="4" y="5.5" width="24" height="21" rx="2.5" />
      <path d="M4 11h24" opacity="0.4" />
      <path d="m8.5 21.5 4-5 3.5 2.5 3-4.5 4.5 5" />
      <path d="M8.5 15h2" opacity="0.4" />
    </>
  ),

  /* Shield with a validated mark. */
  shield: (
    <>
      <path d="M16 4.5 26 8v7c0 6.5-4.3 10.8-10 12.5C10.3 25.8 6 21.5 6 15V8z" />
      <path d="m11.5 15.5 3.2 3.2 6-6.4" />
    </>
  ),

  /* Clock with a delivery tick. */
  clock: (
    <>
      <circle cx="16" cy="16" r="11" />
      <path d="M16 9.5V16l4.5 3" />
      <path d="M16 5v1.5M16 25.5V27" opacity="0.4" />
    </>
  ),

  /* Three figures — the team. */
  users: (
    <>
      <circle cx="12" cy="11" r="4" />
      <path d="M4.5 25.5c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7" />
      <circle cx="23" cy="12.5" r="3.2" opacity="0.4" />
      <path d="M21 19.8c3.5 0 6.5 2.4 6.5 5.7" opacity="0.4" />
    </>
  ),

  /* Four-point spark with a small second spark — applied AI. */
  spark: (
    <>
      <path d="M13 4.5c0 4.7 1.8 6.5 6.5 6.5-4.7 0-6.5 1.8-6.5 6.5 0-4.7-1.8-6.5-6.5-6.5 4.7 0 6.5-1.8 6.5-6.5z" />
      <path d="M22.5 17c0 2.8 1 3.8 3.8 3.8-2.8 0-3.8 1-3.8 3.8 0-2.8-1-3.8-3.8-3.8 2.8 0 3.8-1 3.8-3.8z" opacity="0.4" />
      <path d="M8 22.5v4M6 24.5h4" opacity="0.4" />
    </>
  ),

  /* Stacked planes — layered front-end architecture. */
  layers: (
    <>
      <path d="m16 4.5 11 5.5-11 5.5L5 10z" />
      <path d="m5 16 11 5.5L27 16" opacity="0.4" />
      <path d="m5 21.5 11 5.5 11-5.5" />
    </>
  ),

  /* Terminal with a prompt and a passing check. */
  terminal: (
    <>
      <rect x="4" y="6" width="24" height="20" rx="2.5" />
      <path d="m9 13 3 3-3 3" />
      <path d="M15 19h5" />
      <path d="M4 10h24" opacity="0.4" />
      <path d="M22.5 13.5h3" opacity="0.4" />
    </>
  ),

  /* Magnifier over a document — audits and research. */
  search: (
    <>
      <path d="M7 5.5h11l5.5 5.5v4" opacity="0.4" />
      <path d="M7 5.5v21h7" opacity="0.4" />
      <circle cx="19.5" cy="19.5" r="6" />
      <path d="m24 24 4 4" />
    </>
  ),
};

export default function Glyph({
  id,
  size = 32,
  className,
}: {
  id: GlyphId;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      {...S}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
      focusable="false"
    >
      {PATHS[id] ?? PATHS.spark}
    </svg>
  );
}
