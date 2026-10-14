"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";

interface OrderRow {
  id: string;
  gig_id: string | null;
  buyer_id: string;
  seller_id: string | null;
  amount: number;
  currency: string;
  status: string;
  requirements: string | null;
  created_at: string;
  delivery_note: string | null;
  revision_note: string | null;
  revision_count: number | null;
  title?: string | null;
}

interface Order extends OrderRow {
  gigTitle: string;
  role: "buyer" | "seller";
  counterpart: string;
  gigImage?: string;
}

const STATUS_CLASS: Record<string, string> = {
  pending: "warn",
  paid: "ok",
  delivered: "ok",
  revision: "warn",
  completed: "ok",
  cancelled: "muted",
  disputed: "warn",
};

const STATUS_STEPS = ["paid", "delivered", "completed"];

type TabFilter = "all" | "active" | "completed" | "cancelled";

const TABS: { key: TabFilter; label: string }[] = [
  { key: "all", label: "All orders" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function StatusTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="ord-timeline">
      {STATUS_STEPS.map((step, i) => {
        const done = currentIdx >= i;
        const active = currentIdx === i;
        return (
          <div key={step} className={`ord-tl-step${done ? " done" : ""}${active ? " active" : ""}`}>
            <div className="ord-tl-dot" />
            {i < STATUS_STEPS.length - 1 && <div className="ord-tl-line" />}
            <span className="ord-tl-label">{step === "paid" ? "In progress" : step === "delivered" ? "Delivered" : "Completed"}</span>
          </div>
        );
      })}
    </div>
  );
}

function TimeAgo({ date }: { date: string }) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return <span>{Math.max(1, Math.floor(diff / 3600000))}h ago</span>;
  if (days < 30) return <span>{days}d ago</span>;
  return <span>{new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNote, setActionNote] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<Record<string, number>>({});
  const [reviewComment, setReviewComment] = useState<Record<string, string>>({});
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<TabFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !user?.sub) return;
    void supabase
      .from("reviews")
      .select("gig_id")
      .eq("reviewer_id", user.sub)
      .then(({ data }) => {
        const map: Record<string, boolean> = {};
        for (const r of (data ?? []) as { gig_id: string }[]) map[r.gig_id] = true;
        setReviewed((prev) => ({ ...prev, ...map }));
      });
  }, [user]);

  const submitReview = async (order: Order) => {
    const supabase = getSupabase();
    if (!supabase || !order.gig_id) return;
    const rating = reviewRating[order.id];
    if (!rating) {
      setActionError("Please select a rating.");
      return;
    }
    setBusyId(order.id + "review");
    setActionError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setActionError("Please sign in again.");
      setBusyId(null);
      return;
    }
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        action: "submit",
        orderId: order.id,
        rating,
        comment: reviewComment[order.id] ?? "",
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setBusyId(null);
    if (!res.ok) {
      setActionError(payload.error ?? "Could not submit review.");
      return;
    }
    setReviewed((prev) => ({ ...prev, [order.gig_id as string]: true }));
  };

  const runAction = async (orderId: string, action: "deliver" | "accept" | "revision" | "cancel") => {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusyId(orderId + action);
    setActionError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setActionError("Please sign in again.");
      setBusyId(null);
      return;
    }
    const res = await fetch("/api/orders/action", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId, action, note: actionNote[orderId] ?? "" }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setActionError(payload.error ?? "Action failed.");
      setBusyId(null);
      return;
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: action === "deliver" ? "delivered" : action === "accept" ? "completed" : action === "cancel" ? "cancelled" : "revision",
              delivery_note: action === "deliver" ? actionNote[orderId] || null : o.delivery_note,
              revision_note: action === "revision" ? actionNote[orderId] || null : o.revision_note,
              revision_count: action === "revision" ? (o.revision_count ?? 0) + 1 : o.revision_count,
            }
          : o,
      ),
    );
    setActionNote((prev) => ({ ...prev, [orderId]: "" }));
    setBusyId(null);
  };

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !user?.sub) return;
    let cancelled = false;
    const userId = user.sub;

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      if (sessionId) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.access_token) {
          await fetch("/api/orders/confirm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
            body: JSON.stringify({ sessionId }),
          });
        }
      }
      return supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
    };

    void run().then(async ({ data }) => {
        if (cancelled) return;
        const rows = (data ?? []) as OrderRow[];
        if (rows.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }
        const gigIds = [...new Set(rows.map((r) => r.gig_id).filter(Boolean))] as string[];
        const peopleIds = [
          ...new Set(
            rows.flatMap((r) => [r.buyer_id, r.seller_id].filter(Boolean) as string[]),
          ),
        ];
        const [{ data: gigs }, { data: people }] = await Promise.all([
          gigIds.length
            ? supabase.from("gigs").select("id, title, images").in("id", gigIds)
            : Promise.resolve({ data: [] as { id: string; title: string; images: string[] | null }[] }),
          supabase.from("profiles").select("user_id, full_name").in("user_id", peopleIds),
        ]);
        if (cancelled) return;
        const gigMap = Object.fromEntries(
          ((gigs ?? []) as { id: string; title: string; images: string[] | null }[]).map((g) => [g.id, g]),
        );
        const nameMap = Object.fromEntries(
          ((people ?? []) as { user_id: string; full_name: string | null }[]).map((p) => [
            p.user_id,
            p.full_name ?? "User",
          ]),
        );
        setOrders(
          rows.map((row) => {
            const role: "buyer" | "seller" = row.buyer_id === userId ? "buyer" : "seller";
            const counterpartId = role === "buyer" ? row.seller_id : row.buyer_id;
            const gigData = row.gig_id ? gigMap[row.gig_id] : undefined;
            return {
              ...row,
              role,
              gigTitle: row.title || (gigData?.title ?? (row.gig_id ? "Lyx" : "Custom order")),
              counterpart: counterpartId ? nameMap[counterpartId] ?? "User" : "User",
              gigImage: gigData?.images?.[0] ?? undefined,
            };
          }),
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = useMemo(() => {
    let list = orders;
    if (tab === "active") list = list.filter((o) => ["paid", "delivered", "revision", "pending"].includes(o.status));
    else if (tab === "completed") list = list.filter((o) => o.status === "completed");
    else if (tab === "cancelled") list = list.filter((o) => o.status === "cancelled");
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((o) => o.gigTitle.toLowerCase().includes(q) || o.counterpart.toLowerCase().includes(q));
    }
    return list;
  }, [orders, tab, searchTerm]);

  const counts = useMemo(() => ({
    all: orders.length,
    active: orders.filter((o) => ["paid", "delivered", "revision", "pending"].includes(o.status)).length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  }), [orders]);

  if (!user) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Sign in to see your orders</h3>
            <p>Track purchases and sales in one place.</p>
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
            <div className="kicker">Orders</div>
            <h2>Your orders</h2>
            <p className="sub">Track purchases and sales on Hirelyx.</p>
          </div>
          <Link className="btn-post" href="/search">
            Browse lyxes
          </Link>
        </div>

        {!loading && orders.length > 0 && (
          <div className="ord-stats">
            <div className="ord-stat">
              <span className="ord-stat-num">{counts.all}</span>
              <span className="ord-stat-label">Total</span>
            </div>
            <div className="ord-stat">
              <span className="ord-stat-num ord-stat-active">{counts.active}</span>
              <span className="ord-stat-label">Active</span>
            </div>
            <div className="ord-stat">
              <span className="ord-stat-num ord-stat-done">{counts.completed}</span>
              <span className="ord-stat-label">Completed</span>
            </div>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="ord-controls">
            <div className="ord-tabs">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`ord-tab${tab === t.key ? " on" : ""}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                  <span className="ord-tab-count">{counts[t.key]}</span>
                </button>
              ))}
            </div>
            <input
              type="text"
              className="ord-search"
              placeholder="Search orders…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {loading ? (
          <div className="empty">
            <div className="sf-spinner" />
            <p style={{ color: "var(--muted)" }}>Loading orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty">
            <h3>No orders yet</h3>
            <p>When you buy or sell a lyx, it will show up here.</p>
            <Link className="btn-primary" href="/search">
              Browse lyxes
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <h3>No matching orders</h3>
            <p>Try a different filter or search term.</p>
          </div>
        ) : (
          <ul className="order-list">
            {filtered.map((order) => (
              <li key={order.id} className="order-row ord-card">
                <div className="ord-card-top">
                  {order.gigImage && (
                    <div className="ord-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={order.gigImage} alt="" />
                    </div>
                  )}
                  <div className="ord-card-info">
                    <div className="ord-card-title">
                      {order.gig_id ? (
                        <Link href={`/gig/${order.gig_id}`}>{order.gigTitle}</Link>
                      ) : (
                        order.gigTitle
                      )}
                    </div>
                    <div className="ord-card-meta">
                      <span className={"status-pill " + (STATUS_CLASS[order.status] ?? "muted")}>
                        {order.status}
                      </span>
                      <span className="ord-role-tag">{order.role === "buyer" ? "Buying" : "Selling"}</span>
                      <span>{order.role === "buyer" ? `Seller: ${order.counterpart}` : `Buyer: ${order.counterpart}`}</span>
                      <span className="ord-amount">${formatPrice(order.amount)}</span>
                    </div>
                    <div className="ord-card-date">
                      <TimeAgo date={order.created_at} />
                      {order.revision_count ? <span> · {order.revision_count} revision{order.revision_count > 1 ? "s" : ""}</span> : null}
                    </div>
                  </div>
                  <Link className="btn-ghost btn-sm ord-open" href={`/orders/${order.id}`}>Open →</Link>
                </div>

                {["paid", "delivered", "completed"].includes(order.status) && (
                  <StatusTimeline status={order.status} />
                )}

                {order.delivery_note && (
                  <p className="order-note">
                    <strong>Delivery:</strong> {order.delivery_note}
                  </p>
                )}
                {order.status === "revision" && order.revision_note && (
                  <p className="order-note">
                    <strong>Revision requested:</strong> {order.revision_note}
                  </p>
                )}
                {order.role === "seller" && (order.status === "paid" || order.status === "revision") ? (
                  <div className="order-actions">
                    <textarea
                      placeholder="Delivery note (link to files, message to buyer...)"
                      value={actionNote[order.id] ?? ""}
                      onChange={(e) => setActionNote((p) => ({ ...p, [order.id]: e.target.value }))}
                    />
                    <button
                      className="btn-primary"
                      type="button"
                      disabled={busyId === order.id + "deliver"}
                      onClick={() => runAction(order.id, "deliver")}
                    >
                      {busyId === order.id + "deliver" ? "Delivering..." : "Deliver work"}
                    </button>
                  </div>
                ) : null}
                {order.role === "buyer" && order.status === "delivered" ? (
                  <div className="order-actions">
                    <textarea
                      placeholder="Note (optional — required for revision)"
                      value={actionNote[order.id] ?? ""}
                      onChange={(e) => setActionNote((p) => ({ ...p, [order.id]: e.target.value }))}
                    />
                    <div className="ord-action-btns">
                      <button
                        className="btn-primary"
                        type="button"
                        disabled={busyId === order.id + "accept"}
                        onClick={() => runAction(order.id, "accept")}
                      >
                        {busyId === order.id + "accept" ? "Accepting..." : "Accept delivery"}
                      </button>
                      <button
                        className="btn-post"
                        type="button"
                        disabled={busyId === order.id + "revision"}
                        onClick={() => runAction(order.id, "revision")}
                      >
                        {busyId === order.id + "revision" ? "Sending..." : "Request revision"}
                      </button>
                    </div>
                  </div>
                ) : null}
                {order.role === "buyer" && order.status === "completed" && order.gig_id ? (
                  reviewed[order.gig_id] ? (
                    <p className="order-note ord-review-done">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-deep)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Review submitted — thanks!
                    </p>
                  ) : (
                    <div className="order-actions ord-review-form">
                      <div className="ord-star-row">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`ord-star-btn${(reviewRating[order.id] ?? 0) >= s ? " on" : ""}`}
                            onClick={() => setReviewRating((p) => ({ ...p, [order.id]: s }))}
                            aria-label={`${s} star${s > 1 ? "s" : ""}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Write a short review…"
                        value={reviewComment[order.id] ?? ""}
                        onChange={(e) =>
                          setReviewComment((p) => ({ ...p, [order.id]: e.target.value }))
                        }
                      />
                      <button
                        className="btn-primary"
                        type="button"
                        disabled={busyId === order.id + "review"}
                        onClick={() => submitReview(order)}
                      >
                        {busyId === order.id + "review" ? "Submitting..." : "Submit review"}
                      </button>
                    </div>
                  )
                ) : null}
                {order.status === "pending" ? (
                  <div className="order-actions">
                    <button
                      className="btn-ghost"
                      type="button"
                      disabled={busyId === order.id + "cancel"}
                      onClick={() => {
                        if (window.confirm("Cancel this unpaid order?")) {
                          void runAction(order.id, "cancel");
                        }
                      }}
                    >
                      {busyId === order.id + "cancel" ? "Cancelling..." : "Cancel order"}
                    </button>
                  </div>
                ) : null}
                {order.status === "disputed" ? (
                  <p className="order-note">Under review in the resolution center.</p>
                ) : null}
                {actionError && busyId === null ? <p className="order-note">{actionError}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
