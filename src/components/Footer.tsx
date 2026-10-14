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
      <a className="foot-social" href="#" aria-label="Twitter / X" onClick={(e) => e.preventDefault()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <a className="foot-social" href="#" aria-label="LinkedIn" onClick={(e) => e.preventDefault()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
      <a className="foot-social" href="#" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
      </a>
      <a className="foot-social" href="#" aria-label="YouTube" onClick={(e) => e.preventDefault()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
      </a>
      <a className="foot-social" href="#" aria-label="Facebook" onClick={(e) => e.preventDefault()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>
      <a className="foot-social" href="mailto:support@hirelyx.com" aria-label="Email us">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      </a>
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
