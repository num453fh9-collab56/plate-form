"use client";

import type { CSSProperties, DragEvent as ReactDragEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useMemo, useState } from "react";
import { CATEGORY_LABEL_KEYS } from "@/lib/gigs";
import { CATEGORIES, searchSkills, skillsForCategory } from "@/lib/taxonomy";
import { useI18n } from "@/lib/i18n";
import {
  EXPERIENCE_OPTIONS,
  MAX_SKILLS,
  MIN_SKILLS,
  SKILL_LEVELS,
  TOP_SKILLS,
  levelFor,
} from "@/lib/skills-meta";
import type { SkillLevel } from "@/lib/types";

/* ==========================================================================
   HIRELYX · SKILLS STEP
   1. Category cards — the eight allowed categories as visual, tappable cards.
   2. Experience — total years, as one-tap buckets.
   3. Skill picker — search + category-popular chips, a 15-skill cap, a
      proficiency level per skill, and drag (or arrow-button) ordering where
      the first three become the highlighted "top skills".
   ========================================================================== */

export interface SkillsValues {
  primaryCategory: string;
  skills: string[];
  skillLevels: Record<string, SkillLevel>;
  experienceYears: string;
}

const POPULAR_VISIBLE = 12;

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}

function Chevron({ up }: { up?: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={up ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
    </svg>
  );
}

export default function SkillsStep({
  values,
  errors,
  onChange,
}: {
  values: SkillsValues;
  errors?: { primaryCategory?: string; skills?: string };
  onChange: (patch: Partial<SkillsValues>) => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [showAllPopular, setShowAllPopular] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const { skills, skillLevels, primaryCategory } = values;
  const full = skills.length >= MAX_SKILLS;
  const has = (label: string) => skills.some((item) => item.toLowerCase() === label.toLowerCase());

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const taken = new Set(skills.map((item) => item.toLowerCase()));
    return searchSkills(query)
      .flatMap((group) => group.skills.map((skill) => skill.label))
      .filter((label, index, all) => all.indexOf(label) === index && !taken.has(label.toLowerCase()))
      .slice(0, 8);
  }, [query, skills]);

  const popular = useMemo(() => {
    const taken = new Set(skills.map((item) => item.toLowerCase()));
    return skillsForCategory(primaryCategory).filter((label) => !taken.has(label.toLowerCase()));
  }, [primaryCategory, skills]);

  const addSkill = (raw: string) => {
    const label = raw.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!label || full) return;
    if (has(label)) {
      setQuery("");
      return;
    }
    onChange({ skills: [...skills, label] });
    setQuery("");
  };

  const removeSkill = (label: string) => {
    const nextLevels = { ...skillLevels };
    delete nextLevels[label];
    onChange({ skills: skills.filter((item) => item !== label), skillLevels: nextLevels });
  };

  const setLevel = (label: string, level: SkillLevel) => {
    onChange({ skillLevels: { ...skillLevels, [label]: level } });
  };

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= skills.length) return;
    const next = [...skills];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange({ skills: next });
  };

  const onDragStart = (index: number) => (event: ReactDragEvent<HTMLLIElement>) => {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const onDrop = (index: number) => (event: ReactDragEvent<HTMLLIElement>) => {
    event.preventDefault();
    if (dragIndex !== null) move(dragIndex, index);
    setDragIndex(null);
    setOverIndex(null);
  };

  const onSearchKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addSkill(matches[0] && matches[0].toLowerCase().startsWith(query.trim().toLowerCase()) ? matches[0] : query);
    } else if (event.key === "Escape" && query) {
      event.stopPropagation();
      setQuery("");
    }
  };

  const visiblePopular = showAllPopular ? popular : popular.slice(0, POPULAR_VISIBLE);
  const categoryName = primaryCategory && CATEGORY_LABEL_KEYS[primaryCategory]
    ? t(CATEGORY_LABEL_KEYS[primaryCategory])
    : "";

  return (
    <section className="skills-step" aria-labelledby="skills-step-title">
      {/* ------------------------------ category ------------------------------ */}
      <div className="basic-info-card">
        <div className="basic-info-head">
          <span className="basic-info-count">{t("skills.stepBadge")}</span>
          <h3 id="skills-step-title">{t("profile.primaryCategory")}</h3>
          <p>{t("skills.categorySub")}</p>
        </div>

        <div className="sk-cats" role="radiogroup" aria-label={t("profile.primaryCategory")} id="field-primaryCategory" tabIndex={-1}>
          {CATEGORIES.map((category) => {
            const selected = category.label === primaryCategory;
            return (
              <button
                key={category.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={"sk-cat" + (selected ? " selected" : "")}
                style={{ "--cat-a": category.colors[0], "--cat-b": category.colors[1] } as CSSProperties}
                onClick={() => onChange({ primaryCategory: category.label })}
              >
                <span className="sk-cat-glyph" aria-hidden="true">
                  {category.glyph}
                </span>
                <span className="sk-cat-text">
                  <strong>{t(category.translationKey)}</strong>
                  <span>{category.tagline}</span>
                </span>
                <span className="sk-cat-check" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              </button>
            );
          })}
        </div>
        {errors?.primaryCategory ? <p className="wiz-inline-error">{errors.primaryCategory}</p> : null}
      </div>

      {/* ------------------------------ experience ------------------------------ */}
      <div className="basic-info-card">
        <div className="basic-info-head">
          <h3>{t("skills.experience")}</h3>
          <p>{t("skills.experienceSub")}</p>
        </div>
        <div className="sk-seg" role="radiogroup" aria-label={t("skills.experience")} id="field-experienceYears" tabIndex={-1}>
          {EXPERIENCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={values.experienceYears === option.value}
              className={values.experienceYears === option.value ? "active" : ""}
              onClick={() =>
                onChange({ experienceYears: values.experienceYears === option.value ? "" : option.value })
              }
            >
              {t(option.key)}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------ skills ------------------------------ */}
      <div className="basic-info-card">
        <div className="basic-info-head sk-skills-head">
          <div>
            <h3>{t("profile.skills")}</h3>
            <p>{t("skills.skillsSub", { min: MIN_SKILLS, top: TOP_SKILLS })}</p>
          </div>
          <span className={"sk-counter" + (skills.length >= MIN_SKILLS ? " ok" : "") + (full ? " full" : "")}>
            {skills.length}/{MAX_SKILLS}
          </span>
        </div>

        <div className="sk-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="field-skills"
            type="text"
            value={query}
            disabled={full}
            placeholder={full ? t("skills.limitReached", { max: MAX_SKILLS }) : t("profile.skillsPlaceholder")}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onSearchKey}
          />
          {query.trim() ? (
            <div className="sk-search-pop">
              {matches.map((label) => (
                <button key={label} type="button" onClick={() => addSkill(label)}>
                  {label}
                </button>
              ))}
              {!has(query) && !matches.some((label) => label.toLowerCase() === query.trim().toLowerCase()) ? (
                <button type="button" className="custom" onClick={() => addSkill(query)}>
                  {t("skills.addCustom", { skill: query.trim() })}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {skills.length > 0 ? (
          <ol className="sk-list">
            {skills.map((label, index) => {
              const level = levelFor(skillLevels, label);
              const top = index < TOP_SKILLS;
              return (
                <li
                  key={label}
                  className={
                    "sk-item" +
                    (top ? " top" : "") +
                    (dragIndex === index ? " dragging" : "") +
                    (overIndex === index && dragIndex !== index ? " over" : "")
                  }
                  draggable
                  onDragStart={onDragStart(index)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setOverIndex(index);
                  }}
                  onDragLeave={() => setOverIndex((current) => (current === index ? null : current))}
                  onDrop={onDrop(index)}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                >
                  <span className="sk-grip" title={t("skills.dragHint")}>
                    <GripIcon />
                  </span>
                  <span className="sk-rank">{index + 1}</span>
                  <span className="sk-name">
                    {label}
                    {top ? <em>{t("skills.topBadge")}</em> : null}
                  </span>
                  <span className="sk-levels" role="radiogroup" aria-label={t("skills.levelFor", { skill: label })}>
                    {SKILL_LEVELS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={level === option.value}
                        className={"lvl-" + option.value.toLowerCase() + (level === option.value ? " active" : "")}
                        onClick={() => setLevel(label, option.value)}
                      >
                        {t(option.key)}
                      </button>
                    ))}
                  </span>
                  <span className="sk-actions">
                    <button
                      type="button"
                      aria-label={t("skills.moveUp", { skill: label })}
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    >
                      <Chevron up />
                    </button>
                    <button
                      type="button"
                      aria-label={t("skills.moveDown", { skill: label })}
                      disabled={index === skills.length - 1}
                      onClick={() => move(index, index + 1)}
                    >
                      <Chevron />
                    </button>
                    <button
                      type="button"
                      className="sk-remove"
                      aria-label={t("skills.remove", { skill: label })}
                      onClick={() => removeSkill(label)}
                    >
                      &times;
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="sk-empty">{t("skills.empty")}</p>
        )}
        {errors?.skills ? <p className="wiz-inline-error">{errors.skills}</p> : null}

        {primaryCategory && popular.length > 0 ? (
          <div className="sk-popular">
            <span className="sk-popular-label">{t("skills.popularIn", { category: categoryName })}</span>
            <div className="sk-popular-list">
              {visiblePopular.map((label) => (
                <button key={label} type="button" disabled={full} onClick={() => addSkill(label)}>
                  + {label}
                </button>
              ))}
              {popular.length > POPULAR_VISIBLE ? (
                <button type="button" className="more" onClick={() => setShowAllPopular((current) => !current)}>
                  {showAllPopular ? t("skills.showLess") : t("skills.showMore", { count: popular.length - POPULAR_VISIBLE })}
                </button>
              ) : null}
            </div>
          </div>
        ) : !primaryCategory ? (
          <p className="sk-hint">{t("skills.pickCategoryFirst")}</p>
        ) : null}
      </div>
    </section>
  );
}
