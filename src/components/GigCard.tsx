"use client";

import { useState } from "react";
import type { Gig } from "@/lib/types";
import { formatPrice, initials, stars } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export default function GigCard({ gig }: { gig: Gig }) {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const [ordering, setOrdering] = useState(false);

  const handleOrder = () => {
    setOrdering(true);
    window.setTimeout(() => setOrdering(false), 1100);
  };

  return (
    <article className={"gig" + (gig.isNew ? " is-new" : "")} data-category={gig.category}>
      <div
        className="gig-media"
        style={{ background: `linear-gradient(140deg,${gig.colors[0]},${gig.colors[1]})` }}
      >
        <span className={gig.badge === "Pro" ? "badge dark" : "badge"}>{gig.badge}</span>
        <button
          className={"fav" + (saved ? " on" : "")}
          type="button"
          aria-label={t("card.saveAria")}
          onClick={() => setSaved((value) => !value)}
        >
          {saved ? "♥" : "♡"}
        </button>
        <span className="glyph">{gig.glyph}</span>
      </div>
      <div className="gig-body">
        <h3 className="gig-title">{gig.title}</h3>
        {gig.description && <p className="gig-desc">{gig.description}</p>}
        <div className="seller">
          <div
            className="avatar"
            style={{ background: `linear-gradient(140deg,${gig.colors[0]},${gig.colors[1]})` }}
          >
            {initials(gig.seller)}
          </div>
          <div className="seller-info">
            <div className="seller-name">
              {gig.seller}
              {gig.verified && (
                <span className="verified" title="Verified">
                  ✓
                </span>
              )}
            </div>
            <div className="seller-role">{gig.role}</div>
          </div>
        </div>
        <div className="gig-meta">
          <span className="meta-tag">
            <ClockIcon />
            {t("card.delivery", { time: gig.delivery })}
          </span>
          <span className="meta-tag">
            <RefreshIcon />
            {t("card.revisions")}
          </span>
        </div>
        <div className="gig-foot">
          {gig.reviews > 0 ? (
            <span className="rating">
              <span className="stars">{stars(gig.rating)}</span>
              {gig.rating.toFixed(1)} <span className="count">({gig.reviews})</span>
            </span>
          ) : (
            <span className="rating">
              <span className="fresh">{t("card.newNoReviews")}</span>
            </span>
          )}
          <span className="price">
            <span className="from">{t("card.startingAt")}</span>
            <span className="amount">
              <span>$</span>
              {formatPrice(gig.price)}
            </span>
          </span>
        </div>
        <button className="btn-order" type="button" onClick={handleOrder} disabled={ordering}>
          {ordering ? t("card.openingOrder") : t("card.viewGig")}
        </button>
      </div>
    </article>
  );
}
