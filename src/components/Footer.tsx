"use client";

import { useState } from "react";
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
import BrandMark from "./BrandMark";

function BrandLogo({ tagline }: { tagline?: string }) {
  return (
    <div className="foot-logo">
      <Link href="/" className="logo" aria-label="Hirelyx home">
        <span className="mark" aria-hidden="true">
          <BrandMark />
        </span>
        <b className="logo-word">
          Hire<span className="accent">lyx</span>
        </b>
      </Link>
      {tagline ? <p>{tagline}</p> : null}
    </div>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { toast } = useUI();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast("Please enter a valid email address.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="foot-newsletter">
      <h4>Stay in the loop</h4>
      <p>Get the latest freelancing tips, platform updates, and exclusive offers.</p>
      {sent ? (
        <div className="foot-newsletter-done">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          Thanks for subscribing!
        </div>
      ) : (
        <form className="foot-newsletter-form" onSubmit={submit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email for newsletter"
          />
          <button type="submit" className="btn-primary foot-newsletter-btn">Subscribe</button>
        </form>
      )}
    </div>
  );
}

function SocialLinks() {
  return (
    <div className="foot-socials">
      <Link className="foot-social" href="/contact" aria-label="Contact us">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      </Link>
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

        <Newsletter />

        <div className="foot-columns">
          <div className="foot-brand">
            <BrandLogo tagline={t("footer.tagline")} />
            <SocialLinks />
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
            <BrandLogo />
            <span className="foot-copy">{t("footer.rights")}</span>
          </div>

          <div className="foot-bottom-links">
            <Link href="/terms">{t("footer.terms")}</Link>
            <Link href="/privacy">{t("footer.privacy")}</Link>
            <Link href="/accessibility">{t("footer.accessibility")}</Link>
          </div>

          <div className="foot-bottom-actions">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </footer>
  );
}
