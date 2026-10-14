"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import { getRecentViews } from "@/lib/recent-views";
import type { RecentGig } from "@/lib/recent-views";

interface BuyerOrder {
  id: string;
  gig_id: string | null;
  amount: number;
  status: string;
  created_at: string;
  title: string;
  sellerName: string;
}

interface BuyerStats {
  active: number;
  completed: number;
  totalSpent: number;
  savedCount: number;
  requestCount: number;
}

const STATUS_COLOR: Record<string, string> = {
  pending: "#d97706",
  paid: "#0066cc",
  delivered: "#059669",
  revision: "#d97706",
  completed: "#059669",
  cancelled: "#6b7280",
  disputed: "#dc2626",
};

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [stats, setStats] = useState<BuyerStats>({ active: 0, completed: 0, totalSpent: 0, savedCount: 0, requestCount: 0 });
  const [recentViews, setRecentViews] = useState<RecentGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !user?.sub) return;
    let cancelled = false;
    const uid = user.sub;

    const loadData = async () => {
      const [ordersRes, favsRes, reqsRes] = await Promise.all([
        supabase.from("orders").select("*").eq("buyer_id", uid).order("created_at", { ascending: false }),
        supabase.from("favorites").select("gig_id").eq("user_id", uid),
        supabase.from("job_posts").select("id").eq("buyer_id", uid),
      ]);

      if (cancelled) return;

      const rawOrders = (ordersRes.data ?? []) as {
        id: string;
        gig_id: string | null;
        seller_id: string | null;
        amount: number;
        status: string;
        created_at: string;
        title?: string | null;
      }[];

      const gigIds = [...new Set(rawOrders.map((o) => o.gig_id).filter(Boolean))] as string[];
      const sellerIds = [...new Set(rawOrders.map((o) => o.seller_id).filter(Boolean))] as string[];

      const [gigsRes, sellersRes] = await Promise.all([
        gigIds.length ? supabase.from("gigs").select("id, title").in("id", gigIds) : Promise.resolve({ data: [] }),
        sellerIds.length ? supabase.from("profiles").select("user_id, full_name").in("user_id", sellerIds) : Promise.resolve({ data: [] }),
      ]);

      if (cancelled) return;

      const gigMap = Object.fromEntries(
        ((gigsRes.data ?? []) as { id: string; title: string }[]).map((g) => [g.id, g.title]),
      );
      const nameMap = Object.fromEntries(
        ((sellersRes.data ?? []) as { user_id: string; full_name: string | null }[]).map((p) => [p.user_id, p.full_name ?? "Seller"]),
      );

      const mapped: BuyerOrder[] = rawOrders.map((o) => ({
        id: o.id,
        gig_id: o.gig_id,
        amount: o.amount,
        status: o.status,
        created_at: o.created_at,
        title: o.title || (o.gig_id ? gigMap[o.gig_id] ?? "Lyx" : "Custom order"),
        sellerName: o.seller_id ? nameMap[o.seller_id] ?? "Seller" : "Seller",
      }));

      let totalSpent = 0;
      let activeCount = 0;
      let completedCount = 0;
      for (const o of mapped) {
        if (o.status === "completed") {
          totalSpent += Number(o.amount);
          completedCount++;
        } else if (o.status !== "cancelled" && o.status !== "pending") {
          activeCount++;
        }
      }

      setOrders(mapped);
      setStats({
        active: activeCount,
        completed: completedCount,
        totalSpent,
        savedCount: (favsRes.data ?? []).length,
        requestCount: (reqsRes.data ?? []).length,
      });

      try {
        setRecentViews(getRecentViews().slice(0, 6));
      } catch { /* noop */ }

      setLoading(false);
    };

    void loadData();
    return () => { cancelled = true; };
  }, [user?.sub]);

  if (!user) {
    return (
      <div className="sd-empty">
        <h3>Sign in to see your buyer dashboard</h3>
        <button className="btn-primary" type="button" onClick={() => openAuth("login")}>Sign in</button>
      </div>
    );
  }

  const activeStatuses = ["paid", "delivered", "revision", "disputed"];
  const filtered =
    filter === "all" ? orders
      : filter === "active" ? orders.filter((o) => activeStatuses.includes(o.status))
      : filter === "completed" ? orders.filter((o) => o.status === "completed")
      : orders.filter((o) => o.status === "cancelled");

  const filterCounts = {
    all: orders.length,
    active: orders.filter((o) => activeStatuses.includes(o.status)).length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <>
      {/* ── Overview Stats ── */}
      <div className="sd-overview">
        <div className="sd-stat-card">
          <span className="sd-stat-label">Active Orders</span>
          <strong className="sd-stat-value">{stats.active}</strong>
          <span className="sd-stat-sub accent">In progress</span>
        </div>
        <div className="sd-stat-card">
          <span className="sd-stat-label">Completed</span>
          <strong className="sd-stat-value">{stats.completed}</strong>
          <span className="sd-stat-sub emerald">Delivered</span>
        </div>
        <div className="sd-stat-card sd-earning">
          <span className="sd-stat-label">Total Spent</span>
          <strong className="sd-stat-value">${stats.totalSpent.toFixed(2)}</strong>
          <span className="sd-stat-sub">All time</span>
        </div>
        <div className="sd-stat-card">
          <span className="sd-stat-label">Saved Lyxes</span>
          <strong className="sd-stat-value">{stats.savedCount}</strong>
          <Link href="/favorites" className="sd-stat-sub accent">View all</Link>
        </div>
        <div className="sd-stat-card">
          <span className="sd-stat-label">My Requests</span>
          <strong className="sd-stat-value">{stats.requestCount}</strong>
          <Link href="/requests" className="sd-stat-sub accent">View all</Link>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="bd-actions">
        <Link href="/search" className="bd-action-card">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <div>
            <strong>Browse Lyxes</strong>
            <span>Find the perfect freelancer</span>
          </div>
        </Link>
        <Link href="/requests/new" className="bd-action-card">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <div>
            <strong>Post a Request</strong>
            <span>Get quotes from sellers</span>
          </div>
        </Link>
        <Link href="/favorites" className="bd-action-card">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <div>
            <strong>Saved Lyxes</strong>
            <span>{stats.savedCount} lyxes saved</span>
          </div>
        </Link>
      </div>

      {/* ── Orders Section ── */}
      <div className="sd-gigs-section">
        <div className="sd-gigs-header">
          <h3>My Orders</h3>
        </div>

        <div className="sd-tabs" role="tablist">
          {(
            [
              { key: "all" as const, label: "All" },
              { key: "active" as const, label: "Active" },
              { key: "completed" as const, label: "Completed" },
              { key: "cancelled" as const, label: "Cancelled" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={filter === key ? "sd-tab active" : "sd-tab"}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className="sd-tab-count">{filterCounts[key]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "var(--muted)", padding: 20 }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="sd-empty">
            <div className="sd-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h3>{orders.length === 0 ? "No orders yet" : "Nothing here"}</h3>
            <p>{orders.length === 0 ? "Browse lyxes and place your first order." : "No orders match this filter."}</p>
            {orders.length === 0 && (
              <Link href="/search" className="btn-primary">Browse Lyxes</Link>
            )}
          </div>
        ) : (
          <div className="bd-orders-list">
            {filtered.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="bd-order-row">
                <div className="bd-order-info">
                  <span className="bd-order-title">{order.title}</span>
                  <span className="bd-order-meta">
                    <span className="bd-order-seller">{order.sellerName}</span>
                    <span className="bd-order-date">{new Date(order.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                  </span>
                </div>
                <div className="bd-order-right">
                  <span className="bd-order-amount">${formatPrice(order.amount)}</span>
                  <span className="bd-order-status" style={{ color: STATUS_COLOR[order.status] ?? "#6b7280" }}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Recently Viewed ── */}
      {recentViews.length > 0 && (
        <div className="bd-recent-section">
          <h3>Recently Viewed</h3>
          <div className="bd-recent-grid">
            {recentViews.map((view) => (
              <Link key={view.id} href={`/gig/${view.id}`} className="bd-recent-card">
                {view.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={view.image} alt="" className="bd-recent-img" loading="lazy" />
                ) : (
                  <span className="bd-recent-img sd-placeholder" />
                )}
                <div className="bd-recent-info">
                  <span className="bd-recent-title">{view.title}</span>
                  <span className="bd-recent-price">From ${formatPrice(view.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
