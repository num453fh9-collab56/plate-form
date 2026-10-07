"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import AccountMenu from "./AccountMenu";
import LanguageSelector from "./LanguageSelector";

export default function Header() {
  const { user } = useAuth();
  const { openPost, openAuth } = useUI();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  const startProject = () => {
    setMenuOpen(false);
    if (user) openPost();
    else openAuth("signup");
  };

  return (
    <header>
      <div className="wrap nav">
        <Link href="/" className="logo">
          <span className="mark" aria-hidden="true"><svg className="apex" viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18.4" stroke="#111111" strokeWidth="1.2" /><path d="M20 8L30 28H25L20 18L15 28H10L20 8Z" fill="#111111" /><path d="M16 23H24" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" /></svg></span>
          <b>
            Ap<span className="accent">ex</span>
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
            {t("nav.project")}
          </Link>
          <Link href="/#portfolio" onClick={() => setMenuOpen(false)}>
            {t("nav.resolutions")}
          </Link>
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
          <button className="btn-gig" type="button" onClick={startProject}>
            <span className="btn-gig-plus" aria-hidden="true">
              +
            </span>
            {t("nav.postProject")}
          </button>

          <LanguageSelector />

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
