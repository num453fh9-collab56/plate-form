"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { getCategory, searchSkills } from "@/lib/taxonomy";

/* ==========================================================================
   HIRELYX · SKILL PICKER
   A taxonomy-driven multi-select. Freelancers use it during onboarding; gig
   owners use it (scoped to the chosen category) when posting a service.
   Only platform-approved skills can be selected.
   ========================================================================== */

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

interface SkillPickerProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder: string;
  /** When set, only skills belonging to this category label are offered. */
  category?: string;
  max?: number;
  className?: string;
}

export default function SkillPicker({
  value,
  onChange,
  placeholder,
  category,
  max = 25,
  className = "",
}: SkillPickerProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const selected = useMemo(() => new Set(value), [value]);
  const activeCategory = category ? getCategory(category) : undefined;

  const toggle = (skill: string) => {
    if (selected.has(skill)) {
      onChange(value.filter((item) => item !== skill));
      return;
    }
    if (value.length >= max) return;
    onChange([...value, skill]);
  };

  const groups = useMemo(() => searchSkills(query, category), [query, category]);

  const atLimit = value.length >= max;

  return (
    <div className={"skill-picker " + className} ref={boxRef}>
      <div
        className={"skill-box" + (open ? " open" : "")}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {value.map((skill) => (
          <span className="skill-chip" key={skill}>
            {skill}
            <button
              type="button"
              aria-label={`Remove ${skill}`}
              onClick={(event) => {
                event.stopPropagation();
                toggle(skill);
              }}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="skill-input"
          type="text"
          value={query}
          placeholder={value.length ? "" : placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              const firstMatch = groups[0]?.skills.find((skill) => !selected.has(skill.label));
              if (firstMatch) toggle(firstMatch.label);
            } else if (event.key === "Backspace" && !query && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
        />
      </div>

      {open && (
        <div className="skill-dropdown">
          {activeCategory && (
            <div className="skill-scope">
              <span className="skill-scope-glyph" aria-hidden="true">
                {activeCategory.glyph}
              </span>
              <span className="skill-scope-copy">
                <strong>{t(activeCategory.translationKey)}</strong>
                <small>{activeCategory.tagline}</small>
              </span>
              <span className="skill-scope-count">
                {value.filter((skill) =>
                  activeCategory.skills.some((item) => item.label === skill),
                ).length}
              </span>
            </div>
          )}

          {groups.map((group) => (
            <div className="skill-group" key={group.id}>
              <div className="skill-group-title">{t(group.translationKey)}</div>
              <div className="skill-options">
                {group.skills.map((skill) => {
                  const isSelected = selected.has(skill.label);
                  return (
                    <button
                      type="button"
                      key={skill.id}
                      className={"skill-option" + (isSelected ? " selected" : "")}
                      disabled={!isSelected && atLimit}
                      onClick={() => toggle(skill.label)}
                    >
                      {isSelected ? <CheckIcon /> : null}
                      {skill.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!groups.length && <div className="skill-empty">{t("profile.skillsNoMatch")}</div>}
        </div>
      )}
    </div>
  );
}
