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
  const { user, profile } = useAuth();
  const { openPost, openAuth } = useUI();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const role = profile.role;
  const isBuyer = role === "buyer";
  const isFreelancer = role === "freelancer";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const startProject = () => {
    setMenuOpen(false);
    if (user) openPost();
    else openAuth("signup");
  };

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
          <Link href="/search" onClick={() => setMenuOpen(false)}>
            {isBuyer ? "Find Talent" : t("nav.project")}
          </Link>
          {!isBuyer && (
            <Link href="/requests" onClick={() => setMenuOpen(false)}>
              {isFreelancer ? "Find Work" : "Requests"}
            </Link>
          )}
          {!isBuyer && (
            <Link href="/#portfolio" onClick={() => setMenuOpen(false)}>
              {t("nav.resolutions")}
            </Link>
          )}
          {isBuyer && (
            <Link href="/requests" onClick={() => setMenuOpen(false)}>
              My Requests
            </Link>
          )}
          {!user && (
            <button
              className="nav-login"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openAuth("login");
              }}
            >
              {t("nav.login")}
            </button>
          )}
          {isBuyer ? (
            <Link
              href="/requests/new"
              className="btn-gig"
              onClick={() => setMenuOpen(false)}
            >
              <span className="btn-gig-plus" aria-hidden="true">+</span>
              Post a Request
            </Link>
          ) : (
            <button className="btn-gig" type="button" onClick={startProject}>
              <span className="btn-gig-plus" aria-hidden="true">+</span>
              {t("nav.postProject")}
            </button>
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

          <AccountMenu />
        </nav>
      </div>
    </header>
  );
}
