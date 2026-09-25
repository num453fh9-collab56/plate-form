"use client";

import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { openPost } = useUI();
  const { t } = useI18n();

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <a href="#" className="logo">
              <span className="mark" aria-hidden="true"><svg className="apex" viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18.4" stroke="#111111" strokeWidth="1.2" /><path d="M20 8L30 28H25L20 18L15 28H10L20 8Z" fill="#111111" /><path d="M16 23H24" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" /></svg></span>
          <b>
            Ap<span className="accent">ex</span>
          </b>
            </a>
            <p>{t("footer.tagline")}</p>
          </div>
          <div className="foot-col">
            <h4>{t("footer.marketplace")}</h4>
            <a href="#gigs">{t("footer.browseGigs")}</a>
            <a href="#gigs">{t("footer.categories")}</a>
            <button className="link-btn" type="button" onClick={openPost}>
              {t("footer.postGig")}
            </button>
          </div>
          <div className="foot-col">
            <h4>{t("footer.freelancers")}</h4>
            <button className="link-btn" type="button" onClick={openPost}>
              {t("footer.becomeSeller")}
            </button>
            <a href="#gigs">{t("footer.successStories")}</a>
            <a href="#gigs">{t("footer.sellerAcademy")}</a>
          </div>
          <div className="foot-col">
            <h4>{t("footer.company")}</h4>
            <a href="#">{t("footer.about")}</a>
            <a href="#">{t("footer.careers")}</a>
            <a href="#">{t("footer.contact")}</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>{t("footer.rights")}</span>
          <span>{t("footer.legal")}</span>
        </div>
      </div>
    </footer>
  );
}
