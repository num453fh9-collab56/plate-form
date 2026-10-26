"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { CaseStudy, Faq } from "@/lib/content/types";
import { WorkCard } from "./ui";

/* ==========================================================================
   HIRELYX · INTERACTIVE PIECES
   The only client-side JavaScript on the marketing pages: a scroll-reveal
   observer, an accessible FAQ accordion, and the portfolio filter. Each
   respects prefers-reduced-motion and works from the keyboard.
   ========================================================================== */

/**
 * Observes every `.hx-reveal` element on the page and marks it shown once.
 * Mounted once in the root layout; re-scans when the route changes.
 * With reduced motion requested, elements are revealed immediately.
 */
export function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".hx-reveal"));
    if (nodes.length === 0) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      for (const node of nodes) node.dataset.shown = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.shown = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    for (const node of nodes) {
      if (node.dataset.shown === "true") continue;
      observer.observe(node);
    }
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

/** Accessible single-open accordion used for FAQs. */
export function FaqAccordion({ items, initialOpen = 0 }: { items: readonly Faq[]; initialOpen?: number }) {
  const [open, setOpen] = useState<number | null>(initialOpen);
  const base = useId().replace(/:/g, "");

  return (
    <div className="hx-acc">
      {items.map((item, i) => {
        const expanded = open === i;
        const panelId = `${base}-panel-${i}`;
        const btnId = `${base}-btn-${i}`;
        return (
          <div className="hx-acc-item" key={item.q}>
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                id={btnId}
                className="hx-acc-btn"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : i)}
              >
                <span>{item.q}</span>
                <span className="hx-acc-sign" aria-hidden />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} hidden={!expanded}>
              <div className="hx-acc-panel">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Category filter over the case-study grid. */
export function PortfolioFilter({
  studies,
  categories,
}: {
  studies: readonly CaseStudy[];
  categories: readonly string[];
}) {
  const [active, setActive] = useState("All");
  const liveRef = useRef<HTMLParagraphElement>(null);
  const shown = active === "All" ? studies : studies.filter((s) => s.category === active);
  const options = ["All", ...categories];

  return (
    <>
      <div className="hx-filters" role="group" aria-label="Filter projects by category">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className="hx-filter"
            aria-pressed={active === option}
            onClick={() => setActive(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <p ref={liveRef} className="hx-sr" aria-live="polite">
        {shown.length} {shown.length === 1 ? "project" : "projects"} shown
        {active === "All" ? "" : ` in ${active}`}.
      </p>

      <div className="hx-work hx-mt-lg">
        {shown.map((study) => (
          <WorkCard key={study.slug} study={study} />
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="hx-lead hx-mt-lg">
          No projects in this category yet.{" "}
          <Link href="/contact" style={{ color: "var(--hx-accent)" }}>
            Talk to us about being the first.
          </Link>
        </p>
      ) : null}
    </>
  );
}
