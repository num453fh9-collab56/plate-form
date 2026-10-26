import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import ProjectInquiryForm from "@/components/site/ProjectInquiryForm";
import { Breadcrumbs, CheckList, Section, SectionHead } from "@/components/site/ui";
import { Calendar, Chat, Mail } from "@/components/site/Icons";
import { DELIVERY_PROCESS } from "@/lib/content/process";
import { SERVICE_SLUGS } from "@/lib/content/services";
import { SUPPORT_EMAIL, breadcrumbSchema, pageMetadata } from "@/lib/seo";

/* ==========================================================================
   HIRELYX · CONTACT
   The conversion page. The inquiry form submits to the existing
   POST /api/contact route; nothing new is integrated here.
   ========================================================================== */

const CRUMBS = [{ label: "Home", href: "/" }, { label: "Contact" }];

export const metadata: Metadata = pageMetadata({
  title: "Contact — Start a Project or Get a Proposal",
  description:
    "Tell Hirelyx what you are trying to achieve. Four short steps, a written scope and a fixed quote. Typical first reply within 24–48 hours.",
  path: "/contact",
  keywords: ["contact hirelyx", "get a proposal", "start a software project"],
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  /* Service pages link here as /contact?service=<slug> so the first step
     arrives already answered. Unknown values are ignored rather than
     trusted. */
  const { service } = await searchParams;
  const preselect = service && SERVICE_SLUGS.includes(service) ? service : undefined;

  return (
    <>
      <JsonLd data={breadcrumbSchema(CRUMBS)} />

      <section className="hx-page-hero">
        <div className="hx-wrap">
          <Breadcrumbs items={CRUMBS} />
          <div style={{ marginTop: "1.5rem", maxWidth: "48rem" }}>
            <p className="hx-kicker">Start a project</p>
            <h1 className="hx-h1">
              Have a project in mind? Let&apos;s build something exceptional.
            </h1>
            <p className="hx-lead" style={{ marginTop: "1.1rem" }}>
              Four short steps. You will get a reply from the person who would do the work, with
              a view on scope, cost and whether we are the right team for it.
            </p>
          </div>
        </div>
      </section>

      <Section id="form" tone="alt">
        <div className="hx-contact-grid">
          {/* Sidebar */}
          <aside className="hx-stack">
            <div className="hx-contact-methods">
              <a className="hx-contact-method" href={`mailto:${SUPPORT_EMAIL}`}>
                <span className="hx-tile hx-tile-sm">
                  <Mail size={18} />
                </span>
                <span>
                  <h3>Email us</h3>
                  <p>For anything that does not fit a form</p>
                  <b>{SUPPORT_EMAIL}</b>
                </span>
              </a>

              <Link className="hx-contact-method" href="/bookings">
                <span className="hx-tile hx-tile-sm">
                  <Calendar size={18} />
                </span>
                <span>
                  <h3>Book a free consultation</h3>
                  <p>A scoping call, not a sales call</p>
                  <b>Choose a time slot</b>
                </span>
              </Link>

              <div className="hx-contact-method">
                <span className="hx-tile hx-tile-sm">
                  <Chat size={18} />
                </span>
                <span>
                  <h3>Live chat</h3>
                  <p>Our AI assistant answers questions about Hirelyx and hands over to a person when it cannot</p>
                  <b>Available on every page</b>
                </span>
              </div>
            </div>

            <div className="hx-card hx-card-flat">
              <h3 className="hx-h4">What happens next</h3>
              <ol className="hx-stack-sm" style={{ margin: "0.75rem 0 0", paddingLeft: "1.1rem" }}>
                {["We read the brief and check we are a fit", "A reply within 24–48 hours with questions or a scoping call", "A written scope and fixed quote before anything starts"].map(
                  (line) => (
                    <li key={line} className="hx-small" style={{ marginBottom: "0.4rem" }}>
                      {line}
                    </li>
                  ),
                )}
              </ol>
              <div className="hx-card-foot">
                <p className="hx-xs">
                  Our full delivery process has {DELIVERY_PROCESS.length} stages —{" "}
                  <Link href="/how-it-works" style={{ color: "var(--hx-accent)", fontWeight: 600 }}>
                    see what each one produces
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="hx-card hx-card-flat">
              <h3 className="hx-h4">Already a client?</h3>
              <p className="hx-small">
                Project status, files, messages and invoices are in the client portal.
              </p>
              <div className="hx-card-foot">
                <Link className="hx-btn hx-btn-secondary hx-btn-sm hx-btn-block" href="/portal">
                  Open the client portal
                </Link>
              </div>
            </div>
          </aside>

          {/* Form */}
          <div>
            <ProjectInquiryForm preselect={preselect} />
          </div>
        </div>
      </Section>

      <Section id="expect">
        <SectionHead
          kicker="Before you write"
          title="Things worth knowing"
          lead="So the first exchange is useful rather than a round of qualifying questions."
        />
        <div className="hx-split" style={{ alignItems: "start" }}>
          <div className="hx-panel">
            <h3 className="hx-h4" style={{ marginBottom: "1.1rem" }}>
              We are a good fit when
            </h3>
            <CheckList
              items={[
                "You need Python, AI, WordPress or marketing work specifically",
                "You want the system delivered into your own accounts and repository",
                "You would rather have a written scope than an hourly arrangement",
                "You are comfortable being told when something is not worth building",
              ]}
            />
          </div>
          <div className="hx-panel">
            <h3 className="hx-h4" style={{ marginBottom: "1.1rem" }}>
              We are not the right choice when
            </h3>
            <CheckList
              items={[
                "You need native mobile app development — we do not do it",
                "You need a brand identity or design studio rather than engineering",
                "You want a guaranteed search ranking or advertising return",
                "The work must be done in a stack we have not shipped in",
              ]}
            />
            <p className="hx-xs" style={{ marginTop: "1.25rem" }}>
              We would rather say this now than three weeks into a project.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
