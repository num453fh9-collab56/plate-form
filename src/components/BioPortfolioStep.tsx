"use client";

import { useI18n } from "@/lib/i18n";
import type { PortfolioProject } from "@/lib/types";
import IntroVideo from "./IntroVideo";
import BioWriter from "./BioWriter";
import RatesCard from "./RatesCard";
import PortfolioManager from "./PortfolioManager";
import SocialLinks from "./SocialLinks";

/* ==========================================================================
   HIRELYX · BIO & PORTFOLIO STEP
   Bio writer → rates calculator → intro video → portfolio cards → links.
   Context from earlier steps (name, headline, skills, experience, category,
   weekly hours) feeds the bio templates and the earnings estimate.
   ========================================================================== */

export interface BioPortfolioValues {
  bio: string;
  hourlyRate: string;
  projectRate: string;
  portfolio: string;
  socialLinks: Record<string, string>;
  introVideo: string;
  introVideoName: string;
  portfolioProjects: PortfolioProject[];
}

export interface BioPortfolioContext {
  fullName: string;
  headline: string;
  skills: string[];
  experienceYears: string;
  category: string;
  weeklyHours: string;
}

export default function BioPortfolioStep({
  values,
  errors,
  context,
  onChange,
}: {
  values: BioPortfolioValues;
  errors?: { bio?: string };
  context: BioPortfolioContext;
  onChange: (patch: Partial<BioPortfolioValues>) => void;
}) {
  const { t } = useI18n();

  return (
    <section className="bio-portfolio-step skills-step" aria-labelledby="bio-portfolio-title">
      <div className="basic-info-card">
        <div className="basic-info-head">
          <span className="basic-info-count">{t("bioStep.stepBadge")}</span>
          <h3 id="bio-portfolio-title">{t("wizard.step3Title")}</h3>
          <p>{t("wizard.step3Sub")}</p>
        </div>
        <BioWriter
          value={values.bio}
          error={errors?.bio}
          context={context}
          onChange={(bio) => onChange({ bio })}
        />
      </div>

      <RatesCard
        hourlyRate={values.hourlyRate}
        projectRate={values.projectRate}
        category={context.category}
        weeklyHours={context.weeklyHours}
        onChange={onChange}
      />

      <div className="wiz-card" id="field-introVideo" tabIndex={-1}>
        <div className="wiz-card-head">
          <h3>{t("profile.video")}</h3>
          <p>{t("profile.videoSub")}</p>
        </div>
        <IntroVideo
          src={values.introVideo}
          name={values.introVideoName}
          onChange={(src, name) => onChange({ introVideo: src, introVideoName: name })}
        />
      </div>

      <PortfolioManager
        projects={values.portfolioProjects}
        onChange={(portfolioProjects) => onChange({ portfolioProjects })}
      />

      <SocialLinks website={values.portfolio} links={values.socialLinks} onChange={onChange} />
    </section>
  );
}
