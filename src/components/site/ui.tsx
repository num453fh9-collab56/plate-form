import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "./Icons";
import Glyph from "./Glyph";
import type { CaseStudy, GlyphId, Pair, Step, Tier } from "@/lib/content/types";

/* ==========================================================================
   HIRELYX · SHARED PAGE PRIMITIVES
   --------------------------------------------------------------------------
   Server components only — no hooks, no client bundle. Interactive pieces
   (accordions, filters, scroll reveal) live in ./interactive.tsx.
   ========================================================================== */

/* ── Layout ─────────────────────────────────────────────────────────────── */

export function Section({
  children,
  id,
  tone = "default",
  tight,
  line,
  className,
}: {
  children: ReactNode;
  id?: string;
  tone?: "default" | "alt" | "ink";
  tight?: boolean;
  line?: boolean;
  className?: string;
}) {
  const classes = [
    "hx-section",
    tone === "alt" ? "hx-section-alt" : "",
    tone === "ink" ? "hx-ink" : "",
    tight ? "hx-section-tight" : "",
    line ? "hx-section-line" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <section id={id} className={classes}>
      <div className="hx-wrap">{children}</div>
    </section>
  );
}

export function SectionHead({
  kicker,
  title,
  lead,
  center,
  as: As = "h2",
  aside,
}: {
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
  center?: boolean;
  as?: "h1" | "h2";
  aside?: ReactNode;
}) {
  const head = (
    <div className={"hx-head" + (center ? " hx-head-center" : "")}>
      {kicker ? <p className="hx-kicker">{kicker}</p> : null}
      {As === "h1" ? <h1 className="hx-h1">{title}</h1> : <h2 className="hx-h2">{title}</h2>}
      {lead ? <p className="hx-lead">{lead}</p> : null}
    </div>
  );
  if (!aside) return head;
  return (
    <div className="hx-head-split">
      {head}
      <div>{aside}</div>
    </div>
  );
}

/* ── Buttons & links ────────────────────────────────────────────────────── */

type BtnVariant = "primary" | "secondary" | "light" | "outline-light";

export function Btn({
  href,
  children,
  variant = "primary",
  size,
  arrow,
  className,
  external,
}: {
  href: string;
  children: ReactNode;
  variant?: BtnVariant;
  size?: "sm" | "lg";
  arrow?: boolean;
  className?: string;
  external?: boolean;
}) {
  const classes = [
    "hx-btn",
    variant === "secondary" ? "hx-btn-secondary" : "",
    variant === "light" ? "hx-btn-light" : "",
    variant === "outline-light" ? "hx-btn-outline-light" : "",
    size === "sm" ? "hx-btn-sm" : "",
    size === "lg" ? "hx-btn-lg" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      {children}
      {arrow ? <ArrowRight className="hx-btn-arrow" /> : null}
    </>
  );

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a className={classes} href={href} rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <Link className={classes} href={href}>
      {inner}
    </Link>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="hx-link" href={href}>
      {children}
      <ArrowRight size={15} />
    </Link>
  );
}

/* ── Breadcrumbs ────────────────────────────────────────────────────────── */

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="hx-crumbs">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} {...(last ? { "aria-current": "page" as const } : {})}>
              {item.href && !last ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
              {!last ? (
                <span className="hx-crumbs-sep" aria-hidden>
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── Content blocks ─────────────────────────────────────────────────────── */

export function Chips({ items, accent }: { items: readonly string[]; accent?: boolean }) {
  return (
    <ul className="hx-chips" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {items.map((item) => (
        <li key={item} className={"hx-chip" + (accent ? " hx-chip-accent" : "")}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function CheckList({ items, columns }: { items: readonly string[]; columns?: boolean }) {
  return (
    <ul className={"hx-checks" + (columns ? " hx-checks-2" : "")}>
      {items.map((item) => (
        <li key={item}>
          <Check />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PairCards({
  items,
  glyph,
  columns = 3,
}: {
  items: readonly Pair[];
  glyph?: GlyphId;
  columns?: 2 | 3;
}) {
  return (
    <div className={"hx-grid " + (columns === 2 ? "hx-grid-2" : "hx-grid-3")}>
      {items.map((item) => (
        <article key={item.title} className="hx-card">
          {glyph ? (
            <span className="hx-tile hx-tile-sm">
              <Glyph id={glyph} />
            </span>
          ) : null}
          <h3 className="hx-h4">{item.title}</h3>
          <p className="hx-small">{item.desc}</p>
        </article>
      ))}
    </div>
  );
}

export function Steps({ steps }: { steps: readonly Step[] }) {
  return (
    <ol className="hx-steps">
      {steps.map((step, i) => (
        <li key={step.title} className="hx-step">
          <span className="hx-step-no">{String(i + 1).padStart(2, "0")}</span>
          <div className="hx-step-body">
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Stats({ items }: { items: readonly { value: string; label: string }[] }) {
  return (
    <div className="hx-stats">
      {items.map((item) => (
        <div key={item.label} className="hx-stat">
          <b>{item.value}</b>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Pricing ────────────────────────────────────────────────────────────── */

export function Tiers({ tiers, ctaHref = "/contact" }: { tiers: readonly Tier[]; ctaHref?: string }) {
  return (
    <div className="hx-tiers">
      {tiers.map((tier) => (
        <article key={tier.name} className={"hx-tier" + (tier.highlighted ? " hx-tier-pop" : "")}>
          {tier.highlighted ? <span className="hx-tier-flag">{tier.cta ?? "Recommended"}</span> : null}
          <h3>{tier.name}</h3>
          <div className="hx-tier-price">
            <b>{tier.price}</b>
            <span>{tier.period}</span>
          </div>
          <p>{tier.desc}</p>
          <CheckList items={tier.features} />
          <Btn href={ctaHref} variant={tier.highlighted ? "primary" : "secondary"} size="sm" className="hx-btn-block">
            {tier.highlighted ? "Start this tier" : (tier.cta ?? "Enquire")}
          </Btn>
        </article>
      ))}
    </div>
  );
}

/* ── Case study card ────────────────────────────────────────────────────── */

export function WorkCard({ study }: { study: CaseStudy }) {
  return (
    <Link href={`/portfolio/${study.slug}`} className="hx-work-card">
      <div className="hx-work-media">
        {study.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={study.image}
            alt={`Illustration representing the ${study.title} project`}
            width={960}
            height={600}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <GeneratedCover title={study.title} />
        )}
        <span className="hx-work-media-label">{study.category}</span>
      </div>
      <div className="hx-work-body">
        <h3>{study.title}</h3>
        <p>{study.summary}</p>
        {study.placeholder ? (
          <span className="hx-placeholder-flag">Content placeholder</span>
        ) : study.results.length > 0 ? (
          <p className="hx-xs" style={{ fontWeight: 600, color: "var(--hx-fg)" }}>
            {study.results.map((r) => `${r.value} ${r.label.toLowerCase()}`).join(" · ")}
          </p>
        ) : null}
        <Chips items={study.tech.slice(0, 4)} />
      </div>
    </Link>
  );
}

/**
 * Cover used when a project has no photograph or screenshot — a generated
 * geometric panel rather than a stock image that implies something untrue.
 */
export function GeneratedCover({ title }: { title: string }) {
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(145deg, #0b1424 0%, #11213a 60%, #0b5fd0 160%)",
        color: "rgba(255,255,255,0.92)",
        fontFamily: "var(--hx-font-display)",
        fontSize: "2.4rem",
        fontWeight: 700,
        letterSpacing: "-0.04em",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <span style={{ position: "relative" }}>{initials}</span>
    </div>
  );
}

/* ── Linked rows (solutions, industries, services index) ───────────────── */

export function LinkRows({
  items,
}: {
  items: readonly { href: string; title: string; desc: string; meta?: string }[];
}) {
  return (
    <div className="hx-rows">
      {items.map((item, i) => (
        <Link key={item.href + item.title} href={item.href} className="hx-row">
          <span className="hx-num">{String(i + 1).padStart(2, "0")}</span>
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
          <span className="hx-row-arrow" aria-hidden>
            <ArrowUpRight size={16} />
          </span>
        </Link>
      ))}
    </div>
  );
}

/* ── Tech marquee ───────────────────────────────────────────────────────── */

export function TechMarquee({ items }: { items: readonly string[] }) {
  const row = (
    <div className="hx-marquee-row" aria-hidden>
      {items.map((item) => (
        <span key={item} className="hx-marquee-item">
          <Glyph id="layers" size={16} />
          {item}
        </span>
      ))}
    </div>
  );
  return (
    <div className="hx-marquee">
      <p className="hx-sr">Technologies we work with: {items.join(", ")}.</p>
      <div className="hx-marquee-track">
        {row}
        {row}
      </div>
    </div>
  );
}

/* ── Closing CTA ────────────────────────────────────────────────────────── */

export function ClosingCta({
  title = "Have a project in mind? Let's build something exceptional.",
  body = "Tell us what you are trying to achieve. We will tell you what it takes, what it costs, and whether we are the right team for it.",
  primary = { label: "Start a Project", href: "/contact" },
  secondary = { label: "Get a Free Consultation", href: "/bookings" },
}: {
  title?: string;
  body?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="hx-section">
      <div className="hx-wrap">
        <div className="hx-cta">
          <div className="hx-split hx-split-wide">
            <div>
              <h2>{title}</h2>
              <p>{body}</p>
              <div className="hx-actions">
                <Btn href={primary.href} variant="light" size="lg" arrow>
                  {primary.label}
                </Btn>
                <Btn href={secondary.href} variant="outline-light" size="lg">
                  {secondary.label}
                </Btn>
              </div>
            </div>
            <ul className="hx-cta-aside hx-checks" style={{ color: "#cdd6e6" }}>
              <li>
                <Check />
                <span>A written scope and fixed quote before work starts</span>
              </li>
              <li>
                <Check />
                <span>Payments handled securely through Stripe</span>
              </li>
              <li>
                <Check />
                <span>Code, accounts and documentation stay yours</span>
              </li>
              <li>
                <Check />
                <span>Typical first reply within 24–48 hours</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Sticky in-page navigation for long service / solution pages ───────── */

export function SubNav({ items }: { items: readonly { id: string; label: string }[] }) {
  return (
    <nav className="hx-subnav" aria-label="On this page">
      <div className="hx-wrap">
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
