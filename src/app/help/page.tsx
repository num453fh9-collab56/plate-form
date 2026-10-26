import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import Glyph from "@/components/site/Glyph";
import { Btn, ClosingCta, PageHero, Section, SectionHead } from "@/components/site/ui";
import { SUPPORT_EMAIL, breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";

/* ==========================================================================
   HIRELYX · HELP CENTRE
   --------------------------------------------------------------------------
   Content carried over from the previous help page. Two groups of answers
   were corrected rather than copied: the service list now names the six
   current service lines, and the project-stage answer matches the
   seven-stage delivery process on /how-it-works.
   ========================================================================== */

export const metadata: Metadata = pageMetadata({
  title: "Help Centre — Projects, Bookings, Payments & Accounts",
  description:
    "Practical answers about starting a project with Hirelyx, tracking progress in the client portal, bookings, invoices and account security.",
  path: "/help",
  keywords: ["hirelyx help", "client portal help", "project tracking", "invoice help"],
});

const CRUMBS = [{ label: "Home", href: "/" }, { label: "Help Centre" }];

const GROUPS: {
  id: string;
  group: string;
  glyph: "search" | "software" | "clock" | "shield" | "users";
  items: [string, string][];
}[] = [
  {
    id: "getting-started",
    group: "Getting started",
    glyph: "search",
    items: [
      [
        "How do I start a project?",
        "Send a project request through the contact form — four short steps covering the service, budget, timing and your brief — or book a free consultation. Either way you will hear back within 24–48 hours.",
      ],
      [
        "What services do you offer?",
        "Six: Python development, WordPress development, digital marketing, custom AI agents, MCP server development and prompt engineering. Each has its own page with scope, process, technologies and current pricing.",
      ],
      [
        "Do you work with international clients?",
        "Yes. We work with clients worldwide, over email, the client portal and video calls. Our working language is English, with support available in several others.",
      ],
      [
        "How long does a typical project take?",
        "A compact website is typically two to four weeks; a full backend or web application four to ten weeks depending on integrations. Marketing retainers run monthly. The timeline is agreed in the strategy stage before work begins.",
      ],
    ],
  },
  {
    id: "projects",
    group: "Projects and tracking",
    glyph: "software",
    items: [
      [
        "How can I track my project?",
        "Once a project starts you get an account in the client portal, showing the current stage, milestones and a timeline, all updated as work lands.",
      ],
      [
        "What stages does a project go through?",
        "Seven: discovery, strategy, design, development, testing, launch and support. Each one has a defined output, so you can always tell what should already exist. The how-we-work page lists them in full.",
      ],
      [
        "Can I communicate with the team during development?",
        "Yes, and with the people building it rather than an account manager. Each project has an activity feed for comments and questions, plus the chat widget and the option to book a call.",
      ],
      [
        "Can I upload files for my project?",
        "Yes. The project detail page has a file upload section for documents, images and other assets, up to 10 MB per file.",
      ],
    ],
  },
  {
    id: "bookings",
    group: "Bookings and consultations",
    glyph: "clock",
    items: [
      [
        "How do I book a consultation?",
        "Pick an available slot on the bookings page, add your details and confirm. You will receive a confirmation with the meeting details.",
      ],
      [
        "Can I cancel or reschedule a booking?",
        "Yes. Find the booking under My Bookings on the bookings page and cancel it, then book a slot that suits you better.",
      ],
      [
        "Are consultations free?",
        "The first one is. We use it to understand the requirement and discuss the approach — it is a scoping conversation, not a pitch.",
      ],
    ],
  },
  {
    id: "payments",
    group: "Payments and invoices",
    glyph: "shield",
    items: [
      [
        "How do I pay?",
        "Invoices are issued in the client portal and paid by card through Stripe. We never see or store your card details.",
      ],
      [
        "When do I need to pay?",
        "Payment terms are agreed before work starts. Larger projects use milestone billing, so payment stays aligned with delivered work.",
      ],
      [
        "Where can I see my invoices?",
        "On the Invoices page once signed in — view, download or pay them there.",
      ],
      [
        "What currencies do you accept?",
        "USD, PKR, EUR and GBP. The currency is fixed when the invoice is created.",
      ],
    ],
  },
  {
    id: "account",
    group: "Account and security",
    glyph: "users",
    items: [
      [
        "How do I sign in?",
        "Use Sign in in the header. You can sign in with your email using a one-time code, or with Google.",
      ],
      [
        "How do I access the client portal?",
        "After signing in, open the Portal from the footer or the header menu. Projects, bookings and invoices are all there.",
      ],
      [
        "Is my data secure?",
        "Access is enforced in the database with row-level security, so you can only read your own records — not by hiding interface elements. Payments are handled entirely by Stripe, and two-factor authentication is available in account settings.",
      ],
    ],
  },
];

const ALL_FAQS = GROUPS.flatMap((group) => group.items.map(([q, a]) => ({ q, a })));

export default function HelpPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema(CRUMBS), faqSchema(ALL_FAQS)]} />

      <PageHero
        crumbs={CRUMBS}
        kicker="Help centre"
        title="How can we help?"
        lead="Practical answers about starting a project, tracking it, bookings, invoices and your account. For anything commercial or technical, the FAQ page goes deeper."
        actions={
          <>
            <Btn href="/contact" arrow>
              Contact us
            </Btn>
            <Btn href="/faq" variant="secondary">
              Read the full FAQ
            </Btn>
          </>
        }
      />

      <Section tone="alt">
        <SectionHead
          kicker="Browse by topic"
          title="Five topics, covering nearly everything we get asked"
        />

        <div className="hx-grid hx-grid-3" style={{ marginBottom: "clamp(2rem, 4vw, 3.5rem)" }}>
          {GROUPS.map((group) => (
            <a className="hx-card hx-card-link hx-card-hover" href={`#${group.id}`} key={group.id}>
              <span className="hx-tile hx-tile-sm">
                <Glyph id={group.glyph} />
              </span>
              <h3 className="hx-h4">{group.group}</h3>
              <p className="hx-small">
                {group.items.length} {group.items.length === 1 ? "answer" : "answers"}
              </p>
            </a>
          ))}
        </div>

        {GROUPS.map((group) => (
          <div key={group.id} id={group.id} style={{ marginBottom: "clamp(2rem, 4vw, 3rem)" }}>
            <h3 className="hx-h3" style={{ marginBottom: "1rem" }}>
              {group.group}
            </h3>
            <div className="hx-acc">
              {group.items.map(([question, answer]) => (
                <div className="hx-acc-item" key={question}>
                  <details>
                    <summary className="hx-acc-btn" style={{ listStyle: "none", cursor: "pointer" }}>
                      <span>{question}</span>
                      <span className="hx-acc-sign" aria-hidden />
                    </summary>
                    <div className="hx-acc-panel">
                      <p>{answer}</p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section tight>
        <div className="hx-panel">
          <h2 className="hx-h3">Still need help?</h2>
          <p className="hx-small" style={{ marginTop: "0.6rem", maxWidth: "52ch" }}>
            If none of this answers it, write to us. Existing clients get the fastest route through
            the messages area of the client portal.
          </p>
          <div className="hx-actions" style={{ marginTop: "1.75rem" }}>
            <Btn href="/contact" arrow>
              Contact us
            </Btn>
            <Btn href={`mailto:${SUPPORT_EMAIL}`} variant="secondary">
              {SUPPORT_EMAIL}
            </Btn>
            <Link className="hx-btn hx-btn-secondary" href="/portal">
              Open the client portal
            </Link>
          </div>
        </div>
      </Section>

      <ClosingCta
        title="Ready to start something?"
        body="Four short steps and you are done. You will get a written scope and a fixed quote before anything begins."
      />
    </>
  );
}
