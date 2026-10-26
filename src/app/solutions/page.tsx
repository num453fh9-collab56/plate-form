import type { Metadata } from "next";
import { SOLUTIONS } from "@/lib/content/solutions";
import { INDUSTRIES } from "@/lib/content/expertise";
import Glyph from "@/components/site/Glyph";
import JsonLd from "@/components/site/JsonLd";
import {
  Breadcrumbs,
  Btn,
  Chips,
  ClosingCta,
  Section,
  SectionHead,
  TextLink,
} from "@/components/site/ui";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

const CRUMBS = [{ label: "Home", href: "/" }, { label: "Solutions" }];

export const metadata: Metadata = pageMetadata({
  title: "Solutions — Automation, Custom Software, AI & Growth",
  description:
    "Hirelyx solutions framed around business problems: business process automation, custom software, AI-powered workflows, digital growth and intelligent customer support.",
  path: "/solutions",
  keywords: [
    "business process automation",
    "custom software development",
    "ai workflow automation",
    "digital growth agency",
    "ai customer support",
  ],
});

export default function SolutionsIndexPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(CRUMBS)} />

      <section className="hx-page-hero">
        <div className="hx-wrap">
          <Breadcrumbs items={CRUMBS} />
          <div style={{ marginTop: "1.5rem", maxWidth: "52rem" }}>
            <p className="hx-kicker">Solutions</p>
            <h1 className="hx-h1">Start from the problem, not the technology.</h1>
            <p className="hx-lead" style={{ marginTop: "1.1rem" }}>
              Nobody wakes up wanting FastAPI. They want a process that stops costing a day a
              week, a system someone can safely change, or marketing numbers they can trust.
              Each solution below says which services deliver it.
            </p>
            <div className="hx-actions" style={{ marginTop: "2rem" }}>
              <Btn href="/contact" arrow>
                Describe your problem
              </Btn>
              <Btn href="/services" variant="secondary">
                Browse by service
              </Btn>
            </div>
          </div>
        </div>
      </section>

      <Section tone="alt">
        <div className="hx-grid hx-grid-2">
          {SOLUTIONS.map((solution) => (
            <article className="hx-card hx-card-hover hx-reveal" key={solution.slug}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <span className="hx-tile">
                  <Glyph id={solution.glyph} />
                </span>
                <div>
                  <h2 className="hx-h3">{solution.name}</h2>
                  <p className="hx-small" style={{ marginTop: "0.35rem", fontWeight: 600, color: "var(--hx-fg)" }}>
                    {solution.tagline}
                  </p>
                </div>
              </div>
              <p className="hx-small">{solution.summary}</p>
              <div className="hx-card-foot">
                <Chips items={solution.tech.slice(0, 5)} />
                <div style={{ marginTop: "1.1rem" }}>
                  <TextLink href={`/solutions/${solution.slug}`}>
                    {solution.name}
                  </TextLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="industries">
        <SectionHead
          kicker="Industries"
          title="Sectors where this work tends to land"
          lead="We are not an industry specialist firm, and we will not claim deep domain knowledge we do not have. These are the sectors our existing work sits in."
        />
        <div className="hx-grid hx-grid-3">
          {INDUSTRIES.map((industry) => (
            <article className="hx-card hx-card-flat hx-reveal" key={industry.slug}>
              <span className="hx-tile hx-tile-sm">
                <Glyph id={industry.glyph} />
              </span>
              <h3 className="hx-h4">{industry.name}</h3>
              <p className="hx-small">{industry.summary}</p>
              <div className="hx-card-foot">
                <Chips items={industry.useCases} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <ClosingCta
        title="Describe the outcome. We will work backwards to the build."
        body="A couple of paragraphs is enough to start. If we are not the right team for it, we will tell you that too."
      />
    </>
  );
}
