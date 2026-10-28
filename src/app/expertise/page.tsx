import type { Metadata } from "next";
import { EXPERTISE, INDUSTRIES } from "@/lib/content/expertise";
import Glyph from "@/components/site/Glyph";
import JsonLd from "@/components/site/JsonLd";
import {
  Breadcrumbs,
  Btn,
  Chips,
  ClosingCta,
  Section,
  SectionHead,
  TechMarquee,
  TextLink,
} from "@/components/site/ui";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

const CRUMBS = [{ label: "Home", href: "/" }, { label: "Expertise" }];

export const metadata: Metadata = pageMetadata({
  title: "Expertise — Python, AI, Front-End & Integration Engineering",
  description:
    "The technologies Hirelyx genuinely works in: Python and FastAPI, React and Next.js, OpenAI and Claude APIs, LangChain, MCP, n8n — and what we build with each.",
  path: "/expertise",
  keywords: [
    "python expertise",
    "fastapi expertise",
    "next.js development",
    "llm engineering",
    "n8n integration",
  ],
});

const ALL_TECH = Array.from(
  new Set(EXPERTISE.flatMap((area) => area.stack.map((entry) => entry.name))),
);

export default function ExpertiseIndexPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(CRUMBS)} />

      <section className="hx-page-hero">
        <div className="hx-wrap">
          <Breadcrumbs items={CRUMBS} />
          <div style={{ marginTop: "1.5rem", maxWidth: "52rem" }}>
            <p className="hx-kicker">Expertise</p>
            <h1 className="hx-h1">What we actually work in — and why each choice is made.</h1>
            <p className="hx-lead" style={{ marginTop: "1.1rem" }}>
              This is not a logo wall. Every technology below is one we use in delivered work,
              listed with the reason we reach for it and the trade-off that comes with it. If
              something is missing from this page, assume we do not do it.
            </p>
            <div className="hx-actions" style={{ marginTop: "2rem" }}>
              <Btn href="/contact" arrow>
                Discuss your stack
              </Btn>
              <Btn href="/portfolio" variant="secondary">
                See it applied
              </Btn>
            </div>
          </div>
        </div>
      </section>

      <Section tone="alt">
        <SectionHead
          kicker="Areas"
          title="Four engineering areas, one team"
          lead="A small team with deliberately overlapping skills, rather than separate departments that hand work over."
          aside={<TextLink href="/services">See the services these power</TextLink>}
        />
        <div className="hx-grid hx-grid-2">
          {EXPERTISE.map((area) => (
            <article className="hx-card hx-card-hover hx-reveal" key={area.slug}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <span className="hx-tile">
                  <Glyph id={area.glyph} />
                </span>
                <div>
                  <h2 className="hx-h3">{area.name}</h2>
                  <p className="hx-small" style={{ marginTop: "0.35rem", fontWeight: 600, color: "var(--hx-fg)" }}>
                    {area.tagline}
                  </p>
                </div>
              </div>
              <p className="hx-small">{area.summary}</p>
              <div className="hx-card-foot">
                <Chips items={area.stack.slice(0, 6).map((entry) => entry.name)} />
                <div style={{ marginTop: "1.1rem" }}>
                  <TextLink href={`/expertise/${area.slug}`}>{area.name} in practice</TextLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <section className="hx-section hx-section-tight">
        <div className="hx-wrap">
          <p className="hx-xs" style={{ marginBottom: "1.1rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
            Every technology named on this site
          </p>
        </div>
        <TechMarquee items={ALL_TECH} />
      </section>

      <Section id="industries" tone="ink">
        <SectionHead
          kicker="Industries"
          title="Sectors our existing work sits in"
          lead="We will not claim deep domain expertise we have not earned. These are the sectors we have delivered in, with the use cases that recur."
        />
        <div className="hx-grid hx-grid-3">
          {INDUSTRIES.map((industry) => (
            <article className="hx-card hx-reveal" key={industry.slug} id={industry.slug}>
              <span className="hx-tile hx-tile-sm">
                <Glyph id={industry.glyph} />
              </span>
              <h3 className="hx-h4">{industry.name}</h3>
              <p className="hx-small">{industry.summary}</p>
              <div className="hx-card-foot">
                <p className="hx-xs" style={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                  Typical work
                </p>
                <Chips items={industry.useCases} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <ClosingCta
        title="Want a second opinion on a technology decision?"
        body="We review architectures and codebases as a fixed-scope engagement. You get a written assessment whether or not you hire us to act on it."
        primary={{ label: "Request a review", href: "/contact" }}
        secondary={{ label: "Book a consultation", href: "/bookings" }}
      />
    </>
  );
}
