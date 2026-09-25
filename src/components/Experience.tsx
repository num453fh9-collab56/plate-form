"use client";

import { useI18n } from "@/lib/i18n";

/* ==========================================================================
   APEX · EDIT YOUR PROFESSIONAL PROFILE HERE
   --------------------------------------------------------------------------
   The "Professional Experience & Expertise" section is fully driven by the
   PROFILE object below. Change these values to your own details — this is the
   only place you need to edit. Add or remove array items freely.
   ========================================================================== */
const PROFILE = {
  name: "Your Name",
  role: "Senior Product Designer & Frontend Developer",
  location: "Remote · Available worldwide",
  summary:
    "Write two to four sentences about your professional background — your years of experience, the kind of products and clients you work with, and what sets your work apart.",
  skills: [
    "Product Design",
    "UI/UX Design",
    "Design Systems",
    "Interaction Design",
    "Frontend (React)",
    "Prototyping",
    "Accessibility",
    "Brand Identity",
  ],
  software: [
    { name: "Figma", note: "Design & systems" },
    { name: "Adobe Illustrator", note: "Vector & brand" },
    { name: "Adobe Photoshop", note: "Imagery & retouch" },
    { name: "After Effects", note: "Motion" },
    { name: "React / Next.js", note: "Frontend" },
    { name: "Webflow", note: "No-code builds" },
  ],
  milestones: [
    {
      period: "2022 — Present",
      title: "Lead Product Designer",
      org: "Northwind Studio",
      text: "Lead end-to-end design for B2B SaaS products — research, design systems, and shipped interfaces.",
    },
    {
      period: "2019 — 2022",
      title: "Senior UI/UX Designer",
      org: "Lumen Digital",
      text: "Designed and shipped web and mobile experiences for fintech and e-commerce clients across 12 markets.",
    },
    {
      period: "2016 — 2019",
      title: "Product Designer",
      org: "Craftworks",
      text: "Built the first design system and established the visual language for a suite of internal tools.",
    },
    {
      period: "2014 — 2016",
      title: "Visual Designer",
      org: "Independent",
      text: "Partnered with startups and agencies on brand identity, marketing sites, and product UI.",
    },
  ],
};

export default function Experience() {
  const { t } = useI18n();

  return (
    <section className="section experience" id="experience">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">{t("exp.kicker")}</div>
            <h2>{t("exp.title")}</h2>
          </div>
          <span className="exp-status">{t("exp.status")}</span>
        </div>

        <div className="exp-grid">
          <article className="exp-card wide">
            <div className="exp-label">{t("exp.about")}</div>
            <h3>{PROFILE.name}</h3>
            <div className="exp-role">{PROFILE.role}</div>
            <div className="exp-meta">{PROFILE.location}</div>
            <p className="exp-text">{PROFILE.summary}</p>
          </article>

          <article className="exp-card">
            <div className="exp-label">{t("exp.skills")}</div>
            <div className="chips">
              {PROFILE.skills.map((skill) => (
                <span className="chip" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </article>

          <article className="exp-card">
            <div className="exp-label">{t("exp.stack")}</div>
            <div className="chips">
              {PROFILE.software.map((item) => (
                <span className="chip" key={item.name}>
                  {item.name}
                  {item.note ? (
                    <span className="chip-note">{item.note}</span>
                  ) : null}
                </span>
              ))}
            </div>
          </article>

          <article className="exp-card wide">
            <div className="exp-label">{t("exp.milestones")}</div>
            <div className="timeline">
              {PROFILE.milestones.map((milestone) => (
                <div className="milestone" key={milestone.period}>
                  <div className="ms-period">{milestone.period}</div>
                  <div className="ms-title">{milestone.title}</div>
                  <div className="ms-org">{milestone.org}</div>
                  <div className="ms-text">{milestone.text}</div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
