"use client";

import { useRouter } from "next/navigation";
import type { Gig } from "@/lib/types";
import { formatPrice, initials, stars } from "@/lib/format";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useMarketplace } from "@/lib/marketplace";
import { useMessaging } from "@/lib/messaging";
import { useUI } from "@/lib/ui";
import { translationKeyForCategory } from "@/lib/taxonomy";

export default function GigCard({ gig }: { gig: Gig }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { startConversation } = useMessaging();
  const requireAuth = useRequireAuth();
  const { openVideo, openMessages } = useUI();
  const { selectedSkills, toggleSkill } = useMarketplace();
  const router = useRouter();

  const handleOrder = () => {
    router.push(`/gig/${gig.id}`);
  };

  const openConversation = async () => {
    if (!gig.sellerId) return;
    const id = await startConversation({
      gigId: gig.id,
      sellerId: gig.sellerId,
      sellerName: gig.seller,
    });
    if (id) openMessages();
  };

  return (
    <article className={"gig" + (gig.isNew ? " is-new" : "")} data-category={gig.category}>
      <div className="gig-head">
        <span className="gig-eyebrow">{t(translationKeyForCategory(gig.category))}</span>
      </div>

      <div className="gig-body">
        <h3 className="gig-title">{gig.title}</h3>
        {gig.description && <p className="gig-desc">{gig.description}</p>}

        <div className="seller">
          <span className="avatar" aria-hidden="true">
            {initials(gig.seller)}
          </span>
          <div className="seller-info">
            <div className="seller-name">
              {gig.seller}
              {gig.verified && (
                <span className="verified" title="Verified">
                  ✓
                </span>
              )}
            </div>
          </div>
          {gig.video ? (
            <button
              className="gig-watch"
              type="button"
              aria-label={t("card.watchIntro")}
              onClick={() =>
                openVideo({ src: gig.video as string, title: gig.videoName || gig.title })
              }
            >
              <span className="gig-watch-icon" aria-hidden="true">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              {t("card.introBadge")}
            </button>
          ) : null}
        </div>
      </div>

      <div className="gig-foot">
        {gig.skills.length > 0 && (
          <div className="gig-skills" aria-label={t("card.skillsAria")}>
            {gig.skills.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  className={"gig-skill" + (active ? " on" : "")}
                  aria-pressed={active}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        )}

        <div className="gig-trade">
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

        <button className="btn-order" type="button" onClick={handleOrder}>
          {t("card.viewGig")}
        </button>

        {gig.sellerId && gig.sellerId !== user?.sub ? (
          <button
            className="btn-ghost btn-sm"
            type="button"
            onClick={() => requireAuth(() => void openConversation())}
          >
            Message seller
          </button>
        ) : null}
      </div>
    </article>
  );
}
