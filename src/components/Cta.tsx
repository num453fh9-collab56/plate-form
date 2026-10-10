"use client";

import { useRequireAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import { CTA_VIDEO } from "@/lib/site-media";

export default function Cta() {
  const { openPost, openProfile } = useUI();
  const requireAuth = useRequireAuth();
  const { t } = useI18n();

  return (
    <div className="wrap">
      <div className="cta" id="cta">
        <div className="cta-copy">
          <div>
            <h3>{t("cta.title")}</h3>
            <p>{t("cta.text")}</p>
          </div>
          <div className="cta-actions">
            <button
              className="btn-primary"
              type="button"
              onClick={() => requireAuth(openProfile)}
            >
              {t("cta.becomeSeller")}
            </button>
            <button
              className="btn-dark"
              type="button"
              onClick={() => requireAuth(openPost)}
            >
              {t("cta.postGig")}
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
