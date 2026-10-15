"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useRouter } from "next/navigation";
import BrandMark from "./BrandMark";

const INDUSTRIES = [
  "Technology", "Marketing & Advertising", "Finance & Banking", "Healthcare",
  "Education", "E-commerce & Retail", "Media & Entertainment", "Real Estate",
  "Manufacturing", "Non-profit", "Government", "Other",
];

const TEAM_SIZES = ["Solo / Individual", "2–10", "11–50", "51–200", "200+"];

const PROJECT_TYPES = [
  "Web Development", "Mobile App", "Graphic Design", "Digital Marketing",
  "Video & Animation", "Writing & Content", "AI & Machine Learning",
  "Data Analysis", "UI/UX Design", "SEO & SEM", "Social Media", "Other",
];

const HIRING_FREQ = ["One-time project", "Monthly", "Ongoing / Regular"];

const BUDGET_RANGES = ["Under $500", "$500 – $2,000", "$2,000 – $10,000", "$10,000+"];

interface StepDef { id: string; title: string; sub: string }

const STEPS: StepDef[] = [
  { id: "about", title: "About You", sub: "Tell us about yourself or your company" },
  { id: "needs", title: "Your Needs", sub: "What kind of work are you looking for?" },
  { id: "review", title: "All Set!", sub: "Review and start browsing" },
];

export default function BuyerOnboarding() {
  const { profile, updateProfile } = useAuth();
  const { closeBuyerOnboard, toast } = useUI();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState(profile.buyerProfile?.companyName || "");
  const [industry, setIndustry] = useState(profile.buyerProfile?.industry || "");
  const [teamSize, setTeamSize] = useState(profile.buyerProfile?.teamSize || "");
  const [companyDescription, setCompanyDescription] = useState(profile.buyerProfile?.companyDescription || "");
  const [companyWebsite, setCompanyWebsite] = useState(profile.buyerProfile?.companyWebsite || "");
  const [projectTypes, setProjectTypes] = useState<string[]>(profile.buyerProfile?.projectTypes || []);
  const [hiringFrequency, setHiringFrequency] = useState(profile.buyerProfile?.hiringFrequency || "");
  const [budgetRange, setBudgetRange] = useState("");

  const toggleProjectType = (type: string) => {
    setProjectTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const canNext = () => {
    if (step === 0) return companyName.trim().length > 0 || profile.fullName.length > 0;
    if (step === 1) return projectTypes.length > 0;
    return true;
  };

  const goNext = () => {
    if (step < STEPS.length - 1) {
      updateProfile({
        buyerProfile: {
          companyName, industry, teamSize, projectTypes,
          hiringFrequency, companyDescription, companyWebsite, companyLogo: "",
        },
      });
      setStep(step + 1);
    }
  };

  const finish = (destination: "browse" | "request") => {
    updateProfile({
      buyerProfile: {
        companyName, industry, teamSize, projectTypes,
        hiringFrequency, companyDescription, companyWebsite, companyLogo: "",
      },
    });
    toast("Welcome to Hirelyx! Your buyer profile is ready.");
    closeBuyerOnboard();
    router.push(destination === "browse" ? "/search" : "/requests/new");
  };

  function renderAbout() {
    return (
      <div style={{ maxWidth: 560 }}>
        <div className="buyer-onb-field">
          <label>Company / Organization Name</label>
          <input
            type="text"
            placeholder="e.g. Acme Inc."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            maxLength={100}
          />
        </div>
        <div className="buyer-onb-field">
          <label>Industry</label>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">Select your industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
        <div className="buyer-onb-field">
          <label>Team Size</label>
          <div className="buyer-onb-radios">
            {TEAM_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={"buyer-onb-radio" + (teamSize === size ? " active" : "")}
                onClick={() => setTeamSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <div className="buyer-onb-field">
          <label>About Your Company (optional)</label>
          <textarea
            placeholder="Briefly describe what your company does..."
            value={companyDescription}
            onChange={(e) => setCompanyDescription(e.target.value)}
            maxLength={500}
          />
        </div>
        <div className="buyer-onb-field">
          <label>Website (optional)</label>
          <input
            type="url"
            placeholder="https://example.com"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
          />
        </div>
      </div>
    );
  }

  function renderNeeds() {
    return (
      <div style={{ maxWidth: 600 }}>
        <div className="buyer-onb-field">
          <label>What type of projects do you need help with?</label>
          <div className="buyer-onb-checks">
            {PROJECT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={"buyer-onb-check" + (projectTypes.includes(type) ? " active" : "")}
                onClick={() => toggleProjectType(type)}
              >
                <span className="check-box">
                  {projectTypes.includes(type) && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="buyer-onb-field">
          <label>How often do you hire freelancers?</label>
          <div className="buyer-onb-radios">
            {HIRING_FREQ.map((freq) => (
              <button
                key={freq}
                type="button"
                className={"buyer-onb-radio" + (hiringFrequency === freq ? " active" : "")}
                onClick={() => setHiringFrequency(freq)}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>
        <div className="buyer-onb-field">
          <label>Typical project budget</label>
          <div className="buyer-onb-radios">
            {BUDGET_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                className={"buyer-onb-radio" + (budgetRange === range ? " active" : "")}
                onClick={() => setBudgetRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderReview() {
    return (
      <div style={{ maxWidth: 560 }}>
        <div className="buyer-onb-summary">
          <div>
            <dt>Company</dt>
            <dd>{companyName || profile.fullName || "—"}</dd>
          </div>
          {industry && <div><dt>Industry</dt><dd>{industry}</dd></div>}
          {teamSize && <div><dt>Team Size</dt><dd>{teamSize}</dd></div>}
          {projectTypes.length > 0 && (
            <div>
              <dt>Looking For</dt>
              <dd>{projectTypes.join(", ")}</dd>
            </div>
          )}
          {hiringFrequency && <div><dt>Hiring Frequency</dt><dd>{hiringFrequency}</dd></div>}
          {budgetRange && <div><dt>Budget Range</dt><dd>{budgetRange}</dd></div>}
        </div>

        <div className="buyer-onb-ctas">
          <button
            type="button"
            className="ob-btn-primary"
            onClick={() => finish("browse")}
            style={{ minWidth: 180 }}
          >
            Start Browsing
          </button>
          <button
            type="button"
            className="ob-btn-ghost"
            onClick={() => finish("request")}
            style={{ minWidth: 180 }}
          >
            Post a Request
          </button>
        </div>
      </div>
    );
  }

  const panels = [renderAbout, renderNeeds, renderReview];

  return (
    <div className="ob-shell" role="dialog" aria-modal="true" aria-labelledby="buyerOnbTitle">
      <div className="ob-aurora" aria-hidden="true" />

      <header className="ob-topbar">
        <span className="ob-brand">
          <BrandMark className="ob-brand-mark" />
          <b>Hire<span>lyx</span></b>
          <span className="ob-brand-tag">Buyer Setup</span>
        </span>
        <div className="ob-topbar-actions">
          <button type="button" className="ob-btn-ghost" onClick={closeBuyerOnboard}>
            Skip for now
          </button>
        </div>
      </header>

      <main className="ob-main">
        <div className="ob-flow">
          <div className="wiz-steps" role="list">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={"wiz-step" + (i === step ? " active" : "") + (i < step ? " done" : "")}
                role="listitem"
              >
                <span className="wiz-step-index">{i < step ? "✓" : i + 1}</span>
                <span className="wiz-step-label">{s.title}</span>
              </div>
            ))}
            <div className="wiz-progress">
              <div className="wiz-progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>

          <div className="wiz-card" style={{ marginTop: 32 }}>
            <h2 id="buyerOnbTitle">{STEPS[step].title}</h2>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>{STEPS[step].sub}</p>
            {panels[step]()}
          </div>

          {step < 2 && (
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
              {step > 0 && (
                <button type="button" className="ob-btn-ghost" onClick={() => setStep(step - 1)}>
                  Back
                </button>
              )}
              <button
                type="button"
                className="ob-btn-primary"
                disabled={!canNext()}
                onClick={goNext}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
