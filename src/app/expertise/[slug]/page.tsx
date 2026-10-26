import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EXPERTISE, getExpertise } from "@/lib/content/expertise";
import { servicesBySlug } from "@/lib/content/services";
import Glyph from "@/components/site/Glyph";
import JsonLd from "@/components/site/JsonLd";
import {
  Breadcrumbs,
  Btn,
  Chips,
  ClosingCta,
  LinkRows,
  PairCards,
  Section,
  SectionHead,
} from "@/components/site/ui";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

/* Stable anchor ids for each stack entry, so the mega menu can deep-link
   (for example /expertise/fastapi#pydantic-models). */
function anchorId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateStaticParams() {
  return EXPERTISE.map((area) => ({ slug: area.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = getExpertise(slug);
  if (!area) return {};
  return pageMetadata({
    title: area.metaTitle,
    description: area.metaDescription,
    path: `/expertise/${area.slug}`,
    keywords: area.keywords,
  });
}

export default async function ExpertisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = getExpertise(slug);
  if (!area) notFound();

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Expertise", href: "/expertise" },
    { label: area.name },
  ];
  const services = servicesBySlug(area.services);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <section className="hx-page-hero">
        <div className="hx-wrap">
          <Breadcrumbs items={crumbs} />
          <div className="hx-page-hero-inner">
            <div>
              <span className="hx-tile" style={{ marginBottom: "1.5rem" }}>
                <Glyph id={area.glyph} />
              </span>
              <h1 className="hx-h1">{area.title}</h1>
              <p className="hx-lead" style={{ marginTop: "1rem", fontWeight: 500, color: "var(--hx-fg)" }}>
                {area.tagline}
              </p>
              <p className="hx-body" style={{ marginTop: "1rem", maxWidth: "54ch" }}>
                {area.summary}
              </p>
              <div className="hx-actions" style={{ marginTop: "2rem" }}>
                <Btn href="/contact" arrow>
                  Talk to an engineer
                </Btn>
                <Btn href="/portfolio" variant="secondary">
                  See delivered work
                </Btn>
              </div>
            </div>
            <div className="hx-card">
              <p className="hx-kicker">In this stack</p>
              <Chips items={area.stack.map((entry) => entry.name)} accent />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stack, with the reason for each choice ─────────────────────── */}
      <Section id="stack" tone="alt">
        <SectionHead
          kicker="The stack"
          title="What we use, and what each one buys you"
          lead="Written as a reason rather than a feature list, because the reason is what tells you whether it applies to your project."
        />
        <div className="hx-rows">
          {area.stack.map((entry, i) => (
            <div
              className="hx-row hx-reveal"
              key={entry.name}
              id={anchorId(entry.name)}
              style={{ cursor: "default" }}
            >
              <span className="hx-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{entry.name}</h3>
              <p>{entry.note}</p>
              <span />
            </div>
          ))}
        </div>
      </Section>

      {/* ── What we build with it ──────────────────────────────────────── */}
      <Section id="applications">
        <SectionHead
          kicker="Applied"
          title="What this expertise produces"
          lead="The kinds of systems this area of the stack is actually used to build."
        />
        <PairCards items={area.applications} glyph={area.glyph} columns={2} />
      </Section>

      {/* ── Services ───────────────────────────────────────────────────── */}
      <Section id="services" tone="ink">
        <SectionHead
          kicker="Where it is applied"
          title="Services built on this expertise"
        />
        <LinkRows
          items={services.map((service) => ({
            href: `/services/${service.slug}`,
            title: service.name,
            desc: service.summary,
          }))}
        />
      </Section>

      {/* ── Other areas ────────────────────────────────────────────────── */}
      <Section>
        <SectionHead kicker="Also in our stack" title="Other expertise areas" />
        <div className="hx-grid hx-grid-3">
          {EXPERTISE.filter((item) => item.slug !== area.slug).map((item) => (
            <article className="hx-card hx-card-flat hx-reveal" key={item.slug}>
              <span className="hx-tile hx-tile-sm">
                <Glyph id={item.glyph} />
              </span>
              <h3 className="hx-h4">{item.name}</h3>
              <p className="hx-small">{item.tagline}</p>
              <div className="hx-card-foot">
                <Btn href={`/expertise/${item.slug}`} variant="secondary" size="sm" className="hx-btn-block">
                  {item.name}
                </Btn>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <ClosingCta
        title="Have a project that needs this?"
        body="Tell us what you are building and where it is getting difficult. You will get a straight technical answer before any commercial conversation."
      />
    </>
  );
}
