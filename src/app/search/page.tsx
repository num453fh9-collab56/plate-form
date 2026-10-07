"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Gig } from "@/lib/types";
import { searchGigs } from "@/lib/api";
import { CATEGORY_LABEL_KEYS, CATEGORY_OPTIONS } from "@/lib/gigs";
import { POPULAR_SKILLS } from "@/lib/taxonomy";
import { useI18n } from "@/lib/i18n";
import GigCard from "@/components/GigCard";
import SkillPicker from "@/components/SkillPicker";

const PAGE_SIZE = 12;

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
  const [maxPrice, setMaxPrice] = useState("");
  const [maxDelivery, setMaxDelivery] = useState("");
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [items, setItems] = useState<Gig[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const skillsKey = useMemo(() => skills.join("|"), [skills]);

  useEffect(() => {
    let cancelled = false;
    void searchGigs({
      q: qParam,
      category,
      skills,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      maxDeliveryDays: maxDelivery ? Number(maxDelivery) : undefined,
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
  }, [qParam, category, skillsKey, page, maxPrice, maxDelivery, sort]);

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

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">{t("grid.kicker")}</div>
            <h2>
              {qParam ? `“${qParam}”` : t("grid.title")}
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
          <div className="taxonomy-row">
            <span className="taxonomy-label">Filters</span>
            <div className="taxonomy-chips" style={{ alignItems: "center" }}>
              <input
                type="number"
                min={0}
                placeholder="Max price ($)"
                value={maxPrice}
                style={{ width: 120, padding: "6px 10px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)" }}
                onChange={(e) => {
                  setLoading(true);
                  setMaxPrice(e.target.value);
                  pushParams({ page: 1 });
                }}
              />
              <select
                value={maxDelivery}
                style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)" }}
                onChange={(e) => {
                  setLoading(true);
                  setMaxDelivery(e.target.value);
                  pushParams({ page: 1 });
                }}
              >
                <option value="">Any delivery time</option>
                <option value="1">Within 1 day</option>
                <option value="3">Within 3 days</option>
                <option value="7">Within 7 days</option>
                <option value="14">Within 14 days</option>
                <option value="30">Within 30 days</option>
              </select>
              <select
                value={sort}
                style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)" }}
                onChange={(e) => {
                  setLoading(true);
                  setSort(e.target.value as "newest" | "price_asc" | "price_desc");
                  pushParams({ page: 1 });
                }}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </div>
          </div>
          <div className="taxonomy-row">
            <span className="taxonomy-label">{t("grid.categoryLabel")}</span>
            <div className="taxonomy-chips">
              <button
                type="button"
                className={"taxonomy-chip" + (category === "All" ? " on" : "")}
                onClick={() => {
                  setLoading(true);
                  pushParams({ category: "All", page: 1 });
                }}
              >
                {t("grid.allCategories")}
              </button>
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={"taxonomy-chip" + (category === option ? " on" : "")}
                  onClick={() => {
                    setLoading(true);
                    pushParams({ category: option, page: 1 });
                  }}
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
                onChange={(next) => {
                  setLoading(true);
                  setSkills(next);
                  pushParams({ page: 1 });
                }}
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
                      setSkills((current) =>
                        current.includes(skill)
                          ? current.filter((item) => item !== skill)
                          : [...current, skill],
                      );
                      pushParams({ page: 1 });
                    }}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid-meta">
          <span>{t("grid.count", { count })}</span>
        </div>

        <div className="grid">
          {items.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
          {items.length === 0 && (
            <div className="empty" role="status">
              <h3>{loading ? "Searching…" : t("grid.emptyTitle")}</h3>
              {!loading ? <p>{t("grid.emptyText")}</p> : null}
            </div>
          )}
        </div>

        {totalPages > 1 ? (
          <div className="pager">
            <button
              className="btn-ghost btn-sm"
              type="button"
              disabled={page <= 1}
              onClick={() => {
                setLoading(true);
                pushParams({ page: page - 1 });
              }}
            >
              Prev
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              className="btn-ghost btn-sm"
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                setLoading(true);
                pushParams({ page: page + 1 });
              }}
            >
              Next
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
