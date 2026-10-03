"use client";

import { useI18n } from "@/lib/i18n";
import type { ProfileStrength } from "@/lib/auth";
import type { Profile } from "@/lib/types";
import { isAllowedCategory } from "@/lib/taxonomy";
import { CATEGORY_LABEL_KEYS } from "@/lib/gigs";

function Row({ label, value }: { label: string; value: string }) {
  const { t } = useI18n();
  const empty = value.trim().length === 0;
  return (
    <div className="wiz-review-row">
      <span className="wiz-review-label">{label}</span>
      <span className={"wiz-review-value" + (empty ? " empty" : "")}>
        {empty ? t("wizard.notSet") : value}
      </span>
    </div>
  );
}

function CheckMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function ReviewStep({
  profile,
  strength,
  onEdit,
  onPublish,
}: {
  profile: Profile;
  strength: ProfileStrength;
  onEdit: (section: "basic" | "skills" | "bio") => void;
  onPublish: () => void;
}) {
  const { t } = useI18n();
  const categoryLabel = isAllowedCategory(profile.primaryCategory)
    ? t(CATEGORY_LABEL_KEYS[profile.primaryCategory])
    : "";
  const avatarValue = profile.avatar
    ? profile.avatar.startsWith("data:")
      ? t("wizard.uploaded")
      : profile.avatar
    : "";
  const portfolioValue =
    profile.portfolioProjects.map((project) => project.title).join(", ") || "";

  return (
    <section className="review-step" aria-labelledby="review-step-title">
      <div className="basic-info-card">
        <div className="basic-info-head">
          <span className="basic-info-count">Step 4 of 4</span>
          <h3 id="review-step-title">{t("wizard.step4Title")}</h3>
          <p>{t("wizard.step4Sub")}</p>
        </div>

        <div className="review-section">
          <div className="review-section-head">
            <h4>{t("wizard.reviewBasic")}</h4>
            <button type="button" className="wiz-edit" onClick={() => onEdit("basic")}>
              {t("wizard.edit")}
            </button>
          </div>
          <div className="wiz-review-grid">
            <Row label={t("profile.fullName")} value={profile.fullName} />
            <Row label={t("profile.profTitle")} value={profile.title} />
            <Row label={t("profile.country")} value={profile.country} />
            <Row label={t("profile.languages")} value={profile.languages} />
            <Row label={t("profile.phone")} value={profile.phone} />
            <Row label={t("profile.photo")} value={avatarValue} />
          </div>
        </div>

        <div className="review-section">
          <div className="review-section-head">
            <h4>{t("wizard.reviewSkills")}</h4>
            <button type="button" className="wiz-edit" onClick={() => onEdit("skills")}>
              {t("wizard.edit")}
            </button>
          </div>
          <div className="wiz-review-grid">
            <Row label={t("profile.primaryCategory")} value={categoryLabel} />
            <Row label={t("profile.skills")} value={profile.skills.join(", ")} />
            <Row label={t("profile.availability")} value={profile.availability} />
          </div>
        </div>

        <div className="review-section">
          <div className="review-section-head">
            <h4>{t("wizard.reviewBio")}</h4>
            <button type="button" className="wiz-edit" onClick={() => onEdit("bio")}>
              {t("wizard.edit")}
            </button>
          </div>
          <div className="wiz-review-grid">
            <Row label={t("profile.bio")} value={profile.bio} />
            <Row label={t("profile.rate")} value={profile.hourlyRate} />
            <Row label={t("profile.projectRate")} value={profile.projectRate} />
            <Row label={t("profile.portfolio")} value={profile.portfolio} />
            <Row
              label={t("profile.video")}
              value={profile.introVideoName || (profile.introVideo ? t("wizard.uploaded") : "")}
            />
            <Row label={t("account.portfolioTitle")} value={portfolioValue} />
          </div>
        </div>

        <div className="review-section">
          <div className="review-section-head">
            <h4>{t("profile.strength")}</h4>
          </div>
          <p className="review-strength-note">
            {t("profile.steps", { done: strength.completed, total: strength.total })}
          </p>
          <div className="wiz-strength">
            <div
              className="wiz-strength-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={strength.total}
              aria-valuenow={strength.completed}
            >
              <span style={{ width: `${strength.percent}%` }} />
            </div>
            <strong>{strength.percent}%</strong>
          </div>
          <ul className="strength-list wiz-strength-list">
            {strength.items.map((item) => (
              <li key={String(item.key)} className={item.done ? "done" : ""}>
                <span className="strength-check" aria-hidden="true">
                  {item.done ? <CheckMark /> : null}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="basic-info-card review-publish-card">
        <div>
          <h3>{t("wizard.publishTitle")}</h3>
          <p>{t("wizard.publishSub")}</p>
        </div>
        <button type="button" className="btn-primary review-publish-btn" onClick={onPublish}>
          {t("wizard.publish")}
        </button>
      </div>
    </section>
  );
}
