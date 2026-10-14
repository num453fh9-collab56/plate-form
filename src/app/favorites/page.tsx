"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { fetchFavoriteGigs } from "@/lib/favorites";
import type { Gig } from "@/lib/types";
import GigCard from "@/components/GigCard";

type SortKey = "newest" | "price_asc" | "price_desc" | "name";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<SortKey>("newest");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    if (!user?.sub) return;
    void fetchFavoriteGigs().then((items) => {
      setGigs(items);
      setLoading(false);
    });
  }, [user]);

  const categories = useMemo(() => {
    const set = new Set(gigs.map((g) => g.category));
    return ["All", ...Array.from(set).sort()];
  }, [gigs]);

  const filtered = useMemo(() => {
    let list = gigs;
    if (categoryFilter !== "All") list = list.filter((g) => g.category === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((g) => g.title.toLowerCase().includes(q) || g.seller.toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === "price_asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [gigs, categoryFilter, search, sort]);

  if (!user) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Sign in to see saved lyxes</h3>
            <button className="btn-primary" type="button" onClick={() => openAuth("login")}>
              Sign in
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">Saved</div>
            <h2>Your saved lyxes</h2>
            {!loading && <p className="sub">{gigs.length} lyx{gigs.length !== 1 ? "es" : ""} saved</p>}
          </div>
          <Link className="btn-post" href="/search">Browse lyxes</Link>
        </div>

        {!loading && gigs.length > 0 && (
          <div className="fav-toolbar">
            <input
              type="text"
              className="ord-search"
              placeholder="Search saved lyxes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="sf-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="sf-select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <option value="newest">Recently saved</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="name">Name A–Z</option>
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
        )}

        {loading ? (
          <div className="empty">
            <div className="sf-spinner" />
            <p style={{ color: "var(--muted)" }}>Loading…</p>
          </div>
        ) : gigs.length === 0 ? (
          <div className="empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <h3>Nothing saved yet</h3>
            <p>Tap the bookmark on any lyx to save it here for later.</p>
            <Link className="btn-primary" href="/search" style={{ marginTop: 12 }}>Browse lyxes</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <h3>No matches</h3>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          <div className={viewMode === "list" ? "grid grid-list-view" : "grid"}>
            {filtered.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
