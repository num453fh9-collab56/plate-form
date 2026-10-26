import type { Metadata } from "next";
import { CASE_CATEGORIES, CASE_STUDIES } from "@/lib/content/portfolio";
import JsonLd from "@/components/site/JsonLd";
import { PortfolioFilter } from "@/components/site/interactive";
import {
  Breadcrumbs,
  Btn,
  ClosingCta,
  Section,
  SectionHead,
  Stats,
} from "@/components/site/ui";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

const CRUMBS = [{ label: "Home", href: "/" }, { label: "Portfolio" }];

export const metadata: Metadata = pageMetadata({
  title: "Portfolio — Case Studies & Delivered Work",
  description:
    "Hirelyx case studies across Python development, custom AI agents, digital marketing, WordPress and MCP server work — each with the problem, the approach and the outcome.",
  path: "/portfolio",
  keywords: ["software development case studies", "ai agent case study", "python project portfolio"],
});

const real = CASE_STUDIES.filter((study) => !study.placeholder);
const reserved = CASE_STUDIES.filter((study) => study.placeholder);

const SUMMARY = [
  { value: String(real.length), label: "Published case studies" },
  { value: String(CASE_CATEGORIES.length), label: "Service categories represented" },
  { value: String(reserved.length), label: "Case studies awaiting client sign-off" },
  { value: "100%", label: "Projects delivered into client-owned repositories" },
];

export default function PortfolioPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(CRUMBS)} />

      <section className="hx-page-hero">
        <div className="hx-wrap">
          <Breadcrumbs items={CRUMBS} />
          <div style={{ marginTop: "1.5rem", maxWidth: "52rem" }}>
            <p className="hx-kicker">Portfolio</p>
            <h1 className="hx-h1">Work shown with the problem, not just the screenshot.</h1>
            <p className="hx-lead" style={{ marginTop: "1.1rem" }}>
              Each case study covers the business challenge, what we built, the technology
              stack and the outcome. Where a figure is the client&apos;s own reported result
              rather than something we measured, the page says so.
            </p>
            <div className="hx-actions" style={{ marginTop: "2rem" }}>
              <Btn href="/contact" arrow>
                Start a project
              </Btn>
              <Btn href="/services" variant="secondary">
                Browse services
              </Btn>
            </div>
          </div>
        </div>
      </section>

      <Section tone="alt">
        <SectionHead
          kicker="Selected work"
          title="Filter by service category"
          lead="Entries marked as a content placeholder are reserved slots — the architecture is in place and the project detail is not yet published."
        />
        <PortfolioFilter studies={CASE_STUDIES} categories={CASE_CATEGORIES} />
      </Section>

      <Section>
        <SectionHead
          kicker="How we present work"
          title="What you can and cannot read into this page"
          lead="A portfolio is only useful if you can tell which parts are evidence."
        />
        <div className="hx-mt-lg">
          <Stats items={SUMMARY} />
        </div>
        <div className="hx-grid hx-grid-3 hx-mt-lg">
          <article className="hx-card hx-card-flat">
            <h3 className="hx-h4">Client names</h3>
            <p className="hx-small">
              Shown only where the client has agreed to be named. Everything else is described
              by sector. We do not display logos we have not been given permission to use.
            </p>
          </article>
          <article className="hx-card hx-card-flat">
            <h3 className="hx-h4">Result figures</h3>
            <p className="hx-small">
              Each case study states whether a figure was measured by us or reported by the
              client. No number on this site is estimated, modelled or rounded up for effect.
            </p>
          </article>
          <article className="hx-card hx-card-flat">
            <h3 className="hx-h4">Cover images</h3>
            <p className="hx-small">
              Cover art is illustration, not product screenshots, and the alt text says so.
              Real screens appear in the case study only where we are permitted to show them.
            </p>
          </article>
        </div>
      </Section>

      <ClosingCta
        title="Didn't find a case study like your project?"
        body="That usually means it is not published rather than not done. Describe what you need and we will tell you plainly whether we have built something comparable."
      />
    </>
  );
}
