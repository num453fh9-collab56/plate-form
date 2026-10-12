"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { adminFetch, useIsAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import {
  fetchAnalytics,
  fetchTopPages,
  fetchHourlyTraffic,
  fetchDailyVisitors,
  fetchDeviceStats,
  fetchBrowserStats,
  fetchCountryStats,
  fetchReferrerStats,
  fetchLiveVisitors,
} from "@/lib/analytics";
import type {
  AnalyticsSummary,
  TopPage,
  HourlyData,
  DailyData,
  DeviceData,
  BrowserData,
  CountryData,
  ReferrerData,
  LiveVisitor,
} from "@/lib/analytics";

type Tab = "overview" | "traffic" | "gigs" | "users" | "orders" | "disputes" | "errors";

interface Overview {
  users: number;
  gigs: number;
  liveGigs: number;
  orders: number;
  banned: number;
  openDisputes: number;
  revenue: number;
  errors24h: number;
}

interface GigItem {
  id: string;
  title: string;
  seller_name: string | null;
  seller_id: string | null;
  status: string | null;
  price: number;
  views: number | null;
  created_at: string;
}

interface UserItem {
  user_id: string;
  full_name: string | null;
  title: string | null;
  country: string | null;
  created_at: string;
  email: string;
  banned: boolean;
  banReason: string | null;
  isAdmin: boolean;
}

interface OrderItem {
  id: string;
  gig_id: string | null;
  amount: number;
  currency: string;
  status: string;
  package_key: string | null;
  created_at: string;
}

interface DisputeItem {
  id: string;
  order_id: string;
  opened_by: string;
  reason: string;
  details: string;
  status: string;
  resolution: string | null;
  refund_amount: number | null;
  admin_note: string | null;
  created_at: string;
  order: { id: string; title: string | null; amount: number; buyer_id: string; seller_id: string | null; status: string } | null;
  buyerName: string;
  sellerName: string;
  messages: { id: string; sender_id: string; body: string; is_admin: boolean; created_at: string }[];
}

interface ErrorItem {
  id: number;
  created_at: string;
  source: string;
  message: string;
  digest: string | null;
  path: string | null;
  context: { stack?: string; routePath?: string; kind?: string } | null;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "traffic", label: "Traffic" },
  { key: "gigs", label: "Gigs" },
  { key: "users", label: "Users" },
  { key: "orders", label: "Orders" },
  { key: "disputes", label: "Disputes" },
  { key: "errors", label: "Errors" },
];

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function AdminPage() {
  const { user } = useAuth();
  const { openAuth, toast } = useUI();
  const isAdmin = useIsAdmin(user?.sub);
  const [tab, setTab] = useState<Tab>("overview");
  const [query, setQuery] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [openError, setOpenError] = useState<number | null>(null);
  const [traffic, setTraffic] = useState<AnalyticsSummary | null>(null);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [browsers, setBrowsers] = useState<BrowserData[]>([]);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [referrers, setReferrers] = useState<ReferrerData[]>([]);
  const [liveVisitors, setLiveVisitors] = useState<LiveVisitor[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ view: tab });
    if (query.trim() && (tab === "gigs" || tab === "users")) params.set("q", query.trim());
    if (tab === "traffic") {
      setTrafficLoading(true);
      const [data, pages, hours, days, dev, brow, ctry, ref, live] = await Promise.all([
        fetchAnalytics(),
        fetchTopPages(),
        fetchHourlyTraffic(),
        fetchDailyVisitors(),
        fetchDeviceStats(),
        fetchBrowserStats(),
        fetchCountryStats(),
        fetchReferrerStats(),
        fetchLiveVisitors(),
      ]);
      setTraffic(data);
      setTopPages(pages);
      setHourly(hours);
      setDaily(days);
      setDevices(dev);
      setBrowsers(brow);
      setCountries(ctry);
      setReferrers(ref);
      setLiveVisitors(live);
      setTrafficLoading(false);
    } else if (tab === "overview") {
      const { data, error } = await adminFetch<Overview>(`/api/admin?${params}`);
      if (error) toast(error);
      setOverview(data ?? null);
    } else {
      const { data, error } = await adminFetch<{ items: unknown[] }>(`/api/admin?${params}`);
      if (error) toast(error);
      setItems(data?.items ?? []);
    }
    setLoading(false);
  }, [tab, query, toast]);

  useEffect(() => {
    if (!isAdmin) return;
    const timer = setTimeout(() => void load(), query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [isAdmin, load, query]);

  useEffect(() => {
    if (!isAdmin || tab !== "traffic") return;
    const interval = setInterval(() => void load(), 15_000);
    return () => clearInterval(interval);
  }, [isAdmin, tab, load]);

  const act = async (action: string, id: string, confirmText?: string, reason?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(id);
    const { error } = await adminFetch("/api/admin", { method: "POST", body: { action, id, reason } });
    setBusy(null);
    if (error) {
      toast(error);
      return;
    }
    toast("Done.");
    void load();
  };

  if (!user) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Sign in to continue</h3>
            <button className="btn-primary" type="button" onClick={() => openAuth("login")}>
              Sign in
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (isAdmin === null) {
    return (
      <section className="section">
        <div className="wrap">
          <p style={{ color: "var(--muted)" }}>Checking access…</p>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty status-page">
            <div className="status-page-icon" aria-hidden="true">🔒</div>
            <h3>Admins only</h3>
            <p>You don&apos;t have permission to view this page.</p>
            <Link className="btn-primary" href="/">Go home</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section admin">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">Admin</div>
            <h2>Control panel</h2>
            <p className="sub">Moderate gigs and users, review orders and site errors.</p>
          </div>
          <button className="btn-ghost" type="button" onClick={() => void load()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="gd-filter" role="tablist">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              className={tab === item.key ? "active" : ""}
              onClick={() => {
                setTab(item.key);
                setQuery("");
                setItems([]);
              }}
            >
              {item.label}
              {item.key === "errors" && overview?.errors24h ? <span>{overview.errors24h}</span> : null}
              {item.key === "disputes" && overview?.openDisputes ? <span>{overview.openDisputes}</span> : null}
            </button>
          ))}
        </div>

        {tab === "gigs" || tab === "users" ? (
          <input
            className="gw-input admin-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "gigs" ? "Search title or seller…" : "Search name or title…"}
          />
        ) : null}

        {tab === "overview" ? (
          overview ? (
            <div className="admin-stats">
              <Stat label="Users" value={overview.users} />
              <Stat label="Gigs (live)" value={`${overview.gigs} (${overview.liveGigs})`} />
              <Stat label="Orders" value={overview.orders} />
              <Stat label="Paid volume" value={`$${formatPrice(overview.revenue)}`} />
              <Stat label="Banned users" value={overview.banned} />
              <Stat label="Open disputes" value={overview.openDisputes} tone={overview.openDisputes ? "bad" : "good"} />
              <Stat label="Errors (24h)" value={overview.errors24h} tone={overview.errors24h ? "bad" : "good"} />
            </div>
          ) : (
            <p className="gw-muted">{loading ? "Loading…" : "No data."}</p>
          )
        ) : null}

        {tab === "traffic" ? (
          trafficLoading ? (
            <p className="gw-muted">Loading traffic data…</p>
          ) : traffic ? (
            <TrafficDashboard
              summary={traffic}
              topPages={topPages}
              hourly={hourly}
              daily={daily}
              devices={devices}
              browsers={browsers}
              countries={countries}
              referrers={referrers}
              liveVisitors={liveVisitors}
            />
          ) : (
            <p className="gw-muted">No traffic data yet. Run migrations 0018 + 0019 in Supabase.</p>
          )
        ) : null}

        {tab !== "overview" && tab !== "traffic" && !loading && items.length === 0 ? (
          <p className="gw-muted">Nothing to show.</p>
        ) : null}

        {tab === "gigs" ? (
          <ul className="admin-list">
            {(items as GigItem[]).map((gig) => {
              const status = gig.status ?? "published";
              return (
                <li key={gig.id} className="admin-row">
                  <div className="admin-row-main">
                    <Link href={`/gig/${gig.id}`} className="admin-row-title">{gig.title}</Link>
                    <div className="order-meta">
                      <span className={`gd-status ${status}`}>{status}</span>
                      <span>{gig.seller_name ?? "Unknown seller"}</span>
                      <span>${formatPrice(gig.price)}</span>
                      <span>{gig.views ?? 0} views</span>
                      <span>{when(gig.created_at)}</span>
                    </div>
                  </div>
                  <div className="admin-row-actions">
                    {status === "published" ? (
                      <button className="btn-ghost btn-sm" type="button" disabled={busy === gig.id} onClick={() => void act("pause-gig", gig.id)}>Pause</button>
                    ) : (
                      <button className="btn-ghost btn-sm" type="button" disabled={busy === gig.id} onClick={() => void act("publish-gig", gig.id)}>Publish</button>
                    )}
                    <button className="btn-ghost btn-sm danger" type="button" disabled={busy === gig.id} onClick={() => void act("delete-gig", gig.id, `Delete "${gig.title}" permanently?`)}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        {tab === "users" ? (
          <ul className="admin-list">
            {(items as UserItem[]).map((u) => (
              <li key={u.user_id} className="admin-row">
                <div className="admin-row-main">
                  <Link href={`/user/${u.user_id}`} className="admin-row-title">
                    {u.full_name || "Unnamed user"}
                  </Link>
                  <div className="order-meta">
                    {u.isAdmin ? <span className="gd-status published">admin</span> : null}
                    {u.banned ? <span className="gd-status paused">banned</span> : null}
                    <span>{u.email || "no email"}</span>
                    {u.title ? <span>{u.title}</span> : null}
                    {u.country ? <span>{u.country}</span> : null}
                    <span>Joined {when(u.created_at)}</span>
                  </div>
                  {u.banned && u.banReason ? <p className="gw-muted">Reason: {u.banReason}</p> : null}
                </div>
                <div className="admin-row-actions">
                  {u.isAdmin ? null : u.banned ? (
                    <button className="btn-ghost btn-sm" type="button" disabled={busy === u.user_id} onClick={() => void act("unban-user", u.user_id)}>Unban</button>
                  ) : (
                    <button
                      className="btn-ghost btn-sm danger"
                      type="button"
                      disabled={busy === u.user_id}
                      onClick={() => {
                        const reason = window.prompt(`Ban ${u.full_name || u.email}? Enter a reason:`);
                        if (reason === null) return;
                        void act("ban-user", u.user_id, undefined, reason);
                      }}
                    >
                      Ban
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "orders" ? (
          <ul className="admin-list">
            {(items as OrderItem[]).map((o) => (
              <li key={o.id} className="admin-row">
                <div className="admin-row-main">
                  <span className="admin-row-title">
                    ${formatPrice(Number(o.amount))} {o.currency.toUpperCase()}
                    {o.package_key ? ` · ${o.package_key}` : ""}
                  </span>
                  <div className="order-meta">
                    <span className={`status-pill ${o.status === "completed" || o.status === "paid" ? "ok" : ""}`}>{o.status}</span>
                    {o.gig_id ? <Link href={`/gig/${o.gig_id}`}>View gig</Link> : <span>Gig removed</span>}
                    <span>{when(o.created_at)}</span>
                    <span className="gw-muted">#{o.id.slice(0, 8)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "disputes" ? (
          <ul className="admin-list">
            {(items as DisputeItem[]).map((d) => (
              <DisputeCard key={d.id} dispute={d} onDone={() => void load()} />
            ))}
          </ul>
        ) : null}

        {tab === "errors" ? (
          <ul className="admin-list">
            {(items as ErrorItem[]).map((e) => (
              <li key={e.id} className="admin-row admin-error">
                <div className="admin-row-main">
                  <button type="button" className="admin-error-msg" onClick={() => setOpenError(openError === e.id ? null : e.id)}>
                    {e.message}
                  </button>
                  <div className="order-meta">
                    <span className={`gd-status ${e.source === "client" ? "draft" : "paused"}`}>{e.source}</span>
                    {e.path ? <span>{e.path}</span> : null}
                    {e.context?.kind ? <span>{e.context.kind}</span> : null}
                    <span>{when(e.created_at)}</span>
                  </div>
                  {openError === e.id && e.context?.stack ? <pre className="admin-stack">{e.context.stack}</pre> : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function DisputeCard({ dispute, onDone }: { dispute: DisputeItem; onDone: () => void }) {
  const { toast } = useUI();
  const [resolution, setResolution] = useState<"refund_full" | "refund_partial" | "release_seller">("refund_full");
  const [refund, setRefund] = useState("");
  const [note, setNote] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const order = dispute.order;
  const openedByBuyer = order?.buyer_id === dispute.opened_by;

  const post = async (body: Record<string, unknown>, success: string) => {
    setBusy(true);
    const { error } = await adminFetch("/api/disputes", { method: "POST", body: { disputeId: dispute.id, ...body } });
    setBusy(false);
    if (error) {
      toast(error);
      return;
    }
    toast(success);
    setReply("");
    onDone();
  };

  return (
    <li className="admin-row admin-dispute">
      <div className="admin-row-main">
        <div className="order-meta">
          <span className={`gd-status ${dispute.status === "open" ? "paused" : "published"}`}>{dispute.status}</span>
          <span>{dispute.reason.replace(/_/g, " ")}</span>
          <span>Opened by {openedByBuyer ? `buyer ${dispute.buyerName}` : `seller ${dispute.sellerName}`}</span>
          <span>{when(dispute.created_at)}</span>
        </div>
        <Link href={`/orders/${dispute.order_id}`} className="admin-row-title">
          {order?.title ?? "Order"} · ${formatPrice(Number(order?.amount ?? 0))}
        </Link>
        <p className="gw-muted">Buyer: {dispute.buyerName} · Seller: {dispute.sellerName}</p>
        <p className="od-dispute-details">{dispute.details}</p>
        {dispute.messages.length ? (
          <ul className="od-thread">
            {dispute.messages.map((m) => (
              <li key={m.id} className={m.is_admin ? "admin" : ""}>
                <strong>
                  {m.is_admin ? "Admin" : m.sender_id === order?.buyer_id ? `Buyer · ${dispute.buyerName}` : `Seller · ${dispute.sellerName}`}
                </strong>
                <p>{m.body}</p>
                <small>{when(m.created_at)}</small>
              </li>
            ))}
          </ul>
        ) : null}
        {dispute.status === "open" ? (
          <div className="admin-resolve">
            <div className="od-actions">
              <input className="gw-input" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Message both parties…" />
              <button className="btn-ghost btn-sm" type="button" disabled={busy || !reply.trim()} onClick={() => void post({ action: "message", body: reply }, "Message sent.")}>
                Send
              </button>
            </div>
            <div className="od-actions">
              <select className="gw-input" value={resolution} onChange={(e) => setResolution(e.target.value as typeof resolution)}>
                <option value="refund_full">Full refund to buyer</option>
                <option value="refund_partial">Partial refund (rest to seller)</option>
                <option value="release_seller">Release payment to seller</option>
              </select>
              {resolution === "refund_partial" ? (
                <input className="gw-input" type="number" min={1} value={refund} onChange={(e) => setRefund(e.target.value)} placeholder="Refund $" />
              ) : null}
            </div>
            <textarea className="gw-input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Decision note (shown to both parties)" />
            <button
              className="btn-primary btn-sm"
              type="button"
              disabled={busy}
              onClick={() => {
                if (!window.confirm("Apply this decision? Money will move immediately.")) return;
                void post({ action: "resolve", resolution, refundAmount: Number(refund), adminNote: note }, "Dispute resolved.");
              }}
            >
              {busy ? "Working…" : "Resolve dispute"}
            </button>
          </div>
        ) : (
          <p className="gw-muted">
            Resolution: {dispute.resolution?.replace(/_/g, " ")}
            {dispute.refund_amount ? ` · refunded $${formatPrice(Number(dispute.refund_amount))}` : ""}
            {dispute.admin_note ? ` · ${dispute.admin_note}` : ""}
          </p>
        )}
      </div>
    </li>
  );
}

/* ── Bar helper for inline charts ── */
function Bar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="an-bar-track">
      <div className="an-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function MiniChart({ data, labelKey, valueKey, color }: { data: { [k: string]: string | number }[]; labelKey: string; valueKey: string; color?: string }) {
  if (!data.length) return <p className="gw-muted">No data yet.</p>;
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0));
  return (
    <div className="an-chart">
      {data.map((d, i) => (
        <div key={i} className="an-chart-row">
          <span className="an-chart-label">{String(d[labelKey])}</span>
          <Bar value={Number(d[valueKey]) || 0} max={max} color={color} />
          <span className="an-chart-val">{Number(d[valueKey]).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function HourlyChart({ data }: { data: HourlyData[] }) {
  const full = Array.from({ length: 24 }, (_, i) => {
    const found = data.find((d) => d.hour === i);
    return { hour: i, views: found?.views ?? 0 };
  });
  const max = Math.max(...full.map((d) => d.views), 1);
  return (
    <div className="an-hourly">
      {full.map((d) => (
        <div key={d.hour} className="an-hourly-col" title={`${d.hour}:00 — ${d.views} views`}>
          <div className="an-hourly-bar" style={{ height: `${Math.max(2, (d.views / max) * 100)}%` }} />
          <span>{d.hour}</span>
        </div>
      ))}
    </div>
  );
}

function DailyChart({ data }: { data: DailyData[] }) {
  if (!data.length) return <p className="gw-muted">No data yet.</p>;
  const max = Math.max(...data.map((d) => d.visitors), 1);
  return (
    <div className="an-daily">
      {data.map((d) => (
        <div key={d.day} className="an-daily-col" title={`${d.day}\n${d.visitors} visitors · ${d.views} views`}>
          <div className="an-daily-bar" style={{ height: `${Math.max(2, (d.visitors / max) * 100)}%` }} />
          <span>{new Date(d.day).getDate()}</span>
        </div>
      ))}
    </div>
  );
}

function TrafficDashboard({
  summary, topPages, hourly, daily, devices, browsers, countries, referrers, liveVisitors,
}: {
  summary: AnalyticsSummary;
  topPages: TopPage[];
  hourly: HourlyData[];
  daily: DailyData[];
  devices: DeviceData[];
  browsers: BrowserData[];
  countries: CountryData[];
  referrers: ReferrerData[];
  liveVisitors: LiveVisitor[];
}) {
  const growthPct = summary.yesterday > 0
    ? Math.round(((summary.today - summary.yesterday) / summary.yesterday) * 100)
    : 0;

  return (
    <div className="an-dashboard">
      {/* ── Row 1: Key metrics ── */}
      <div className="admin-stats">
        <div className="admin-stat good">
          <span>Online now</span>
          <strong><span className="an-pulse" /> {summary.online_now}</strong>
          <small>{summary.online_logged_in} signed in</small>
        </div>
        <div className="admin-stat">
          <span>Today</span>
          <strong>{summary.today.toLocaleString()}</strong>
          <small>{growthPct > 0 ? `+${growthPct}%` : growthPct < 0 ? `${growthPct}%` : "same"} vs yesterday</small>
        </div>
        <div className="admin-stat">
          <span>This week</span>
          <strong>{summary.this_week.toLocaleString()}</strong>
          <small>unique visitors</small>
        </div>
        <div className="admin-stat">
          <span>This month</span>
          <strong>{summary.this_month.toLocaleString()}</strong>
          <small>{summary.total_views_month.toLocaleString()} page views</small>
        </div>
        <div className="admin-stat">
          <span>All time</span>
          <strong>{summary.total_all_time.toLocaleString()}</strong>
          <small>total unique visitors</small>
        </div>
      </div>

      {/* ── Row 2: Live visitors feed ── */}
      {liveVisitors.length > 0 && (
        <div className="an-card">
          <h4>Live visitors <span className="an-pulse" /></h4>
          <div className="an-live-grid">
            {liveVisitors.map((v) => (
              <div key={v.id} className="an-live-row">
                <span className={`an-live-dot ${v.logged_in ? "logged" : ""}`} />
                <span className="an-live-path">{v.path}</span>
                {v.country ? <span className="an-live-tag">{v.country}</span> : null}
                {v.device ? <span className="an-live-tag dim">{v.device}</span> : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 3: Charts ── */}
      <div className="an-grid-2">
        <div className="an-card">
          <h4>Daily visitors (30 days)</h4>
          <DailyChart data={daily} />
        </div>
        <div className="an-card">
          <h4>Peak hours (24h)</h4>
          <HourlyChart data={hourly} />
        </div>
      </div>

      {/* ── Row 4: Breakdown cards ── */}
      <div className="an-grid-3">
        <div className="an-card">
          <h4>Top pages</h4>
          <MiniChart data={topPages.map(({ path, views }) => ({ label: path, value: views }))} labelKey="label" valueKey="value" color="var(--accent)" />
        </div>
        <div className="an-card">
          <h4>Countries</h4>
          <MiniChart data={countries.map(({ country, visitors }) => ({ label: country, value: visitors }))} labelKey="label" valueKey="value" color="var(--emerald)" />
        </div>
        <div className="an-card">
          <h4>Referrers</h4>
          <MiniChart data={referrers.map(({ source, views }) => ({ label: source, value: views }))} labelKey="label" valueKey="value" color="var(--amber)" />
        </div>
      </div>

      <div className="an-grid-2">
        <div className="an-card">
          <h4>Devices</h4>
          <MiniChart data={devices.map(({ device, views }) => ({ label: device, value: views }))} labelKey="label" valueKey="value" color="var(--accent)" />
        </div>
        <div className="an-card">
          <h4>Browsers</h4>
          <MiniChart data={browsers.map(({ browser, views }) => ({ label: browser, value: views }))} labelKey="label" valueKey="value" color="var(--indigo)" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: "good" | "bad" }) {
  return (
    <div className={"admin-stat" + (tone ? ` ${tone}` : "")}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
