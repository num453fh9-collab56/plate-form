"use client";

import { useEffect, useState } from "react";
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
}

interface Order extends OrderRow {
  gigTitle: string;
  role: "buyer" | "seller";
  counterpart: string;
}

const STATUS_CLASS: Record<string, string> = {
  pending: "warn",
  paid: "ok",
  delivered: "ok",
  revision: "warn",
  completed: "ok",
  cancelled: "muted",
};

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
    const { error } = await supabase.from("reviews").insert({
      gig_id: order.gig_id,
      reviewer_id: user?.sub,
      seller_id: order.seller_id,
      rating,
      comment: reviewComment[order.id] ?? "",
    });
    setBusyId(null);
    if (error) {
      setActionError(error.code === "23505" ? "You already reviewed this gig." : error.message);
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
            ? supabase.from("gigs").select("id, title").in("id", gigIds)
            : Promise.resolve({ data: [] as { id: string; title: string }[] }),
          supabase.from("profiles").select("user_id, full_name").in("user_id", peopleIds),
        ]);
        if (cancelled) return;
        const gigMap = Object.fromEntries(
          ((gigs ?? []) as { id: string; title: string }[]).map((g) => [g.id, g.title]),
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
            return {
              ...row,
              role,
              gigTitle: row.gig_id ? gigMap[row.gig_id] ?? "Gig" : "Gig",
              counterpart: counterpartId ? nameMap[counterpartId] ?? "User" : "User",
            };
          }),
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

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
            <p className="sub">Purchases and sales on Hirelyx.</p>
          </div>
          <Link className="btn-post" href="/search">
            Browse gigs
          </Link>
        </div>

        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading orders…</p>
        ) : orders.length === 0 ? (
          <div className="empty">
            <h3>No orders yet</h3>
            <p>When you buy or sell a gig, it will show up here.</p>
            <Link className="btn-primary" href="/search">
              Browse gigs
            </Link>
          </div>
        ) : (
          <ul className="order-list">
            {orders.map((order) => (
              <li key={order.id} className="order-row">
                <div className="order-main">
                  <div className="order-title">
                    {order.gig_id ? (
                      <Link href={`/gig/${order.gig_id}`}>{order.gigTitle}</Link>
                    ) : (
                      order.gigTitle
                    )}
                  </div>
                  <div className="order-meta">
                    <span className={"status-pill " + (STATUS_CLASS[order.status] ?? "muted")}>
                      {order.status}
                    </span>
                    <span>
                      {order.role === "buyer" ? `Seller: ${order.counterpart}` : `Buyer: ${order.counterpart}`}
                    </span>
                    <span>${formatPrice(order.amount)}</span>
                    {order.revision_count ? <span>Revisions: {order.revision_count}</span> : null}
                    <Link href={`/orders/${order.id}`}>Details</Link>
                  </div>
                  {order.delivery_note && order.status !== "completed" ? (
                    <p className="order-note">Delivery note: {order.delivery_note}</p>
                  ) : null}
                  {order.status === "completed" && order.delivery_note ? (
                    <p className="order-note">Delivery note: {order.delivery_note}</p>
                  ) : null}
                  {order.status === "revision" && order.revision_note ? (
                    <p className="order-note">Revision requested: {order.revision_note}</p>
                  ) : null}
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
                        placeholder="Note (optional - required for revision)"
                        value={actionNote[order.id] ?? ""}
                        onChange={(e) => setActionNote((p) => ({ ...p, [order.id]: e.target.value }))}
                      />
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
                  ) : null}
                  {order.role === "buyer" && order.status === "completed" && order.gig_id ? (
                    reviewed[order.gig_id] ? (
                      <p className="order-note">Thanks! Your review was submitted.</p>
                    ) : (
                      <div className="order-actions">
                        <select
                          value={reviewRating[order.id] ?? ""}
                          onChange={(e) =>
                            setReviewRating((p) => ({ ...p, [order.id]: Number(e.target.value) }))
                          }
                        >
                          <option value="">Rate this order...</option>
                          <option value="5">5 - Excellent</option>
                          <option value="4">4 - Good</option>
                          <option value="3">3 - Okay</option>
                          <option value="2">2 - Poor</option>
                          <option value="1">1 - Bad</option>
                        </select>
                        <textarea
                          placeholder="Write a short review"
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
                  {order.status !== "completed" && order.status !== "cancelled" ? (
                    <div className="order-actions">
                      <button
                        className="btn-ghost"
                        type="button"
                        disabled={busyId === order.id + "cancel"}
                        onClick={() => {
                          if (window.confirm("Cancel this order? A refund will be issued if it was paid.")) {
                            void runAction(order.id, "cancel");
                          }
                        }}
                      >
                        {busyId === order.id + "cancel" ? "Cancelling..." : "Cancel order"}
                      </button>
                    </div>
                  ) : null}
                  {actionError && busyId === null ? <p className="order-note">{actionError}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
