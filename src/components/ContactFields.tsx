"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  COMMON_LANGUAGES,
  COUNTRIES,
  LANGUAGE_LEVELS,
  POPULAR_COUNTRY_CODES,
  flagUrl,
  formatLanguages,
  formatLocation,
  formatPhone,
  parseLanguages,
  parseLocation,
  parsePhone,
} from "@/lib/countries";
import type { Country, LanguageLevel, SpokenLanguage } from "@/lib/countries";

/* ==========================================================================
   HIRELYX · SMART CONTACT FIELDS
   Location (searchable country picker with flags + optional city), phone
   (dial code synced to the chosen country) and spoken languages (chips with
   proficiency levels). Values round-trip through the existing plain-text
   profile fields — see `@/lib/countries` for the formats.
   ========================================================================== */

function Flag({ code }: { code: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="cf-flag" src={flagUrl(code, 40)} alt="" width={20} height={15} loading="lazy" />
  );
}

/* ------------------------------ country picker ------------------------------ */

function CountryPicker({
  value,
  placeholder,
  onChange,
}: {
  value: Country | undefined;
  placeholder: string;
  onChange: (country: Country) => void;
}) {
  const { t } = useI18n();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const options = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle) {
      return COUNTRIES.filter(
        (country) =>
          country.name.toLowerCase().includes(needle) ||
          country.code.toLowerCase() === needle ||
          country.dial === needle.replace(/^\+/, ""),
      );
    }
    const popular = POPULAR_COUNTRY_CODES.map((code) =>
      COUNTRIES.find((country) => country.code === code),
    ).filter((country): country is Country => Boolean(country));
    return [...popular, ...COUNTRIES.filter((country) => !POPULAR_COUNTRY_CODES.includes(country.code))];
  }, [query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const choose = (country: Country) => {
    onChange(country);
    setOpen(false);
    setQuery("");
  };

  const onKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((index) => Math.min(options.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const country = options[cursor];
      if (country) choose(country);
    } else if (event.key === "Escape") {
      /* Close only the picker, not the whole onboarding shell. */
      event.stopPropagation();
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-${cursor}`)?.scrollIntoView({ block: "nearest" });
  }, [cursor, open, listId]);

  return (
    <div className="cf-picker" ref={rootRef}>
      <button
        type="button"
        id="field-country"
        className={"cf-picker-btn" + (value ? "" : " empty")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setCursor(0);
          setOpen((current) => !current);
        }}
      >
        {value ? <Flag code={value.code} /> : <span className="cf-flag cf-flag-empty" aria-hidden="true" />}
        <span>{value ? value.name : placeholder}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div className="cf-pop">
          <input
            ref={searchRef}
            type="text"
            className="cf-pop-search"
            value={query}
            placeholder={t("contact.searchCountry")}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={options[cursor] ? `${listId}-${cursor}` : undefined}
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor(0);
            }}
            onKeyDown={onKey}
          />
          <ul className="cf-pop-list" id={listId} role="listbox">
            {options.length === 0 ? <li className="cf-pop-empty">{t("contact.noMatch")}</li> : null}
            {options.map((country, index) => (
              <li
                key={country.code}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={value?.code === country.code}
                className={
                  (index === cursor ? "active " : "") +
                  (value?.code === country.code ? "selected " : "") +
                  (!query && index === POPULAR_COUNTRY_CODES.length - 1 ? "divider" : "")
                }
                onPointerEnter={() => setCursor(index)}
                onClick={() => choose(country)}
              >
                <Flag code={country.code} />
                <span>{country.name}</span>
                <em>+{country.dial}</em>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------ languages ------------------------------ */

function LanguagePicker({
  value,
  onChange,
}: {
  value: SpokenLanguage[];
  onChange: (next: SpokenLanguage[]) => void;
}) {
  const { t } = useI18n();
  const listId = useId();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<LanguageLevel>("Fluent");

  const has = (candidate: string) =>
    value.some((item) => item.name.toLowerCase() === candidate.trim().toLowerCase());

  const add = (candidate: string, candidateLevel: LanguageLevel) => {
    const clean = candidate.trim().replace(/[,;()]/g, "");
    if (!clean || has(clean)) return;
    const known = COMMON_LANGUAGES.find((item) => item.toLowerCase() === clean.toLowerCase());
    onChange([...value, { name: known ?? clean, level: candidateLevel }]);
    setName("");
  };

  const quick = ["English", "Urdu", "Arabic", "Hindi"].filter((item) => !has(item));

  return (
    <div className="cf-langs">
      {value.length > 0 ? (
        <ul className="cf-lang-list">
          {value.map((item, index) => (
            <li key={item.name} className={"cf-lang lvl-" + item.level.toLowerCase()}>
              <strong>{item.name}</strong>
              <select
                value={item.level}
                aria-label={t("contact.levelFor", { language: item.name })}
                onChange={(event) =>
                  onChange(
                    value.map((entry, position) =>
                      position === index ? { ...entry, level: event.target.value as LanguageLevel } : entry,
                    ),
                  )
                }
              >
                {LANGUAGE_LEVELS.map((option) => (
                  <option key={option} value={option}>
                    {t(`contact.level${option}` as const)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label={t("contact.removeLanguage", { language: item.name })}
                onClick={() => onChange(value.filter((_, position) => position !== index))}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="cf-lang-add">
        <input
          id="field-languages"
          type="text"
          list={listId}
          value={name}
          placeholder={t("contact.addLanguage")}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add(name, level);
            }
          }}
        />
        <datalist id={listId}>
          {COMMON_LANGUAGES.filter((item) => !has(item)).map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        <select
          value={level}
          aria-label={t("contact.level")}
          onChange={(event) => setLevel(event.target.value as LanguageLevel)}
        >
          {LANGUAGE_LEVELS.map((option) => (
            <option key={option} value={option}>
              {t(`contact.level${option}` as const)}
            </option>
          ))}
        </select>
        <button type="button" className="ob-btn-ghost btn-sm" onClick={() => add(name, level)} disabled={!name.trim()}>
          {t("contact.add")}
        </button>
      </div>

      {quick.length > 0 ? (
        <div className="cf-quick">
          {quick.map((item) => (
            <button key={item} type="button" onClick={() => add(item, item === "Urdu" ? "Native" : "Fluent")}>
              + {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------ the card ------------------------------ */

export interface ContactValues {
  country: string;
  languages: string;
  phone: string;
}

export default function ContactFields({
  values,
  phoneError,
  onChange,
}: {
  values: ContactValues;
  phoneError?: string;
  onChange: (patch: Partial<ContactValues>) => void;
}) {
  const { t } = useI18n();
  const location = parseLocation(values.country);
  const country = location.country;
  const city = location.country ? location.city : location.raw;
  /* With no number typed the phone field is stored empty, so remember a manually
     picked dial code locally; otherwise it follows the chosen country. */
  const [emptyDial, setEmptyDial] = useState<string | null>(null);
  const phone = parsePhone(values.phone, emptyDial ?? country?.dial ?? "");
  const languages = parseLanguages(values.languages);

  /* Dial code options: one per code, the chosen country's entry first. */
  const dialOptions = useMemo(() => {
    const seen = new Set<string>();
    return [...COUNTRIES]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((entry) => {
        if (seen.has(entry.dial)) return false;
        seen.add(entry.dial);
        return true;
      });
  }, []);
  const dialCountry =
    (country && country.dial === phone.dial ? country : undefined) ??
    COUNTRIES.find((entry) => entry.dial === phone.dial);
  const digits = phone.number.replace(/\D/g, "");

  return (
    <div className="wiz-card cf-card">
      <div className="wiz-card-head">
        <h3>{t("profile.contact")}</h3>
        <p>{t("profile.contactSub")}</p>
      </div>

      <div className="cf-grid">
        <div className="cf-field">
          <label htmlFor="field-country">{t("contact.country")}</label>
          <CountryPicker
            value={country}
            placeholder={t("contact.chooseCountry")}
            onChange={(next) => {
              setEmptyDial(null);
              onChange({ country: formatLocation(city, next) });
            }}
          />
        </div>

        <div className="cf-field">
          <label htmlFor="field-city">
            {t("contact.city")} <span className="cf-optional">{t("contact.optional")}</span>
          </label>
          <input
            id="field-city"
            type="text"
            autoComplete="address-level2"
            value={city}
            placeholder={t("contact.cityPlaceholder")}
            onChange={(event) => onChange({ country: formatLocation(event.target.value, country) })}
          />
        </div>

        <div className={"cf-field cf-field-wide" + (phoneError ? " invalid" : "")}>
          <label htmlFor="field-phone">
            {t("profile.phone")} <b aria-hidden="true">*</b>
          </label>
          <div className="cf-phone">
            <span className="cf-phone-code">
              {dialCountry ? <Flag code={dialCountry.code} /> : null}
              <select
                value={phone.dial}
                aria-label={t("contact.dialCode")}
                onChange={(event) => {
                  setEmptyDial(event.target.value);
                  onChange({ phone: formatPhone(event.target.value, phone.number) });
                }}
              >
                <option value="">+ —</option>
                {dialOptions.map((entry) => (
                  <option key={entry.dial} value={entry.dial}>
                    {entry.code} +{entry.dial}
                  </option>
                ))}
              </select>
            </span>
            <input
              id="field-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={phone.number}
              placeholder={t("contact.phonePlaceholder")}
              onChange={(event) =>
                onChange({ phone: formatPhone(phone.dial, event.target.value.replace(/[^\d\s\-()]/g, "")) })
              }
            />
            {digits.length >= 7 ? (
              <span className="cf-phone-ok" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            ) : null}
          </div>
          {phoneError ? <em className="cf-error">{phoneError}</em> : <span className="cf-hint">{t("contact.phoneHint")}</span>}
        </div>

        <div className="cf-field cf-field-wide">
          <label htmlFor="field-languages">{t("profile.languages")}</label>
          <LanguagePicker
            value={languages}
            onChange={(next) => onChange({ languages: formatLanguages(next) })}
          />
        </div>
      </div>
    </div>
  );
}
