"use client";

import { useMarketplace } from "@/lib/marketplace";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";

export default function Hero() {
  const { query, setQuery } = useMarketplace();
  const { openPost } = useUI();
  const { t } = useI18n();

  const scrollToExperience = () => {
    document
      .getElementById("experience")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="hero">
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> {t("hero.eyebrow")}
          </div>
          <h1 className="hero-title">
            <span>{t("hero.t1")}</span>
            <br />
            <span className="grad">{t("hero.t2")}</span>{" "}
            <span>{t("hero.t3")}</span>
          </h1>
          <p className="sub">{t("hero.sub")}</p>
          <div className="hero-cta">
            <button className="btn-primary" type="button" onClick={openPost}>
              {t("hero.cta1")}
            </button>
            <button
              className="btn-ghost"
              type="button"
              onClick={scrollToExperience}
            >
              {t("hero.cta2")}
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <span className="blob b1" />
          <span className="blob b2" />
          <div className="preview-card">
            <div className="preview-top">
              <span className="preview-av">AR</span>
              <span className="preview-id">
                <span className="preview-name">Aisha Rahman</span>
                <span className="preview-role">Top Rated · Product Designer</span>
              </span>
              <span className="preview-tag">$450</span>
            </div>
            <div className="preview-lines">
              <span />
              <span />
              <span />
            </div>
            <span className="preview-cta">Hire Expert</span>
          </div>
          <span className="avatar-bubble ab1 float-a">
            LO<span className="pip" />
          </span>
          <span className="avatar-bubble ab2 float-b">
            MB<span className="pip" />
          </span>
          <span className="avatar-bubble ab3 float-a">
            SP<span className="pip" />
          </span>
          <span className="avatar-bubble ab4 float-b">
            KZ<span className="pip" />
          </span>
        </div>
      </div>

      <div className="wrap">
        <div className="search-shell hero-search">
          <form
            className="search-bar"
            onSubmit={(event) => {
              event.preventDefault();
              scrollToExperience();
            }}
          >
            <label className="field">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("hero.searchPlaceholder")}
              />
            </label>
            <button className="btn-search" type="submit">
              {t("hero.searchGig")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
