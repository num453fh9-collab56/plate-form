"use client";

import { useI18n } from "@/lib/i18n";

/* ==========================================================================
   HIRELYX · STEP PROGRESS METER
   Ring + checklist for the fields a step owns. Unfinished items are buttons
   that scroll to and focus the field that completes them; the footer line
   shows the overall profile strength so users see each step move the needle.
   ========================================================================== */

export interface StepProgressItem {
  key: string;
  label: string;
  done: boolean;
  required?: boolean;
  /** DOM id of the control that completes this item. */
  targetId: string;
}

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function focusTarget(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => element.focus({ preventScroll: true }), 350);
}

export default function StepProgress({
  title,
  items,
  overallPercent,
}: {
  title: string;
  items: StepProgressItem[];
  overallPercent: number;
}) {
  const { t } = useI18n();
  const done = items.filter((item) => item.done).length;
  const ratio = items.length ? done / items.length : 0;
  const complete = done === items.length;

  return (
    <div className={"sp-card" + (complete ? " complete" : "")}>
      <div className="sp-ring" role="img" aria-label={t("progress.ringLabel", { done, total: items.length })}>
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle className="sp-ring-track" cx="32" cy="32" r={RADIUS} />
          <circle
            className="sp-ring-fill"
            cx="32"
            cy="32"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
          />
        </svg>
        <span>{Math.round(ratio * 100)}%</span>
      </div>

      <div className="sp-body">
        <div className="sp-head">
          <strong>{title}</strong>
          <span>{complete ? t("progress.allDone") : t("progress.remaining", { count: items.length - done })}</span>
        </div>
        <ul className="sp-list">
          {items.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className={item.done ? "done" : ""}
                onClick={() => focusTarget(item.targetId)}
              >
                <span className="sp-dot" aria-hidden="true">
                  {item.done ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : null}
                </span>
                {item.label}
                {item.required && !item.done ? <b aria-hidden="true">*</b> : null}
              </button>
            </li>
          ))}
        </ul>
        <div className="sp-overall">
          <span>{t("progress.overall")}</span>
          <span className="sp-overall-bar" aria-hidden="true">
            <span style={{ width: `${overallPercent}%` }} />
          </span>
          <strong>{overallPercent}%</strong>
        </div>
      </div>
    </div>
  );
}
