import type { Metadata } from "next";
import { TEAM_CERTIFICATIONS } from "@/lib/content/team";
import { WHY_HIRELYX } from "@/lib/content/process";
import { SERVICES } from "@/lib/content/services";
import Glyph from "@/components/site/Glyph";
import JsonLd from "@/components/site/JsonLd";
import TeamGrid from "@/components/site/TeamGrid";
import {
  Breadcrumbs,
  Btn,
  CheckList,
  Chips,
  ClosingCta,
  Section,
  SectionHead,
  TextLink,
} from "@/components/site/ui";
import { breadcrumbSchema, organizationSchema, pageMetadata } from "@/lib/seo";

/* ==========================================================================
   HIRELYX · ABOUT
   The story, values, journey and team. Factual content (the PIAIC origin,
   the pivot from marketplace to services, the year markers) is carried over
   from the previous About page unchanged.
   ========================================================================== */

const CRUMBS = [{ label: "Home", href: "/" }, { label: "About Us" }];

export const metadata: Metadata = pageMetadata({
  title: "About Hirelyx — The Team, the Story, the Way We Work",
  description:
    "Hirelyx is a small digital engineering team: Python and AI engineering, WordPress development and digital marketing. Here is how we started and how we work.",
  path: "/about",
  keywords: ["about hirelyx", "digital engineering team", "software development agency"],
});

const VALUES = [
  {
    glyph: "shield" as const,
    title: "Quality over throughput",
    desc: "We take fewer projects than we could. Every engagement gets tests, a performance pass and a review before it is called finished.",
  },
  {
    glyph: "search" as const,
    title: "Transparent process",
    desc: "Written scope, fixed quote, milestones you can see in the client portal, and a direct line to the people building the work.",
  },
  {
    glyph: "users" as const,
    title: "Client-owned outcomes",
    desc: "Code, infrastructure, accounts and documentation are delivered in your name. If you leave, nothing breaks and nothing needs migrating.",
  },
  {
    glyph: "terminal" as const,
    title: "Current, not fashionable",
    desc: "We use modern tooling where it earns its place and boring tooling where that is the better engineering decision. We will tell you which is which.",
  },
];

const TIMELINE = [
  {
    year: "2024",
    title: "The idea",
    desc: "Started as a PIAIC student project — an ambitious attempt at a global freelance marketplace.",
  },
  {
    year: "2025",
    title: "First launch",
    desc: "Launched on Next.js, Supabase and Stripe, and learned what clients actually wanted from real feedback.",
  },
  {
    year: "2026",
    title: "Pivot to services",
    desc: "Became a professional services team delivering projects directly, rather than brokering other people's work.",
  },
  {
    year: "Now",
    title: "Specialising",
    desc: "Focused on six service lines where we can genuinely be the best option, instead of offering everything.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), breadcrumbSchema(CRUMBS)]} />

      <section className="hx-page-hero hx-page-hero-ink hx-ink">
        <div className="hx-wrap">
          <Breadcrumbs items={CRUMBS} />
          <div className="hx-page-hero-inner">
            <div>
              <p className="hx-kicker">About us</p>
              <h1 className="hx-h1">
                A small engineering team that would rather be specific than impressive.
              </h1>
              <p className="hx-lead" style={{ marginTop: "1.1rem", color: "#dbe3f2" }}>
                Hirelyx builds Python backends, AI agents, MCP servers, WordPress sites and
                measured marketing programmes. Six service lines, three people, and a strong
                preference for saying what we do not do.
              </p>
              <div className="hx-actions" style={{ marginTop: "2rem" }}>
                <Btn href="/contact" variant="light" arrow>
                  Work with us
                </Btn>
                <Btn href="/portfolio" variant="outline-light">
                  See our work
                </Btn>
              </div>
            </div>
            <div className="hx-panel" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="hx-kicker">What stays true in every engagement</p>
              <CheckList
                items={[
                  "Written scope and fixed quote before work begins",
                  "The person who scopes it is the person who builds it",
                  "Code, accounts and documentation delivered in your name",
                  "Measured results rather than asserted ones",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <Section id="story">
        <div className="hx-split">
          <div>
            <p className="hx-kicker">Our story</p>
            <h2 className="hx-h2">We started by building the wrong thing.</h2>
          </div>
          <div className="hx-prose">
            <p>
              Hirelyx began as a student project at PIAIC — an ambitious idea to build a global
              freelance marketplace. We launched it, got real feedback, and learned something
              uncomfortable: what clients wanted was not another marketplace. They wanted a
              team they could trust to take a project from start to finish.
            </p>
            <p>
              So we pivoted. Today Hirelyx is a services team that combines the pace of a small
              studio with the discipline of an engineering organisation — written scopes,
              tested code, measured performance, and documentation at handover.
            </p>
            <p>
              The platform we built along the way did not go to waste. It is now the client
              portal our customers use for project status, files, messages and invoices, and it
              is the first case study in our portfolio.
            </p>
            <p>
              <strong>What we deliberately do not do:</strong> we are not a design studio, we do
              not do mobile app development, and we do not take on work in languages or
              frameworks we have not shipped in. When a request falls outside the six services
              on this site, we say so and, where we can, point you somewhere better.
            </p>
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section id="values" tone="alt">
        <SectionHead
          kicker="Our values"
          title="Four things that actually change how we work"
          lead="Not posters. Each one has a consequence you would notice as a client."
        />
        <div className="hx-grid hx-grid-4">
          {VALUES.map((value) => (
            <article className="hx-card hx-reveal" key={value.title}>
              <span className="hx-tile hx-tile-sm">
                <Glyph id={value.glyph} />
              </span>
              <h3 className="hx-h4">{value.title}</h3>
              <p className="hx-small">{value.desc}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* Journey */}
      <Section id="journey">
        <SectionHead
          kicker="Our journey"
          title="How we got here"
          lead="Short, because we have not been going long. We would rather say that than imply otherwise."
        />
        <ol className="hx-steps">
          {TIMELINE.map((item) => (
            <li className="hx-step hx-reveal" key={item.year}>
              <span className="hx-step-no">{item.year}</span>
              <div className="hx-step-body">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Team */}
      <Section id="team" tone="alt">
        <SectionHead
          kicker="The team"
          title="Three people, named and reachable"
          lead="Small enough that you will know exactly who is doing what on your project."
        />
        <TeamGrid />
        <div className="hx-mt-lg">
          <div className="hx-card hx-card-flat">
            <h3 className="hx-h4">Certifications held across the team</h3>
            <p className="hx-small">
              Issued to the named individuals above. We do not list company-level accreditations,
              because we do not hold any.
            </p>
            <Chips items={TEAM_CERTIFICATIONS} accent />
          </div>
        </div>
      </Section>

      {/* Why Hirelyx */}
      <Section id="why" tone="ink">
        <SectionHead
          kicker="Why clients choose us"
          title="Reasons you can verify"
          lead="Each of these is either visible in the deliverables or written into the engagement terms."
        />
        <div className="hx-grid hx-grid-3">
          {WHY_HIRELYX.map((item, i) => (
            <article className="hx-card hx-reveal" key={item.title}>
              <span className="hx-num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="hx-h4">{item.title}</h3>
              <p className="hx-small">{item.desc}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* Services cross-link */}
      <Section>
        <SectionHead
          kicker="What we do"
          title="Six service lines"
          aside={<TextLink href="/services">Compare all services</TextLink>}
        />
        <div className="hx-grid hx-grid-3">
          {SERVICES.map((service) => (
            <article className="hx-card hx-card-flat hx-reveal" key={service.slug}>
              <span className="hx-tile hx-tile-sm">
                <Glyph id={service.glyph} />
              </span>
              <h3 className="hx-h4">{service.name}</h3>
              <p className="hx-small">{service.tagline}</p>
              <div className="hx-card-foot">
                <Btn href={`/services/${service.slug}`} variant="secondary" size="sm" className="hx-btn-block">
                  {service.name}
                </Btn>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <ClosingCta
        title="Think we might be a fit?"
        body="Send us the problem rather than a specification. We will tell you what we would do, what it would cost, and whether you should be talking to someone else instead."
      />
    </>
  );
}
