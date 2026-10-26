import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES } from "@/lib/content/services";
import { SOLUTIONS } from "@/lib/content/solutions";
import { DELIVERY_PROCESS } from "@/lib/content/process";
import Glyph from "@/components/site/Glyph";
import JsonLd from "@/components/site/JsonLd";
import {
  Breadcrumbs,
  Btn,
  CheckList,
  Chips,
  ClosingCta,
  LinkRows,
  Section,
  SectionHead,
  Steps,
  TextLink,
} from "@/components/site/ui";
import { ArrowRight } from "@/components/site/Icons";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

const CRUMBS = [{ label: "Home", href: "/" }, { label: "Services" }];

export const metadata: Metadata = pageMetadata({
  title: "Services — Python, AI Engineering & Digital Growth",
  description:
    "Six Hirelyx service lines: Python development, WordPress development, digital marketing, custom AI agents, MCP server development and prompt engineering.",
  path: "/services",
  keywords: [
    "python development services",
    "wordpress development services",
    "digital marketing services",
    "custom ai agent development",
    "mcp server development",
    "prompt engineering services",
  ],
});

export default function ServicesIndexPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(CRUMBS)} />

      <section className="hx-page-hero">
        <div className="hx-wrap">
          <Breadcrumbs items={CRUMBS} />
          <div style={{ marginTop: "1.5rem", maxWidth: "52rem" }}>
            <p className="hx-kicker">Our services</p>
            <h1 className="hx-h1">
              Everything you need to build, automate and grow — and nothing you don&apos;t.
            </h1>
            <p className="hx-lead" style={{ marginTop: "1.1rem" }}>
              Six service lines, each with its own page covering scope, deliverables, the
              technologies involved, our process and current pricing. If your problem does not
              fit one of them, we will say so rather than stretch to fit.
            </p>
            <div className="hx-actions" style={{ marginTop: "2rem" }}>
              <Btn href="/contact" arrow>
                Get a proposal
              </Btn>
              <Btn href="/how-it-works" variant="secondary">
                See how we work
              </Btn>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed service cards */}
      <Section tone="alt">
        <div className="hx-grid hx-grid-2">
          {SERVICES.map((service) => (
            <article className="hx-card hx-card-hover hx-reveal" key={service.slug}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <span className="hx-tile">
                  <Glyph id={service.glyph} />
                </span>
                <div>
                  <h2 className="hx-h3">{service.name}</h2>
                  <p className="hx-small" style={{ marginTop: "0.35rem", fontWeight: 600, color: "var(--hx-fg)" }}>
                    {service.tagline}
                  </p>
                </div>
              </div>

              <p className="hx-small">{service.summary}</p>

              <div style={{ marginTop: "0.5rem" }}>
                <p className="hx-xs" style={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                  What you get
                </p>
                <CheckList items={service.deliverables.slice(0, 4)} />
              </div>

              <div className="hx-card-foot">
                <Chips items={service.tech.slice(0, 5)} />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    marginTop: "1.25rem",
                    paddingTop: "1.25rem",
                    borderTop: "1px solid var(--hx-border)",
                  }}
                >
                  <span className="hx-xs">
                    {service.tiers
                      ? `From ${service.tiers[0].price} ${service.tiers[0].period}`
                      : "Quoted per engagement"}
                  </span>
                  <Link className="hx-btn hx-btn-secondary hx-btn-sm" href={`/services/${service.slug}`}>
                    Service details
                    <ArrowRight size={15} className="hx-btn-arrow" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Process */}
      <Section>
        <SectionHead
          kicker="How delivery runs"
          title="The same seven stages, whichever service you buy"
          lead="The work differs. The way it is scoped, demonstrated, tested and handed over does not."
          aside={<TextLink href="/how-it-works">Full process detail</TextLink>}
        />
        <Steps steps={DELIVERY_PROCESS} />
      </Section>

      {/* Solutions cross-link */}
      <Section tone="alt">
        <SectionHead
          kicker="Prefer to start from the problem?"
          title="Solutions, framed the way clients describe them"
          lead="If you know the outcome you need but not the service that produces it, start here instead."
        />
        <LinkRows
          items={SOLUTIONS.map((solution) => ({
            href: `/solutions/${solution.slug}`,
            title: solution.name,
            desc: solution.summary,
          }))}
        />
      </Section>

      <ClosingCta
        title="Not sure which service you need?"
        body="Describe the problem in a couple of sentences. We will tell you which service fits, what it would involve, and whether it is worth doing now."
        primary={{ label: "Get a proposal", href: "/contact" }}
        secondary={{ label: "Book a consultation", href: "/bookings" }}
      />
    </>
  );
}
