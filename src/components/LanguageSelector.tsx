"use client";

import { useEffect, useRef, useState } from "react";
import { LANGUAGES, useI18n } from "@/lib/i18n";

export default function LanguageSelector() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className={"lang-menu" + (open ? " open" : "")} ref={ref}>
      <button
        className="lang-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang.title")}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          className="globe"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
        </svg>
        <span className="lang-current">{lang}</span>
        <svg
          className="chev"
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div className="lang-dropdown" role="listbox" aria-label={t("lang.title")}>
        <div className="lang-dropdown-title">{t("lang.title")}</div>
        {LANGUAGES.map((option) => (
          <button
            key={option.code}
            className={"lang-option" + (option.code === lang ? " active" : "")}
            type="button"
            role="option"
            aria-selected={option.code === lang}
            onClick={() => {
              setLang(option.code);
              setOpen(false);
            }}
          >
            <span className="lang-code">{option.code}</span>
            <span className="lang-name">{option.native}</span>
            {option.native !== option.label && (
              <span className="lang-en">{option.label}</span>
            )}
            {option.code === lang && <span className="lang-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
