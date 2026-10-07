"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useUI } from "@/lib/ui";
import {
  PORTFOLIO_CATEGORIES,
  deletePortfolioProject,
  portfolioGlyph,
  projectCoverStyle,
  savePortfolioProject,
} from "@/lib/portfolio";
import type { PortfolioProject } from "@/lib/types";
import IntroVideo from "./IntroVideo";

export interface BioPortfolioValues {
  bio: string;
  hourlyRate: string;
  projectRate: string;
  portfolio: string;
  introVideo: string;
  introVideoName: string;
  portfolioProjects: PortfolioProject[];
}

const EMPTY_PROJECT: PortfolioProject = {
  id: "",
  title: "",
  category: PORTFOLIO_CATEGORIES[0],
  summary: "",
  tags: [],
  link: "",
  image: "",
  cover: "",
  video: "",
  videoName: "",
};

function uid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `pf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export default function BioPortfolioStep({
  values,
  errors,
  onChange,
}: {
  values: BioPortfolioValues;
  errors?: { bio?: string };
  onChange: (patch: Partial<BioPortfolioValues>) => void;
}) {
  const { t } = useI18n();
  const { toast } = useUI();
  const { account } = useAuth();
  const [draft, setDraft] = useState<PortfolioProject>(EMPTY_PROJECT);
  const [tagText, setTagText] = useState("");

  const addProject = () => {
    const title = draft.title.trim();
    if (title.length < 3) {
      toast(t("account.projectTitleShort"));
      return;
    }
    const tags = tagText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 8);
    const project: PortfolioProject = {
      ...draft,
      id: uid(),
      title,
      tags,
      summary: draft.summary.trim(),
      link: draft.link.trim(),
      image: draft.image.trim(),
      cover: draft.cover.trim(),
      updatedAt: Date.now(),
    };
    onChange({ portfolioProjects: [project, ...values.portfolioProjects] });
    if (account?.id) void savePortfolioProject(account.id, project);
    setDraft(EMPTY_PROJECT);
    setTagText("");
    toast(t("account.projectAdded"));
  };

  const removeProject = (id: string) => {
    onChange({
      portfolioProjects: values.portfolioProjects.filter((item) => item.id !== id),
    });
    void deletePortfolioProject(id);
    toast(t("account.projectRemoved"));
  };

  return (
    <section className="bio-portfolio-step" aria-labelledby="bio-portfolio-title">
      <div className="basic-info-card">
        <div className="basic-info-head">
          <span className="basic-info-count">Step 3 of 4</span>
          <h3 id="bio-portfolio-title">{t("wizard.step3Title")}</h3>
          <p>{t("wizard.step3Sub")}</p>
        </div>

        <div className="basic-info-grid">
          <label className="basic-info-field basic-info-field-wide">
            <span>
              {t("profile.bio")}
              <b aria-hidden="true"> *</b>
            </span>
            <textarea
              rows={5}
              value={values.bio}
              placeholder={t("profile.bioPlaceholder")}
              onChange={(event) => onChange({ bio: event.target.value })}
            />
            <small className="char-count">{values.bio.trim().length} / 40+</small>
            {errors?.bio ? <em>{errors.bio}</em> : null}
          </label>

          <label className="basic-info-field">
            <span>{t("profile.rate")}</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={values.hourlyRate}
              placeholder={t("profile.ratePlaceholder")}
              onChange={(event) => onChange({ hourlyRate: event.target.value })}
            />
          </label>

          <label className="basic-info-field">
            <span>{t("profile.projectRate")}</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={values.projectRate}
              placeholder={t("profile.projectRatePlaceholder")}
              onChange={(event) => onChange({ projectRate: event.target.value })}
            />
          </label>

          <label className="basic-info-field basic-info-field-wide">
            <span>{t("profile.portfolio")}</span>
            <input
              type="url"
              value={values.portfolio}
              placeholder={t("profile.portfolioPlaceholder")}
              onChange={(event) => onChange({ portfolio: event.target.value })}
            />
          </label>
        </div>

        <div className="bio-portfolio-video">
          <h4>{t("profile.video")}</h4>
          <p>{t("profile.videoSub")}</p>
          <IntroVideo
            src={values.introVideo}
            name={values.introVideoName}
            onChange={(src, name) => onChange({ introVideo: src, introVideoName: name })}
          />
        </div>

        <div className="bio-portfolio-projects">
          <h4>{t("account.portfolioTitle")}</h4>
          <p>{t("account.portfolioSub")}</p>

          <div className="basic-info-grid">
            <label className="basic-info-field">
              <span>{t("account.projectTitle")}</span>
              <input
                type="text"
                value={draft.title}
                placeholder={t("account.projectTitlePlaceholder")}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              />
            </label>
            <label className="basic-info-field">
              <span>{t("account.projectCategory")}</span>
              <select
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              >
                {PORTFOLIO_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="basic-info-field">
              <span>{t("account.projectTags")}</span>
              <input
                type="text"
                value={tagText}
                placeholder="React, Next.js, TypeScript"
                onChange={(event) => setTagText(event.target.value)}
              />
            </label>
            <label className="basic-info-field">
              <span>{t("account.projectLink")}</span>
              <input
                type="url"
                value={draft.link}
                placeholder="https://your-project.com"
                onChange={(event) => setDraft({ ...draft, link: event.target.value })}
              />
            </label>
            <label className="basic-info-field">
              <span>{t("account.projectCover")}</span>
              <input
                type="url"
                value={draft.image}
                placeholder="https://…/cover.jpg"
                onChange={(event) => setDraft({ ...draft, image: event.target.value })}
              />
            </label>
            <label className="basic-info-field">
              <span>{t("profile.projectDescription")}</span>
              <input
                type="text"
                value={draft.summary}
                placeholder={t("profile.projectDescriptionPlaceholder")}
                onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
              />
            </label>
          </div>

          <button className="btn-primary account-inline-btn" type="button" onClick={addProject}>
            + {t("account.addProject")}
          </button>

          {values.portfolioProjects.length === 0 ? (
            <p className="account-empty">{t("account.noProjects")}</p>
          ) : (
            <ul className="project-manage">
              {values.portfolioProjects.map((project) => (
                <li key={project.id}>
                  <span className="project-manage-cover" style={projectCoverStyle(project)}>
                    {portfolioGlyph(project.category)}
                  </span>
                  <div className="project-manage-info">
                    <strong>{project.title}</strong>
                    <span>
                      {project.category}
                      {project.tags.length > 0 ? ` · ${project.tags.join(", ")}` : ""}
                    </span>
                  </div>
                  <button
                    className="btn-ghost btn-sm danger"
                    type="button"
                    onClick={() => removeProject(project.id)}
                  >
                    {t("account.removeProject")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
