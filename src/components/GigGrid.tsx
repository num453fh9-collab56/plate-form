"use client";

import { useMemo } from "react";
import { useMarketplace } from "@/lib/marketplace";
import { useUI } from "@/lib/ui";
import GigCard from "./GigCard";

export default function GigGrid() {
  const { gigs, query, category } = useMarketplace();
  const { openPost } = useUI();

  const visibleGigs = useMemo(() => {
    const term = query.trim().toLowerCase();
    return gigs.filter((gig) => {
      const matchesCategory = category === "All" || gig.category === category;
      if (!matchesCategory) return false;
      if (!term) return true;
      return (
        gig.title.toLowerCase().includes(term) ||
        gig.seller.toLowerCase().includes(term) ||
        gig.description.toLowerCase().includes(term)
      );
    });
  }, [gigs, query, category]);

  return (
    <section className="section" id="gigs">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">Featured Marketplace</div>
            <h2>Top-Rated Freelance Services</h2>
            <p className="sub">
              Handpicked gigs from verified professionals with proven track records.
            </p>
          </div>
          <div className="head-actions">
            <a href="#gigs" className="link-all">
              Browse all gigs <span>&rarr;</span>
            </a>
            <button className="btn-post" type="button" onClick={openPost}>
              + Post a Project
            </button>
          </div>
        </div>

        <div className="grid">
          {visibleGigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
          {visibleGigs.length === 0 && (
            <div className="empty">
              <h3>No gigs found</h3>
              <p>Try a different keyword or category, or post your own project.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
