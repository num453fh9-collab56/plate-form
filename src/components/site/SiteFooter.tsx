"use client";

import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import LanguageSelector from "@/components/LanguageSelector";
import { CONTACT_DETAILS, FOOTER_NAV, LEGAL_NAV } from "@/lib/content/nav";
import { ArrowRight, GitHub, Mail } from "./Icons";

/* ==========================================================================
   HIRELYX · SITE FOOTER
   --------------------------------------------------------------------------
   Client component only because it hosts the language selector, which reads
   the i18n context. Every link resolves to a real page.

   NOTE: the previous footer had a newsletter form that never submitted
   anywhere — it only switched to a "thanks" state locally. It has been
   replaced by the proposal CTA rather than kept as a form that silently
   discards addresses. Wire a real list provider and it can come back.
   ========================================================================== */

const YEAR = new Date().getFullYear();

export default function SiteFooter() {
  return (
    <footer className="hx-footer">
      <div className="hx-wrap">
        <div className="hx-footer-top">
          <div className="hx-footer-pitch">
            <Link href="/" className="hx-logo" aria-label="Hirelyx — home" style={{ marginBottom: "1.4rem" }}>
              <span className="hx-logo-mark" aria-hidden>
                <BrandMark />
              </span>
              <span className="hx-logo-word" style={{ color: "#fff" }}>
                Hire<i style={{ color: "#8fb8ff" }}>lyx</i>
              </span>
            </Link>
            <h2>Have a project in mind?</h2>
            <p>
              Tell us what you are trying to achieve. You will get a written scope, a fixed
              quote, and a straight answer about whether we are the right team for it.
            </p>
            <div className="hx-actions">
              <Link className="hx-btn hx-btn-light" href="/contact">
                Get a proposal
                <ArrowRight size={15} className="hx-btn-arrow" />
              </Link>
              <Link className="hx-btn hx-btn-outline-light" href={CONTACT_DETAILS.consultation}>
                Book a consultation
              </Link>
            </div>
          </div>

          <dl className="hx-footer-contact">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${CONTACT_DETAILS.email}`}>{CONTACT_DETAILS.email}</a>
              </dd>
            </div>
            <div>
              <dt>Typical first reply</dt>
              <dd>{CONTACT_DETAILS.responseTime}</dd>
            </div>
            <div>
              <dt>Working language</dt>
              <dd>English, with support in several other languages</dd>
            </div>
            <div>
              <dt>Engagement</dt>
              <dd>Fixed-scope projects and monthly retainers</dd>
            </div>
          </dl>
        </div>

        <div className="hx-footer-grid">
          {FOOTER_NAV.map((column) => (
            <nav className="hx-footer-col" key={column.id} aria-labelledby={`foot-${column.id}`}>
              <h3 id={`foot-${column.id}`}>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="hx-footer-bottom">
          <span>© {YEAR} Hirelyx. All rights reserved.</span>

          <nav aria-label="Legal">
            {LEGAL_NAV.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="hx-footer-social">
              <a href={`mailto:${CONTACT_DETAILS.email}`} aria-label="Email Hirelyx">
                <Mail size={17} />
              </a>
              <a
                href="https://github.com/saadamjad44"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Hirelyx founder on GitHub"
              >
                <GitHub size={17} />
              </a>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </footer>
  );
}
