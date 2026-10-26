import Link from "next/link";
import { SERVICES } from "@/lib/content/services";
import { SOLUTIONS } from "@/lib/content/solutions";
import { EXPERTISE, INDUSTRIES } from "@/lib/content/expertise";
import { CASE_STUDIES } from "@/lib/content/portfolio";
import { DELIVERY_PROCESS, WHY_HIRELYX } from "@/lib/content/process";
import { TEAM_CERTIFICATIONS } from "@/lib/content/team";
import Glyph from "@/components/site/Glyph";
import HeroVisual from "@/components/site/HeroVisual";
import TeamGrid from "@/components/site/TeamGrid";
import {
  Btn,
  Chips,
  CheckList,
  ClosingCta,
  LinkRows,
  Section,
  SectionHead,
  Stats,
  TechMarquee,
  TextLink,
  WorkCard,
} from "@/components/site/ui";
import { ArrowRight, Check } from "@/components/site/Icons";

/* ==========================================================================
   HIRELYX · HOMEPAGE
   --------------------------------------------------------------------------
   A server component: no client JavaScript other than the shared header,
   footer and the scroll-reveal observer, so the whole page is prerendered
   as markup. The hero visual is inline SVG, which means the largest
   contentful element is text and needs no network request.

   Section order follows the agreed brief:
     A Hero · B Expertise overview · C Why Hirelyx · D Selected work
     E Technical capabilities · F Industries · G Delivery process
     H Team · I Client trust · J Closing CTA
   ========================================================================== */

const HERO_PROOF = [
  "Written scope and fixed quote before work starts",
  "Code and accounts stay in your name",
  "Payments secured through Stripe",
];

const CAPABILITY_STATS = [
  { value: "6", label: "Focused service lines rather than a catalogue" },
  { value: "7", label: "Delivery stages, each with a defined output" },
  { value: "24–48h", label: "Typical time to a first substantive reply" },
  { value: "100%", label: "Code and infrastructure ownership transferred to you" },
];

const FEATURED_WORK = CASE_STUDIES.filter((study) => !study.placeholder).slice(0, 3);

const MARQUEE_TECH = [
  "Python",
  "FastAPI",
  "Pydantic",
  "Pytest",
  "Django",
  "Next.js",
  "React",
  "TypeScript",
  "PostgreSQL",
  "Supabase",
  "Anthropic Claude",
  "OpenAI",
  "LangChain",
  "Model Context Protocol",
  "n8n",
  "Stripe",
  "Docker",
  "WordPress",
  "WooCommerce",
  "Google Analytics 4",
  "Meta Ads",
];

export default function HomePage() {
  return (
    <>
      {/* ── A · HERO ─────────────────────────────────────────────────────── */}
      <section className="hx-hero">
        <div className="hx-hero-bg" aria-hidden />
        <div className="hx-wrap">
          <div className="hx-hero-inner">
            <div>
              <p className="hx-badge" style={{ color: "#bcc5d8" }}>
                <span className="hx-badge-dot" aria-hidden />
                Python · AI engineering · digital growth
              </p>
              <h1>
                We build <em>intelligent digital solutions</em> that move businesses forward.
              </h1>
              <p className="hx-hero-sub">
                From custom software and AI agents to intelligent automation and digital growth,
                Hirelyx helps ambitious businesses turn complex challenges into working systems.
              </p>
              <div className="hx-actions">
                <Btn href="/contact" variant="light" size="lg" arrow>
                  Start Your Project
                </Btn>
                <Btn href="/expertise" variant="outline-light" size="lg">
                  Explore Our Expertise
                </Btn>
              </div>
              <div className="hx-hero-proof">
                {HERO_PROOF.map((item) => (
                  <div key={item}>
                    <Check size={15} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Technology marquee — a quiet bridge out of the hero. */}
      <section className="hx-section hx-section-tight" style={{ paddingBlock: "clamp(1.75rem, 3vw, 2.75rem)" }}>
        <div className="hx-wrap">
          <p className="hx-xs" style={{ marginBottom: "1.1rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
            The stack we work in every day
          </p>
        </div>
        <TechMarquee items={MARQUEE_TECH} />
      </section>

      {/* ── B · EXPERTISE OVERVIEW ───────────────────────────────────────── */}
      <Section id="services" tone="alt" line>
        <SectionHead
          kicker="What we do"
          title="Six service lines, each deep enough to be worth hiring for"
          lead="We would rather be the obvious choice for six things than a plausible option for sixty. Each service has its own page with scope, process, technologies and pricing."
          aside={<TextLink href="/services">Compare all services</TextLink>}
        />

        <div className="hx-grid hx-grid-3">
          {SERVICES.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="hx-card hx-card-link hx-card-hover hx-reveal"
            >
              <span className="hx-tile">
                <Glyph id={service.glyph} />
              </span>
              <h3 className="hx-h3">{service.name}</h3>
              <p className="hx-small">{service.summary}</p>
              <div className="hx-card-foot">
                <Chips items={service.tech.slice(0, 3)} accent />
                <span className="hx-link" style={{ marginTop: "1rem" }}>
                  Service details
                  <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── C · WHY HIRELYX ──────────────────────────────────────────────── */}
      <Section id="why">
        <SectionHead
          kicker="Why Hirelyx"
          title="Advantages you can check, not just read"
          lead="Everything below is either visible in the deliverables or written into the engagement. We have left out the claims we could not back."
        />
        <div className="hx-grid hx-grid-3">
          {WHY_HIRELYX.map((item, i) => (
            <article className="hx-card hx-card-flat hx-reveal" key={item.title}>
              <span className="hx-num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="hx-h4">{item.title}</h3>
              <p className="hx-small">{item.desc}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* ── D · SELECTED WORK ────────────────────────────────────────────── */}
      <Section id="work" tone="ink">
        <SectionHead
          kicker="Selected work"
          title="Projects, with the problem and the approach shown"
          lead="Each case study covers the business problem, what we built, the stack, and the outcome. Where a figure is the client's own reported result rather than something we measured, it says so on the page."
          aside={<TextLink href="/portfolio">View the full portfolio</TextLink>}
        />
        <div className="hx-work">
          {FEATURED_WORK.map((study) => (
            <WorkCard key={study.slug} study={study} />
          ))}
        </div>
      </Section>

      {/* ── E · TECHNICAL CAPABILITIES ───────────────────────────────────── */}
      <Section id="capabilities" tone="alt">
        <SectionHead
          kicker="Technical capabilities"
          title="The technologies we use, and why they serve you"
          lead="Stack choices are made per engagement and written down with their reasoning, so the next team can agree with them or change them knowingly."
          aside={<TextLink href="/expertise">See how we use each one</TextLink>}
        />

        <div className="hx-grid hx-grid-2">
          {EXPERTISE.map((area) => (
            <article className="hx-card hx-card-hover hx-reveal" key={area.slug}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <span className="hx-tile">
                  <Glyph id={area.glyph} />
                </span>
                <div>
                  <h3 className="hx-h3">{area.name}</h3>
                  <p className="hx-small" style={{ marginTop: "0.4rem" }}>
                    {area.summary}
                  </p>
                </div>
              </div>
              <div className="hx-card-foot">
                <Chips items={area.stack.slice(0, 5).map((entry) => entry.name)} />
                <div style={{ marginTop: "1.1rem" }}>
                  <TextLink href={`/expertise/${area.slug}`}>{area.name} in practice</TextLink>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="hx-mt-lg">
          <Stats items={CAPABILITY_STATS} />
        </div>
      </Section>

      {/* ── F · INDUSTRIES & BUSINESS SOLUTIONS ──────────────────────────── */}
      <Section id="industries">
        <SectionHead
          kicker="Industries & solutions"
          title="Framed around the problem, not the technology"
          lead="Clients rarely arrive asking for FastAPI. They arrive with a process that costs too much, a system nobody can change, or growth they cannot measure."
        />

        <LinkRows
          items={SOLUTIONS.map((solution) => ({
            href: `/solutions/${solution.slug}`,
            title: solution.name,
            desc: solution.summary,
          }))}
        />

        <div className="hx-mt-lg">
          <h3 className="hx-h3" style={{ marginBottom: "1.25rem" }}>
            Sectors we work in
          </h3>
          <div className="hx-grid hx-grid-3">
            {INDUSTRIES.map((industry) => (
              <article className="hx-card hx-card-flat hx-reveal" key={industry.slug}>
                <span className="hx-tile hx-tile-sm">
                  <Glyph id={industry.glyph} />
                </span>
                <h4 className="hx-h4">{industry.name}</h4>
                <p className="hx-small">{industry.summary}</p>
                <div className="hx-card-foot">
                  <Chips items={industry.useCases.slice(0, 3)} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {/* ── G · DELIVERY PROCESS ─────────────────────────────────────────── */}
      <Section id="process" tone="alt">
        <SectionHead
          kicker="Our delivery process"
          title="Seven stages, and what you receive at each one"
          lead="A process is only useful if it produces artefacts. Each stage below names its output, so you can tell whether it actually happened."
          aside={<TextLink href="/how-it-works">How we work in detail</TextLink>}
        />

        <ol className="hx-steps">
          {DELIVERY_PROCESS.map((stage, i) => (
            <li key={stage.title} className="hx-step hx-reveal">
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

      {/* ── H · TEAM ─────────────────────────────────────────────────────── */}
      <Section id="team">
        <SectionHead
          kicker="Meet our team"
          title="You will be working with these people directly"
          lead="A small team, which means the person who scopes your project is the person who builds it. No account layer in between."
          aside={<TextLink href="/about">More about Hirelyx</TextLink>}
        />
        <TeamGrid />
      </Section>

      {/* ── I · CLIENT TRUST ─────────────────────────────────────────────── */}
      <Section id="trust" tone="alt">
        <SectionHead
          kicker="Client trust"
          title="What we can actually evidence"
          lead="We publish credentials the team holds and reviews clients have submitted themselves. We do not publish logos, ratings or testimonials we cannot attribute."
        />

        <div className="hx-split hx-split-wide" style={{ alignItems: "start" }}>
          <div className="hx-stack">
            <div className="hx-card">
              <h3 className="hx-h4">Certifications held by the team</h3>
              <p className="hx-small">
                Issued to named team members and listed on their profiles.
              </p>
              <Chips items={TEAM_CERTIFICATIONS} accent />
            </div>

            <div className="hx-card">
              <h3 className="hx-h4">How reviews work here</h3>
              <p className="hx-small">
                Reviews are submitted by clients through their own account in the Hirelyx portal
                and published as they arrive. The reviews page shows whatever has been submitted
                — including when that is nothing yet.
              </p>
              <div className="hx-card-foot">
                <TextLink href="/reviews">Read client reviews</TextLink>
              </div>
            </div>
          </div>

          <div className="hx-panel">
            <h3 className="hx-h4" style={{ marginBottom: "1.1rem" }}>
              Commitments in every engagement
            </h3>
            <CheckList
              items={[
                "A written scope and a fixed quote before any work begins",
                "Payments processed by Stripe — we never hold card details",
                "Code, accounts and documentation delivered in your name",
                "Server-side access control, not hidden interface elements",
                "Clear statement of what is excluded from the scope",
                "A handover session so your team can maintain the work",
              ]}
            />
            <div style={{ marginTop: "1.75rem" }}>
              <Btn href="/how-it-works" variant="secondary" size="sm">
                Read our terms of engagement
              </Btn>
            </div>
          </div>
        </div>
      </Section>

      {/* ── J · CLOSING CTA ──────────────────────────────────────────────── */}
      <ClosingCta />
    </>
  );
}
