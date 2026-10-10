"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { computeProfileStrength, useAuth } from "@/lib/auth";
import { createExternalStore } from "@/lib/external-store";
import type { ExternalStore } from "@/lib/external-store";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { initials } from "@/lib/format";
import { isAllowedCategory } from "@/lib/taxonomy";
import { MIN_SKILLS } from "@/lib/skills-meta";
import { BIO_GOOD, BIO_MIN } from "@/lib/bio";
import { uploadDataUrl } from "@/lib/storage";
import { analyzeResume, composeBio, extractResumeText } from "@/lib/resume";
import type { Profile } from "@/lib/types";
import BasicInformationStep from "./BasicInformationStep";
import type { BasicInformationValues } from "./BasicInformationStep";
import AvatarUploader from "./AvatarUploader";
import ContactFields from "./ContactFields";
import type { ContactValues } from "./ContactFields";
import StepProgress from "./StepProgress";
import AvailabilityCard from "./AvailabilityCard";
import type { AvailabilityValues } from "./AvailabilityCard";
import SkillsStep from "./SkillsStep";
import type { SkillsValues } from "./SkillsStep";
import BioPortfolioStep from "./BioPortfolioStep";
import type { BioPortfolioValues } from "./BioPortfolioStep";
import ReviewStep from "./ReviewStep";
import OnboardingPreview from "./OnboardingPreview";

/* ==========================================================================
   HIRELYX · ELITE ONBOARDING
   Full-page immersive profile setup — not a modal. Clean white canvas,
   blue primary accent, emerald for completion and progress.

     Entry   Upload resume (AI auto-parsing)  vs  Precision manual setup
     Flow    1 · Basic info        identity, photo, contact
             2 · Skills            category, skills, availability
             3 · Bio & portfolio   bio, rates, video, projects
             4 · Review            read-only summary, then publish

   A sticky live preview renders the exact card clients see, fed by a merged
   draft (persisted profile + in-flight step state) so every keystroke is
   reflected in real time. Progress persists per account, so the flow resumes
   where the user left off.
   ========================================================================== */

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

/* ------------------------- resume parsing engine -------------------------
   Real client-side extraction lives in `@/lib/resume` (pdfjs for PDF, mammoth
   for DOCX, plain read for text files). The staged progress copy reflects the
   actual pipeline: upload → text extraction → analysis → draft composition. */

const RESUME_MAX_BYTES = 10 * 1048576;
const PARSE_STAGES = [
  "onboarding.parsing1",
  "onboarding.parsing2",
  "onboarding.parsing3",
  "onboarding.parsing4",
] as const;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/* ------------------------------ primitives ------------------------------ */

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

function SparkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <path d="m12 8 1.2 2.8L16 12l-2.8 1.2L12 16l-1.2-2.8L8 12l2.8-1.2Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
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
  const resumeRef = useRef<HTMLInputElement>(null);
  /* The entry screen only appears for fresh setups — a persisted step means
     the user is resuming, so we drop them straight back into the flow. */
  const [entered, setEntered] = useState(() => step > 0);
  const [parseStage, setParseStage] = useState<number>(-1);
  const [basicInfo, setBasicInfo] = useState<BasicInformationValues>(() => ({
    fullName: profile.fullName,
    headline: profile.title,
    profilePictureUrl: profile.avatar,
  }));
  const [skillsInfo, setSkillsInfo] = useState<SkillsValues>(() => ({
    primaryCategory: profile.primaryCategory,
    skills: profile.skills,
    skillLevels: profile.skillLevels,
    experienceYears: profile.experienceYears,
  }));
  const [bioInfo, setBioInfo] = useState<BioPortfolioValues>(() => ({
    bio: profile.bio,
    hourlyRate: profile.hourlyRate,
    projectRate: profile.projectRate,
    portfolio: profile.portfolio,
    socialLinks: profile.socialLinks,
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

  /** The live draft — persisted profile merged with in-flight step state, so
   *  the preview and validation react to every keystroke, not just commits. */
  const draft = useMemo<Profile>(
    () => ({
      ...profile,
      fullName: basicInfo.fullName,
      title: basicInfo.headline,
      avatar: basicInfo.profilePictureUrl,
      primaryCategory: skillsInfo.primaryCategory,
      skills: skillsInfo.skills,
      skillLevels: skillsInfo.skillLevels,
      experienceYears: skillsInfo.experienceYears,
      bio: bioInfo.bio,
      hourlyRate: bioInfo.hourlyRate,
      projectRate: bioInfo.projectRate,
      portfolio: bioInfo.portfolio,
      socialLinks: bioInfo.socialLinks,
      introVideo: bioInfo.introVideo,
      introVideoName: bioInfo.introVideoName,
      portfolioProjects: bioInfo.portfolioProjects,
    }),
    [profile, basicInfo, skillsInfo, bioInfo],
  );

  const errorFor = useCallback(
    (key: keyof Profile): string => {
      const requirement = requirementFor(key);
      if (!revealed.includes(requirement.step)) return "";
      return requirement.valid(draft) ? "" : t("profile.fieldRequired");
    },
    [revealed, draft, t],
  );

  const missingRequired = useMemo(
    () => REQUIREMENTS.filter((item) => !item.valid(draft)),
    [draft],
  );

  /** Receives the already-cropped 400×400 JPEG from the uploader, shows it
   *  immediately, then swaps in the storage URL once the upload lands. */
  const onAvatar = async (dataUrl: string) => {
    setBasicInfo((prev) => ({ ...prev, profilePictureUrl: dataUrl }));
    updateProfile({ avatar: dataUrl });
    if (!accountId) return;
    try {
      const url = await uploadDataUrl("avatars", accountId, dataUrl, "avatar");
      if (url) {
        setBasicInfo((prev) => ({ ...prev, profilePictureUrl: url }));
        updateProfile({ avatar: url });
      }
    } catch {
      toast(t("avatar.uploadFailed"));
    }
  };

  const updateContact = (patch: Partial<ContactValues>) => {
    updateProfile(patch);
  };

  const updateAvailability = (patch: Partial<AvailabilityValues>) => {
    updateProfile(patch);
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
        skillLevels: skillsInfo.skillLevels,
        experienceYears: skillsInfo.experienceYears,
      });
    }
    if (stepIndex === BIO_STEP) {
      updateProfile({
        bio: bioInfo.bio,
        hourlyRate: bioInfo.hourlyRate,
        projectRate: bioInfo.projectRate,
        portfolio: bioInfo.portfolio,
      socialLinks: bioInfo.socialLinks,
        introVideo: bioInfo.introVideo,
        introVideoName: bioInfo.introVideoName,
        portfolioProjects: bioInfo.portfolioProjects,
      });
    }
  };

  /** Advance is gated: the current step's required fields must validate
   *  against the live draft, otherwise errors surface inline and we stay. */
  const goNext = () => {
    setRevealed((prev) => (prev.includes(step) ? prev : [...prev, step]));
    const blockers = REQUIREMENTS.filter(
      (item) => item.step === step && !item.valid(draft),
    );
    if (blockers.length > 0) return;
    commitStep(step);
    gotoStep(step + 1);
  };

  const goBack = () => {
    commitStep(step);
    gotoStep(step - 1);
  };

  const finish = () => {
    const persisted = updateProfile({
      fullName: basicInfo.fullName,
      title: basicInfo.headline,
      avatar: basicInfo.profilePictureUrl,
      primaryCategory: skillsInfo.primaryCategory,
      skills: skillsInfo.skills,
      skillLevels: skillsInfo.skillLevels,
      experienceYears: skillsInfo.experienceYears,
      bio: bioInfo.bio,
      hourlyRate: bioInfo.hourlyRate,
      projectRate: bioInfo.projectRate,
      portfolio: bioInfo.portfolio,
      socialLinks: bioInfo.socialLinks,
      introVideo: bioInfo.introVideo,
      introVideoName: bioInfo.introVideoName,
      portfolioProjects: bioInfo.portfolioProjects,
      profilePublic: true,
    });
    persistStep(accountId, 0);
    toast(persisted ? t("profile.saved") : t("video.quota"));
    closeProfile();
  };

  /* ---------------------------- resume parsing ---------------------------- */

  const onResume = async (file: File) => {
    if (file.size > RESUME_MAX_BYTES) {
      toast(t("video.tooLarge", { max: 10 }));
      return;
    }
    setParseStage(0);

    /* Stage 1 → real text extraction (PDF / DOCX / TXT) */
    let text = "";
    try {
      text = await extractResumeText(file);
    } catch {
      text = "";
    }

    /* Stages 2-3 → analysis; stage timing keeps the UI honest and readable */
    setParseStage(1);
    const analysis = analyzeResume(text);
    await delay(700);
    setParseStage(2);
    await delay(700);
    setParseStage(3);
    await delay(500);

    const fullName = profile.fullName.trim() || analysis.fullName || user?.name || "";
    const category = analysis.category;
    const headline = profile.title.trim() || analysis.headline;
    const skills = analysis.skills;
    const phone = profile.phone.trim() || analysis.phone;
    const bio =
      profile.bio.trim().length >= 40
        ? profile.bio
        : composeBio({
            fullName,
            headline,
            skills,
            years: analysis.years,
          });

    setBasicInfo((prev) => ({ ...prev, fullName, headline }));
    setSkillsInfo((prev) => ({ ...prev, primaryCategory: category, skills }));
    setBioInfo((prev) => ({ ...prev, bio }));
    updateProfile({ fullName, title: headline, primaryCategory: category, skills, bio, phone });

    setParseStage(-1);
    setEntered(true);
    gotoStep(BASIC_STEP);
    toast(t("onboarding.parsed"));
  };

  if (!user) return null;

  const active = STEPS[step];
  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const fallbackInitials = initials(profile.fullName || user.name);
  const parsing = parseStage >= 0;

  /* ------------------------------ step 1 ------------------------------ */
  function renderBasic() {
    const basicItems = [
      { key: "avatar", label: t("progress.photo"), done: draft.avatar.trim().length > 0, required: true, targetId: "field-avatar" },
      { key: "fullName", label: t("progress.name"), done: draft.fullName.trim().length >= 2, required: true, targetId: "field-fullName" },
      { key: "title", label: t("progress.headline"), done: draft.title.trim().length >= 3, required: true, targetId: "field-title" },
      { key: "phone", label: t("progress.phone"), done: draft.phone.replace(/D/g, "").length >= 7, required: true, targetId: "field-phone" },
      { key: "country", label: t("progress.country"), done: draft.country.trim().length >= 2, targetId: "field-country" },
      { key: "languages", label: t("progress.languages"), done: draft.languages.trim().length >= 2, targetId: "field-languages" },
    ];
    return (
      <>
        <StepProgress
          title={t("progress.basicTitle")}
          items={basicItems}
          overallPercent={computeProfileStrength(draft).percent}
        />

        <WizardCard>
          <div className="wiz-card-head">
            <h3>{t("profile.photo")}</h3>
            <p>{t("profile.photoSub")}</p>
          </div>
          <AvatarUploader
            value={draft.avatar}
            fallback={fallbackInitials}
            error={errorFor("avatar")}
            onSave={onAvatar}
            onRemove={() => {
              setBasicInfo((prev) => ({ ...prev, profilePictureUrl: "" }));
              updateProfile({ avatar: "" });
            }}
          />
        </WizardCard>

        <BasicInformationStep
          values={basicInfo}
          category={skillsInfo.primaryCategory}
          errors={{
            fullName: errorFor("fullName"),
            headline: errorFor("title"),
          }}
          onChange={updateBasicInfo}
        />

        <ContactFields
          values={{ country: profile.country, languages: profile.languages, phone: profile.phone }}
          phoneError={errorFor("phone")}
          onChange={updateContact}
        />
      </>
    );
  }

  /* ------------------------------ step 2 ------------------------------ */
  function renderSkills() {
    const skillItems = [
      { key: "primaryCategory", label: t("progress.category"), done: isAllowedCategory(draft.primaryCategory), required: true, targetId: "field-primaryCategory" },
      { key: "experienceYears", label: t("progress.experience"), done: draft.experienceYears !== "", targetId: "field-experienceYears" },
      { key: "skills", label: t("progress.skills", { min: MIN_SKILLS }), done: draft.skills.length >= MIN_SKILLS, targetId: "field-skills" },
      { key: "availability", label: t("progress.availability"), done: draft.availability.trim().length > 0, targetId: "field-availability" },
      { key: "weeklyHours", label: t("progress.hours"), done: draft.weeklyHours !== "" || draft.availability === "Not available right now", targetId: "field-weeklyHours" },
      { key: "responseTime", label: t("progress.response"), done: draft.responseTime !== "" || draft.availability === "Not available right now", targetId: "field-responseTime" },
    ];
    return (
      <>
        <StepProgress
          title={t("progress.skillsTitle")}
          items={skillItems}
          overallPercent={computeProfileStrength(draft).percent}
        />

        <SkillsStep
          values={skillsInfo}
          errors={{ primaryCategory: errorFor("primaryCategory") }}
          onChange={updateSkillsInfo}
        />

        <AvailabilityCard
          values={{
            availability: profile.availability,
            weeklyHours: profile.weeklyHours,
            responseTime: profile.responseTime,
          }}
          onChange={updateAvailability}
        />
      </>
    );
  }

  /* ------------------------------ step 3 ------------------------------ */
  function renderBio() {
    const linkCount =
      (draft.portfolio.trim() ? 1 : 0) +
      Object.values(draft.socialLinks).filter((value) => value.trim()).length;
    const bioItems = [
      { key: "bio", label: t("progress.bio", { min: BIO_MIN }), done: draft.bio.trim().length >= BIO_MIN, required: true, targetId: "field-bio" },
      { key: "bioGood", label: t("progress.bioGood"), done: draft.bio.trim().length >= BIO_GOOD, targetId: "field-bio" },
      { key: "hourlyRate", label: t("progress.rate"), done: Number(draft.hourlyRate) > 0, targetId: "field-hourlyRate" },
      { key: "introVideo", label: t("progress.video"), done: draft.introVideo.trim().length > 0, targetId: "field-introVideo" },
      { key: "projects", label: t("progress.project"), done: draft.portfolioProjects.length > 0, targetId: "field-projects" },
      { key: "links", label: t("progress.links"), done: linkCount > 0, targetId: "field-links" },
    ];
    return (
      <>
        <StepProgress
          title={t("progress.bioTitle")}
          items={bioItems}
          overallPercent={computeProfileStrength(draft).percent}
        />
        <BioPortfolioStep
          values={bioInfo}
          errors={{ bio: errorFor("bio") }}
          context={{
            fullName: draft.fullName,
            headline: draft.title,
            skills: draft.skills,
            experienceYears: draft.experienceYears,
            category: draft.primaryCategory,
            weeklyHours: draft.weeklyHours,
          }}
          onChange={updateBioInfo}
        />
      </>
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
          profile={draft}
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

  /* ----------------------------- entry screen ----------------------------- */
  function renderEntry() {
    return (
      <div className="ob-entry">
        <div className="ob-entry-head">
          <span className="ob-kicker">
            <span className="ob-kicker-dot" aria-hidden="true" />
            {t("onboarding.kicker")}
          </span>
          <h1>{t("onboarding.entryTitle")}</h1>
          <p>{t("onboarding.entrySub")}</p>
        </div>

        <div className="ob-choices">
          <div className={"ob-choice ob-choice-ai" + (parsing ? " parsing" : "")}>
            <span className="ob-choice-badge">{t("onboarding.aiBadge")}</span>
            <span className="ob-choice-icon" aria-hidden="true">
              <SparkIcon />
            </span>
            <h2>{t("onboarding.aiTitle")}</h2>
            <p>{t("onboarding.aiSub")}</p>
            <ul>
              <li>{t("onboarding.aiPoint1")}</li>
              <li>{t("onboarding.aiPoint2")}</li>
              <li>{t("onboarding.aiPoint3")}</li>
            </ul>
            {parsing ? (
              <div className="ob-parse" role="status" aria-live="polite">
                <span className="ob-parse-bar">
                  <span
                    className="ob-parse-fill"
                    style={{ width: `${((parseStage + 1) / PARSE_STAGES.length) * 100}%` }}
                  />
                </span>
                <span className="ob-parse-label">
                  <span className="ob-parse-spinner" aria-hidden="true" />
                  {t(PARSE_STAGES[parseStage])}
                </span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="ob-btn-primary ob-choice-cta"
                  onClick={() => resumeRef.current?.click()}
                >
                  {t("onboarding.aiCta")}
                </button>
                <span className="ob-choice-hint">{t("onboarding.aiHint")}</span>
              </>
            )}
            <input
              ref={resumeRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md,.rtf"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onResume(file);
                event.target.value = "";
              }}
            />
          </div>

          <div className="ob-choice">
            <span className="ob-choice-badge ob-choice-badge-alt">{t("onboarding.manualBadge")}</span>
            <span className="ob-choice-icon" aria-hidden="true">
              <PenIcon />
            </span>
            <h2>{t("onboarding.manualTitle")}</h2>
            <p>{t("onboarding.manualSub")}</p>
            <ul>
              <li>{t("onboarding.manualPoint1")}</li>
              <li>{t("onboarding.manualPoint2")}</li>
              <li>{t("onboarding.manualPoint3")}</li>
            </ul>
            <button
              type="button"
              className="ob-btn-ghost ob-choice-cta"
              onClick={() => setEntered(true)}
              disabled={parsing}
            >
              {t("onboarding.manualCta")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ the shell ------------------------------ */
  return (
    <div className="ob-shell" role="dialog" aria-modal="true" aria-labelledby="profileTitle">
      <div className="ob-aurora" aria-hidden="true" />

      <header className="ob-topbar">
        <span className="ob-brand">
          <svg className="ob-brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <circle cx="20" cy="20" r="18.4" stroke="currentColor" strokeWidth="1.2" />
            <path d="M13 10H17.5V18H22.5V10H27V30H22.5V22H17.5V30H13Z" fill="currentColor" />
          </svg>
          <b>
            Hire<span>lyx</span>
          </b>
          <span className="ob-brand-tag">{t("onboarding.kicker")}</span>
        </span>
        <div className="ob-topbar-actions">
          {entered && (
            <button type="button" className="ob-btn-ghost btn-sm" onClick={() => setEntered(false)}>
              {t("onboarding.backToStart")}
            </button>
          )}
          <button type="button" className="ob-exit" onClick={closeProfile}>
            {t("onboarding.exit")}
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </header>

      {entered ? (
        <div className="ob-main">
          <div className="ob-flow">
            <div className="ob-flow-head">
              <span className="ob-kicker">
                {t("wizard.kicker")} · {t("wizard.stepOf", { current: step + 1, total: STEPS.length })}
              </span>
              <h1 id="profileTitle">{t(active.titleKey)}</h1>
              <p>{t(active.subKey)}</p>
            </div>

            <div
              className="ob-progress"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={STEPS.length}
              aria-valuenow={step + 1}
              aria-valuetext={t("wizard.stepOf", { current: step + 1, total: STEPS.length })}
              aria-label={t("onboarding.stepRail")}
            >
              <span className="ob-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <nav className="ob-steps" aria-label={t("wizard.kicker")}>
              {STEPS.map((item, index) => {
                const state =
                  index === step ? "active" : revealed.includes(index) ? "done" : "todo";
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={"ob-step " + state}
                    aria-current={index === step ? "step" : undefined}
                    onClick={() => {
                      commitStep(step);
                      gotoStep(index);
                    }}
                  >
                    <span className="ob-step-index">
                      {state === "done" ? <CheckMark /> : index + 1}
                    </span>
                    <span className="ob-step-label">{t(item.titleKey)}</span>
                  </button>
                );
              })}
            </nav>

            <div className="ob-panel" key={active.id}>
              {panels[active.id]()}
            </div>

            <div className="ob-foot">
              <span className="ob-foot-note">{t("wizard.autosaved")}</span>
              <div className="ob-foot-actions">
                {step > 0 && (
                  <button type="button" className="ob-btn-ghost" onClick={goBack}>
                    {t("wizard.back")}
                  </button>
                )}
                {step < LAST_STEP ? (
                  <button type="button" className="ob-btn-primary" onClick={goNext}>
                    {t("wizard.next")}
                  </button>
                ) : (
                  <button type="button" className="ob-btn-primary" onClick={finish}>
                    {t("wizard.publish")}
                  </button>
                )}
              </div>
            </div>
          </div>

          <OnboardingPreview profile={draft} />
        </div>
      ) : (
        renderEntry()
      )}
    </div>
  );
}

export default function ProfileBuilder() {
  const { isProfileOpen } = useUI();
  const { user } = useAuth();
  if (!isProfileOpen || !user) return null;
  return <ProfileWizard />;
}
