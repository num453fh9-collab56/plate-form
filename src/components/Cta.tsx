"use client";

import { useRequireAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { CTA_VIDEO } from "@/lib/site-media";

export default function Cta() {
  const { openAuth } = useUI();
  const requireAuth = useRequireAuth();

  return (
    <div className="wrap">
      <div className="cta" id="cta">
        <div className="cta-copy">
          <div>
            <h3>Ready to bring your idea to life?</h3>
            <p>Our team is ready to build your next digital product. Get in touch and let&apos;s make it happen.</p>
          </div>
          <div className="cta-actions">
            <button
              className="btn-primary"
              type="button"
              onClick={() => requireAuth(() => {
                window.location.href = "/contact";
              })}
            >
              Contact Us
            </button>
            <button
              className="btn-dark"
              type="button"
              onClick={() => openAuth("signup")}
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="cta-media">
          {CTA_VIDEO ? (
            <video
              className="cta-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src={CTA_VIDEO} type="video/mp4" />
            </video>
          ) : (
            <div className="cta-video cta-fallback" aria-hidden="true" />
          )}
          <span className="cta-media-scrim" aria-hidden="true" />
          <span
            style={{
              position: "absolute",
              right: 10,
              bottom: 10,
              zIndex: 3,
              background: "rgba(17,17,17,0.72)",
              color: "#fff",
              padding: "4px 10px",
              borderRadius: 7,
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              pointerEvents: "none",
            }}
          >
            Hirelyx
          </span>
        </div>
      </div>
    </div>
  );
}
