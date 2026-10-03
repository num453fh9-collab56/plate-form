"use client";

import type { ReactNode } from "react";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import { useMarketplace } from "@/lib/marketplace";
import {
  FOOTER_CATEGORIES,
  FOOTER_COLUMNS,
  type FooterAction,
} from "@/lib/navigation";
import LanguageSelector from "./LanguageSelector";

function ApexLogo({ tagline }: { tagline?: string }) {
  return (
    <div className="foot-logo">
      <a href="#" className="logo" aria-label="Apex home">
        <span className="mark" aria-hidden="true">
          <svg className="apex" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <circle cx="20" cy="20" r="18.4" stroke="#111111" strokeWidth="1.2" />
            <path d="M20 8L30 28H25L20 18L15 28H10L20 8Z" fill="#111111" />
            <path d="M16 23H24" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <b>
          Ap<span className="accent">ex</span>
        </b>
      </a>
      {tagline ? <p>{tagline}</p> : null}
    </div>
  );
}

const SOCIALS: { id: string; label: string; href: string; icon: ReactNode }[] = [
  {
    id: "x",
    label: "X",
    href: "#",
    icon: (
      <path
        fill="currentColor"
        d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z"
      />
    ),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "#",
    icon: (
      <path
        fill="currentColor"
        d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11.1 22 14.2V21h-4v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V21h-4z"
      />
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "#",
    icon: (
      <path
        fill="currentColor"
        d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"
      />
    ),
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "#",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
      </>
    ),
  },
];

export default function Footer() {
  const { openPost, openAuth } = useUI();
  const { setCategory, setQuery } = useMarketplace();
  const { t } = useI18n();

  const scrollToGigs = () => {
    document.getElementById("gigs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToCategory = (marketplaceCategory: string | undefined, label: string) => {
    if (marketplaceCategory) {
      setCategory(marketplaceCategory);
      setQuery("");
    } else {
      setCategory("All");
      setQuery(label);
    }
    scrollToGigs();
  };

  const runAction = (action: FooterAction) => {
    if (action === "postGig") openPost();
    else openAuth("signup");
  };

  return (
    <footer className="site-footer">
      <div className="wrap">
        <section className="foot-categories" aria-labelledby="footerCategoriesTitle">
          <div className="foot-categories-head">
            <div>
              <span className="kicker">{t("footer.categoriesKicker")}</span>
              <h3 id="footerCategoriesTitle">{t("footer.exploreCategories")}</h3>
            </div>
            <button
              className="link-all"
              type="button"
              onClick={() => goToCategory(undefined, "")}
            >
              {t("footer.viewAll")} <span aria-hidden="true">&rarr;</span>
            </button>
          </div>

          <div className="foot-category-grid">
            {FOOTER_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className="foot-category"
                onClick={() => goToCategory(category.marketplaceCategory, t(category.labelKey))}
              >
                <span className="foot-category-glyph" aria-hidden="true">
                  {category.glyph}
                </span>
                <span className="foot-category-label">{t(category.labelKey)}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="foot-columns">
          <div className="foot-brand">
            <ApexLogo tagline={t("footer.tagline")} />
            <div className="foot-socials" aria-label={t("footer.followUs")}>
              {SOCIALS.map((social) => (
                <a
                  key={social.id}
                  className="foot-social"
                  href={social.href}
                  aria-label={social.label}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav
              className="foot-col"
              key={column.id}
              aria-label={t(column.titleKey)}
            >
              <h4>{t(column.titleKey)}</h4>
              {column.links.map((link) =>
                link.action ? (
                  <button
                    key={link.labelKey}
                    className="link-btn"
                    type="button"
                    onClick={() => runAction(link.action as FooterAction)}
                  >
                    {t(link.labelKey)}
                  </button>
                ) : (
                  <a key={link.labelKey} href={link.href ?? "#"}>
                    {t(link.labelKey)}
                  </a>
                ),
              )}
            </nav>
          ))}
        </div>

        <div className="foot-bottom">
          <div className="foot-bottom-brand">
            <ApexLogo />
            <span className="foot-copy">{t("footer.rights")}</span>
          </div>

          <nav className="foot-bottom-links" aria-label={t("footer.companySupport")}>
            <a href="#">{t("footer.terms")}</a>
            <a href="#">{t("footer.privacy")}</a>
            <a href="#">{t("footer.sitemap")}</a>
          </nav>

          <div className="foot-bottom-actions">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </footer>
  );
}
