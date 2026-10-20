import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Learn how Hirelyx delivers your digital project — from initial consultation to launch and ongoing support.",
  alternates: { canonical: "/how-it-works" },
};

const STEPS = [
  {
    title: "Tell us what you need",
    body: "Fill out our project form or send us a message. Describe your goals, timeline, and budget — we'll take it from there.",
    icon: "💬",
  },
  {
    title: "Get a free consultation",
    body: "We'll review your requirements and schedule a call to discuss the best approach, tech stack, and timeline for your project.",
    icon: "📋",
  },
  {
    title: "Agree on scope & pricing",
    body: "We'll send you a clear proposal with deliverables, milestones, and pricing. No hidden fees, no surprises.",
    icon: "🤝",
  },
  {
    title: "We build your project",
    body: "Our team gets to work. You'll receive regular updates, demos, and have the chance to give feedback at every milestone.",
    icon: "⚡",
  },
  {
    title: "Review & revisions",
    body: "We deliver the finished product for your review. Request revisions until everything is exactly how you want it.",
    icon: "🔍",
  },
  {
    title: "Launch & support",
    body: "We help you launch, set up hosting, and provide ongoing support. Your success is our priority.",
    icon: "🚀",
  },
];

const FAQS = [
  {
    q: "How much does a project cost?",
    a: "It depends on the scope. A simple landing page starts at $499, while complex web apps or mobile apps can range from $2,000 to $10,000+. We always provide a clear quote before starting.",
  },
  {
    q: "How long does a project take?",
    a: "Timelines vary by project. A website typically takes 2–4 weeks, a mobile app 4–8 weeks, and larger projects may take 2–3 months. We'll agree on a timeline before starting.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards through Stripe. Payments are secure and you can pay in milestones for larger projects.",
  },
  {
    q: "What if I'm not happy with the result?",
    a: "We include revision rounds in every project. If something isn't right, we'll fix it. Your satisfaction is guaranteed before final payment.",
  },
  {
    q: "Do you provide ongoing support?",
    a: "Yes! We offer post-launch support packages. Bug fixes, updates, and maintenance — we're here for you after delivery too.",
  },
];

function HowToSchema() {
  const steps = STEPS.map((step, i) => ({
    "@type": "HowToStep" as const,
    position: i + 1,
    name: step.title,
    text: step.body,
  }));
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How Hirelyx Works — From Idea to Launch",
          description: "A step-by-step guide to working with the Hirelyx team on your digital project.",
          step: steps,
        }),
      }}
    />
  );
}

export default function HowItWorksPage() {
  return (
    <section className="section">
      <HowToSchema />
      <div className="wrap info-page">
        <div className="section-head">
          <div>
            <div className="kicker">How it works</div>
            <h2>From idea to launch — we handle everything.</h2>
            <p className="sub">A simple, transparent process that puts you in control.</p>
          </div>
        </div>

        <ol className="info-steps">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="info-step-num">{i + 1}</span>
              <div>
                <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>{step.icon}</span> {step.title}
                </strong>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <h3 className="info-h" style={{ marginTop: "3rem" }}>Frequently Asked Questions</h3>
        <div className="info-grid" style={{ gap: "1.25rem" }}>
          {FAQS.map((faq) => (
            <div key={faq.q} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1.25rem" }}>
              <strong style={{ fontSize: "0.92rem", display: "block", marginBottom: "0.5rem" }}>{faq.q}</strong>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="info-cta">
          <Link className="btn-primary" href="/contact">Start a Project</Link>
          <Link className="btn-ghost" href="/services">View Services</Link>
          <Link className="btn-ghost" href="/help">Help Center</Link>
        </div>
      </div>
    </section>
  );
}
