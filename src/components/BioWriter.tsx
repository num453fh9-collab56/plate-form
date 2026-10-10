"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { BIO_MAX, BIO_MIN, BIO_RICH, bioBand, bioChecks, bioTemplates } from "@/lib/bio";
import type { BioContext, BioTemplate } from "@/lib/bio";

/* ==========================================================================
   HIRELYX · BIO WRITER
   Textarea with a coloured length meter, live quality checks, and three
   templates built from the freelancer's own details. Applying a template
   keeps the previous text so one tap can undo it.
   ========================================================================== */

const BAND_KEYS = {
  empty: "bio.bandEmpty",
  short: "bio.bandShort",
  ok: "bio.bandOk",
  good: "bio.bandGood",
  rich: "bio.bandRich",
} as const;

export default function BioWriter({
  value,
  error,
  context,
  onChange,
}: {
  value: string;
  error?: string;
  context: BioContext;
  onChange: (bio: string) => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<BioTemplate["id"]>("professional");
  const [previous, setPrevious] = useState<string | null>(null);

  const length = value.trim().length;
  const band = bioBand(length);
  const checks = bioChecks(value, context.skills);
  const templates = useMemo(() => bioTemplates(context, t), [context, t]);
  const current = templates.find((item) => item.id === active) ?? templates[0];

  const apply = (template: BioTemplate) => {
    setPrevious(value);
    onChange(template.text);
    setOpen(false);
  };

  return (
    <div className={"bw" + (error ? " invalid" : "")}>
      <div className="bw-head">
        <label htmlFor="field-bio">
          {t("profile.bio")} <b aria-hidden="true">*</b>
        </label>
        <div className="bw-head-actions">
          {previous !== null ? (
            <button
              type="button"
              className="bw-undo"
              onClick={() => {
                onChange(previous);
                setPrevious(null);
              }}
            >
              ↶ {t("bio.undo")}
            </button>
          ) : null}
          <button
            type="button"
            className={"bw-magic" + (open ? " open" : "")}
            aria-expanded={open}
            onClick={() => setOpen((state) => !state)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="m12 2 1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9Zm7 11 .9 2.6 2.6.9-2.6.9L19 20l-.9-2.6-2.6-.9 2.6-.9Z" />
            </svg>
            {t("bio.templates")}
          </button>
        </div>
      </div>

      {open ? (
        <div className="bw-tpl">
          <div className="bw-tpl-tabs" role="tablist">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                role="tab"
                aria-selected={template.id === active}
                className={template.id === active ? "active" : ""}
                onClick={() => setActive(template.id)}
              >
                {t(template.labelKey)}
              </button>
            ))}
          </div>
          <p className="bw-tpl-text">{current.text}</p>
          <div className="bw-tpl-foot">
            <span>{t("bio.templateHint")}</span>
            <button type="button" className="ob-btn-primary btn-sm" onClick={() => apply(current)}>
              {value.trim() ? t("bio.replaceWith") : t("bio.useTemplate")}
            </button>
          </div>
        </div>
      ) : null}

      <textarea
        id="field-bio"
        rows={8}
        maxLength={BIO_MAX}
        value={value}
        placeholder={t("profile.bioPlaceholder")}
        onChange={(event) => {
          if (previous !== null) setPrevious(null);
          onChange(event.target.value);
        }}
      />

      <div className="bw-meter" aria-hidden="true">
        <span className={"band-" + band} style={{ width: `${Math.min(100, (length / BIO_RICH) * 100)}%` }} />
        <i style={{ left: `${(BIO_MIN / BIO_RICH) * 100}%` }} />
      </div>
      <div className="bw-status">
        <span className={"bw-band band-" + band}>{t(BAND_KEYS[band], { min: BIO_MIN })}</span>
        <span className="bw-count">
          {length}/{BIO_MAX}
        </span>
      </div>
      {error ? <em className="bw-error">{error}</em> : null}

      <ul className="bw-checks" aria-label={t("bio.checksLabel")}>
        {checks.map((check) => (
          <li key={check.key} className={check.done ? "done" : ""}>
            <span aria-hidden="true">{check.done ? "✓" : "○"}</span>
            {t(check.labelKey)}
          </li>
        ))}
      </ul>
    </div>
  );
}
