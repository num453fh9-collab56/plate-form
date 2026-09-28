"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

/* Strictly curated catalogue of remote digital, tech and creative skills,
   grouped by discipline. Only these platform-approved skills can be selected. */
export const SKILL_CATALOG: { category: string; skills: string[] }[] = [
  {
    category: "Web & Software Development",
    skills: [
      "Full-Stack Development", "Frontend Development", "Backend Development",
      "React/Next.js", "Node.js", "TypeScript", "JavaScript", "Python", "PHP",
      "Laravel", "Django", "Java", "C#/.NET", "Go", "REST API", "GraphQL",
      "API Integration", "SQL", "PostgreSQL", "MongoDB", "DevOps", "Docker",
      "Kubernetes", "CI/CD", "AWS", "WordPress", "Shopify", "Webflow",
      "Web Security", "Testing & QA",
    ],
  },
  {
    category: "Mobile App Development",
    skills: [
      "Mobile App Development", "React Native", "Flutter", "Swift (iOS)",
      "Kotlin (Android)", "Cross-Platform Apps", "App Store Optimization",
    ],
  },
  {
    category: "AI & Automation",
    skills: [
      "AI & Automation", "AI/ML", "Machine Learning", "Deep Learning", "NLP",
      "Computer Vision", "Generative AI", "Prompt Engineering", "LLM Integration",
      "Chatbot Development", "TensorFlow", "PyTorch", "Data Analysis",
      "Data Science", "Data Visualization", "Process Automation",
      "Zapier / Make", "Power BI", "Tableau",
    ],
  },
  {
    category: "UI/UX & Web Design",
    skills: [
      "UI/UX & Web Design", "UI/UX Design", "Web Design", "Product Design",
      "Mobile App Design", "Wireframing", "Prototyping", "Design Systems",
      "Interaction Design", "Figma", "Adobe XD", "Sketch", "Accessibility",
    ],
  },
  {
    category: "Graphic Design & Branding",
    skills: [
      "Graphic Design & Branding", "Graphic Design", "Logo Design",
      "Brand Identity", "Brand Guidelines", "Illustration", "Typography",
      "Packaging Design", "Social Media Graphics", "Adobe Photoshop",
      "Adobe Illustrator", "Canva",
    ],
  },
  {
    category: "Video Editing & Post-Production",
    skills: [
      "Video Editing & Post-Production", "Video Editing", "CapCut",
      "Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Motion Graphics",
      "Color Grading", "Sound Design", "Subtitling",
      "Short-Form / Reels Editing", "YouTube Video Editing",
    ],
  },
  {
    category: "Digital Marketing & Growth",
    skills: [
      "Digital Marketing & Growth", "Social Media Marketing", "Meta Ads",
      "Google Ads", "TikTok Ads", "SEO", "SEO & Content Strategy",
      "Content Marketing", "Email Marketing", "Marketing Automation",
      "Conversion Optimization", "Analytics & Tracking", "Growth Marketing",
      "Influencer Marketing",
    ],
  },
  {
    category: "Writing & Copywriting",
    skills: [
      "Professional Copywriting", "Technical Writing", "Blog Writing",
      "SEO Writing", "Content Writing", "Website Copy", "Ad Copy",
      "Email Copywriting", "Product Descriptions", "Scriptwriting",
      "Proofreading & Editing",
    ],
  },
];

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
  max?: number;
}

export default function SkillPicker({ value, onChange, placeholder, max = 25 }: SkillPickerProps) {
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

  const toggle = (skill: string) => {
    if (selected.has(skill)) {
      onChange(value.filter((item) => item !== skill));
      return;
    }
    if (value.length >= max) return;
    onChange([...value, skill]);
  };

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase();
    return SKILL_CATALOG.map((group) => ({
      category: group.category,
      skills: group.skills.filter((skill) => !term || skill.toLowerCase().includes(term)),
    })).filter((group) => group.skills.length > 0);
  }, [query]);

  return (
    <div className="skill-picker" ref={boxRef}>
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
              const firstMatch = groups[0]?.skills.find((skill) => !selected.has(skill));
              if (firstMatch) toggle(firstMatch);
            } else if (event.key === "Backspace" && !query && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
        />
      </div>

      {open && (
        <div className="skill-dropdown">
          {groups.map((group) => (
            <div className="skill-group" key={group.category}>
              <div className="skill-group-title">{group.category}</div>
              <div className="skill-options">
                {group.skills.map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    className={"skill-option" + (selected.has(skill) ? " selected" : "")}
                    onClick={() => toggle(skill)}
                  >
                    {selected.has(skill) ? <CheckIcon /> : null}
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {!groups.length && (
            <div className="skill-empty">{t("profile.skillsNoMatch")}</div>
          )}
        </div>
      )}
    </div>
  );
}
