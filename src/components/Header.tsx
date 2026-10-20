"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import AccountMenu from "./AccountMenu";
import LanguageSelector from "./LanguageSelector";
import CurrencySelector from "./CurrencySelector";
import NotificationBell from "./NotificationBell";
import BrandMark from "./BrandMark";

export default function Header() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={scrolled ? "scrolled" : ""}>
      <div className="wrap nav">
        <Link href="/" className="logo">
          <span className="mark" aria-hidden="true"><BrandMark /></span>
          <b className="logo-word">
            Hire<span className="accent">lyx</span>
          </b>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          &#9776;
        </button>
        <nav className={"nav-links" + (menuOpen ? " open" : "")}>
          <Link href="/" onClick={() => setMenuOpen(false)}>
            {t("nav.home")}
          </Link>
          <Link href="/services" onClick={() => setMenuOpen(false)}>
            Services
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          <Link href="/portfolio" onClick={() => setMenuOpen(false)}>
            Portfolio
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>

          {user && (
            <Link href="/dashboard" className="btn-gig" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          )}

          <LanguageSelector />
          <CurrencySelector />
          <NotificationBell />

          {!user && (
            <button
              className="btn-signin"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openAuth("signup");
              }}
            >
              {t("nav.join")}
            </button>
          )}

          {user && <AccountMenu />}
        </nav>
      </div>
    </header>
  );
}
