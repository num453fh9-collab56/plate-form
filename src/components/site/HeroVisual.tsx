/* ==========================================================================
   HIRELYX · HERO COMPOSITION
   --------------------------------------------------------------------------
   An original, hand-authored SVG: the shape of the systems we build —
   clients on the left, a typed API boundary in the middle, services and
   data behind it, with an AI tool layer attached through MCP.

   Pure SVG plus CSS keyframes (defined in hirelyx.css under
   "hero composition"), so there is no JavaScript and no image request in
   the critical path. Motion is suppressed under prefers-reduced-motion.
   Decorative: the headline carries the meaning, so it is aria-hidden.
   ========================================================================== */

export default function HeroVisual() {
  return (
    <div className="hx-hero-visual" aria-hidden>
      <svg viewBox="0 0 560 440" role="presentation" focusable="false">
        <defs>
          <linearGradient id="hxCardFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="hxEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2f7bf0" stopOpacity="0.15" />
            <stop offset="0.5" stopColor="#5e9bff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#2f7bf0" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="hxGreenEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#22c55e" stopOpacity="0.15" />
            <stop offset="0.5" stopColor="#4ade80" stopOpacity="0.8" />
            <stop offset="1" stopColor="#22c55e" stopOpacity="0.15" />
          </linearGradient>
          <filter id="hxGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Connectors, drawn first so cards sit on top ── */}
        <g fill="none" strokeWidth="1.5">
          <path className="hx-edge" d="M118 118 H214 Q238 118 238 142 V196" stroke="url(#hxEdge)" />
          <path className="hx-edge hx-edge-2" d="M118 220 H238" stroke="url(#hxEdge)" />
          <path className="hx-edge hx-edge-3" d="M118 322 H214 Q238 322 238 298 V244" stroke="url(#hxEdge)" />
          <path className="hx-edge hx-edge-4" d="M342 220 H394" stroke="url(#hxGreenEdge)" />
          <path className="hx-edge hx-edge-5" d="M394 148 H370 Q342 148 342 176 V196" stroke="url(#hxEdge)" />
          <path className="hx-edge hx-edge-6" d="M394 300 H370 Q342 300 342 268 V244" stroke="url(#hxEdge)" />
          <path className="hx-edge hx-edge-7" d="M290 288 V356" stroke="url(#hxGreenEdge)" />
        </g>

        {/* ── Left column: clients ── */}
        <g className="hx-float">
          <rect x="18" y="92" width="100" height="52" rx="12" fill="url(#hxCardFill)" stroke="rgba(255,255,255,0.16)" />
          <rect x="34" y="108" width="40" height="5" rx="2.5" fill="#8fb8ff" opacity="0.85" />
          <rect x="34" y="120" width="62" height="4" rx="2" fill="#ffffff" opacity="0.22" />
          <rect x="34" y="129" width="48" height="4" rx="2" fill="#ffffff" opacity="0.14" />
        </g>
        <g className="hx-float hx-float-b">
          <rect x="18" y="194" width="100" height="52" rx="12" fill="url(#hxCardFill)" stroke="rgba(255,255,255,0.16)" />
          <circle cx="40" cy="220" r="8" fill="none" stroke="#8fb8ff" strokeWidth="1.6" />
          <rect x="56" y="212" width="46" height="4.5" rx="2.25" fill="#ffffff" opacity="0.26" />
          <rect x="56" y="223" width="32" height="4.5" rx="2.25" fill="#ffffff" opacity="0.16" />
        </g>
        <g className="hx-float hx-float-c">
          <rect x="18" y="296" width="100" height="52" rx="12" fill="url(#hxCardFill)" stroke="rgba(255,255,255,0.16)" />
          <path d="M36 330 l8-10 6 6 8-12 10 16" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="36" y="308" width="30" height="4.5" rx="2.25" fill="#ffffff" opacity="0.26" />
        </g>

        {/* ── Centre: the typed API boundary ── */}
        <g className="hx-core">
          <rect
            x="238"
            y="152"
            width="104"
            height="136"
            rx="18"
            fill="rgba(11,95,208,0.18)"
            stroke="rgba(143,184,255,0.55)"
            strokeWidth="1.5"
          />
          <rect x="256" y="172" width="68" height="5" rx="2.5" fill="#bed6ff" />
          <rect x="256" y="187" width="46" height="4" rx="2" fill="#ffffff" opacity="0.3" />
          <g stroke="rgba(143,184,255,0.7)" strokeWidth="1.4" fill="none">
            <rect x="256" y="204" width="68" height="18" rx="5" />
            <rect x="256" y="228" width="68" height="18" rx="5" />
            <rect x="256" y="252" width="68" height="18" rx="5" />
          </g>
          <circle cx="266" cy="213" r="2.6" fill="#4ade80" />
          <circle cx="266" cy="237" r="2.6" fill="#4ade80" />
          <circle cx="266" cy="261" r="2.6" fill="#8fb8ff" />
          <rect x="276" y="211" width="30" height="4" rx="2" fill="#ffffff" opacity="0.4" />
          <rect x="276" y="235" width="38" height="4" rx="2" fill="#ffffff" opacity="0.4" />
          <rect x="276" y="259" width="24" height="4" rx="2" fill="#ffffff" opacity="0.4" />
        </g>

        {/* ── Right column: services and data ── */}
        <g className="hx-float hx-float-b">
          <rect x="394" y="122" width="148" height="52" rx="12" fill="url(#hxCardFill)" stroke="rgba(255,255,255,0.16)" />
          <circle cx="416" cy="148" r="9" fill="none" stroke="#8fb8ff" strokeWidth="1.6" />
          <path d="M416 143.5v9M411.5 148h9" stroke="#8fb8ff" strokeWidth="1.4" strokeLinecap="round" />
          <rect x="434" y="140" width="76" height="4.5" rx="2.25" fill="#ffffff" opacity="0.28" />
          <rect x="434" y="151" width="54" height="4.5" rx="2.25" fill="#ffffff" opacity="0.16" />
        </g>
        <g className="hx-float">
          <rect x="394" y="194" width="148" height="52" rx="12" fill="url(#hxCardFill)" stroke="rgba(74,222,128,0.3)" />
          <rect x="412" y="210" width="8" height="20" rx="3" fill="#4ade80" opacity="0.8" />
          <rect x="426" y="216" width="8" height="14" rx="3" fill="#4ade80" opacity="0.55" />
          <rect x="440" y="204" width="8" height="26" rx="3" fill="#4ade80" opacity="0.95" />
          <rect x="462" y="210" width="62" height="4.5" rx="2.25" fill="#ffffff" opacity="0.28" />
          <rect x="462" y="221" width="40" height="4.5" rx="2.25" fill="#ffffff" opacity="0.16" />
        </g>
        <g className="hx-float hx-float-c">
          <rect x="394" y="274" width="148" height="52" rx="12" fill="url(#hxCardFill)" stroke="rgba(255,255,255,0.16)" />
          <g stroke="#8fb8ff" strokeWidth="1.5" fill="none">
            <ellipse cx="416" cy="290" rx="12" ry="4.5" />
            <path d="M404 290v10c0 2.5 5.4 4.5 12 4.5s12-2 12-4.5v-10" />
            <path d="M404 297c0 2.5 5.4 4.5 12 4.5s12-2 12-4.5" opacity="0.5" />
          </g>
          <rect x="440" y="288" width="70" height="4.5" rx="2.25" fill="#ffffff" opacity="0.28" />
          <rect x="440" y="299" width="46" height="4.5" rx="2.25" fill="#ffffff" opacity="0.16" />
        </g>

        {/* ── Bottom: the AI tool layer reached through MCP ── */}
        <g className="hx-pulse-card">
          <rect
            x="206"
            y="356"
            width="168"
            height="58"
            rx="14"
            fill="rgba(34,197,94,0.1)"
            stroke="rgba(74,222,128,0.45)"
            strokeWidth="1.5"
          />
          <path
            d="M232 379c0 5.6 2.2 7.8 7.8 7.8-5.6 0-7.8 2.2-7.8 7.8 0-5.6-2.2-7.8-7.8-7.8 5.6 0 7.8-2.2 7.8-7.8z"
            transform="translate(0,-14)"
            fill="none"
            stroke="#4ade80"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <rect x="252" y="373" width="94" height="5" rx="2.5" fill="#c7f5d8" opacity="0.9" />
          <rect x="252" y="386" width="64" height="4" rx="2" fill="#ffffff" opacity="0.28" />
        </g>

        {/* ── Travelling packets along the primary paths ── */}
        <g className="hx-packets">
          <circle r="3.2" fill="#8fb8ff" filter="url(#hxGlow)">
            <animateMotion dur="3.4s" repeatCount="indefinite" path="M118 220 H238" />
          </circle>
          <circle r="3.2" fill="#4ade80" filter="url(#hxGlow)">
            <animateMotion dur="3.4s" begin="1.1s" repeatCount="indefinite" path="M342 220 H394" />
          </circle>
          <circle r="2.8" fill="#8fb8ff" filter="url(#hxGlow)">
            <animateMotion dur="4.2s" begin="0.5s" repeatCount="indefinite" path="M118 118 H214 Q238 118 238 142 V196" />
          </circle>
        </g>
      </svg>
    </div>
  );
}
