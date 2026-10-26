"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { FAQ_CATEGORIES, SITE_FAQS } from "@/lib/content/faq";

/* ==========================================================================
   HIRELYX · FAQ SEARCH
   Search + category filter over the site FAQ, with an accessible
   disclosure list. Keeps the search and category behaviour of the previous
   /faq page, rebuilt on the shared design system.
   ========================================================================== */

export default function FaqSearch() {
  const uid = useId().replace(/:/g, "");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState<string | null>(SITE_FAQS[0]?.q ?? null);

  const options = ["All", ...FAQ_CATEGORIES];

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SITE_FAQS.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (!needle) return true;
      return (
        item.q.toLowerCase().includes(needle) || item.a.toLowerCase().includes(needle)
      );
    });
  }, [query, category]);

  return (
    <div>
      <div className="hx-split" style={{ gap: "1.25rem", alignItems: "end", marginBottom: "1.5rem" }}>
        <label className="hx-field" style={{ marginBottom: 0 }} htmlFor={`${uid}-search`}>
          <span className="hx-field-label">Search the FAQ</span>
          <input
            id={`${uid}-search`}
            className="hx-input"
            type="search"
            value={query}
            placeholder="pricing, ownership, timelines…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="hx-filters" role="group" aria-label="Filter questions by category">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className="hx-filter"
              aria-pressed={category === option}
              onClick={() => setCategory(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <p className="hx-sr" aria-live="polite">
        {results.length} {results.length === 1 ? "question" : "questions"} match.
      </p>

      {results.length === 0 ? (
        <div className="hx-empty">
          <h2>No matching questions</h2>
          <p>
            Try a different wording, or{" "}
            <Link href="/contact" style={{ color: "var(--hx-accent)", fontWeight: 600 }}>
              ask us directly
            </Link>{" "}
            — a real person will answer.
          </p>
        </div>
      ) : (
        <div className="hx-acc">
          {results.map((item) => {
            const expanded = open === item.q;
            const panelId = `${uid}-${item.q.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
            return (
              <div className="hx-acc-item" key={item.q}>
                <h3 style={{ margin: 0 }}>
                  <button
                    type="button"
                    className="hx-acc-btn"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : item.q)}
                  >
                    <span>
                      {item.q}
                      <span className="hx-xs" style={{ display: "block", marginTop: "0.25rem", fontWeight: 600 }}>
                        {item.category}
                      </span>
                    </span>
                    <span className="hx-acc-sign" aria-hidden />
                  </button>
                </h3>
                <div id={panelId} role="region" hidden={!expanded}>
                  <div className="hx-acc-panel">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
