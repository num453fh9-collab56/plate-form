"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/lib/auth";
import { createExternalStore } from "@/lib/external-store";
import type { ExternalStore } from "@/lib/external-store";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { initials } from "@/lib/format";
import { isAllowedCategory } from "@/lib/taxonomy";
import { MAX_AVATAR_SOURCE_BYTES, resizeImageToSquare } from "@/lib/media";
import type { Profile } from "@/lib/types";
import BasicInformationStep from "./BasicInformationStep";
import type { BasicInformationValues } from "./BasicInformationStep";
import SkillsStep from "./SkillsStep";
import type { SkillsValues } from "./SkillsStep";
import BioPortfolioStep from "./BioPortfolioStep";
import type { BioPortfolioValues } from "./BioPortfolioStep";
import ReviewStep from "./ReviewStep";

/* ==========================================================================
   APEX · PROFILE WIZARD
   The profile settings surface, broken into four progressive steps:

     1 · Basic info              identity, location, contact
     2 · Skills & expertise      category, skills, availability
     3 · Bio & portfolio         bio, website, intro video, projects
     4 · Review                  read-only summary, then publish

   Every keystroke writes through `updateProfile`, which persists to
   localStorage immediately — so progress is never lost when moving between
   steps, closing the modal, or reloading the page. The active step index is
   persisted separately so reopening the wizard resumes where the user left off.
   ========================================================================== */

const AVAILABILITY: {
  value: string;
  key: "profile.availFull" | "profile.availPart" | "profile.availProject" | "profile.availNot";
}[] = [
  { value: "Full time", key: "profile.availFull" },
  { value: "Part time", key: "profile.availPart" },
  { value: "Project based", key: "profile.availProject" },
  { value: "Not available right now", key: "profile.availNot" },
];

interface StepDef {
  id: "basic" | "skills" | "bio" | "review";
  titleKey: TranslationKey;
  subKey: TranslationKey;
}

const STEPS: StepDef[] = [
  { id: "basic", titleKey: "wizard.step1Title", subKey: "wizard.step1Sub" },
  { id: "skills", titleKey: "wizard.step2Title", subKey: "wizard.step2Sub" },
  { id: "bio", titleKey: "wizard.step3Title", subKey: "wizard.step3Sub" },
  { id: "review", titleKey: "wizard.step4Title", subKey: "wizard.step4Sub" },
];

const LAST_STEP = STEPS.length - 1;
const BASIC_STEP = 0;
const SKILLS_STEP = 1;
const BIO_STEP = 2;

/** Fields that must be filled before a profile is considered publishable.
 *  Each entry declares which step owns the field, so inline errors only ever
 *  appear against the step that can actually fix them. */
interface Requirement {
  key: keyof Profile;
  step: number;
  valid: (profile: Profile) => boolean;
}

const REQUIREMENTS: Requirement[] = [
  { key: "avatar", step: BASIC_STEP, valid: (p) => p.avatar.trim().length > 0 },
  { key: "fullName", step: BASIC_STEP, valid: (p) => p.fullName.trim().length >= 2 },
  { key: "title", step: BASIC_STEP, valid: (p) => p.title.trim().length >= 3 },
  { key: "phone", step: BASIC_STEP, valid: (p) => p.phone.replace(/\D/g, "").length >= 7 },
  { key: "primaryCategory", step: SKILLS_STEP, valid: (p) => isAllowedCategory(p.primaryCategory) },
  { key: "bio", step: BIO_STEP, valid: (p) => p.bio.trim().length >= 40 },
];

function requirementFor(key: keyof Profile): Requirement {
  return (
    REQUIREMENTS.find((item) => item.key === key) ?? {
      key,
      step: BASIC_STEP,
      valid: () => true,
    }
  );
}

/* ---------------- persisted step index (per account) ----------------
   Backed by the same external-store pattern used by auth and i18n: the server
   always renders step 1, then the client picks up the stored position after
   hydration. This keeps progress across reloads without a setState-in-effect. */

const STEP_STORE_PREFIX = "wv_wizard_step:";
const EMPTY_STEP_STORE = createExternalStore<number>(() => 0, 0);
const STEP_STORES = new Map<string, ExternalStore<number>>();

function stepStore(accountId: string): ExternalStore<number> {
  const existing = STEP_STORES.get(accountId);
  if (existing) return existing;
  const created = createExternalStore<number>(() => {
    try {
      const parsed = Number(window.localStorage.getItem(STEP_STORE_PREFIX + accountId));
      if (Number.isInteger(parsed) && parsed >= 0 && parsed <= LAST_STEP) return parsed;
    } catch {
      /* storage unavailable */
    }
    return 0;
  }, 0);
  STEP_STORES.set(accountId, created);
  return created;
}

function persistStep(accountId: string, step: number): void {
  try {
    if (step <= 0) {
      window.localStorage.removeItem(STEP_STORE_PREFIX + accountId);
    } else {
      window.localStorage.setItem(STEP_STORE_PREFIX + accountId, String(step));
    }
  } catch {
    /* storage unavailable */
  }
  if (accountId) stepStore(accountId).set(step);
}

/* ------------------------------ primitives ------------------------------ */

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className={"form-field" + (error ? " invalid" : "")}>
      <label>
        {label}
        {required ? <span className="req"> *</span> : null}
      </label>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
      <span className="error-msg">{error}</span>
    </div>
  );
}

function WizardCard({ children }: { children: ReactNode }) {
  return <div className="wiz-card">{children}</div>;
}

function CheckMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* ============================== the wizard ============================== */

function ProfileWizard() {
  const { closeProfile, toast } = useUI();
  const { user, account, profile, strength, updateProfile } = useAuth();
  const { t } = useI18n();

  const accountId = account?.id ?? "";
  const store = useMemo(
    () => (accountId ? stepStore(accountId) : EMPTY_STEP_STORE),
    [accountId],
  );
  const step = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  /* Steps the user has visited — their errors stay visible until fixed. */
  const [revealed, setRevealed] = useState<number[]>([]);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInformationValues>(() => ({
    fullName: profile.fullName,
    headline: profile.title,
    profilePictureUrl: profile.avatar,
  }));
  const [skillsInfo, setSkillsInfo] = useState<SkillsValues>(() => ({
    primaryCategory: profile.primaryCategory,
    skills: profile.skills,
  }));
  const [bioInfo, setBioInfo] = useState<BioPortfolioValues>(() => ({
    bio: profile.bio,
    hourlyRate: profile.hourlyRate,
    projectRate: profile.projectRate,
    portfolio: profile.portfolio,
    introVideo: profile.introVideo,
    introVideoName: profile.introVideoName,
    portfolioProjects: profile.portfolioProjects,
  }));

  useEffect(() => {
    document.body.classList.add("modal-open");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProfile();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeProfile]);

  const gotoStep = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(LAST_STEP, next));
      setRevealed((prev) => (prev.includes(clamped) ? prev : [...prev, clamped]));
      persistStep(accountId, clamped);
    },
    [accountId],
  );

  const errorFor = useCallback(
    (key: keyof Profile): string => {
      const requirement = requirementFor(key);
      if (!revealed.includes(requirement.step)) return "";
      return requirement.valid(profile) ? "" : t("profile.fieldRequired");
    },
    [revealed, profile, t],
  );

  const missingRequired = useMemo(
    () => REQUIREMENTS.filter((item) => !item.valid(profile)),
    [profile],
  );

  const onAvatar = async (file: File) => {
    if (file.size > MAX_AVATAR_SOURCE_BYTES) {
      toast(t("video.tooLarge", { max: Math.round(MAX_AVATAR_SOURCE_BYTES / 1048576) }));
      return;
    }
    try {
      const dataUrl = await resizeImageToSquare(file);
      setBasicInfo((prev) => ({ ...prev, profilePictureUrl: dataUrl }));
      updateProfile({ avatar: dataUrl });
    } catch {
      toast(t("video.errRead"));
    }
  };

  const updateBasicInfo = (patch: Partial<BasicInformationValues>) => {
    const next = { ...basicInfo, ...patch };
    setBasicInfo(next);
    updateProfile({
      fullName: next.fullName,
      title: next.headline,
      avatar: next.profilePictureUrl,
    });
  };

  const updateSkillsInfo = (patch: Partial<SkillsValues>) => {
    setSkillsInfo((prev) => ({ ...prev, ...patch }));
  };

  const updateBioInfo = (patch: Partial<BioPortfolioValues>) => {
    setBioInfo((prev) => ({ ...prev, ...patch }));
  };

  const commitStep = (stepIndex: number) => {
    if (stepIndex === BASIC_STEP) {
      updateProfile({
        fullName: basicInfo.fullName,
        title: basicInfo.headline,
        avatar: basicInfo.profilePictureUrl,
      });
    }
    if (stepIndex === SKILLS_STEP) {
      updateProfile({
        primaryCategory: skillsInfo.primaryCategory,
        skills: skillsInfo.skills,
      });
    }
    if (stepIndex === BIO_STEP) {
      updateProfile({
        bio: bioInfo.bio,
        hourlyRate: bioInfo.hourlyRate,
        projectRate: bioInfo.projectRate,
        portfolio: bioInfo.portfolio,
        introVideo: bioInfo.introVideo,
        introVideoName: bioInfo.introVideoName,
        portfolioProjects: bioInfo.portfolioProjects,
      });
    }
  };

  const finish = () => {
    const persisted = updateProfile({
      fullName: basicInfo.fullName,
      title: basicInfo.headline,
      avatar: basicInfo.profilePictureUrl,
      primaryCategory: skillsInfo.primaryCategory,
      skills: skillsInfo.skills,
      bio: bioInfo.bio,
      hourlyRate: bioInfo.hourlyRate,
      projectRate: bioInfo.projectRate,
      portfolio: bioInfo.portfolio,
      introVideo: bioInfo.introVideo,
      introVideoName: bioInfo.introVideoName,
      portfolioProjects: bioInfo.portfolioProjects,
      profilePublic: true,
    });
    persistStep(accountId, 0);
    toast(persisted ? t("profile.saved") : t("video.quota"));
    closeProfile();
  };

if (!user) return null;

const active = STEPS[step];
const progress = Math.round(((step + 1) / STEPS.length) * 100);
const fallbackInitials = initials(profile.fullName || user.name);

  /* ------------------------------ step 1 ------------------------------ */
  function renderBasic() {
    return (
      <>
        <WizardCard>
          <div className="wiz-card-head">
            <h3>{t("profile.photo")}</h3>
            <p>{t("profile.photoSub")}</p>
          </div>
          <div className="avatar-upload">
            <div className="avatar-preview">
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar} alt="" />
              ) : (
                fallbackInitials
              )}
            </div>
            <div className="avatar-actions">
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => avatarRef.current?.click()}
              >
                {profile.avatar ? t("profile.photoChange") : t("profile.photoUpload")}
              </button>
              {profile.avatar && (
                <button
                  type="button"
                  className="btn-ghost btn-sm danger"
                  onClick={() => {
                    setBasicInfo((prev) => ({ ...prev, profilePictureUrl: "" }));
                    updateProfile({ avatar: "" });
                  }}
                >
                  {t("profile.remove")}
                </button>
              )}
            </div>
            {errorFor("avatar") ? <p className="wiz-inline-error">{errorFor("avatar")}</p> : null}
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onAvatar(file);
                event.target.value = "";
              }}
            />
          </div>
        </WizardCard>

        <BasicInformationStep
          values={basicInfo}
          errors={{
            fullName: errorFor("fullName"),
            headline: errorFor("title"),
          }}
          onChange={updateBasicInfo}
        />

        <WizardCard>
          <div className="wiz-card-head">
            <h3>{t("profile.contact")}</h3>
            <p>{t("profile.contactSub")}</p>
          </div>
          <div className="field-grid">
            <Field label={t("profile.country")}>
              <input
                type="text"
                value={profile.country}
                placeholder={t("profile.countryPlaceholder")}
                onChange={(event) => updateProfile({ country: event.target.value })}
              />
            </Field>
            <Field label={t("profile.languages")}>
              <input
                type="text"
                value={profile.languages}
                placeholder={t("profile.languagesPlaceholder")}
                onChange={(event) => updateProfile({ languages: event.target.value })}
              />
            </Field>
            <Field label={t("profile.phone")} required error={errorFor("phone")}>
              <input
                type="tel"
                autoComplete="tel"
                value={profile.phone}
                placeholder={t("profile.phonePlaceholder")}
                onChange={(event) => updateProfile({ phone: event.target.value })}
              />
            </Field>
          </div>
        </WizardCard>
      </>
    );
  }

  /* ------------------------------ step 2 ------------------------------ */
  function renderSkills() {
    return (
      <>
        <SkillsStep
          values={skillsInfo}
          errors={{ primaryCategory: errorFor("primaryCategory") }}
          onChange={updateSkillsInfo}
        />

        <WizardCard>
          <div className="wiz-card-head">
            <h3>{t("profile.work")}</h3>
            <p>{t("profile.workSub")}</p>
          </div>
          <div className="field-grid">
            <Field label={t("profile.availability")}>
              <select
                value={profile.availability}
                onChange={(event) => updateProfile({ availability: event.target.value })}
              >
                <option value="">&mdash;</option>
                {AVAILABILITY.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.key)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </WizardCard>
      </>
    );
  }

  /* ------------------------------ step 3 ------------------------------ */
  function renderBio() {
    return (
      <BioPortfolioStep
        values={bioInfo}
        errors={{ bio: errorFor("bio") }}
        onChange={updateBioInfo}
      />
    );
  }

  /* ------------------------------ step 4 ------------------------------ */
  function renderReview() {
    return (
      <>
        {missingRequired.length > 0 && (
          <p className="wiz-review-note">{t("wizard.reviewIncomplete")}</p>
        )}
        <ReviewStep
          profile={profile}
          strength={strength}
          onEdit={(section) => {
            if (section === "basic") gotoStep(BASIC_STEP);
            if (section === "skills") gotoStep(SKILLS_STEP);
            if (section === "bio") gotoStep(BIO_STEP);
          }}
          onPublish={finish}
        />
      </>
    );
  }

  const panels: Record<StepDef["id"], () => ReactNode> = {
    basic: renderBasic,
    skills: renderSkills,
    bio: renderBio,
    review: renderReview,
  };

  return (
    <div
      className="modal-overlay profile-overlay open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profileTitle"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeProfile();
      }}
    >
      <div className="profile-modal wiz-modal">
        <div className="wiz-head">
          <div className="wiz-head-copy">
            <span className="wiz-kicker">
              {t("wizard.kicker")} ·{" "}
              {t("wizard.stepOf", { current: step + 1, total: STEPS.length })}
            </span>
            <h2 id="profileTitle">{t(active.titleKey)}</h2>
            <p>{t(active.subKey)}</p>
          </div>
          <button className="modal-close" type="button" aria-label={t("common.close")} onClick={closeProfile}>
            &times;
          </button>
        </div>

        <div
          className="wiz-progress"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
          aria-valuetext={t("wizard.stepOf", { current: step + 1, total: STEPS.length })}
          aria-label={t("profile.strength")}
        >
          <span className="wiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <nav className="wiz-steps" aria-label={t("wizard.kicker")}>
          {STEPS.map((item, index) => {
            const state =
              index === step ? "active" : revealed.includes(index) ? "done" : "todo";
            return (
              <button
                key={item.id}
                type="button"
                className={"wiz-step " + state}
                aria-current={index === step ? "step" : undefined}
                onClick={() => {
                  commitStep(step);
                  gotoStep(index);
                }}
              >
                <span className="wiz-step-index">
                  {state === "done" ? <CheckMark /> : index + 1}
                </span>
                <span className="wiz-step-label">{t(item.titleKey)}</span>
              </button>
            );
          })}
        </nav>

        <div className="wiz-body" key={active.id}>
          {panels[active.id]()}
        </div>

        <div className="wiz-foot">
          <span className="wiz-foot-note">{t("wizard.autosaved")}</span>
          <div className="wiz-foot-actions">
            {step > 0 && (
              <button type="button" className="btn-ghost" onClick={() => { commitStep(step); gotoStep(step - 1); }}>
                {t("wizard.back")}
              </button>
            )}
            {step < LAST_STEP ? (
              <button type="button" className="btn-publish" onClick={() => { commitStep(step); gotoStep(step + 1); }}>
                {t("wizard.next")}
              </button>
            ) : (
              <button type="button" className="btn-publish" onClick={finish}>
                {t("wizard.publish")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileBuilder() {
  const { isProfileOpen } = useUI();
  const { user } = useAuth();
  if (!isProfileOpen || !user) return null;
  return <ProfileWizard />;
}