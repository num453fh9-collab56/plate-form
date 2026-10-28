"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { getRecaptchaToken } from "@/lib/recaptcha";
import { SERVICES } from "@/lib/content/services";
import { Check } from "./Icons";

/* ==========================================================================
   HIRELYX · PROJECT INQUIRY FORM
   --------------------------------------------------------------------------
   Four steps: service → scope → brief → contact details.

   Submits to the existing POST /api/contact route (reCAPTCHA + server-side
   rate limiting + email to support@hirelyx.com). No new integration is
   invented here: the same endpoint the previous form used, with the extra
   fields appended to the message body and a honeypot field the API rejects.

   Accessibility:
     · each step is a labelled group with a heading the focus moves to
     · options are real radio/checkbox inputs inside <fieldset>/<legend>
     · errors are tied to inputs with aria-describedby + aria-invalid, and
       announced through an aria-live region
     · the step indicator is an ordered list with per-step state, not colour
       alone

   Spam handling: reCAPTCHA token, the `trap` honeypot, a minimum time on
   form before submit is accepted, and the API route's own rate limit.
   ========================================================================== */

const BUDGETS = [
  { value: "Under $1,000", hint: "Small, single-outcome scope" },
  { value: "$1,000 – $2,500", hint: "A focused build or audit" },
  { value: "$2,500 – $5,000", hint: "Full service or backend" },
  { value: "$5,000 – $10,000", hint: "Multi-part platform work" },
  { value: "$10,000+", hint: "Programme of work" },
  { value: "Not sure yet", hint: "We will help you size it" },
];

const TIMELINES = [
  { value: "As soon as possible", hint: "1–2 weeks" },
  { value: "Short", hint: "2–4 weeks" },
  { value: "Medium", hint: "1–2 months" },
  { value: "Long", hint: "3+ months" },
  { value: "Flexible", hint: "No fixed deadline" },
];

/** Sub-options per service, drawn from each service's real capabilities. */
const SUB_OPTIONS: Record<string, string[]> = {
  "python-development": [
    "FastAPI service",
    "REST or GraphQL API",
    "Pydantic data modelling",
    "Pytest test suite",
    "Database design or migration",
    "Third-party integration",
    "Review of an existing codebase",
    "Deployment and CI/CD",
  ],
  "wordpress-development": [
    "New custom theme",
    "Redesign of an existing site",
    "WooCommerce store",
    "Speed and Core Web Vitals",
    "Platform migration",
    "Technical SEO setup",
    "Block patterns for editors",
    "Maintenance and updates",
  ],
  "digital-marketing": [
    "Technical SEO audit",
    "Web analytics and GA4 setup",
    "Conversion tracking",
    "Meta Ads",
    "Social media marketing",
    "Content strategy and briefs",
    "Landing page optimisation",
    "Monthly reporting",
  ],
  "ai-agents": [
    "Support or FAQ agent",
    "Retrieval over our own content",
    "Document or data extraction",
    "Lead qualification",
    "Multi-step workflow agent",
    "Evaluation of an existing agent",
    "CRM or helpdesk integration",
    "Monitoring and cost control",
  ],
  "mcp-server-development": [
    "Discovery sprint",
    "MCP server over one system",
    "Multiple systems",
    "Database access tools",
    "Internal API tools",
    "Document resources",
    "Auth and permission scoping",
    "Audit logging",
  ],
  "prompt-engineering": [
    "System prompt design",
    "Prompt library",
    "Structured output contracts",
    "Evaluation set and grading",
    "Retrieval prompt tuning",
    "Cost and latency reduction",
    "Team training",
  ],
  other: [],
};

const STEP_LABELS = ["Service", "Scope", "Your brief", "Contact"];

const MIN_FILL_MS = 2500;

interface Attachment {
  name: string;
  size: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errors = Partial<Record<"service" | "message" | "name" | "email" | "consent", string>>;

export default function ProjectInquiryForm({ preselect }: { preselect?: string }) {
  const uid = useId().replace(/:/g, "");
  const [step, setStep] = useState(0);

  const [service, setService] = useState(preselect ?? "");
  const [subs, setSubs] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mountedAt = useRef<number>(0);
  const movedRef = useRef(false);

  /* Recorded after mount rather than during render, so the value stays pure
     and the minimum-fill-time check has a real baseline. */
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  /* Move focus to the new step heading, but never on first paint. */
  useEffect(() => {
    if (!movedRef.current) {
      movedRef.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step, sent]);

  const selected = SERVICES.find((item) => item.slug === service);
  const serviceLabel = selected?.name ?? (service === "other" ? "Not sure yet" : "");
  const subOptions = SUB_OPTIONS[service] ?? [];

  const validateStep = (index: number): Errors => {
    const next: Errors = {};
    if (index === 0 && !service) next.service = "Choose the service closest to what you need.";
    if (index === 2 && message.trim().length < 20) {
      next.message = "Please give us at least a couple of sentences — 20 characters minimum.";
    }
    if (index === 3) {
      if (!name.trim()) next.name = "We need a name to reply to.";
      if (!EMAIL_RE.test(email.trim())) next.email = "Enter an email address we can reply to.";
      if (!consent) next.consent = "Please confirm you are happy for us to reply.";
    }
    return next;
  };

  const goNext = () => {
    const found = validateStep(step);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setFormError("");
    setStep((value) => Math.min(value + 1, STEP_LABELS.length - 1));
  };

  const goBack = () => {
    setErrors({});
    setFormError("");
    setStep((value) => Math.max(value - 1, 0));
  };

  const addFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []).map((file) => ({
      name: file.name,
      size: file.size,
    }));
    setFiles((prev) => [...prev, ...picked].slice(0, 5));
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;

    const found = validateStep(3);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    /* Spam heuristics: the honeypot must stay empty and a real person takes
       more than a couple of seconds to fill four steps. */
    const elapsed = mountedAt.current === 0 ? MIN_FILL_MS : Date.now() - mountedAt.current;
    if (trap.trim() !== "" || elapsed < MIN_FILL_MS) {
      setFormError("Your request could not be verified. Please try again.");
      return;
    }

    setSending(true);
    setFormError("");

    try {
      const captchaToken = await getRecaptchaToken("contact");
      const body = [
        `Service: ${serviceLabel || "Unspecified"}`,
        subs.length > 0 ? `Specifics: ${subs.join(", ")}` : null,
        budget ? `Budget: ${budget}` : null,
        timeline ? `Timeline: ${timeline}` : null,
        company.trim() ? `Company: ${company.trim()}` : null,
        phone.trim() ? `Phone: ${phone.trim()}` : null,
        links.trim() ? `Reference links: ${links.trim()}` : null,
        files.length > 0
          ? `Files the client wants to share (names only — not uploaded): ${files
              .map((file) => file.name)
              .join(", ")}`
          : null,
        "",
        message.trim(),
      ]
        .filter((line) => line !== null)
        .join("\n");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: `Project inquiry — ${serviceLabel || "general"}`,
          message: body,
          captchaToken,
          trap,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (data.ok) {
        setSent(true);
      } else {
        setFormError(data.error ?? "Something went wrong sending your request. Please try again.");
      }
    } catch {
      setFormError("We could not reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  /* ── Confirmation ─────────────────────────────────────────────────────── */
  if (sent) {
    return (
      <div className="hx-form">
        <div className="hx-form-done">
          <span className="hx-form-done-mark" aria-hidden>
            <Check size={30} />
          </span>
          <h3 ref={headingRef} tabIndex={-1}>
            Request received, {name.trim().split(/\s+/)[0]}.
          </h3>
          <p>
            It has gone straight to our inbox. You will normally hear back within 24–48 hours,
            and the reply will come from a person who has read the whole brief.
          </p>

          <dl className="hx-summary">
            <div>
              <dt>Service</dt>
              <dd>{serviceLabel || "Not specified"}</dd>
            </div>
            {subs.length > 0 ? (
              <div>
                <dt>Specifics</dt>
                <dd>{subs.join(", ")}</dd>
              </div>
            ) : null}
            {budget ? (
              <div>
                <dt>Budget</dt>
                <dd>{budget}</dd>
              </div>
            ) : null}
            {timeline ? (
              <div>
                <dt>Timeline</dt>
                <dd>{timeline}</dd>
              </div>
            ) : null}
            <div>
              <dt>Reply to</dt>
              <dd>{email.trim()}</dd>
            </div>
          </dl>

          <div className="hx-actions" style={{ justifyContent: "center" }}>
            <Link className="hx-btn hx-btn-secondary" href="/bookings">
              Book a consultation slot
            </Link>
            <Link className="hx-btn hx-btn-secondary" href="/portfolio">
              Read a case study
            </Link>
          </div>

          <p className="hx-xs" style={{ marginTop: "1.75rem" }}>
            Files are not uploaded through this form. If you listed any, we will reply with a
            secure way to send them.
          </p>
        </div>
      </div>
    );
  }

  const progress = ((step + 1) / STEP_LABELS.length) * 100;

  return (
    <form className="hx-form" onSubmit={submit} noValidate>
      {/* Progress */}
      <div className="hx-form-progress">
        <ol className="hx-form-steps">
          {STEP_LABELS.map((label, index) => (
            <li
              key={label}
              data-state={index === step ? "current" : index < step ? "done" : "todo"}
            >
              <b aria-hidden>{index < step ? "✓" : index + 1}</b>
              <span>
                {label}
                {index === step ? <span className="hx-sr"> (current step)</span> : null}
                {index < step ? <span className="hx-sr"> (completed)</span> : null}
              </span>
            </li>
          ))}
        </ol>
        <div
          className="hx-form-track"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEP_LABELS.length}
          aria-valuenow={step + 1}
          aria-label={`Step ${step + 1} of ${STEP_LABELS.length}`}
        >
          <div className="hx-form-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ── Step 1 · Service ─────────────────────────────────────────────── */}
      {step === 0 ? (
        <section className="hx-form-panel" aria-labelledby={`${uid}-s0`}>
          <h3 id={`${uid}-s0`} ref={headingRef} tabIndex={-1}>
            What do you need help with?
          </h3>
          <p>Pick the closest match. If none of them fit, choose the last option.</p>

          <fieldset className="hx-fieldset">
            <legend>
              Service <span className="hx-req">*</span>
            </legend>
            <div
              className="hx-options"
              {...(errors.service ? { "aria-describedby": `${uid}-err-service` } : {})}
            >
              {[...SERVICES.map((item) => ({ value: item.slug, label: item.name, hint: item.tagline })),
                { value: "other", label: "Not sure yet", hint: "Describe it and we will tell you" },
              ].map((option) => (
                <label className="hx-option" key={option.value}>
                  <input
                    type="radio"
                    name="service"
                    value={option.value}
                    checked={service === option.value}
                    onChange={() => {
                      setService(option.value);
                      setSubs([]);
                      setErrors((prev) => ({ ...prev, service: undefined }));
                    }}
                  />
                  <span className="hx-option-mark" aria-hidden />
                  <span className="hx-option-text">
                    {option.label}
                    <span>{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.service ? (
              <span className="hx-field-error" id={`${uid}-err-service`}>
                {errors.service}
              </span>
            ) : null}
          </fieldset>

          {subOptions.length > 0 ? (
            <fieldset className="hx-fieldset">
              <legend>
                Which parts apply? <span className="hx-fieldset-hint">optional, select any</span>
              </legend>
              <div className="hx-options">
                {subOptions.map((option) => (
                  <label className="hx-option" key={option}>
                    <input
                      type="checkbox"
                      name="subs"
                      value={option}
                      checked={subs.includes(option)}
                      onChange={() =>
                        setSubs((prev) =>
                          prev.includes(option)
                            ? prev.filter((item) => item !== option)
                            : [...prev, option],
                        )
                      }
                    />
                    <span className="hx-option-mark hx-option-mark-box" aria-hidden />
                    <span className="hx-option-text">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
        </section>
      ) : null}

      {/* ── Step 2 · Scope ──────────────────────────────────────────────── */}
      {step === 1 ? (
        <section className="hx-form-panel" aria-labelledby={`${uid}-s1`}>
          <h3 id={`${uid}-s1`} ref={headingRef} tabIndex={-1}>
            Budget and timing
          </h3>
          <p>
            Both are optional, and a range is fine. Knowing them early means our first reply can
            be useful rather than a request for more information.
          </p>

          <fieldset className="hx-fieldset">
            <legend>
              Approximate budget <span className="hx-fieldset-hint">optional</span>
            </legend>
            <div className="hx-options">
              {BUDGETS.map((option) => (
                <label className="hx-option" key={option.value}>
                  <input
                    type="radio"
                    name="budget"
                    value={option.value}
                    checked={budget === option.value}
                    onChange={() => setBudget(option.value)}
                  />
                  <span className="hx-option-mark" aria-hidden />
                  <span className="hx-option-text">
                    {option.value}
                    <span>{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="hx-fieldset">
            <legend>
              When would you like to start <span className="hx-fieldset-hint">optional</span>
            </legend>
            <div className="hx-options">
              {TIMELINES.map((option) => (
                <label className="hx-option" key={option.value}>
                  <input
                    type="radio"
                    name="timeline"
                    value={option.value}
                    checked={timeline === option.value}
                    onChange={() => setTimeline(option.value)}
                  />
                  <span className="hx-option-mark" aria-hidden />
                  <span className="hx-option-text">
                    {option.value}
                    <span>{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>
      ) : null}

      {/* ── Step 3 · Brief ──────────────────────────────────────────────── */}
      {step === 2 ? (
        <section className="hx-form-panel" aria-labelledby={`${uid}-s2`}>
          <h3 id={`${uid}-s2`} ref={headingRef} tabIndex={-1}>
            Tell us about the project
          </h3>
          <p>
            What are you trying to achieve, what exists today, and what has to be true for this
            to count as a success? Detail here saves a round of emails.
          </p>

          <label className="hx-field" htmlFor={`${uid}-message`}>
            <span className="hx-field-label">
              Project brief <span className="hx-req">*</span>
            </span>
            <textarea
              id={`${uid}-message`}
              className="hx-textarea"
              value={message}
              maxLength={5000}
              rows={8}
              placeholder="Goals, current situation, systems involved, who it is for, and anything that has already been tried."
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={
                errors.message ? `${uid}-err-message ${uid}-count` : `${uid}-count`
              }
              onChange={(event) => {
                setMessage(event.target.value);
                if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
              }}
            />
            {errors.message ? (
              <span className="hx-field-error" id={`${uid}-err-message`}>
                {errors.message}
              </span>
            ) : null}
            <span className="hx-field-count" id={`${uid}-count`}>
              {message.length.toLocaleString()} / 5,000 characters
            </span>
          </label>

          <label className="hx-field" htmlFor={`${uid}-links`}>
            <span className="hx-field-label">
              Reference links <em>— optional</em>
            </span>
            <input
              id={`${uid}-links`}
              className="hx-input"
              type="text"
              value={links}
              maxLength={500}
              placeholder="Current site, Figma file, repository, competitor example…"
              onChange={(event) => setLinks(event.target.value)}
            />
            <span className="hx-field-help">
              Anything we can look at before replying. One per line or comma-separated.
            </span>
          </label>

          <fieldset className="hx-fieldset">
            <legend>
              Files you would like to share <span className="hx-fieldset-hint">optional</span>
            </legend>
            <input
              ref={fileRef}
              id={`${uid}-files`}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.fig,.sketch,.zip,.csv"
              className="hx-sr"
              onChange={addFiles}
              aria-describedby={`${uid}-files-help`}
            />
            <button
              type="button"
              className="hx-btn hx-btn-secondary hx-btn-sm"
              onClick={() => fileRef.current?.click()}
            >
              Choose files
            </button>
            <span className="hx-field-help" id={`${uid}-files-help`}>
              Up to 5 files. Only the file names are sent with this form — we will reply with a
              secure upload link for the files themselves.
            </span>
            {files.length > 0 ? (
              <ul className="hx-files" style={{ listStyle: "none", padding: 0 }}>
                {files.map((file, index) => (
                  <li className="hx-file" key={`${file.name}-${index}`}>
                    <b>{file.name}</b>
                    <span>{formatSize(file.size)}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </fieldset>
        </section>
      ) : null}

      {/* ── Step 4 · Contact ────────────────────────────────────────────── */}
      {step === 3 ? (
        <section className="hx-form-panel" aria-labelledby={`${uid}-s3`}>
          <h3 id={`${uid}-s3`} ref={headingRef} tabIndex={-1}>
            Where should we reply?
          </h3>
          <p>We use these details to answer your enquiry. Nothing else.</p>

          <div className="hx-grid-fields">
            <label className="hx-field" htmlFor={`${uid}-name`}>
              <span className="hx-field-label">
                Your name <span className="hx-req">*</span>
              </span>
              <input
                id={`${uid}-name`}
                className="hx-input"
                type="text"
                value={name}
                maxLength={100}
                autoComplete="name"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? `${uid}-err-name` : undefined}
                onChange={(event) => {
                  setName(event.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {errors.name ? (
                <span className="hx-field-error" id={`${uid}-err-name`}>
                  {errors.name}
                </span>
              ) : null}
            </label>

            <label className="hx-field" htmlFor={`${uid}-email`}>
              <span className="hx-field-label">
                Email <span className="hx-req">*</span>
              </span>
              <input
                id={`${uid}-email`}
                className="hx-input"
                type="email"
                inputMode="email"
                value={email}
                maxLength={200}
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? `${uid}-err-email` : undefined}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
              />
              {errors.email ? (
                <span className="hx-field-error" id={`${uid}-err-email`}>
                  {errors.email}
                </span>
              ) : null}
            </label>

            <label className="hx-field" htmlFor={`${uid}-company`}>
              <span className="hx-field-label">
                Company <em>— optional</em>
              </span>
              <input
                id={`${uid}-company`}
                className="hx-input"
                type="text"
                value={company}
                maxLength={120}
                autoComplete="organization"
                onChange={(event) => setCompany(event.target.value)}
              />
            </label>

            <label className="hx-field" htmlFor={`${uid}-phone`}>
              <span className="hx-field-label">
                Phone <em>— optional</em>
              </span>
              <input
                id={`${uid}-phone`}
                className="hx-input"
                type="tel"
                value={phone}
                maxLength={40}
                autoComplete="tel"
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
          </div>

          {/* Honeypot — never shown, never autofilled. */}
          <div className="hx-trap" aria-hidden>
            <label htmlFor={`${uid}-trap`}>Leave this field empty</label>
            <input
              id={`${uid}-trap`}
              name="website_url_confirm"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={trap}
              onChange={(event) => setTrap(event.target.value)}
            />
          </div>

          <label className="hx-consent" htmlFor={`${uid}-consent`}>
            <input
              id={`${uid}-consent`}
              type="checkbox"
              checked={consent}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? `${uid}-err-consent` : undefined}
              onChange={(event) => {
                setConsent(event.target.checked);
                if (errors.consent) setErrors((prev) => ({ ...prev, consent: undefined }));
              }}
            />
            <span>
              I am happy for Hirelyx to use these details to reply to this enquiry, as described
              in the <Link href="/privacy">privacy policy</Link>.
              {errors.consent ? (
                <span className="hx-field-error" id={`${uid}-err-consent`}>
                  {errors.consent}
                </span>
              ) : null}
            </span>
          </label>

          <dl className="hx-summary" style={{ margin: "0 0 1rem" }}>
            <div>
              <dt>Service</dt>
              <dd>{serviceLabel || "Not specified"}</dd>
            </div>
            {budget ? (
              <div>
                <dt>Budget</dt>
                <dd>{budget}</dd>
              </div>
            ) : null}
            {timeline ? (
              <div>
                <dt>Timeline</dt>
                <dd>{timeline}</dd>
              </div>
            ) : null}
          </dl>
          <p className="hx-xs">
            This form is protected by reCAPTCHA and rate limiting. Submissions are emailed to our
            support inbox — we do not add you to any mailing list.
          </p>
        </section>
      ) : null}

      {/* Errors announced to assistive tech */}
      <div aria-live="polite" aria-atomic="true">
        {formError ? (
          <p className="hx-form-alert" role="alert">
            {formError}
          </p>
        ) : null}
      </div>

      {/* Navigation */}
      <div className="hx-form-nav">
        {step > 0 ? (
          <button type="button" className="hx-btn hx-btn-secondary hx-btn-sm" onClick={goBack}>
            Back
          </button>
        ) : null}
        <div className="hx-form-nav-end">
          {step < STEP_LABELS.length - 1 ? (
            <button type="button" className="hx-btn" onClick={goNext}>
              Continue
            </button>
          ) : (
            <button type="submit" className="hx-btn" disabled={sending}>
              {sending ? "Sending…" : "Send project request"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
