"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Gig } from "@/lib/types";
import { searchGigs } from "@/lib/api";
import { CATEGORY_LABEL_KEYS, CATEGORY_OPTIONS } from "@/lib/gigs";
import { POPULAR_SKILLS } from "@/lib/taxonomy";
import { useI18n } from "@/lib/i18n";
import { getRecentViews } from "@/lib/recent-views";
import GigCard from "@/components/GigCard";
import SkillPicker from "@/components/SkillPicker";

const PAGE_SIZE = 12;

type SortKey = "newest" | "price_asc" | "price_desc" | "best_selling" | "top_rated";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "best_selling", label: "Best selling" },
  { value: "top_rated", label: "Top rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

const DELIVERY_OPTIONS = [
  { value: "", label: "Any delivery" },
  { value: "1", label: "Express 24h" },
  { value: "3", label: "Up to 3 days" },
  { value: "7", label: "Up to 7 days" },
  { value: "14", label: "Up to 14 days" },
  { value: "30", label: "Up to 30 days" },
];

const SELLER_LEVELS = [
  { value: "all", label: "Any level" },
  { value: "New", label: "New Seller" },
  { value: "Level 1", label: "Level 1" },
  { value: "Level 2", label: "Level 2" },
  { value: "Top Rated", label: "Top Rated" },
];

const RATING_OPTIONS = [
  { value: 0, label: "Any rating" },
  { value: 4, label: "4.0+" },
  { value: 4.5, label: "4.5+" },
  { value: 4.8, label: "4.8+" },
];

function SearchView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const category = searchParams.get("category") ?? "All";
  const qParam = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const [term, setTerm] = useState(qParam);
  const [skills, setSkills] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxDelivery, setMaxDelivery] = useState("");
  const [sellerLevel, setSellerLevel] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortKey>("newest");
  const [items, setItems] = useState<Gig[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const skillsKey = useMemo(() => skills.join("|"), [skills]);

  const hasFilters = skills.length > 0 || minPrice || maxPrice || maxDelivery || sellerLevel !== "all" || minRating > 0 || category !== "All";

  const clearAll = () => {
    setSkills([]);
    setMinPrice("");
    setMaxPrice("");
    setMaxDelivery("");
    setSellerLevel("all");
    setMinRating(0);
    setSort("newest");
    setLoading(true);
    pushParams({ category: "All", q: "", page: 1 });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void searchGigs({
      q: qParam,
      category,
      skills,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      maxDeliveryDays: maxDelivery ? Number(maxDelivery) : undefined,
      sellerLevel: sellerLevel !== "all" ? sellerLevel : undefined,
      minRating: minRating > 0 ? minRating : undefined,
      sort,
    }).then((result) => {
      if (cancelled) return;
      setItems(result.items);
      setCount(result.count);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam, category, skillsKey, page, minPrice, maxPrice, maxDelivery, sellerLevel, minRating, sort]);

  const pushParams = useCallback(
    (next: { q?: string; category?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.q !== undefined) {
        if (next.q) params.set("q", next.q);
        else params.delete("q");
      }
      if (next.category !== undefined) {
        if (next.category && next.category !== "All") params.set("category", next.category);
        else params.delete("category");
      }
      if (next.page !== undefined) {
        if (next.page > 1) params.set("page", String(next.page));
        else params.delete("page");
      }
      router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [pathname, router, searchParams],
  );

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (category !== "All") activeFilters.push({ label: t(CATEGORY_LABEL_KEYS[category]), clear: () => { setLoading(true); pushParams({ category: "All", page: 1 }); } });
  if (minPrice) activeFilters.push({ label: `Min $${minPrice}`, clear: () => { setMinPrice(""); } });
  if (maxPrice) activeFilters.push({ label: `Max $${maxPrice}`, clear: () => { setMaxPrice(""); } });
  if (maxDelivery) activeFilters.push({ label: `${maxDelivery}d delivery`, clear: () => { setMaxDelivery(""); } });
  if (sellerLevel !== "all") activeFilters.push({ label: sellerLevel, clear: () => { setSellerLevel("all"); } });
  if (minRating > 0) activeFilters.push({ label: `${minRating}+ stars`, clear: () => { setMinRating(0); } });
  for (const s of skills) activeFilters.push({ label: s, clear: () => { setSkills((prev) => prev.filter((x) => x !== s)); } });

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">{t("grid.kicker")}</div>
            <h2>
              {qParam ? `"${qParam}"` : t("grid.title")}
              {category !== "All" ? ` · ${t(CATEGORY_LABEL_KEYS[category])}` : ""}
            </h2>
            <p className="sub">{t("grid.sub")}</p>
          </div>
        </div>

        <form
          className="search-bar"
          style={{ marginBottom: 20 }}
          onSubmit={(event) => {
            event.preventDefault();
            setLoading(true);
            pushParams({ q: term.trim(), page: 1 });
          }}
        >
          <label className="field">
            <input
              type="text"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder={t("hero.searchPlaceholder")}
              aria-label={t("hero.searchPlaceholder")}
            />
          </label>
          <button className="btn-search" type="submit">
            {t("hero.searchGig")}
          </button>
        </form>

        <div className="taxonomy-filters">
          <div className="sf-toolbar">
            <button type="button" className="sf-toggle" onClick={() => setFiltersOpen((v) => !v)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
              {filtersOpen ? "Hide filters" : "Show filters"}
              {hasFilters && <span className="sf-badge">{activeFilters.length}</span>}
            </button>
            <div className="sf-sort-view">
              <select
                className="sf-select"
                value={sort}
                onChange={(e) => { setSort(e.target.value as SortKey); pushParams({ page: 1 }); }}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="sf-view-toggle">
                <button type="button" className={`sf-view-btn${viewMode === "grid" ? " on" : ""}`} onClick={() => setViewMode("grid")} aria-label="Grid view">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                </button>
                <button type="button" className={`sf-view-btn${viewMode === "list" ? " on" : ""}`} onClick={() => setViewMode("list")} aria-label="List view">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="4" rx="1.5"/><rect x="3" y="10" width="18" height="4" rx="1.5"/><rect x="3" y="16" width="18" height="4" rx="1.5"/></svg>
                </button>
              </div>
            </div>
          </div>

          {filtersOpen && (
            <>
              <div className="sf-filter-grid">
                <div className="sf-filter-group">
                  <label className="sf-filter-label">Price range</label>
                  <div className="sf-price-range">
                    <input type="number" min={0} placeholder="Min" value={minPrice} className="sf-input" onChange={(e) => { setMinPrice(e.target.value); pushParams({ page: 1 }); }} />
                    <span className="sf-price-sep">—</span>
                    <input type="number" min={0} placeholder="Max" value={maxPrice} className="sf-input" onChange={(e) => { setMaxPrice(e.target.value); pushParams({ page: 1 }); }} />
                  </div>
                </div>
                <div className="sf-filter-group">
                  <label className="sf-filter-label">Delivery time</label>
                  <select className="sf-select" value={maxDelivery} onChange={(e) => { setMaxDelivery(e.target.value); pushParams({ page: 1 }); }}>
                    {DELIVERY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="sf-filter-group">
                  <label className="sf-filter-label">Seller level</label>
                  <select className="sf-select" value={sellerLevel} onChange={(e) => { setSellerLevel(e.target.value); pushParams({ page: 1 }); }}>
                    {SELLER_LEVELS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="sf-filter-group">
                  <label className="sf-filter-label">Rating</label>
                  <select className="sf-select" value={minRating} onChange={(e) => { setMinRating(Number(e.target.value)); pushParams({ page: 1 }); }}>
                    {RATING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="taxonomy-row">
                <span className="taxonomy-label">{t("grid.categoryLabel")}</span>
                <div className="taxonomy-chips">
                  <button
                    type="button"
                    className={"taxonomy-chip" + (category === "All" ? " on" : "")}
                    onClick={() => { setLoading(true); pushParams({ category: "All", page: 1 }); }}
                  >
                    {t("grid.allCategories")}
                  </button>
                  {CATEGORY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={"taxonomy-chip" + (category === option ? " on" : "")}
                      onClick={() => { setLoading(true); pushParams({ category: option, page: 1 }); }}
                    >
                      {t(CATEGORY_LABEL_KEYS[option])}
                    </button>
                  ))}
                </div>
              </div>

              <div className="taxonomy-row taxonomy-row-skill">
                <span className="taxonomy-label">{t("grid.skillLabel")}</span>
                <div className="taxonomy-skill-filter">
                  <SkillPicker
                    value={skills}
                    onChange={(next) => { setLoading(true); setSkills(next); pushParams({ page: 1 }); }}
                    placeholder={t("grid.skillPlaceholder")}
                  />
                </div>
              </div>

              <div className="taxonomy-row taxonomy-popular">
                <span className="taxonomy-label">{t("grid.popularLabel")}</span>
                <div className="taxonomy-chips">
                  {POPULAR_SKILLS.slice(0, 10).map((skill) => {
                    const on = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        className={"taxonomy-chip skill" + (on ? " on" : "")}
                        onClick={() => {
                          setLoading(true);
                          setSkills((current) => current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill]);
                          pushParams({ page: 1 });
                        }}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="sf-active-filters">
            {activeFilters.map((f) => (
              <button key={f.label} type="button" className="sf-active-pill" onClick={f.clear}>
                {f.label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            ))}
            <button type="button" className="sf-clear-all" onClick={clearAll}>Clear all</button>
          </div>
        )}

        <div className="grid-meta">
          <span>
            {loading ? "Searching…" : `${count} lyx${count !== 1 ? "es" : ""} found`}
            {sort !== "newest" && !loading ? ` · Sorted by ${SORT_OPTIONS.find((o) => o.value === sort)?.label ?? sort}` : ""}
          </span>
        </div>

        <div className={viewMode === "list" ? "grid grid-list-view" : "grid"}>
          {items.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
          {items.length === 0 && !loading && (
            <div className="empty" role="status">
              <h3>{t("grid.emptyTitle")}</h3>
              <p>{t("grid.emptyText")}</p>
              {hasFilters && (
                <button className="btn-ghost" type="button" onClick={clearAll} style={{ marginTop: 12 }}>
                  Clear all filters
                </button>
              )}
            </div>
          )}
          {items.length === 0 && loading && (
            <div className="empty" role="status">
              <div className="sf-spinner" />
              <h3>Searching…</h3>
            </div>
          )}
        </div>

        {items.length === 0 && !loading && (() => {
          const recent = getRecentViews();
          return recent.length > 0 ? (
            <div className="rv-recent">
              <h3>Recently Viewed</h3>
              <div className="rv-recent-grid">
                {recent.slice(0, 6).map((g) => (
                  <Link key={g.id} href={`/gig/${g.id}`} className="rv-recent-item">
                    {g.image ? <img src={g.image} alt="" /> : <div className="rv-recent-placeholder" />}
                    <div className="rv-recent-info">
                      <strong>{g.title}</strong>
                      <span>${g.price}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {totalPages > 1 ? (
          <div className="pager">
            <button
              className="btn-ghost btn-sm"
              type="button"
              disabled={page <= 1}
              onClick={() => { setLoading(true); pushParams({ page: page - 1 }); }}
            >
              ← Prev
            </button>
            <div className="pager-nums">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p: number;
                if (totalPages <= 7) p = i + 1;
                else if (page <= 4) p = i + 1;
                else if (page >= totalPages - 3) p = totalPages - 6 + i;
                else p = page - 3 + i;
                return (
                  <button
                    key={p}
                    type="button"
                    className={`pager-num${p === page ? " on" : ""}`}
                    onClick={() => { if (p !== page) { setLoading(true); pushParams({ page: p }); } }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              className="btn-ghost btn-sm"
              type="button"
              disabled={page >= totalPages}
              onClick={() => { setLoading(true); pushParams({ page: page + 1 }); }}
            >
              Next →
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <section className="section">
          <div className="wrap"><p style={{ color: "var(--muted)" }}>Loading…</p></div>
        </section>
      }
    >
      <SearchView />
    </Suspense>
  );
}
