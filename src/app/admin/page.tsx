"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { adminFetch, useIsAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/format";

type Tab = "overview" | "gigs" | "users" | "orders" | "errors";

interface Overview {
  users: number;
  gigs: number;
  liveGigs: number;
  orders: number;
  banned: number;
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
  { key: "gigs", label: "Gigs" },
  { key: "users", label: "Users" },
  { key: "orders", label: "Orders" },
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

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ view: tab });
    if (query.trim() && (tab === "gigs" || tab === "users")) params.set("q", query.trim());
    if (tab === "overview") {
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
              <Stat label="Errors (24h)" value={overview.errors24h} tone={overview.errors24h ? "bad" : "good"} />
            </div>
          ) : (
            <p className="gw-muted">{loading ? "Loading…" : "No data."}</p>
          )
        ) : null}

        {tab !== "overview" && !loading && items.length === 0 ? (
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

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: "good" | "bad" }) {
  return (
    <div className={"admin-stat" + (tone ? ` ${tone}` : "")}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
