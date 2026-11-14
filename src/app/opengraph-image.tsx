import { ImageResponse } from "next/og";

/* ==========================================================================
   HIRELYX · DEFAULT SHARE CARD
   --------------------------------------------------------------------------
   Inherited by every route that does not pass its own `image` to
   pageMetadata (articles pass their cover). Built from divs rather than the
   logo SVG because Satori only supports a subset of SVG, and the mark is
   simple enough to lay out directly.
   ========================================================================== */

export const alt = "Hirelyx — Python, AI and digital engineering partner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#1a120e";
const CREAM = "#d5c4ae";
const BRONZE = "#a88462";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          padding: 72,
          position: "relative",
        }}
      >
        {/* Bronze glow, bottom right */}
        <div
          style={{
            position: "absolute",
            right: -160,
            bottom: -220,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(168,132,98,0.38), rgba(26,18,14,0))",
          }}
        />

        {/* Mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 20,
              background: "linear-gradient(135deg, #2e1f16, #1a120e)",
              border: "1px solid rgba(213,196,174,0.18)",
              display: "flex",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", left: 21, top: 25, width: 8, height: 26, borderRadius: 4, background: CREAM }} />
            <div style={{ position: "absolute", left: 47, top: 17, width: 8, height: 34, borderRadius: 4, background: CREAM }} />
            <div style={{ position: "absolute", left: 25, top: 34, width: 26, height: 7, borderRadius: 4, background: BRONZE }} />
            <div style={{ position: "absolute", left: 21, top: 55, width: 34, height: 4, borderRadius: 2, background: BRONZE }} />
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, letterSpacing: -1.5 }}>
            <span style={{ color: "#ffffff" }}>Hire</span>
            <span style={{ color: BRONZE }}>lyx</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -2.4,
              color: "#ffffff",
            }}
          >
            We build intelligent digital solutions that move businesses forward.
          </div>
        </div>

        {/* Footer rule */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(213,196,174,0.16)",
            paddingTop: 28,
            fontSize: 26,
            color: CREAM,
          }}
        >
          <div style={{ display: "flex" }}>Python · AI engineering · digital growth</div>
          <div style={{ display: "flex", color: BRONZE, fontWeight: 600 }}>hirelyx.com</div>
        </div>
      </div>
    ),
    size,
  );
}
