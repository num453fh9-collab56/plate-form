"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Gig, GigStatus, PackageKey } from "@/lib/types";
import {
  fetchGigById,
  fetchGigReviews,
  fetchGigsBySeller,
  fetchPublicProfile,
  recordGigView,
  reviewAverage,
} from "@/lib/api";
import type { GigReview, PublicProfile } from "@/lib/api";
import { formatPrice, initials, stars } from "@/lib/format";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { useMessaging } from "@/lib/messaging";
import { useMarketplace } from "@/lib/marketplace";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase";
import { startCheckout } from "@/lib/checkout";
import { offeredPackages, quoteOrder } from "@/lib/gig-model";
import { topicVideoFor } from "@/lib/video-topic";
import VideoPlayer from "@/components/VideoPlayer";
import GigCard from "@/components/GigCard";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function GigDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const { startConversation } = useMessaging();
  const { gigs: cachedGigs } = useMarketplace();
  const { openMessages, toast } = useUI();
  const requireAuth = useRequireAuth();
  const [requirements, setRequirements] = useState("");
  const [ordering, setOrdering] = useState(false);

  /* Render instantly from the marketplace cache; the fetch below refreshes it
     (and is the only source for the owner's drafts / paused gigs). */
  const cached = useMemo(() => cachedGigs.find((item) => item.id === id) ?? null, [cachedGigs, id]);
  const [fetched, setFetched] = useState<Gig | null>(null);
  const [fetchDone, setFetchDone] = useState(false);
  const [seller, setSeller] = useState<PublicProfile | null>(null);
  const [reviews, setReviews] = useState<GigReview[]>([]);
  const [related, setRelated] = useState<Gig[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<PackageKey | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [statusBusy, setStatusBusy] = useState(false);
  const gig = fetched ?? cached;
  const loading = !gig && !fetchDone;

  useEffect(() => {
    if (id) void recordGigView(id);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void fetchGigById(id).then(async (found) => {
      if (cancelled) return;
      setFetched(found);
      setFetchDone(true);
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
  const packages = useMemo(() => (gig ? offeredPackages(gig) : []), [gig]);
  const pkgKey: PackageKey | null =
    selectedPkg && packages.some(([key]) => key === selectedPkg)
      ? selectedPkg
      : packages[0]?.[0] ?? null;
  const quote = useMemo(
    () => (gig ? quoteOrder(gig, pkgKey, selectedExtras) : { total: 0, days: 1 }),
    [gig, pkgKey, selectedExtras],
  );
  const allFeatures = useMemo(() => {
    const labels: string[] = [];
    for (const [, pkg] of packages) {
      for (const f of pkg.features ?? []) if (!labels.includes(f)) labels.push(f);
    }
    return labels;
  }, [packages]);

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
            <p>This gig may have been removed or paused.</p>
            <button className="btn-primary" type="button" onClick={() => router.push("/search")}>
              Browse gigs
            </button>
          </div>
        </div>
      </section>
    );
  }

  const isOwner = Boolean(gig.sellerId && gig.sellerId === user?.sub);
  const status: GigStatus = gig.status ?? "published";
  const images = gig.images ?? [];
  const imageIndex = Math.min(activeImage, Math.max(0, images.length - 1));
  const currentPkg = pkgKey ? gig.packages?.[pkgKey] : undefined;
  const fallbackVideo = topicVideoFor(`${gig.category} ${gig.title}`);

  const openConversation = async () => {
    if (!gig.sellerId) return;
    const conversationId = await startConversation({
      gigId: gig.id,
      sellerId: gig.sellerId,
      sellerName: gig.seller,
    });
    if (conversationId) openMessages();
  };

  const setStatus = async (next: GigStatus) => {
    const supabase = getSupabase();
    if (!supabase) return;
    setStatusBusy(true);
    const { error } = await supabase.from("gigs").update({ status: next }).eq("id", gig.id);
    setStatusBusy(false);
    if (error) {
      toast(error.message);
      return;
    }
    setFetched({ ...gig, status: next });
    toast(next === "published" ? "Your gig is live." : "Gig paused. Buyers cannot order it until you resume.");
  };

  const toggleExtra = (label: string) =>
    setSelectedExtras((cur) => (cur.includes(label) ? cur.filter((l) => l !== label) : [...cur, label]));

  const placeOrder = async () => {
    setOrdering(true);
    const result = await startCheckout(gig.id, requirements, {
      packageKey: pkgKey,
      extras: selectedExtras,
    });
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

        {isOwner ? (
          <div className="gd-owner-bar">
            <span className={`gd-status ${status}`}>{status}</span>
            <span className="grow">This is your gig · {plural(gig.views ?? 0, "view")}</span>
            <Link className="btn-ghost btn-sm" href={`/post-project?edit=${gig.id}`}>
              Edit gig
            </Link>
            {status === "published" ? (
              <button className="btn-ghost btn-sm" type="button" disabled={statusBusy} onClick={() => void setStatus("paused")}>
                Pause
              </button>
            ) : (
              <button className="btn-primary btn-sm" type="button" disabled={statusBusy} onClick={() => void setStatus("published")}>
                {status === "draft" ? "Publish" : "Resume"}
              </button>
            )}
          </div>
        ) : null}

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

            {images.length > 0 ? (
              <div className="gd-gallery">
                <div className="gd-gallery-main">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={images[imageIndex]} alt={`${gig.title} — image ${imageIndex + 1}`} />
                  {images.length > 1 ? (
                    <>
                      <button
                        type="button"
                        className="gd-gallery-nav prev"
                        aria-label="Previous image"
                        onClick={() => setActiveImage((imageIndex - 1 + images.length) % images.length)}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="gd-gallery-nav next"
                        aria-label="Next image"
                        onClick={() => setActiveImage((imageIndex + 1) % images.length)}
                      >
                        ›
                      </button>
                    </>
                  ) : null}
                </div>
                {images.length > 1 ? (
                  <div className="gd-thumbs">
                    {images.map((url, i) => (
                      <button
                        key={url + i}
                        type="button"
                        className={i === imageIndex ? "active" : ""}
                        aria-label={`Show image ${i + 1}`}
                        onClick={() => setActiveImage(i)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {gig.video || fallbackVideo ? (
              <div className="gig-detail-video">
                <VideoPlayer src={gig.video || fallbackVideo || ""} title={gig.videoName || gig.title} />
              </div>
            ) : null}

            <div className="gig-detail-block">
              <h2>About this gig</h2>
              <p className="gig-detail-desc" style={{ whiteSpace: "pre-line" }}>{gig.description}</p>
            </div>

            {packages.length > 1 ? (
              <div className="gig-detail-block">
                <h2>Compare packages</h2>
                <div className="gd-compare-wrap">
                  <table className="gd-compare">
                    <thead>
                      <tr>
                        <th />
                        {packages.map(([key, pkg]) => (
                          <th key={key}>{pkg.name || key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Price</td>
                        {packages.map(([key, pkg]) => (
                          <td key={key}><strong>${formatPrice(pkg.price)}</strong></td>
                        ))}
                      </tr>
                      <tr>
                        <td>Delivery</td>
                        {packages.map(([key, pkg]) => (
                          <td key={key}>{plural(pkg.delivery, "day")}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Revisions</td>
                        {packages.map(([key, pkg]) => (
                          <td key={key}>{pkg.revisions ?? "—"}</td>
                        ))}
                      </tr>
                      {allFeatures.map((feature) => (
                        <tr key={feature}>
                          <td>{feature}</td>
                          {packages.map(([key, pkg]) =>
                            pkg.features?.includes(feature) ? (
                              <td key={key} className="yes" aria-label="Included">✓</td>
                            ) : (
                              <td key={key} className="no" aria-label="Not included">—</td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {gig.requirementQuestions?.length || gig.requirementsText ? (
              <div className="gig-detail-block">
                <h2>What the seller needs from you</h2>
                {gig.requirementQuestions?.length ? (
                  <ol className="gd-req-list">
                    {gig.requirementQuestions.map((q, i) => (
                      <li key={i}>
                        {q.question}
                        {q.required ? " *" : ""}
                      </li>
                    ))}
                  </ol>
                ) : null}
                {gig.requirementsText ? <p className="gig-detail-desc">{gig.requirementsText}</p> : null}
              </div>
            ) : null}

            {gig.faq && gig.faq.length > 0 ? (
              <div className="gig-detail-block gd-faq">
                <h2>FAQ</h2>
                {gig.faq.map((f, i) => (
                  <details key={i}>
                    <summary>{f.question}</summary>
                    <p>{f.answer}</p>
                  </details>
                ))}
              </div>
            ) : null}

            {gig.skills.length > 0 || (gig.tags ?? []).length > 0 ? (
              <div className="gig-detail-block">
                <h2>Skills</h2>
                <div className="chips">
                  {gig.skills.map((skill) => (
                    <span className="chip" key={skill}>{skill}</span>
                  ))}
                  {(gig.tags ?? []).map((tag) => (
                    <Link className="chip" key={`tag-${tag}`} href={`/search?q=${encodeURIComponent(tag)}`}>
                      #{tag}
                    </Link>
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
              {packages.length > 1 ? (
                <div className="gd-tabs" role="tablist">
                  {packages.map(([key, pkg]) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={key === pkgKey}
                      className={key === pkgKey ? "active" : ""}
                      onClick={() => setSelectedPkg(key)}
                    >
                      {pkg.name || key}
                    </button>
                  ))}
                </div>
              ) : null}

              {currentPkg ? (
                <>
                  <div className="gd-pkg-head">
                    <span className="gw-cap" style={{ fontWeight: 700 }}>{currentPkg.name || pkgKey}</span>
                    <strong>${formatPrice(currentPkg.price)}</strong>
                  </div>
                  {currentPkg.description || currentPkg.note ? (
                    <p className="gd-pkg-desc">{currentPkg.description || currentPkg.note}</p>
                  ) : null}
                  <div className="gd-pkg-meta">
                    <span>⏱ {plural(currentPkg.delivery, "day")}</span>
                    {currentPkg.revisions != null ? <span>↻ {plural(currentPkg.revisions, "revision")}</span> : null}
                  </div>
                  {allFeatures.length > 0 ? (
                    <ul className="gd-pkg-features">
                      {allFeatures.map((f) => (
                        <li key={f} className={currentPkg.features?.includes(f) ? "" : "off"}>{f}</li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="price-card-row">
                    <span>{t("card.startingAt")}</span>
                    <strong>${formatPrice(gig.price)}</strong>
                  </div>
                  <div className="price-card-row muted">
                    <span>Delivery</span>
                    <strong>{gig.delivery}</strong>
                  </div>
                </>
              )}

              {gig.extras && gig.extras.length > 0 ? (
                <div className="gd-extras">
                  <span className="gw-muted">Add extras</span>
                  {gig.extras.map((extra) => (
                    <label key={extra.label}>
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes(extra.label)}
                        onChange={() => toggleExtra(extra.label)}
                      />
                      <span>
                        {extra.label}
                        {extra.days ? ` (${extra.days > 0 ? "+" : ""}${extra.days}d)` : ""}
                      </span>
                      <span>+${formatPrice(extra.price)}</span>
                    </label>
                  ))}
                </div>
              ) : null}

              <div className="gd-total">
                <span>Total · {plural(quote.days, "day")}</span>
                <span>${formatPrice(quote.total)}</span>
              </div>

              <textarea
                className="price-card-req"
                rows={3}
                value={requirements}
                placeholder={
                  gig.requirementQuestions?.length
                    ? gig.requirementQuestions.map((q, i) => `${i + 1}. ${q.question}`).join("\n")
                    : "Describe what you need (optional)…"
                }
                onChange={(event) => setRequirements(event.target.value)}
              />
              <button
                className="btn-primary price-card-cta"
                type="button"
                disabled={ordering || isOwner || status !== "published"}
                onClick={() => requireAuth(() => void placeOrder())}
              >
                {ordering
                  ? "Starting checkout…"
                  : status !== "published"
                    ? "Not available"
                    : `Continue · $${formatPrice(quote.total)}`}
              </button>
              {gig.sellerId && !isOwner ? (
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
