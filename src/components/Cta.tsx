"use client";

import { useRequireAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";

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
          <video
            className="cta-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/videos/showcase-2.mp4" type="video/mp4" />
          </video>
          <span className="cta-media-scrim" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
