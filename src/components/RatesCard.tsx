"use client";

import { useI18n } from "@/lib/i18n";
import { CATEGORY_LABEL_KEYS } from "@/lib/gigs";
import { PLATFORM_FEE_RATE, sellerNet } from "@/lib/fees";
import {
  DEFAULT_WEEKLY_HOURS,
  WEEKS_PER_MONTH,
  hoursForBucket,
  rateRangeFor,
} from "@/lib/rates";

/* ==========================================================================
   HIRELYX · RATES CALCULATOR
   Hourly + starting project price with a suggested range for the chosen
   category, the platform fee taken off live, and a monthly estimate based on
   the weekly hours picked in step 2.
   ========================================================================== */

function money(value: number): string {
  return value >= 100 ? `$${Math.round(value).toLocaleString("en-US")}` : `$${value.toFixed(2).replace(/\.00$/, "")}`;
}

function cleanNumber(raw: string): string {
  const digits = raw.replace(/[^\d.]/g, "");
  const [whole, ...rest] = digits.split(".");
  const decimals = rest.join("").slice(0, 2);
  return decimals ? `${whole}.${decimals}` : rest.length ? `${whole}.` : whole;
}

export default function RatesCard({
  hourlyRate,
  projectRate,
  category,
  weeklyHours,
  onChange,
}: {
  hourlyRate: string;
  projectRate: string;
  category: string;
  weeklyHours: string;
  onChange: (patch: { hourlyRate?: string; projectRate?: string }) => void;
}) {
  const { t } = useI18n();
  const range = rateRangeFor(category);
  const hourly = Number(hourlyRate);
  const project = Number(projectRate);
  const hasHourly = hourlyRate.trim() !== "" && Number.isFinite(hourly) && hourly > 0;
  const hasProject = projectRate.trim() !== "" && Number.isFinite(project) && project > 0;
  const hours = hoursForBucket(weeklyHours) ?? DEFAULT_WEEKLY_HOURS;
  const feePercent = Math.round(PLATFORM_FEE_RATE * 100);
  const categoryName = CATEGORY_LABEL_KEYS[category] ? t(CATEGORY_LABEL_KEYS[category]) : t("rates.allCategories");

  /* Marker position on a scale from 0 to 1.5× the suggested high end. */
  const scaleMax = range.high * 1.5;
  const marker = hasHourly ? Math.min(100, (hourly / scaleMax) * 100) : null;
  const position: "below" | "within" | "above" | null = !hasHourly
    ? null
    : hourly < range.low
      ? "below"
      : hourly > range.high
        ? "above"
        : "within";

  return (
    <div className="wiz-card rc-card">
      <div className="wiz-card-head">
        <h3>{t("profile.work")}</h3>
        <p>{t("rates.sub")}</p>
      </div>

      <div className="rc-inputs">
        <div className="rc-field">
          <label htmlFor="field-hourlyRate">{t("profile.rate")}</label>
          <div className="rc-money">
            <span>$</span>
            <input
              id="field-hourlyRate"
              type="text"
              inputMode="decimal"
              value={hourlyRate}
              placeholder={String(Math.round((range.low + range.high) / 2))}
              onChange={(event) => onChange({ hourlyRate: cleanNumber(event.target.value) })}
            />
            <em>/{t("rates.hr")}</em>
          </div>
        </div>
        <div className="rc-field">
          <label htmlFor="field-projectRate">{t("profile.projectRate")}</label>
          <div className="rc-money">
            <span>$</span>
            <input
              id="field-projectRate"
              type="text"
              inputMode="decimal"
              value={projectRate}
              placeholder={String(range.low * 10)}
              onChange={(event) => onChange({ projectRate: cleanNumber(event.target.value) })}
            />
            <em>{t("rates.from")}</em>
          </div>
        </div>
      </div>

      <div className="rc-range">
        <div className="rc-range-head">
          <span>{t("rates.suggested", { category: categoryName })}</span>
          <strong>
            {money(range.low)} – {money(range.high)}/{t("rates.hr")}
          </strong>
        </div>
        <div className="rc-bar" aria-hidden="true">
          <span
            className="rc-bar-band"
            style={{ left: `${(range.low / scaleMax) * 100}%`, width: `${((range.high - range.low) / scaleMax) * 100}%` }}
          />
          {marker !== null ? <i className={"rc-bar-marker " + position} style={{ left: `${marker}%` }} /> : null}
        </div>
        {position ? (
          <p className={"rc-range-note " + position}>{t(`rates.${position}` as const)}</p>
        ) : (
          <p className="rc-range-note">{t("rates.guideNote")}</p>
        )}
      </div>

      <div className="rc-earn">
        <div className="rc-earn-item">
          <span>{t("rates.youGetHourly")}</span>
          <strong>{hasHourly ? money(sellerNet(hourly)) : "—"}</strong>
          <em>{t("rates.afterFee", { fee: feePercent })}</em>
        </div>
        <div className="rc-earn-item">
          <span>{t("rates.youGetProject")}</span>
          <strong>{hasProject ? money(sellerNet(project)) : "—"}</strong>
          <em>{t("rates.afterFee", { fee: feePercent })}</em>
        </div>
        <div className="rc-earn-item highlight">
          <span>{t("rates.monthly")}</span>
          <strong>{hasHourly ? money(sellerNet(hourly) * hours * WEEKS_PER_MONTH) : "—"}</strong>
          <em>{t("rates.monthlyBasis", { hours })}</em>
        </div>
      </div>
    </div>
  );
}
