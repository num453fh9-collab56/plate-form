"use client";

import { useI18n } from "@/lib/i18n";

/* ==========================================================================
   HIRELYX · BASIC INFORMATION
   Name + professional headline. The headline gets a live character budget,
   a quality hint and one-tap suggestions tailored to the primary category
   (when the resume parser or a previous visit already set one).
   ========================================================================== */

export const HEADLINE_MAX = 70;
const HEADLINE_GOOD = 25;

export interface BasicInformationValues {
  fullName: string;
  headline: string;
  profilePictureUrl: string;
}

export interface BasicInformationErrors {
  fullName?: string;
  headline?: string;
  profilePictureUrl?: string;
}

const GENERIC_HEADLINES = [
  "Full Stack Developer | React & Node.js",
  "Creative Graphic Designer & Brand Specialist",
  "Digital Marketing Expert | SEO & Paid Ads",
  "Professional Content Writer & Copywriter",
];

/* Keyed by category label (the value stored in `primaryCategory`). */
const HEADLINES_BY_CATEGORY: Record<string, string[]> = {
  "Programming & Tech": [
    "Full Stack Developer | React, Next.js & Node.js",
    "WordPress & Shopify Expert | Fast, SEO-ready Sites",
    "Backend Engineer | APIs, Databases & Cloud",
  ],
  "Mobile Apps": [
    "Flutter & React Native App Developer",
    "iOS & Android Developer | From Idea to App Store",
    "Mobile UI Engineer | Smooth, Native-feel Apps",
  ],
  "AI Services": [
    "AI Engineer | Chatbots, Agents & Automation",
    "Machine Learning Specialist | Python & LLMs",
    "AI Automation Expert | Save Hours Every Week",
  ],
  "UI/UX Design": [
    "UI/UX Designer | Figma, Prototypes & Design Systems",
    "Product Designer | Web & Mobile Experiences",
    "UX Researcher & Interface Designer",
  ],
  "Graphics & Design": [
    "Logo & Brand Identity Designer",
    "Creative Graphic Designer | Social Media & Print",
    "Packaging & Illustration Artist",
  ],
  "Video & Animation": [
    "Video Editor | YouTube, Reels & Ads",
    "2D/3D Motion Graphics Animator",
    "Explainer Video & Whiteboard Animation Expert",
  ],
  "Digital Marketing": [
    "Digital Marketing Expert | Meta & Google Ads",
    "SEO Specialist | Rank Higher, Grow Traffic",
    "Social Media Manager & Growth Strategist",
  ],
  "Writing & Translation": [
    "SEO Content Writer & Blog Specialist",
    "Copywriter | Websites, Ads & Email",
    "English ⇄ Urdu Translator & Proofreader",
  ],
};

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function BasicInformationStep({
  values,
  errors,
  category,
  onChange,
}: {
  values: BasicInformationValues;
  errors?: BasicInformationErrors;
  /** Primary category label, used to tailor headline suggestions. */
  category?: string;
  onChange: (patch: Partial<BasicInformationValues>) => void;
}) {
  const { t } = useI18n();

  const headline = values.headline;
  const length = headline.length;
  const nameOk = values.fullName.trim().split(/\s+/).filter(Boolean).length >= 2;
  const suggestions = (category && HEADLINES_BY_CATEGORY[category]) || GENERIC_HEADLINES;
  const quality =
    length === 0
      ? ""
      : length < HEADLINE_GOOD
        ? t("basic.headlineShort")
        : length > HEADLINE_MAX - 8
          ? t("basic.headlineNearMax")
          : t("basic.headlineGood");
  const meterTone = length === 0 ? "" : length < HEADLINE_GOOD ? " warn" : " good";

  return (
    <section className="basic-info-step" aria-labelledby="basic-info-title">
      <div className="basic-info-card">
        <div className="basic-info-head">
          <span className="basic-info-count">{t("basic.stepBadge")}</span>
          <h3 id="basic-info-title">{t("profile.basics")}</h3>
          <p>{t("profile.basicsSub")}</p>
        </div>

        <div className="basic-info-grid">
          <label className={"basic-info-field basic-info-field-wide" + (errors?.fullName ? " invalid" : "")}>
            <span>
              {t("profile.fullName")}
              <b aria-hidden="true"> *</b>
            </span>
            <div className="bi-input">
              <input
                id="field-fullName"
                type="text"
                autoComplete="name"
                maxLength={60}
                value={values.fullName}
                placeholder={t("auth.fullNamePlaceholder")}
                onChange={(event) => onChange({ fullName: event.target.value })}
              />
              {nameOk ? (
                <span className="bi-ok" aria-hidden="true">
                  <CheckIcon />
                </span>
              ) : null}
            </div>
            {errors?.fullName ? <em>{errors.fullName}</em> : <small className="bi-hint">{t("basic.nameHint")}</small>}
          </label>

          <div className={"basic-info-field basic-info-field-wide" + (errors?.headline ? " invalid" : "")}>
            <label htmlFor="field-title">
              {t("profile.headline")}
              <b aria-hidden="true"> *</b>
            </label>
            <div className="bi-input">
              <input
                id="field-title"
                type="text"
                maxLength={HEADLINE_MAX}
                value={headline}
                placeholder={t("profile.headlinePlaceholder")}
                aria-describedby="headline-meter"
                onChange={(event) => onChange({ headline: event.target.value })}
              />
              <span className={"bi-count" + meterTone} id="headline-meter">
                {length}/{HEADLINE_MAX}
              </span>
            </div>
            <div className="bi-meter" aria-hidden="true">
              <span
                className={meterTone.trim()}
                style={{ width: `${Math.min(100, (length / HEADLINE_MAX) * 100)}%` }}
              />
            </div>
            {errors?.headline ? (
              <em>{errors.headline}</em>
            ) : quality ? (
              <small className={"bi-hint" + meterTone}>{quality}</small>
            ) : (
              <small className="bi-hint">{t("basic.headlineHint")}</small>
            )}

            <div className="bi-suggest">
              <span className="bi-suggest-label">{t("basic.suggestions")}</span>
              <div className="bi-suggest-list">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={item === headline ? "active" : ""}
                    onClick={() => onChange({ headline: item.slice(0, HEADLINE_MAX) })}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
