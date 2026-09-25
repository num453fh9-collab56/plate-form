"use client";

import { useMemo } from "react";
import { useMarketplace } from "@/lib/marketplace";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import GigCard from "./GigCard";

export default function GigGrid() {
  const { gigs, query, category } = useMarketplace();
  const { openPost } = useUI();
  const { t } = useI18n();

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
            <div className="kicker">{t("grid.kicker")}</div>
            <h2>{t("grid.title")}</h2>
            <p className="sub">{t("grid.sub")}</p>
          </div>
          <div className="head-actions">
            <a href="#gigs" className="link-all">
              {t("grid.browseAll")} <span>&rarr;</span>
            </a>
            <button className="btn-post" type="button" onClick={openPost}>
              + {t("grid.postGig")}
            </button>
          </div>
        </div>

        <div className="grid">
          {visibleGigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
          {visibleGigs.length === 0 && (
            <div className="empty">
              <h3>{t("grid.emptyTitle")}</h3>
              <p>{t("grid.emptyText")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
