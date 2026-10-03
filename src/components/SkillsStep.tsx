"use client";

import { useMemo, useState } from "react";
import { CATEGORY_LABEL_KEYS, CATEGORY_OPTIONS } from "@/lib/gigs";
import { searchSkills } from "@/lib/taxonomy";
import { useI18n } from "@/lib/i18n";

export interface SkillsValues {
  primaryCategory: string;
  skills: string[];
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
  const [skillInput, setSkillInput] = useState("");

  const suggestions = useMemo(() => {
    const groups = searchSkills(skillInput, values.primaryCategory || undefined);
    return groups
      .flatMap((group) => group.skills.map((skill) => skill.label))
      .filter(
        (skill, index, all) =>
          !values.skills.some((item) => item.toLowerCase() === skill.toLowerCase()) &&
          all.findIndex((item) => item.toLowerCase() === skill.toLowerCase()) === index,
      )
      .slice(0, 8);
  }, [skillInput, values.primaryCategory, values.skills]);

  const addSkill = (raw: string) => {
    const skill = raw.trim().replace(/\s+/g, " ");
    if (!skill) return;
    if (values.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      setSkillInput("");
      return;
    }
    onChange({ skills: [...values.skills, skill] });
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    onChange({ skills: values.skills.filter((item) => item !== skill) });
  };

  return (
    <section className="skills-step" aria-labelledby="skills-step-title">
      <div className="basic-info-card">
        <div className="basic-info-head">
          <span className="basic-info-count">Step 2 of 4</span>
          <h3 id="skills-step-title">{t("wizard.step2Title")}</h3>
          <p>{t("wizard.step2Sub")}</p>
        </div>

        <div className="basic-info-grid">
          <label className="basic-info-field">
            <span>
              {t("profile.primaryCategory")}
              <b aria-hidden="true"> *</b>
            </span>
            <select
              value={values.primaryCategory}
              onChange={(event) => onChange({ primaryCategory: event.target.value })}
            >
              <option value="">{t("profile.primaryCategoryPlaceholder")}</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(CATEGORY_LABEL_KEYS[option])}
                </option>
              ))}
            </select>
            {errors?.primaryCategory ? <em>{errors.primaryCategory}</em> : null}
          </label>

          <div className="basic-info-field">
            <span>{t("profile.skills")}</span>
            <div className="skills-tagbox">
              {values.skills.map((skill) => (
                <span className="skills-tag" key={skill}>
                  {skill}
                  <button
                    type="button"
                    aria-label={`Remove ${skill}`}
                    onClick={() => removeSkill(skill)}
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                placeholder={values.skills.length ? "" : t("profile.skillsPlaceholder")}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addSkill(event.currentTarget.value);
                  } else if (event.key === "Backspace" && !skillInput && values.skills.length) {
                    removeSkill(values.skills[values.skills.length - 1]);
                  }
                }}
              />
              <button type="button" className="skills-add" onClick={() => addSkill(skillInput)}>
                Add
              </button>
            </div>
            {errors?.skills ? <em>{errors.skills}</em> : null}

            {suggestions.length > 0 ? (
              <div className="skills-suggestions" aria-label="Skill suggestions">
                {suggestions.map((skill) => (
                  <button key={skill} type="button" onClick={() => addSkill(skill)}>
                    {skill}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
