"use client";

import { useMarketplace } from "@/lib/marketplace";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import { CATEGORY_LABEL_KEYS, CATEGORY_OPTIONS } from "@/lib/gigs";

/* ==========================================================================
   APEX · HERO
   --------------------------------------------------------------------------
   Left: headline, supporting copy and CTAs.
   Right: the talent-collage hero image (public/hero/hero-visual.png).
   Below: a single full-width search bar spanning the content column.
   ========================================================================== */

export default function Hero() {
  const { query, setQuery, category, setCategory } = useMarketplace();
  const { user } = useAuth();
  const { openAuth, openProfile } = useUI();
  const { t } = useI18n();

  const scrollToShowcase = () => {
    document
      .getElementById("work")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToGigs = () => {
    document
      .getElementById("gigs")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1 className="hero-title">
              <span>{t("hero.t1")}</span> <span>{t("hero.t2")}</span>
              <br />
              <span>{t("hero.t3")}</span>
            </h1>
            <p className="sub">{t("hero.sub")}</p>
            <div className="hero-cta">
              <button
                className="btn-primary"
                type="button"
                onClick={() => (user ? openProfile() : openAuth("signup"))}
              >
                {t("hero.cta1")}
              </button>
              <button
                className="btn-ghost"
                type="button"
                onClick={scrollToShowcase}
              >
                {t("hero.cta2")}
              </button>
            </div>
          </div>

          <div className="hero-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero/hero-visual.png"
              alt="Apex freelancers collaborating with clients around the world"
              width={1190}
              height={657}
              fetchPriority="high"
            />
          </div>
        </div>

        <div className="hero-search-block">
          <form
            className="search-bar hero-search-bar"
            onSubmit={(event) => {
              event.preventDefault();
              scrollToGigs();
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
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("hero.searchPlaceholder")}
                aria-label={t("hero.searchPlaceholder")}
              />
            </label>
            <span className="divider" aria-hidden="true" />
            <label className="select-wrap hero-category">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label={t("hero.allCategories")}
              >
                <option value="All">{t("hero.allCategories")}</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {t(CATEGORY_LABEL_KEYS[option])}
                  </option>
                ))}
              </select>
              <span className="chev" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
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
