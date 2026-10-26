import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SERVICES, getService } from "@/lib/content/services";
import { solutionsBySlug } from "@/lib/content/solutions";
import { caseStudiesBySlug } from "@/lib/content/portfolio";
import Glyph from "@/components/site/Glyph";
import JsonLd from "@/components/site/JsonLd";
import { FaqAccordion } from "@/components/site/interactive";
import {
  Breadcrumbs,
  Btn,
  CheckList,
  Chips,
  ClosingCta,
  LinkRows,
  PairCards,
  Section,
  SectionHead,
  Steps,
  SubNav,
  Tiers,
  WorkCard,
} from "@/components/site/ui";
import { Check } from "@/components/site/Icons";
import { breadcrumbSchema, faqSchema, pageMetadata, serviceSchema } from "@/lib/seo";

/* ==========================================================================
   HIRELYX · SERVICE DETAIL
   --------------------------------------------------------------------------
   One statically generated page per entry in lib/content/services.ts, with
   per-page metadata, breadcrumbs and Service + FAQPage structured data.

   Previously this route was a client component with `useParams` and no
   metadata export, so none of the six service pages had a unique title,
   description or canonical URL. That is the main SEO change here.
   ========================================================================== */

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return pageMetadata({
    title: service.metaTitle,
    description: service.metaDescription,
    path: `/services/${service.slug}`,
    keywords: service.keywords,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: service.name },
  ];

  const work = caseStudiesBySlug(service.relatedWork);
  const solutions = solutionsBySlug(service.relatedSolutions);

  const anchors = [
    { id: "overview", label: "Overview" },
    { id: "problems", label: "Problems we solve" },
    { id: "capabilities", label: "Capabilities" },
    { id: "process", label: "Process" },
    ...(work.length > 0 ? [{ id: "work", label: "Related work" }] : []),
    { id: service.tiers ? "pricing" : "engagements", label: service.tiers ? "Pricing" : "Engagements" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: service.title,
            description: service.metaDescription,
            path: `/services/${service.slug}`,
            serviceType: service.name,
          }),
          breadcrumbSchema(crumbs),
          faqSchema(service.faqs),
        ]}
      />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="hx-page-hero hx-page-hero-ink hx-ink">
        <div className="hx-wrap">
          <Breadcrumbs items={crumbs} />
          <div className="hx-page-hero-inner">
            <div>
              <span className="hx-tile" style={{ marginBottom: "1.5rem" }}>
                <Glyph id={service.glyph} />
              </span>
              <h1 className="hx-h1">{service.title}</h1>
              <p className="hx-lead" style={{ marginTop: "1rem", fontWeight: 500, color: "#dbe3f2" }}>
                {service.tagline}
              </p>
              <p className="hx-body" style={{ marginTop: "1rem", maxWidth: "54ch" }}>
                {service.summary}
              </p>
              <div className="hx-actions" style={{ marginTop: "2rem" }}>
                <Btn href="/contact" variant="light" arrow>
                  Get a proposal
                </Btn>
                <Btn href="/bookings" variant="outline-light">
                  Book a consultation
                </Btn>
              </div>
            </div>

            <div className="hx-panel" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="hx-kicker">What you receive</p>
              <CheckList items={service.deliverables} />
            </div>
          </div>
        </div>
      </section>

      <SubNav items={anchors} />

      {/* ── Overview ───────────────────────────────────────────────────── */}
      <Section id="overview">
        <div className="hx-split">
          <div>
            <p className="hx-kicker">Overview</p>
            <h2 className="hx-h2">{service.tagline}</h2>
            <div className="hx-prose" style={{ marginTop: "1.4rem" }}>
              {service.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="hx-card hx-card-flat">
            <p className="hx-kicker">Technologies</p>
            <Chips items={service.tech} />
            <div className="hx-card-foot">
              <p className="hx-xs">
                Each choice is made per engagement and written down with its reasoning.
              </p>
              <div style={{ marginTop: "1rem" }}>
                <Btn href="/expertise" variant="secondary" size="sm">
                  How we use these
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Problems ───────────────────────────────────────────────────── */}
      <Section id="problems" tone="alt">
        <SectionHead
          kicker="Problems we solve"
          title="What usually brings people to this service"
          lead="If one of these describes your situation, this is the right page."
        />
        <div className="hx-rows">
          {service.problems.map((problem, i) => (
            <div className="hx-row hx-reveal" key={problem.title} style={{ cursor: "default" }}>
              <span className="hx-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{problem.title}</h3>
              <p>{problem.desc}</p>
              <span />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Capabilities ───────────────────────────────────────────────── */}
      <Section id="capabilities">
        <SectionHead
          kicker="Capabilities"
          title={`What ${service.name.toLowerCase()} covers at Hirelyx`}
          lead="Concrete capabilities rather than adjectives. Anything not listed here, we will tell you we do not do."
        />
        <PairCards items={service.capabilities} columns={3} />
      </Section>

      {/* ── Process ────────────────────────────────────────────────────── */}
      <Section id="process" tone="ink">
        <SectionHead
          kicker="Process"
          title={`How a ${service.name.toLowerCase()} engagement runs`}
          lead="Specific to this service. The wider seven-stage delivery process wraps around it."
        />
        <Steps steps={service.process} />
      </Section>

      {/* ── Related work ───────────────────────────────────────────────── */}
      {work.length > 0 ? (
        <Section id="work" tone="alt">
          <SectionHead
            kicker="Related work"
            title="Where this service has been applied"
            lead="Entries marked as a content placeholder are reserved for projects whose details are not yet published."
          />
          <div className="hx-work">
            {work.map((study) => (
              <WorkCard key={study.slug} study={study} />
            ))}
          </div>
        </Section>
      ) : null}

      {/* ── Pricing or engagement models ───────────────────────────────── */}
      {service.tiers ? (
        <Section id="pricing">
          <SectionHead
            kicker="Pricing"
            title="Current pricing for this service"
            lead={
              service.pricingNote ??
              "Indicative tiers. The final scope and a fixed quote are confirmed in writing after discovery — nothing starts on an estimate."
            }
          />
          <Tiers tiers={service.tiers} />
        </Section>
      ) : (
        <Section id="engagements">
          <SectionHead
            kicker="Engagements"
            title="How this work is scoped and quoted"
            lead={service.pricingNote}
          />
          <div className="hx-grid hx-grid-3">
            {service.engagements?.map((model, i) => (
              <article className="hx-card hx-reveal" key={model.title}>
                <span className="hx-num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="hx-h4">{model.title}</h3>
                <p className="hx-small">{model.desc}</p>
                <div className="hx-card-foot">
                  <Btn href="/contact" variant="secondary" size="sm" className="hx-btn-block">
                    Discuss this
                  </Btn>
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <Section id="faq" tone="alt">
        <div className="hx-split">
          <div>
            <p className="hx-kicker">Questions</p>
            <h2 className="hx-h2">Frequently asked</h2>
            <p className="hx-lead" style={{ marginTop: "1rem" }}>
              The questions we are actually asked about {service.name.toLowerCase()}, answered
              without hedging.
            </p>
            <div style={{ marginTop: "1.75rem" }}>
              <Btn href="/contact" variant="secondary" size="sm">
                Ask something else
              </Btn>
            </div>
          </div>
          <FaqAccordion items={service.faqs} />
        </div>
      </Section>

      {/* ── Related solutions ──────────────────────────────────────────── */}
      {solutions.length > 0 ? (
        <Section>
          <SectionHead
            kicker="Related solutions"
            title="Outcomes this service contributes to"
          />
          <LinkRows
            items={solutions.map((solution) => ({
              href: `/solutions/${solution.slug}`,
              title: solution.name,
              desc: solution.summary,
            }))}
          />
          <p className="hx-small hx-mt-lg">
            Or browse{" "}
            <Link href="/services" style={{ color: "var(--hx-accent)", fontWeight: 600 }}>
              all six services
            </Link>
            .
          </p>
        </Section>
      ) : null}

      <ClosingCta
        title={`Ready to talk about ${service.name.toLowerCase()}?`}
        body="Tell us where you are now and what needs to be true in three months. You will get a written scope and a fixed quote before anything starts."
      />

      <div className="hx-wrap" style={{ paddingBottom: "2rem" }}>
        <p className="hx-xs" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Check size={14} />
          Prices shown exclude third-party costs such as hosting, model API usage and
          advertising spend, which are paid directly by you.
        </p>
      </div>
    </>
  );
}
