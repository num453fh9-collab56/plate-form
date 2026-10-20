"use client";

import { useRef, useState } from "react";
import { getRecaptchaToken } from "@/lib/recaptcha";

/* ==========================================================================
   HIRELYX · ADVANCED CONTACT FORM
   Project configurator with service type, budget range, timeline,
   file attachments, and live validation.
   ========================================================================== */

const SERVICE_OPTIONS = [
  {
    value: "programming", label: "Programming & Tech", icon: "🌐",
    subs: ["Website Development", "UI/UX Design", "Frontend Development", "Backend Development", "Full Stack Development", "API Integration", "Database Design", "Mobile App (React Native)"],
  },
  {
    value: "marketing", label: "Digital Marketing", icon: "📈",
    subs: ["Meta Ads (Facebook/Instagram)", "Google Ads", "SEO Optimization", "Social Media Marketing", "Content Marketing", "Email Marketing", "Web Analytics Setup", "Competitor Analysis"],
  },
  {
    value: "ai-agents", label: "Custom AI Agents", icon: "🤖",
    subs: ["AI Chatbot", "Customer Support Agent", "Data Processing Agent", "Lead Qualification Bot", "Multi-Agent Pipeline", "RAG / Knowledge Base", "AI API Integration"],
  },
  {
    value: "social-ai", label: "Social Media AI & Animation", icon: "🎬",
    subs: ["AI Video Generation", "Short-form Reels/TikToks", "AI Animation", "Thumbnail Design", "Content Calendar", "Brand Visual Identity", "YouTube Shorts"],
  },
  {
    value: "prompt", label: "Prompt Engineering", icon: "💬",
    subs: ["System Prompt Design", "Prompt Library", "ChatGPT Optimization", "Claude Optimization", "Chain-of-Thought Prompts", "RAG Prompt Tuning", "Team Training"],
  },
  {
    value: "n8n", label: "n8n & Workflow Automation", icon: "⚡",
    subs: ["n8n Workflow Setup", "Zapier Automation", "CRM Integration", "Email Automation", "Data Sync Between Apps", "Scheduled Reports", "Custom API Webhooks"],
  },
  { value: "other", label: "Other / Not Sure", icon: "❓", subs: [] },
];

const BUDGET_RANGES = [
  "$500 – $1,000",
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000 – $10,000",
  "$10,000+",
  "Not sure yet",
];

const TIMELINE_OPTIONS = [
  "ASAP (1–2 weeks)",
  "Short (2–4 weeks)",
  "Medium (1–2 months)",
  "Long (3+ months)",
  "Flexible / No rush",
];

interface FileAttachment {
  name: string;
  size: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ContactForm() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [subServices, setSubServices] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const canNext = step === 0
    ? service !== ""
    : step === 1
      ? name.trim() !== "" && /\S+@\S+\.\S+/.test(email)
      : message.trim().length >= 10;

  const submit = async () => {
    if (sending) return;
    setError("");
    setSending(true);
    try {
      const captchaToken = await getRecaptchaToken("contact");
      const fullMessage = [
        `Service: ${SERVICE_OPTIONS.find((s) => s.value === service)?.label ?? service}`,
        subServices.length > 0 ? `Specifics: ${subServices.join(", ")}` : null,
        budget ? `Budget: ${budget}` : null,
        timeline ? `Timeline: ${timeline}` : null,
        files.length > 0 ? `Attachments: ${files.map((f) => f.name).join(", ")}` : null,
        "",
        message,
      ].filter(Boolean).join("\n");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject: subject || `${SERVICE_OPTIONS.find((s) => s.value === service)?.label} Inquiry`, message: fullMessage, captchaToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (data.ok) {
        setSent(true);
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setSending(false);
    }
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []).map((f) => ({ name: f.name, size: f.size }));
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (sent) {
    return (
      <div className="cf-success">
        <div className="cf-success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3>Request Submitted!</h3>
        <p>Thank you, {name.split(" ")[0]}! We&apos;ll review your project details and get back to you within 24 hours.</p>
        <div className="cf-success-summary">
          <div><strong>Service:</strong> {SERVICE_OPTIONS.find((s) => s.value === service)?.label}</div>
          {subServices.length > 0 && <div><strong>Specifics:</strong> {subServices.join(", ")}</div>}
          {budget && <div><strong>Budget:</strong> {budget}</div>}
          {timeline && <div><strong>Timeline:</strong> {timeline}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="cf-wizard">
      {/* Progress */}
      <div className="cf-progress">
        {["Project Type", "Your Info", "Details"].map((label, i) => (
          <button
            key={label}
            type="button"
            className={"cf-step-dot" + (i === step ? " cf-step-active" : "") + (i < step ? " cf-step-done" : "")}
            onClick={() => i < step ? setStep(i) : undefined}
          >
            <span className="cf-step-num">{i < step ? "✓" : i + 1}</span>
            <span className="cf-step-label">{label}</span>
          </button>
        ))}
        <div className="cf-progress-bar">
          <div className="cf-progress-fill" style={{ width: `${((step + 1) / 3) * 100}%` }} />
        </div>
      </div>

      {/* Step 0: Project Type */}
      {step === 0 && (
        <div className="cf-panel">
          <h3 className="cf-panel-title">What do you need help with?</h3>
          <div className="cf-service-grid">
            {SERVICE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={"cf-service-btn" + (service === opt.value ? " cf-service-selected" : "")}
                onClick={() => { setService(opt.value); setSubServices([]); }}
              >
                <span className="cf-service-icon">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {service && SERVICE_OPTIONS.find((s) => s.value === service)?.subs?.length ? (
            <>
              <h4 className="cf-sub-title">What specifically do you need? <span style={{ fontWeight: 400, fontSize: ".78rem", color: "var(--text-secondary)" }}>(select all that apply)</span></h4>
              <div className="cf-chip-row">
                {SERVICE_OPTIONS.find((s) => s.value === service)!.subs!.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    className={"cf-chip" + (subServices.includes(sub) ? " cf-chip-active" : "")}
                    onClick={() => setSubServices((prev) => prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub])}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <h4 className="cf-sub-title">Estimated Budget</h4>
          <div className="cf-chip-row">
            {BUDGET_RANGES.map((b) => (
              <button
                key={b}
                type="button"
                className={"cf-chip" + (budget === b ? " cf-chip-active" : "")}
                onClick={() => setBudget(budget === b ? "" : b)}
              >
                {b}
              </button>
            ))}
          </div>

          <h4 className="cf-sub-title">Timeline</h4>
          <div className="cf-chip-row">
            {TIMELINE_OPTIONS.map((tl) => (
              <button
                key={tl}
                type="button"
                className={"cf-chip" + (timeline === tl ? " cf-chip-active" : "")}
                onClick={() => setTimeline(timeline === tl ? "" : tl)}
              >
                {tl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Your Info */}
      {step === 1 && (
        <div className="cf-panel">
          <h3 className="cf-panel-title">Tell us about yourself</h3>
          <div className="contact-row">
            <label className="cf-label">
              Name <span className="req">*</span>
              <input
                className="cf-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={100}
                autoFocus
              />
            </label>
            <label className="cf-label">
              Email <span className="req">*</span>
              <input
                className="cf-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                maxLength={200}
              />
              {email && !/\S+@\S+\.\S+/.test(email) && (
                <span className="cf-validation">Please enter a valid email</span>
              )}
            </label>
          </div>
          <label className="cf-label">
            Subject <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>(optional)</span>
            <input
              className="cf-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Project name or brief summary"
              maxLength={200}
            />
          </label>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="cf-panel">
          <h3 className="cf-panel-title">Describe your project</h3>
          <label className="cf-label">
            Project Details <span className="req">*</span>
            <textarea
              className="cf-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your project goals, features you need, target audience, and any other relevant details..."
              maxLength={5000}
              rows={7}
            />
            <span className="cf-char-count">{message.length} / 5,000</span>
          </label>

          <div className="cf-file-area">
            <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.fig,.sketch,.zip" className="cf-file-input" onChange={addFiles} />
            <button type="button" className="cf-file-btn" onClick={() => fileRef.current?.click()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
              Attach Files
            </button>
            <span className="cf-file-hint">PDF, images, Figma, ZIP — up to 5 files</span>
          </div>
          {files.length > 0 && (
            <div className="cf-files-list">
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} className="cf-file-item">
                  <span className="cf-file-name">{f.name}</span>
                  <span className="cf-file-size">{formatSize(f.size)}</span>
                  <button type="button" className="cf-file-remove" onClick={() => removeFile(i)}>×</button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="contact-error">{error}</p>}
        </div>
      )}

      {/* Navigation */}
      <div className="cf-nav">
        {step > 0 && (
          <button type="button" className="cf-back" onClick={() => setStep(step - 1)}>
            ← Back
          </button>
        )}
        <div className="cf-nav-spacer" />
        {step < 2 ? (
          <button
            type="button"
            className="btn-primary cf-next"
            disabled={!canNext}
            onClick={() => setStep(step + 1)}
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary cf-next"
            disabled={!canNext || sending}
            onClick={submit}
          >
            {sending ? "Sending..." : "Submit Request"}
          </button>
        )}
      </div>

      <style>{`
        .cf-wizard {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          padding: 2rem;
        }

        /* Progress */
        .cf-progress {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          position: relative;
        }
        .cf-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--border);
          border-radius: 3px;
        }
        .cf-progress-fill {
          height: 100%;
          background: var(--accent, #0066cc);
          border-radius: 3px;
          transition: width 0.4s cubic-bezier(.4,0,.2,1);
        }
        .cf-step-dot {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          font: inherit;
          color: var(--text-secondary);
          padding: 0;
          transition: color 0.2s;
        }
        .cf-step-active { color: var(--text-primary); font-weight: 600; }
        .cf-step-done { color: var(--accent, #0066cc); }
        .cf-step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          border: 2px solid var(--border);
          transition: all 0.2s;
        }
        .cf-step-active .cf-step-num {
          background: var(--accent, #0066cc);
          color: #fff;
          border-color: var(--accent, #0066cc);
        }
        .cf-step-done .cf-step-num {
          background: var(--accent, #0066cc);
          color: #fff;
          border-color: var(--accent, #0066cc);
        }
        .cf-step-label {
          font-size: 0.82rem;
        }

        /* Panels */
        .cf-panel {
          animation: cfFade 0.3s ease;
        }
        @keyframes cfFade {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .cf-panel-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 1.25rem;
        }
        .cf-sub-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 1.5rem 0 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* Service Grid */
        .cf-service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 0.6rem;
        }
        .cf-service-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          border: 1.5px solid var(--border);
          border-radius: 0.75rem;
          background: var(--bg);
          cursor: pointer;
          font: inherit;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .cf-service-btn:hover {
          border-color: var(--accent, #0066cc);
          background: rgba(0,102,204,0.04);
        }
        .cf-service-selected {
          border-color: var(--accent, #0066cc);
          background: rgba(0,102,204,0.08);
          font-weight: 600;
        }
        .cf-service-icon {
          font-size: 1.25rem;
        }

        /* Chips */
        .cf-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .cf-chip {
          padding: 0.4rem 0.85rem;
          border: 1.5px solid var(--border);
          border-radius: 999px;
          background: var(--bg);
          font: inherit;
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .cf-chip:hover {
          border-color: var(--accent, #0066cc);
          color: var(--text-primary);
        }
        .cf-chip-active {
          border-color: var(--accent, #0066cc);
          background: rgba(0,102,204,0.08);
          color: var(--accent, #0066cc);
          font-weight: 600;
        }

        /* Inputs */
        .cf-label {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }
        .cf-input, .cf-textarea {
          padding: 0.7rem 0.9rem;
          border: 1.5px solid var(--border);
          border-radius: 0.6rem;
          font: inherit;
          font-size: 0.9rem;
          color: var(--text-primary);
          background: var(--bg);
          transition: border-color 0.2s;
        }
        .cf-input:focus, .cf-textarea:focus {
          outline: none;
          border-color: var(--accent, #0066cc);
          box-shadow: 0 0 0 3px rgba(0,102,204,0.1);
        }
        .cf-textarea {
          resize: vertical;
          min-height: 120px;
        }
        .cf-validation {
          font-size: 0.72rem;
          color: #dc2626;
          font-weight: 500;
        }
        .cf-char-count {
          font-size: 0.72rem;
          color: var(--text-secondary);
          text-align: right;
        }

        /* File Upload */
        .cf-file-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .cf-file-input { display: none; }
        .cf-file-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border: 1.5px dashed var(--border);
          border-radius: 0.5rem;
          background: none;
          font: inherit;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .cf-file-btn:hover {
          border-color: var(--accent, #0066cc);
          color: var(--accent, #0066cc);
        }
        .cf-file-hint {
          font-size: 0.72rem;
          color: var(--text-secondary);
        }
        .cf-files-list {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .cf-file-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.6rem;
          background: rgba(0,0,0,0.03);
          border-radius: 0.4rem;
          font-size: 0.78rem;
        }
        .cf-file-name {
          flex: 1;
          color: var(--text-primary);
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cf-file-size { color: var(--text-secondary); }
        .cf-file-remove {
          background: none;
          border: none;
          font-size: 1rem;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0 0.3rem;
          line-height: 1;
        }
        .cf-file-remove:hover { color: #dc2626; }

        /* Nav */
        .cf-nav {
          display: flex;
          align-items: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }
        .cf-nav-spacer { flex: 1; }
        .cf-back {
          background: none;
          border: none;
          font: inherit;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem 0.75rem;
        }
        .cf-back:hover { color: var(--text-primary); }
        .cf-next {
          padding: 0.65rem 1.5rem;
          font-size: 0.88rem;
          border-radius: 0.5rem;
        }
        .cf-next:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Success */
        .cf-success {
          text-align: center;
          padding: 2.5rem 1.5rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
        }
        .cf-success-icon {
          color: var(--accent, #059669);
          margin-bottom: 1rem;
        }
        .cf-success h3 {
          font-size: 1.3rem;
          margin: 0 0 0.5rem;
          color: var(--text-primary);
        }
        .cf-success p {
          color: var(--text-secondary);
          max-width: 400px;
          margin: 0 auto 1.5rem;
        }
        .cf-success-summary {
          display: inline-flex;
          flex-direction: column;
          gap: 0.4rem;
          text-align: left;
          padding: 1rem 1.5rem;
          background: rgba(0,0,0,0.03);
          border-radius: 0.75rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .cf-success-summary strong {
          color: var(--text-primary);
        }

        @media (max-width: 600px) {
          .cf-wizard { padding: 1.25rem; }
          .cf-progress { gap: 0.75rem; flex-wrap: wrap; }
          .cf-step-label { display: none; }
          .cf-service-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
