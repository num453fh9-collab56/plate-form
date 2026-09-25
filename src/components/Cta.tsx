"use client";

import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";

export default function Cta() {
  const { openPost } = useUI();
  const { t } = useI18n();

  return (
    <div className="wrap">
      <div className="cta" id="cta">
        <div>
          <h3>{t("cta.title")}</h3>
          <p>{t("cta.text")}</p>
        </div>
        <div className="cta-actions">
          <button className="btn-primary" type="button" onClick={openPost}>
            {t("cta.becomeSeller")}
          </button>
          <button className="btn-dark" type="button" onClick={openPost}>
            {t("cta.postGig")}
          </button>
        </div>
      </div>
    </div>
  );
}
