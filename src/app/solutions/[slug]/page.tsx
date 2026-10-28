import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SOLUTIONS, getSolution } from "@/lib/content/solutions";
import { servicesBySlug } from "@/lib/content/services";
import { DELIVERY_PROCESS } from "@/lib/content/process";
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
  Section,
  SectionHead,
  Steps,
} from "@/components/site/ui";
import { breadcrumbSchema, faqSchema, pageMetadata, serviceSchema } from "@/lib/seo";

export function generateStaticParams() {
  return SOLUTIONS.map((solution) => ({ slug: solution.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) return {};
  return pageMetadata({
    title: solution.metaTitle,
    description: solution.metaDescription,
    path: `/solutions/${solution.slug}`,
    keywords: solution.keywords,
  });
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Solutions", href: "/solutions" },
    { label: solution.name },
  ];
  const services = servicesBySlug(solution.services);

  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: solution.title,
            description: solution.metaDescription,
            path: `/solutions/${solution.slug}`,
            serviceType: solution.name,
          }),
          breadcrumbSchema(crumbs),
          faqSchema(solution.faqs),
        ]}
      />

      <section className="hx-page-hero hx-page-hero-ink hx-ink">
        <div className="hx-wrap">
          <Breadcrumbs items={crumbs} />
          <div className="hx-page-hero-inner">
            <div>
              <span className="hx-tile" style={{ marginBottom: "1.5rem" }}>
                <Glyph id={solution.glyph} />
              </span>
              <h1 className="hx-h1">{solution.title}</h1>
              <p className="hx-lead" style={{ marginTop: "1rem", fontWeight: 500, color: "#dbe3f2" }}>
                {solution.tagline}
              </p>
              <p className="hx-body" style={{ marginTop: "1rem", maxWidth: "54ch" }}>
                {solution.summary}
              </p>
              <div className="hx-actions" style={{ marginTop: "2rem" }}>
                <Btn href="/contact" variant="light" arrow>
                  Start a conversation
                </Btn>
                <Btn href="/bookings" variant="outline-light">
                  Book a consultation
                </Btn>
              </div>
            </div>

            <div className="hx-panel" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="hx-kicker">What changes</p>
              <CheckList items={solution.outcomes} />
            </div>
          </div>
        </div>
      </section>

      {/* The problem */}
      <Section id="problem">
        <div className="hx-split">
          <div>
            <p className="hx-kicker">The problem</p>
            <h2 className="hx-h2">Why this keeps happening</h2>
            <div className="hx-prose" style={{ marginTop: "1.4rem" }}>
              {solution.problem.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="hx-card hx-card-flat">
            <p className="hx-kicker">Technologies involved</p>
            <Chips items={solution.tech} />
            <div className="hx-card-foot">
              <p className="hx-xs">
                Chosen per engagement. We will explain any choice you want to question.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Approach */}
      <Section id="approach" tone="alt">
        <SectionHead
          kicker="Our approach"
          title="How we work through it"
          lead="Four principles that shape every engagement of this kind."
        />
        <div className="hx-rows">
          {solution.approach.map((step, i) => (
            <div className="hx-row hx-reveal" key={step.title} style={{ cursor: "default" }}>
              <span className="hx-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <span />
            </div>
          ))}
        </div>
      </Section>

      {/* Delivering services */}
      <Section id="services">
        <SectionHead
          kicker="Delivered by"
          title="The services that produce this outcome"
          lead="Most engagements of this type combine two or three of them."
        />
        <div className="hx-grid hx-grid-3">
          {services.map((service) => (
            <article className="hx-card hx-card-hover hx-reveal" key={service.slug}>
              <span className="hx-tile hx-tile-sm">
                <Glyph id={service.glyph} />
              </span>
              <h3 className="hx-h4">{service.name}</h3>
              <p className="hx-small">{service.summary}</p>
              <div className="hx-card-foot">
                <Btn href={`/services/${service.slug}`} variant="secondary" size="sm" className="hx-btn-block">
                  {service.name}
                </Btn>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Delivery */}
      <Section id="process" tone="ink">
        <SectionHead
          kicker="Delivery"
          title="Seven stages, each with a defined output"
          lead="Whatever the solution, the engagement runs through the same stages — so you always know what should exist by now."
        />
        <Steps steps={DELIVERY_PROCESS} />
      </Section>

      {/* FAQ */}
      <Section id="faq" tone="alt">
        <div className="hx-split">
          <div>
            <p className="hx-kicker">Questions</p>
            <h2 className="hx-h2">Frequently asked</h2>
            <p className="hx-lead" style={{ marginTop: "1rem" }}>
              Including the ones where the honest answer is &ldquo;you may not need this&rdquo;.
            </p>
          </div>
          <FaqAccordion items={solution.faqs} />
        </div>
      </Section>

      <Section>
        <SectionHead kicker="Other solutions" title="Related outcomes" />
        <LinkRows
          items={SOLUTIONS.filter((item) => item.slug !== solution.slug).map((item) => ({
            href: `/solutions/${item.slug}`,
            title: item.name,
            desc: item.summary,
          }))}
        />
      </Section>

      <ClosingCta
        title={`Let's talk about ${solution.name.toLowerCase()}.`}
        body="Describe the process or the goal. We will come back with what it would take, what it would cost, and what we would do first."
      />
    </>
  );
}
