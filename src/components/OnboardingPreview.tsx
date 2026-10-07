"use client";

import { useI18n } from "@/lib/i18n";
import { computeProfileStrength } from "@/lib/auth";
import { initials } from "@/lib/format";
import { isAllowedCategory } from "@/lib/taxonomy";
import { CATEGORY_LABEL_KEYS } from "@/lib/gigs";
import type { TranslationKey } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

/* ==========================================================================
   APEX · ONBOARDING LIVE PREVIEW
   Sticky sidebar rendered inside the onboarding shell. Receives the merged
   live draft (profile + in-flight step state) so every keystroke is reflected
   instantly — this is the exact card a client sees before hiring.
   ========================================================================== */

export default function OnboardingPreview({ profile }: { profile: Profile }) {
  const { t } = useI18n();

  const name = profile.fullName.trim();
  const title = profile.title.trim();
  const bio = profile.bio.trim();
  const category = isAllowedCategory(profile.primaryCategory)
    ? t(CATEGORY_LABEL_KEYS[profile.primaryCategory])
    : "";
  const location = [profile.country.trim(), profile.languages.trim()]
    .filter(Boolean)
    .join(" · ");
  const hourly = profile.hourlyRate.trim();
  const project = profile.projectRate.trim();
  const availability = profile.availability.trim();

  /* The badge is earned, not static — it reflects the live profile strength
     computed from the draft the user is editing right now. */
  const strength = computeProfileStrength(profile);
  const tierKey: TranslationKey =
    strength.percent >= 80
      ? "onboarding.tierElite"
      : strength.percent >= 40
        ? "onboarding.tierRising"
        : "onboarding.tierNew";

  return (
    <aside className="ob-preview" aria-label={t("onboarding.previewTitle")}>
      <div className="ob-preview-inner">
        <div className="ob-preview-head">
          <span className="ob-preview-dot" aria-hidden="true" />
          <span className="ob-preview-kicker">{t("onboarding.previewKicker")}</span>
        </div>
        <h3 className="ob-preview-title">{t("onboarding.previewTitle")}</h3>

        <div className="ob-pv-card">
          <div className="ob-pv-id">
            <span className="ob-pv-avatar" aria-hidden="true">
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar} alt="" />
              ) : (
                initials(name || "A P")
              )}
            </span>
            <div className="ob-pv-id-info">
              <strong>{name || t("onboarding.previewNameFallback")}</strong>
              <span className={"ob-pv-headline" + (title ? "" : " empty")}>
                {title || t("onboarding.previewTitleFallback")}
              </span>
            </div>
          </div>

          <div className="ob-pv-badges">
            <span className="ob-pv-badge ob-pv-badge-elite">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {t(tierKey)}
            </span>
            {category ? <span className="ob-pv-badge">{category}</span> : null}
            {availability ? (
              <span className="ob-pv-badge ob-pv-badge-avail">{availability}</span>
            ) : null}
          </div>

          {location ? <p className="ob-pv-meta">{location}</p> : null}

          <p className={"ob-pv-bio" + (bio ? "" : " empty")}>
            {bio || t("onboarding.previewBioFallback")}
          </p>

          <div className="ob-pv-skills">
            {profile.skills.length > 0 ? (
              profile.skills.slice(0, 8).map((skill) => (
                <span className="ob-pv-skill" key={skill}>
                  {skill}
                </span>
              ))
            ) : (
              <span className="ob-pv-skills-empty">{t("onboarding.previewNoSkills")}</span>
            )}
          </div>

          <div className="ob-pv-rates">
            {hourly ? (
              <div className="ob-pv-rate">
                <strong>${hourly}</strong>
                <span>{t("onboarding.previewRate")}</span>
              </div>
            ) : null}
            {project ? (
              <div className="ob-pv-rate">
                <strong>${project}</strong>
                <span>{t("onboarding.previewProject")}</span>
              </div>
            ) : null}
          </div>

          {profile.portfolioProjects.length > 0 ? (
            <div className="ob-pv-projects">
              {profile.portfolioProjects.slice(0, 3).map((item) => (
                <span className="ob-pv-project" key={item.id}>
                  {item.title}
                </span>
              ))}
            </div>
          ) : null}

          <div className="ob-pv-strength">
            <div className="ob-pv-strength-head">
              <span>{t("profile.strength")}</span>
              <strong>{strength.percent}%</strong>
            </div>
            <div
              className="ob-pv-strength-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={strength.percent}
            >
              <span style={{ width: `${strength.percent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
