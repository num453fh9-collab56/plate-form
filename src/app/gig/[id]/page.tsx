"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Gig } from "@/lib/types";
import {
  fetchGigById,
  fetchGigReviews,
  fetchGigsBySeller,
  fetchPublicProfile,
  reviewAverage,
} from "@/lib/api";
import type { GigReview, PublicProfile } from "@/lib/api";
import { formatPrice, initials, stars } from "@/lib/format";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { useMessaging } from "@/lib/messaging";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import { startCheckout } from "@/lib/checkout";
import VideoPlayer from "@/components/VideoPlayer";
import GigCard from "@/components/GigCard";

export default function GigDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const { startConversation } = useMessaging();
  const { openMessages, toast } = useUI();
  const requireAuth = useRequireAuth();
  const [requirements, setRequirements] = useState("");
  const [ordering, setOrdering] = useState(false);

  const [gig, setGig] = useState<Gig | null>(null);
  const [seller, setSeller] = useState<PublicProfile | null>(null);
  const [reviews, setReviews] = useState<GigReview[]>([]);
  const [related, setRelated] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void fetchGigById(id).then(async (found) => {
      if (cancelled) return;
      setGig(found);
      setLoading(false);
      if (!found) return;
      const [profile, reviewList, sellerGigs] = await Promise.all([
        found.sellerId ? fetchPublicProfile(found.sellerId) : Promise.resolve(null),
        fetchGigReviews(found.id),
        found.sellerId ? fetchGigsBySeller(found.sellerId) : Promise.resolve([]),
      ]);
      if (cancelled) return;
      setSeller(profile);
      setReviews(reviewList);
      setRelated(sellerGigs.filter((item) => item.id !== found.id).slice(0, 3));
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const stats = useMemo(() => reviewAverage(reviews), [reviews]);

  if (loading) {
    return (
      <section className="section">
        <div className="wrap">
          <p style={{ color: "var(--muted)" }}>Loading gig…</p>
        </div>
      </section>
    );
  }

  if (!gig) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Gig not found</h3>
            <p>This gig may have been removed.</p>
            <button className="btn-primary" type="button" onClick={() => router.push("/search")}>
              Browse gigs
            </button>
          </div>
        </div>
      </section>
    );
  }

  const openConversation = async () => {
    if (!gig.sellerId) return;
    const conversationId = await startConversation({
      gigId: gig.id,
      sellerId: gig.sellerId,
      sellerName: gig.seller,
    });
    if (conversationId) openMessages();
  };

  const placeOrder = async () => {
    setOrdering(true);
    const result = await startCheckout(gig.id, requirements);
    setOrdering(false);
    if (result.error) {
      toast(result.error);
      return;
    }
    if (result.url) window.location.href = result.url;
  };

  return (
    <section className="section gig-detail">
      <div className="wrap">
        <nav className="crumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/search?category=${encodeURIComponent(gig.category)}`}>{gig.category}</Link>
        </nav>

        <div className="gig-detail-grid">
          <div className="gig-detail-main">
            <span className="gig-eyebrow">{gig.category}</span>
            <h1 className="gig-detail-title">{gig.title}</h1>

            <div className="gig-detail-seller">
              <span className="avatar" aria-hidden="true">{initials(gig.seller)}</span>
              <div>
                {gig.sellerId ? (
                  <Link className="seller-name" href={`/user/${gig.sellerId}`}>
                    {gig.seller}
                  </Link>
                ) : (
                  <span className="seller-name">{gig.seller}</span>
                )}
                {seller?.title ? (
                  <div style={{ color: "var(--muted-2)", fontSize: "0.82rem" }}>
                    {seller.title}
                  </div>
                ) : null}
                <div className="gig-detail-rating">
                  {stats.count > 0 ? (
                    <>
                      <span className="stars">{stars(stats.average)}</span>
                      {stats.average.toFixed(1)}{" "}
                      <span className="count">({stats.count})</span>
                    </>
                  ) : (
                    <span className="fresh">{t("card.newNoReviews")}</span>
                  )}
                </div>
              </div>
            </div>

            {gig.video ? (
              <div className="gig-detail-video">
                <VideoPlayer src={gig.video} title={gig.videoName || gig.title} />
              </div>
            ) : null}

            <div className="gig-detail-block">
              <h2>About this gig</h2>
              <p className="gig-detail-desc">{gig.description}</p>
            </div>

            {gig.skills.length > 0 ? (
              <div className="gig-detail-block">
                <h2>Skills</h2>
                <div className="chips">
                  {gig.skills.map((skill) => (
                    <span className="chip" key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="gig-detail-block">
              <h2>Reviews {stats.count > 0 ? `(${stats.count})` : ""}</h2>
              {reviews.length === 0 ? (
                <p style={{ color: "var(--muted)" }}>
                  No reviews yet. Reviews appear after completed orders.
                </p>
              ) : (
                <ul className="review-list">
                  {reviews.map((review) => (
                    <li key={review.id} className="review-item">
                      <div className="review-head">
                        <span className="avatar" aria-hidden="true">{initials(review.reviewerName)}</span>
                        <div>
                          <strong>{review.reviewerName}</strong>
                          <div className="stars">{stars(review.rating)}</div>
                        </div>
                      </div>
                      {review.comment ? <p>{review.comment}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="gig-detail-side">
            <div className="price-card">
              <div className="price-card-row">
                <span>{t("card.startingAt")}</span>
                <strong>${formatPrice(gig.price)}</strong>
              </div>
              <div className="price-card-row muted">
                <span>Delivery</span>
                <strong>{gig.delivery}</strong>
              </div>
              <textarea
                className="price-card-req"
                rows={3}
                value={requirements}
                placeholder="Describe what you need (optional)…"
                onChange={(event) => setRequirements(event.target.value)}
              />
              <button
                className="btn-primary price-card-cta"
                type="button"
                disabled={ordering}
                onClick={() => requireAuth(() => void placeOrder())}
              >
                {ordering ? "Starting checkout…" : `Order now · $${formatPrice(gig.price)}`}
              </button>
              {gig.sellerId && gig.sellerId !== user?.sub ? (
                <button
                  className="btn-ghost price-card-msg"
                  type="button"
                  onClick={() => requireAuth(() => void openConversation())}
                >
                  Message seller
                </button>
              ) : null}
              <p className="price-card-note">
                Secure payment &amp; buyer protection. Funds are released to the
                seller after you approve the delivery.
              </p>
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <div className="gig-detail-related">
            <h2>More from {gig.seller}</h2>
            <div className="grid">
              {related.map((item) => (
                <GigCard key={item.id} gig={item} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
