"use client";

import { useI18n } from "@/lib/i18n";
import { AVAILABILITY_OPTIONS, RESPONSE_TIMES, WEEKLY_HOURS } from "@/lib/skills-meta";

/* ==========================================================================
   HIRELYX · AVAILABILITY
   Status cards (full time / part time / project based / unavailable), then
   weekly capacity and typical response time as one-tap chips. Capacity and
   response chips hide when the freelancer marks themselves unavailable.
   ========================================================================== */

export interface AvailabilityValues {
  availability: string;
  weeklyHours: string;
  responseTime: string;
}

const UNAVAILABLE = "Not available right now";

function StatusIcon({ tone }: { tone: string }) {
  const paths: Record<string, string> = {
    green: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.2-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4Z",
    blue: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10.4V6h-2v7.2l5 3 1-1.7Z",
    amber: "M4 6h16v2H4Zm0 5h16v2H4Zm0 5h10v2H4Z",
    grey: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM7 11h10v2H7Z",
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={paths[tone] ?? paths.grey} />
    </svg>
  );
}

export default function AvailabilityCard({
  values,
  onChange,
}: {
  values: AvailabilityValues;
  onChange: (patch: Partial<AvailabilityValues>) => void;
}) {
  const { t } = useI18n();
  const unavailable = values.availability === UNAVAILABLE;

  return (
    <div className="wiz-card av-card">
      <div className="wiz-card-head">
        <h3>{t("profile.availability")}</h3>
        <p>{t("avail.sub")}</p>
      </div>

      <div className="av-status" role="radiogroup" aria-label={t("profile.availability")} id="field-availability" tabIndex={-1}>
        {AVAILABILITY_OPTIONS.map((option) => {
          const selected = values.availability === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={"av-option tone-" + option.tone + (selected ? " selected" : "")}
              onClick={() => onChange({ availability: option.value })}
            >
              <span className="av-icon">
                <StatusIcon tone={option.tone} />
              </span>
              <strong>{t(option.key)}</strong>
              <span>{t(option.subKey)}</span>
            </button>
          );
        })}
      </div>

      {!unavailable ? (
        <div className="av-extra">
          <div className="av-group">
            <span className="av-label" id="av-hours-label">
              {t("avail.hours")}
            </span>
            <div className="sk-seg" role="radiogroup" aria-labelledby="av-hours-label" id="field-weeklyHours" tabIndex={-1}>
              {WEEKLY_HOURS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={values.weeklyHours === option.value}
                  className={values.weeklyHours === option.value ? "active" : ""}
                  onClick={() => onChange({ weeklyHours: option.value })}
                >
                  {t(option.key)}
                </button>
              ))}
            </div>
          </div>

          <div className="av-group">
            <span className="av-label" id="av-resp-label">
              {t("avail.response")}
            </span>
            <div className="sk-seg" role="radiogroup" aria-labelledby="av-resp-label" id="field-responseTime" tabIndex={-1}>
              {RESPONSE_TIMES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={values.responseTime === option.value}
                  className={values.responseTime === option.value ? "active" : ""}
                  onClick={() => onChange({ responseTime: option.value })}
                >
                  {t(option.key)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="av-note">{t("avail.unavailableNote")}</p>
      )}
    </div>
  );
}
