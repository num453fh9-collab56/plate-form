import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASE_STUDIES, getCaseStudy } from "@/lib/content/portfolio";
import { servicesBySlug } from "@/lib/content/services";
import JsonLd from "@/components/site/JsonLd";
import {
  Breadcrumbs,
  Btn,
  Chips,
  ClosingCta,
  GeneratedCover,
  LinkRows,
  Section,
  SectionHead,
  Steps,
  WorkCard,
} from "@/components/site/ui";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

/* ==========================================================================
   HIRELYX · CASE STUDY TEMPLATE
   --------------------------------------------------------------------------
   Reusable for every entry in lib/content/portfolio.ts — adding a project
   means adding a record, not a page.

   Placeholder entries render a prominent notice and omit the results block
   entirely, so an unfinished case study can never read as a delivered claim.
   ========================================================================== */

export function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  const meta = pageMetadata({
    title: `${study.title} — Case Study`,
    description: study.summary,
    path: `/portfolio/${study.slug}`,
    type: "article",
    ...(study.image ? { image: study.image } : {}),
  });
  /* Reserved placeholder entries stay out of the index until real project
     detail replaces them — thin pages help nobody, least of all the client. */
  return study.placeholder ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: study.title },
  ];
  const services = servicesBySlug(study.services);
  const related = CASE_STUDIES.filter(
    (item) => item.slug !== study.slug && item.category === study.category,
  ).slice(0, 3);
  const more = related.length > 0
    ? related
    : CASE_STUDIES.filter((item) => item.slug !== study.slug && !item.placeholder).slice(0, 3);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <section className="hx-page-hero hx-page-hero-ink hx-ink">
        <div className="hx-wrap">
          <Breadcrumbs items={crumbs} />
          <div className="hx-page-hero-inner">
            <div>
              <p className="hx-kicker">{study.category}</p>
              <h1 className="hx-h1">{study.title}</h1>
              <p className="hx-lead" style={{ marginTop: "1rem", color: "#dbe3f2" }}>
                {study.summary}
              </p>

              {study.placeholder ? (
                <p
                  className="hx-badge"
                  style={{ marginTop: "1.75rem", borderStyle: "dashed", color: "#e2e8f5" }}
                >
                  Content placeholder — project detail not yet published
                </p>
              ) : null}

              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
                  gap: "1.25rem",
                  margin: "2rem 0 0",
                  paddingTop: "1.75rem",
                  borderTop: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div>
                  <dt className="hx-xs" style={{ textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
                    Client
                  </dt>
                  <dd style={{ margin: "0.3rem 0 0", fontSize: "0.95rem", color: "#e7ecf6" }}>{study.client}</dd>
                </div>
                <div>
                  <dt className="hx-xs" style={{ textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
                    Year
                  </dt>
                  <dd style={{ margin: "0.3rem 0 0", fontSize: "0.95rem", color: "#e7ecf6" }}>{study.year}</dd>
                </div>
                <div>
                  <dt className="hx-xs" style={{ textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
                    Services
                  </dt>
                  <dd style={{ margin: "0.3rem 0 0", fontSize: "0.95rem", color: "#e7ecf6" }}>
                    {services.map((service) => service.name).join(", ")}
                  </dd>
                </div>
              </dl>
            </div>

            <div
              className="hx-work-media"
              style={{ borderRadius: "var(--hx-r-lg)", border: "1px solid rgba(255,255,255,0.14)" }}
            >
              {study.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={study.image}
                  alt={`Illustration representing the ${study.title} project`}
                  width={960}
                  height={600}
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <GeneratedCover title={study.title} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Results ────────────────────────────────────────────────────── */}
      {study.results.length > 0 ? (
        <section className="hx-section hx-section-tight">
          <div className="hx-wrap">
            <div className="hx-stats">
              {study.results.map((result) => (
                <div className="hx-stat" key={result.label}>
                  <b>{result.value}</b>
                  <span>{result.label}</span>
                </div>
              ))}
            </div>
            <p className="hx-xs" style={{ marginTop: "1rem" }}>
              Figures as reported by the client at the end of the engagement. Hirelyx has not
              independently audited them.
            </p>
          </div>
        </section>
      ) : null}

      {/* ── Challenge & solution ───────────────────────────────────────── */}
      <Section id="challenge" tone="alt">
        <div className="hx-split">
          <div>
            <p className="hx-kicker">The challenge</p>
            <h2 className="hx-h2">What was actually wrong</h2>
            <div className="hx-prose" style={{ marginTop: "1.4rem" }}>
              {study.challenge.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="hx-kicker">The solution</p>
            <h2 className="hx-h2">What we built</h2>
            <div className="hx-prose" style={{ marginTop: "1.4rem" }}>
              {study.solution.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Implementation ─────────────────────────────────────────────── */}
      <Section id="approach">
        <SectionHead
          kicker="Implementation"
          title="How the work was carried out"
          lead="The sequence that mattered, including the decisions that prevented later rework."
          aside={
            <div>
              <p className="hx-kicker">Technology stack</p>
              <Chips items={study.tech} accent />
            </div>
          }
        />
        <Steps steps={study.approach} />
      </Section>

      {/* ── Outcome ────────────────────────────────────────────────────── */}
      {study.outcome.length > 0 ? (
        <Section id="outcome" tone="ink" tight>
          <div className="hx-wrap-narrow" style={{ marginInline: "auto" }}>
            <p className="hx-kicker">Outcome</p>
            <div className="hx-prose">
              {study.outcome.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} style={{ fontSize: "var(--hx-t-lead)", lineHeight: 1.6 }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      {/* ── Screens ────────────────────────────────────────────────────── */}
      {study.screens.length > 0 ? (
        <Section id="screens" tone="alt" tight>
          <SectionHead kicker="Visuals" title="Project visuals" />
          <div className="hx-grid hx-grid-2">
            {study.screens.map((screen) => (
              <figure key={screen.src} style={{ margin: 0 }}>
                <div className="hx-work-media" style={{ borderRadius: "var(--hx-r-lg)", border: "1px solid var(--hx-border)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={screen.src} alt={screen.alt} width={960} height={600} loading="lazy" decoding="async" />
                </div>
                <figcaption className="hx-xs" style={{ marginTop: "0.65rem" }}>
                  {screen.alt}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ── Services used ──────────────────────────────────────────────── */}
      <Section id="services" tight>
        <SectionHead kicker="Services delivered" title="What this project drew on" />
        <LinkRows
          items={services.map((service) => ({
            href: `/services/${service.slug}`,
            title: service.name,
            desc: service.summary,
          }))}
        />
      </Section>

      {/* ── More work ──────────────────────────────────────────────────── */}
      {more.length > 0 ? (
        <Section tone="alt">
          <SectionHead kicker="More work" title="Other projects" />
          <div className="hx-work">
            {more.map((item) => (
              <WorkCard key={item.slug} study={item} />
            ))}
          </div>
          <div className="hx-mt-lg">
            <Btn href="/portfolio" variant="secondary">
              Back to portfolio
            </Btn>
          </div>
        </Section>
      ) : null}

      <ClosingCta
        title="Want something like this for your business?"
        body="Tell us where you are now. You will get a written scope, a fixed quote and an honest answer about whether this is the right next step."
      />
    </>
  );
}
