"use client";

import { useI18n } from "@/lib/i18n";
import { computeProfileStrength } from "@/lib/auth";
import { initials } from "@/lib/format";
import { isAllowedCategory } from "@/lib/taxonomy";
import { CATEGORY_LABEL_KEYS } from "@/lib/gigs";
import type { TranslationKey } from "@/lib/i18n";
import type { Profile } from "@/lib/types";
import { flagUrl, parseLanguages, parseLocation } from "@/lib/countries";
import { SOCIAL_NETWORKS, displayLink } from "@/lib/social";
import { TOP_SKILLS, availabilityKey, experienceKey, levelFor, responseKey } from "@/lib/skills-meta";

/* ==========================================================================
   HIRELYX · ONBOARDING LIVE PREVIEW
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
  const place = parseLocation(profile.country);
  const location = place.country
    ? [place.city, place.country.name].filter(Boolean).join(", ")
    : place.raw;
  const languages = parseLanguages(profile.languages);
  const hourly = profile.hourlyRate.trim();
  const project = profile.projectRate.trim();
  const availabilityLabelKey = availabilityKey(profile.availability.trim());
  const availability = availabilityLabelKey ? t(availabilityLabelKey) : profile.availability.trim();
  const expKey = experienceKey(profile.experienceYears);
  const links = SOCIAL_NETWORKS.map((network) => ({
    network,
    value: network.key === "website" ? profile.portfolio.trim() : (profile.socialLinks[network.key] ?? "").trim(),
  })).filter((item) => item.value);
  const respKey = responseKey(profile.responseTime);

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
            {expKey ? <span className="ob-pv-badge">{t(expKey)}</span> : null}
            {respKey ? (
              <span className="ob-pv-badge ob-pv-badge-resp">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
                </svg>
                {t(respKey)}
              </span>
            ) : null}
          </div>

          {location || languages.length > 0 ? (
            <div className="ob-pv-meta">
              {location ? (
                <span className="ob-pv-loc">
                  {place.country ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={flagUrl(place.country.code, 40)} alt="" width={16} height={12} />
                  ) : null}
                  {location}
                </span>
              ) : null}
              {languages.length > 0 ? (
                <span className="ob-pv-langs">
                  {languages.slice(0, 4).map((item) => (
                    <span key={item.name} title={item.level}>
                      {item.name}
                      <i className={"lvl-" + item.level.toLowerCase()} aria-hidden="true" />
                    </span>
                  ))}
                </span>
              ) : null}
            </div>
          ) : null}

          <p className={"ob-pv-bio" + (bio ? "" : " empty")}>
            {bio || t("onboarding.previewBioFallback")}
          </p>

          <div className="ob-pv-skills">
            {profile.skills.length > 0 ? (
              profile.skills.slice(0, 8).map((skill, index) => (
                <span
                  className={"ob-pv-skill" + (index < TOP_SKILLS ? " top" : "")}
                  key={skill}
                  title={levelFor(profile.skillLevels, skill)}
                >
                  {skill}
                  <i className={"lvl-" + levelFor(profile.skillLevels, skill).toLowerCase()} aria-hidden="true" />
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

          {links.length > 0 ? (
            <div className="ob-pv-links">
              {links.map(({ network, value }) => (
                <span key={network.key} title={displayLink(value)}>
                  {network.label}
                </span>
              ))}
            </div>
          ) : null}

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
