"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import {
  FOOTER_CATEGORIES,
  FOOTER_COLUMNS,
  type FooterAction,
} from "@/lib/navigation";
import LanguageSelector from "./LanguageSelector";

function ApexLogo({ tagline }: { tagline?: string }) {
  return (
    <div className="foot-logo">
      <Link href="/" className="logo" aria-label="Apex home">
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
      </Link>
      {tagline ? <p>{tagline}</p> : null}
    </div>
  );
}

export default function Footer() {
  const { openPost, openAuth } = useUI();
  const { t } = useI18n();
  const router = useRouter();

  const goToCategory = (marketplaceCategory: string | undefined, label: string) => {
    const params = new URLSearchParams();
    if (marketplaceCategory) params.set("category", marketplaceCategory);
    else if (label) params.set("q", label);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
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
              onClick={() => router.push("/search")}
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
                  <Link key={link.labelKey} href={link.href ?? "/search"}>
                    {t(link.labelKey)}
                  </Link>
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

          <div className="foot-bottom-actions">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </footer>
  );
}
