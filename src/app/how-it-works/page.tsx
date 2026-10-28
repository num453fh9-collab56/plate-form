import type { Metadata } from "next";
import { DELIVERY_PROCESS } from "@/lib/content/process";
import JsonLd from "@/components/site/JsonLd";
import { FaqAccordion } from "@/components/site/interactive";
import {
  Breadcrumbs,
  Btn,
  CheckList,
  ClosingCta,
  Section,
  SectionHead,
  Stats,
} from "@/components/site/ui";
import { SITE_URL, breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";

/* ==========================================================================
   HIRELYX · HOW WE WORK
   The seven delivery stages in full, plus engagement terms and the FAQs that
   were previously on this page (pricing bands, timelines, payment, revisions
   and support — all carried over, with the vaguer promises tightened).
   ========================================================================== */

const CRUMBS = [{ label: "Home", href: "/" }, { label: "How We Work" }];

export const metadata: Metadata = pageMetadata({
  title: "How We Work — Scope, Delivery, Testing & Handover",
  description:
    "The Hirelyx delivery process in detail: seven stages from discovery to support, what you receive at each one, and how scope, pricing and payments work.",
  path: "/how-it-works",
  keywords: ["software development process", "project delivery process", "agency engagement model"],
});

const FAQS = [
  {
    q: "How much does a project cost?",
    a: "It depends on scope. A compact website build starts at $499, a full custom backend or web application at $1,499, AI agent work at $799, and prompt engineering at $299. Larger platform work is quoted per engagement. Every service page lists its current tiers, and you get a fixed written quote after discovery rather than a range.",
  },
  {
    q: "How long does a project take?",
    a: "A compact website is typically two to four weeks. A full backend or web application is usually four to ten weeks depending on integrations. Marketing retainers are ongoing and reviewed monthly. We agree the timeline in the strategy stage and tell you immediately if it slips — early, not at the deadline.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Card payments through Stripe, invoiced from your account in the client portal. Larger projects are split across milestones so you are never paying far ahead of delivered work. We never see or store your card details.",
  },
  {
    q: "What happens if the result is not right?",
    a: "Every tier includes a defined number of revision rounds, and those rounds exist to correct our work against the agreed scope. If we have built something that does not match what was signed off, we fix it at our cost. New requirements discovered along the way are quoted as a change rather than absorbed silently — which keeps both the timeline and the invoice honest.",
  },
  {
    q: "Do you provide ongoing support?",
    a: "Yes. Every engagement ends with a handover session and documentation, and you can add an ongoing support arrangement with an agreed scope and response expectation. Support is a stated arrangement, not an open-ended promise.",
  },
  {
    q: "Who owns the work?",
    a: "You do, from the start. Repositories, infrastructure, domains and third-party accounts are in your name. There is no Hirelyx layer anything depends on at runtime, and no licence to renew.",
  },
  {
    q: "Can you work with our existing team or codebase?",
    a: "Often, and it is frequently the better arrangement. We usually begin with a read-only review that produces a written assessment of the codebase — dependency state, test coverage, correctness risks and the highest-value changes — before anything is agreed.",
  },
  {
    q: "What do you need from us?",
    a: "A named decision-maker who can approve scope, access to the systems involved, and timely feedback at review points. Most delays we see are access delays. We list exactly what is needed in the strategy stage so nothing is discovered late.",
  },
];

const TERMS = [
  { value: "Fixed", label: "Written quote after discovery — not an hourly open end" },
  { value: "Milestones", label: "Payments tied to delivered increments" },
  { value: "Stripe", label: "All payments processed by Stripe" },
  { value: "Yours", label: "Code, accounts and documentation in your name" },
];

/* HowTo structured data mirrors the seven stages shown on this page. */
function howToSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How Hirelyx delivers a project",
    description:
      "The seven-stage delivery process Hirelyx runs on every engagement, from discovery through to support.",
    url: `${SITE_URL}/how-it-works`,
    step: DELIVERY_PROCESS.map((stage, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: stage.title,
      text: stage.desc,
    })),
  };
}

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={[howToSchema(), breadcrumbSchema(CRUMBS), faqSchema(FAQS)]} />

      <section className="hx-page-hero">
        <div className="hx-wrap">
          <Breadcrumbs items={CRUMBS} />
          <div style={{ marginTop: "1.5rem", maxWidth: "52rem" }}>
            <p className="hx-kicker">How we work</p>
            <h1 className="hx-h1">Seven stages, and what should exist at the end of each.</h1>
            <p className="hx-lead" style={{ marginTop: "1.1rem" }}>
              A process is only meaningful if it produces artefacts you can point at. Every
              stage below names its output, so at any moment you can check whether it actually
              happened rather than take our word for it.
            </p>
            <div className="hx-actions" style={{ marginTop: "2rem" }}>
              <Btn href="/contact" arrow>
                Start a project
              </Btn>
              <Btn href="/bookings" variant="secondary">
                Book a consultation
              </Btn>
            </div>
          </div>
        </div>
      </section>

      {/* Stages */}
      <Section id="stages" tone="alt">
        <SectionHead
          kicker="Delivery process"
          title="Discovery → Strategy → Design → Development → Testing → Launch → Support"
          lead="The same sequence on every engagement, scaled to the size of the work. A two-week website runs through all seven; it just spends less time in each."
        />
        <ol className="hx-steps">
          {DELIVERY_PROCESS.map((stage, i) => (
            <li className="hx-step hx-reveal" key={stage.title}>
              <span className="hx-step-no">{String(i + 1).padStart(2, "0")}</span>
              <div className="hx-step-body">
                <h3>{stage.title}</h3>
                <div>
                  <p>{stage.desc}</p>
                  <ul>
                    <li className="hx-chip hx-chip-accent">You receive: {stage.output}</li>
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Engagement terms */}
      <Section id="terms">
        <SectionHead
          kicker="Engagement terms"
          title="How scope, pricing and payment work"
          lead="The commercial side, stated plainly. The full terms are in our Terms of Service; this is the summary that matters day to day."
        />
        <Stats items={TERMS} />

        <div className="hx-split hx-mt-lg" style={{ alignItems: "start" }}>
          <div className="hx-panel">
            <h3 className="hx-h4" style={{ marginBottom: "1.1rem" }}>
              What is always included
            </h3>
            <CheckList
              items={[
                "A written scope listing what is in and what is explicitly out",
                "A fixed quote, confirmed before any work begins",
                "Milestone demos of working software, not progress percentages",
                "Automated tests where the work is code",
                "Accessibility, responsive and performance checks before launch",
                "Documentation and a handover session with your team",
              ]}
            />
          </div>
          <div className="hx-panel">
            <h3 className="hx-h4" style={{ marginBottom: "1.1rem" }}>
              What is never included silently
            </h3>
            <CheckList
              items={[
                "Third-party costs: hosting, domains, model API usage, advertising spend",
                "New requirements found mid-project — quoted as a change, with your approval",
                "Ongoing support beyond the agreed window",
                "Content writing or photography unless named in the scope",
                "Guarantees on search rankings or advertising return, which nobody can honestly give",
              ]}
            />
          </div>
        </div>
      </Section>

      {/* Working with us */}
      <Section id="collaboration" tone="ink">
        <SectionHead
          kicker="Working together"
          title="Where the work actually happens"
          lead="You get a client portal account at kickoff. Project status, files, messages and invoices all live in one place, and the people replying are the people building."
        />
        <div className="hx-grid hx-grid-3">
          <article className="hx-card hx-reveal">
            <h3 className="hx-h4">Client portal</h3>
            <p className="hx-small">
              Project status, file exchange, messaging and invoices. Access control is enforced
              server-side, so your data is not visible to other clients.
            </p>
            <div className="hx-card-foot">
              <Btn href="/portal" variant="secondary" size="sm" className="hx-btn-block">
                Open the portal
              </Btn>
            </div>
          </article>
          <article className="hx-card hx-reveal">
            <h3 className="hx-h4">Consultations</h3>
            <p className="hx-small">
              Book a slot directly rather than going through a form queue. The first call is a
              scoping conversation, not a sales pitch.
            </p>
            <div className="hx-card-foot">
              <Btn href="/bookings" variant="secondary" size="sm" className="hx-btn-block">
                Book a time
              </Btn>
            </div>
          </article>
          <article className="hx-card hx-reveal">
            <h3 className="hx-h4">Invoices and payment</h3>
            <p className="hx-small">
              Invoices are issued in the portal and paid by card through Stripe. Milestone
              billing on larger projects keeps payment aligned with delivery.
            </p>
            <div className="hx-card-foot">
              <Btn href="/invoices" variant="secondary" size="sm" className="hx-btn-block">
                View invoices
              </Btn>
            </div>
          </article>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" tone="alt">
        <div className="hx-split">
          <div>
            <p className="hx-kicker">Questions</p>
            <h2 className="hx-h2">Frequently asked</h2>
            <p className="hx-lead" style={{ marginTop: "1rem" }}>
              Cost, timelines, payment, revisions, ownership and support — answered without
              the usual hedging.
            </p>
            <div style={{ marginTop: "1.75rem" }}>
              <Btn href="/contact" variant="secondary" size="sm">
                Ask us directly
              </Btn>
            </div>
          </div>
          <FaqAccordion items={FAQS} />
        </div>
      </Section>

      <ClosingCta />
    </>
  );
}
