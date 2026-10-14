"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import { fetchSellerGigAnalytics } from "@/lib/api";
import type { GigAnalytics } from "@/lib/api";
import type { GigStatus } from "@/lib/types";
import { fetchSellerStats, LEVEL_META, LEVEL_RULES, LevelBadge } from "@/lib/seller-levels";
import type { SellerStats } from "@/lib/seller-levels";
import DashboardWelcome from "@/components/DashboardWelcome";
import BuyerDashboard from "@/components/BuyerDashboard";

type DashboardMode = "selling" | "buying";

export default function DashboardPage() {
  return (
    <Suspense fallback={<section className="section"><div className="wrap"><p style={{ color: "var(--muted)" }}>Loading dashboard...</p></div></section>}>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardInner() {
  const { user, profile } = useAuth();
  const { openAuth, openRoleSelector } = useUI();
  const searchParams = useSearchParams();
  const role = profile.role;
  const defaultMode: DashboardMode =
    role === "buyer" ? "buying" :
    role === "freelancer" ? "selling" :
    searchParams.get("mode") === "buying" ? "buying" : "selling";
  const [mode, setMode] = useState<DashboardMode>(defaultMode);

  if (!user) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Sign in to access your dashboard</h3>
            <button className="btn-primary" type="button" onClick={() => openAuth("login")}>Sign in</button>
          </div>
        </div>
      </section>
    );
  }

  if (!role) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Choose your role first</h3>
            <p style={{ color: "var(--muted)" }}>Tell us how you want to use Hirelyx to get your personalized dashboard.</p>
            <button className="btn-primary" type="button" onClick={() => openRoleSelector()}>Choose Role</button>
          </div>
        </div>
      </section>
    );
  }

  const showToggle = role === "both";
  const showSeller = role === "freelancer" || (role === "both" && mode === "selling");
  const showBuyer = role === "buyer" || (role === "both" && mode === "buying");

  return (
    <section className="section">
      <div className="wrap">
        {showToggle && (
          <div className="db-mode-switcher">
            <button
              type="button"
              className={`db-mode-btn ${mode === "selling" ? "active" : ""}`}
              onClick={() => setMode("selling")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
              Selling
            </button>
            <button
              type="button"
              className={`db-mode-btn ${mode === "buying" ? "active" : ""}`}
              onClick={() => setMode("buying")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Buying
            </button>
          </div>
        )}

        {showSeller ? <SellerDashboard /> : null}
        {showBuyer ? <BuyerDashboard /> : null}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SELLER DASHBOARD
   ══════════════════════════════════════════════════════════════════════ */

interface GigRowData {
  id: string;
  title: string;
  category: string | null;
  price: number;
  delivery_days: number;
  status?: GigStatus | null;
  views?: number | null;
  images?: string[] | null;
  custom_orders?: boolean | null;
}

interface EarningsData {
  total: number;
  completed: number;
  pending: number;
}

type StatusFilter = "all" | GigStatus;
type TimePeriod = "7" | "30" | "90";

const STATUS_LABEL: Record<GigStatus, string> = {
  published: "Active",
  paused: "Paused",
  draft: "Draft",
};

const STATUS_ICON: Record<GigStatus, string> = {
  published: "●",
  paused: "◐",
  draft: "○",
};

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function SellerDashboard() {
  const { user } = useAuth();
  const { openPost, toast } = useUI();
  const [gigs, setGigs] = useState<GigRowData[]>([]);
  const [ordersCount, setOrdersCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [period, setPeriod] = useState<TimePeriod>("30");
  const [myStats, setMyStats] = useState<SellerStats | null>(null);
  const [analytics, setAnalytics] = useState<GigAnalytics[]>([]);
  const [earnings, setEarnings] = useState<EarningsData>({ total: 0, completed: 0, pending: 0 });

  useEffect(() => {
    if (!user?.sub) return;
    const uid = user.sub;
    let cancelled = false;
    void fetchSellerStats([uid]).then((stats) => {
      if (!cancelled) setMyStats(stats[uid] ?? null);
    });
    return () => { cancelled = true; };
  }, [user?.sub]);

  useEffect(() => {
    if (!user?.sub) return;
    let cancelled = false;
    const since = dateOffset(Number(period));
    const until = todayStr();
    void fetchSellerGigAnalytics(user.sub, since, until).then((data) => {
      if (!cancelled) setAnalytics(data);
    });
    return () => { cancelled = true; };
  }, [user?.sub, period]);

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !user?.sub) return;
    const { data } = await supabase
      .from("gigs")
      .select("*")
      .eq("seller_id", user.sub)
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as GigRowData[];
    setGigs(rows);
    if (rows.length) {
      const { data: orders } = await supabase
        .from("orders")
        .select("gig_id, amount, status")
        .eq("seller_id", user.sub);
      const counts: Record<string, number> = {};
      let totalEarnings = 0;
      let completedEarnings = 0;
      let pendingEarnings = 0;
      for (const o of (orders ?? []) as { gig_id: string; amount: number; status: string }[]) {
        counts[o.gig_id] = (counts[o.gig_id] ?? 0) + 1;
        const net = Number(o.amount) * 0.9;
        totalEarnings += net;
        if (o.status === "completed") completedEarnings += net;
        else if (o.status === "active" || o.status === "delivered") pendingEarnings += net;
      }
      setOrdersCount(counts);
      setEarnings({ total: totalEarnings, completed: completedEarnings, pending: pendingEarnings });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const setStatus = async (gig: GigRowData, status: GigStatus) => {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusyId(gig.id);
    const { error } = await supabase.from("gigs").update({ status }).eq("id", gig.id);
    setBusyId(null);
    if (error) { toast(error.message); return; }
    setGigs((cur) => cur.map((g) => (g.id === gig.id ? { ...g, status } : g)));
  };

  const toggleCustomOrders = async (gig: GigRowData) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const next = !(gig.custom_orders ?? true);
    const { error } = await supabase.from("gigs").update({ custom_orders: next }).eq("id", gig.id);
    if (error) { toast(error.message); return; }
    setGigs((cur) => cur.map((g) => (g.id === gig.id ? { ...g, custom_orders: next } : g)));
  };

  const deleteGig = async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    if (!window.confirm("Delete this lyx? This cannot be undone.")) return;
    await supabase.from("gigs").delete().eq("id", id);
    void load();
  };

  const statusOf = (gig: GigRowData): GigStatus => gig.status ?? "published";
  const visible = filter === "all" ? gigs : gigs.filter((g) => statusOf(g) === filter);
  const analyticsMap = useMemo(() => {
    const map: Record<string, GigAnalytics> = {};
    for (const a of analytics) map[a.gig_id] = a;
    return map;
  }, [analytics]);

  const totals = {
    active: gigs.filter((g) => statusOf(g) === "published").length,
    paused: gigs.filter((g) => statusOf(g) === "paused").length,
    draft: gigs.filter((g) => statusOf(g) === "draft").length,
    impressions: analytics.reduce((s, a) => s + a.impressions, 0),
    clicks: analytics.reduce((s, a) => s + a.clicks, 0),
    orders: Object.values(ordersCount).reduce((sum, n) => sum + n, 0),
  };

  return (
    <>
      <div className="section-head" style={{ paddingTop: 0 }}>
        <div>
          <div className="kicker">Seller dashboard</div>
          <h2>Dashboard</h2>
          <p className="sub">Manage your lyxes, track performance, and grow your business.</p>
        </div>
        <button className="btn-post" type="button" onClick={openPost}>+ Create a new Lyx</button>
      </div>

      <DashboardWelcome />

      {myStats ? <LevelProgress stats={myStats} /> : null}

      <div className="sd-overview">
        <div className="sd-stat-card">
          <span className="sd-stat-label">Active Lyxes</span>
          <strong className="sd-stat-value">{totals.active}</strong>
          <span className="sd-stat-sub accent">{totals.active} live now</span>
        </div>
        <div className="sd-stat-card">
          <span className="sd-stat-label">Impressions</span>
          <strong className="sd-stat-value">{totals.impressions.toLocaleString()}</strong>
          <span className="sd-stat-sub">Last {period} days</span>
        </div>
        <div className="sd-stat-card">
          <span className="sd-stat-label">Clicks</span>
          <strong className="sd-stat-value">{totals.clicks.toLocaleString()}</strong>
          <span className="sd-stat-sub">Last {period} days</span>
        </div>
        <div className="sd-stat-card">
          <span className="sd-stat-label">Orders</span>
          <strong className="sd-stat-value">{totals.orders}</strong>
          <span className="sd-stat-sub">All time</span>
        </div>
        {earnings.total > 0 && (
          <>
            <div className="sd-stat-card sd-earning">
              <span className="sd-stat-label">Total Earnings</span>
              <strong className="sd-stat-value">${earnings.total.toFixed(2)}</strong>
              <span className="sd-stat-sub emerald">After 10% fee</span>
            </div>
            <div className="sd-stat-card">
              <span className="sd-stat-label">Completed</span>
              <strong className="sd-stat-value" style={{ color: "var(--emerald-deep)" }}>${earnings.completed.toFixed(2)}</strong>
              <span className="sd-stat-sub emerald">Earned</span>
            </div>
            <div className="sd-stat-card">
              <span className="sd-stat-label">In Progress</span>
              <strong className="sd-stat-value" style={{ color: "var(--accent)" }}>${earnings.pending.toFixed(2)}</strong>
              <span className="sd-stat-sub">Pending</span>
            </div>
          </>
        )}
      </div>

      <div className="sd-custom-orders-bar">
        <div>
          <strong>Accepting Custom Orders</strong>
          <span>Let buyers send you custom order requests</span>
        </div>
        <label className="sd-toggle">
          <input
            type="checkbox"
            checked={gigs.length > 0 && gigs.some((g) => g.custom_orders !== false)}
            onChange={() => {
              const allOn = gigs.every((g) => g.custom_orders !== false);
              for (const g of gigs) {
                if (allOn || g.custom_orders === false) void toggleCustomOrders(g);
              }
            }}
          />
          <span className="sd-toggle-track" />
        </label>
      </div>

      <div className="sd-gigs-section">
        <div className="sd-gigs-header">
          <h3>Lyxes</h3>
          <div className="sd-period-select">
            <select value={period} onChange={(e) => setPeriod(e.target.value as TimePeriod)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>

        <div className="sd-tabs" role="tablist">
          {(
            [
              { key: "all" as StatusFilter, label: "All", count: gigs.length },
              { key: "published" as StatusFilter, label: "Active", count: totals.active },
              { key: "paused" as StatusFilter, label: "Paused", count: totals.paused },
              { key: "draft" as StatusFilter, label: "Draft", count: totals.draft },
            ] as const
          ).map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={filter === key ? "sd-tab active" : "sd-tab"}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className="sd-tab-count">{count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "var(--muted)", padding: 20 }}>Loading...</p>
        ) : visible.length === 0 ? (
          <div className="sd-empty">
            <div className="sd-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3>{gigs.length === 0 ? "No lyxes yet" : "Nothing here"}</h3>
            <p>{gigs.length === 0 ? "Create your first lyx to start getting orders." : "No lyxes match this filter."}</p>
            {gigs.length === 0 && (
              <button className="btn-primary" type="button" onClick={openPost}>Create a new Lyx</button>
            )}
          </div>
        ) : (
          <div className="sd-table-wrap">
            <table className="sd-analytics-table">
              <thead>
                <tr>
                  <th className="sd-th-gig">LYX</th>
                  <th>Impressions</th>
                  <th>Clicks</th>
                  <th>Orders</th>
                  <th>Cancellations</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((gig) => {
                  const status = statusOf(gig);
                  const a = analyticsMap[gig.id];
                  const impressions = a?.impressions ?? 0;
                  const clicks = a?.clicks ?? 0;
                  const orders = a?.orders ?? 0;
                  const cancellations = a?.cancellations ?? 0;
                  const cancelPct = orders > 0 ? Math.round((cancellations / orders) * 100) : 0;
                  return (
                    <tr key={gig.id} className="sd-gig-row">
                      <td className="sd-td-gig">
                        <div className="sd-gig-cell">
                          {gig.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img className="sd-gig-thumb" src={gig.images[0]} alt="" loading="lazy" />
                          ) : (
                            <span className="sd-gig-thumb sd-placeholder" aria-hidden="true" />
                          )}
                          <div className="sd-gig-meta">
                            <Link href={`/gig/${gig.id}`} className="sd-gig-title">{gig.title}</Link>
                            <div className="sd-gig-tags">
                              <span className={`sd-badge ${status}`}>
                                {STATUS_ICON[status]} {STATUS_LABEL[status]}
                              </span>
                              {gig.category && <span className="sd-gig-cat">{gig.category}</span>}
                              <span className="sd-gig-price">From ${formatPrice(gig.price)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="sd-td-num"><span className="sd-num">{impressions.toLocaleString()}</span></td>
                      <td className="sd-td-num"><span className="sd-num">{clicks.toLocaleString()}</span></td>
                      <td className="sd-td-num"><span className="sd-num">{orders}</span></td>
                      <td className="sd-td-num">
                        <span className={`sd-num ${cancelPct > 10 ? "sd-warn" : ""}`}>{cancelPct}%</span>
                      </td>
                      <td className="sd-td-actions">
                        <div className="sd-action-group">
                          <Link className="sd-action-btn" href={`/post-project?edit=${gig.id}`} title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </Link>
                          {status === "published" ? (
                            <button className="sd-action-btn" type="button" disabled={busyId === gig.id} onClick={() => void setStatus(gig, "paused")} title="Pause">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                            </button>
                          ) : (
                            <button className="sd-action-btn sd-play" type="button" disabled={busyId === gig.id} onClick={() => void setStatus(gig, "published")} title={status === "draft" ? "Publish" : "Resume"}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </button>
                          )}
                          <button className="sd-action-btn sd-del" type="button" onClick={() => void deleteGig(gig.id)} title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   LEVEL PROGRESS (shared)
   ══════════════════════════════════════════════════════════════════════ */

function LevelProgress({ stats }: { stats: SellerStats }) {
  const order = ["new", "level_1", "level_2", "top_rated"] as const;
  const next = LEVEL_RULES.find((rule) => order.indexOf(rule.level) > order.indexOf(stats.level));
  const [now] = useState(() => Date.now());
  const days = stats.memberSince ? Math.floor((now - new Date(stats.memberSince).getTime()) / 86400000) : 0;
  const checks = next
    ? [
        { label: `${next.orders} completed orders`, value: `${stats.completed}/${next.orders}`, pct: stats.completed / next.orders },
        { label: `${next.rating}+ rating`, value: stats.reviews ? stats.rating.toFixed(2) : "No reviews", pct: stats.rating / next.rating },
        { label: `${next.days} days on Hirelyx`, value: `${days}/${next.days}`, pct: days / next.days },
        ...(next.onTime
          ? [{ label: `${next.onTime}% on-time delivery`, value: stats.onTime == null ? "—" : `${stats.onTime}%`, pct: (stats.onTime ?? 100) / next.onTime }]
          : []),
      ]
    : [];
  return (
    <div className="gw-card lvl-card">
      <div className="gw-card-head">
        <div>
          <span className="gw-muted">Your seller level</span>
          <h3><LevelBadge level={stats.level} /></h3>
        </div>
        {next ? <span className="gw-muted">Next: {LEVEL_META[next.level].label}</span> : <span className="gw-muted">Highest level reached</span>}
      </div>
      {next ? (
        <div className="lvl-checks">
          {checks.map((c) => (
            <div key={c.label} className={c.pct >= 1 ? "done" : ""}>
              <div className="lvl-check-head">
                <span>{c.pct >= 1 ? "✓ " : ""}{c.label}</span>
                <strong>{c.value}</strong>
              </div>
              <div className="gw-meter"><span style={{ width: `${Math.min(100, c.pct * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
