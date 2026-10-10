"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import type { GigStatus } from "@/lib/types";

interface GigRowData {
  id: string;
  title: string;
  category: string | null;
  price: number;
  delivery_days: number;
  status?: GigStatus | null;
  views?: number | null;
  images?: string[] | null;
}

const STATUS_LABEL: Record<GigStatus, string> = {
  published: "Live",
  paused: "Paused",
  draft: "Draft",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { openAuth, openPost, toast } = useUI();
  const [gigs, setGigs] = useState<GigRowData[]>([]);
  const [ordersCount, setOrdersCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | GigStatus>("all");

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
        .select("gig_id")
        .in("gig_id", rows.map((r) => r.id));
      const counts: Record<string, number> = {};
      for (const o of (orders ?? []) as { gig_id: string }[]) {
        counts[o.gig_id] = (counts[o.gig_id] ?? 0) + 1;
      }
      setOrdersCount(counts);
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
    if (error) {
      toast(error.message);
      return;
    }
    setGigs((cur) => cur.map((g) => (g.id === gig.id ? { ...g, status } : g)));
  };

  const deleteGig = async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    if (!window.confirm("Delete this gig? This cannot be undone.")) return;
    await supabase.from("gigs").delete().eq("id", id);
    void load();
  };

  if (!user) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Sign in to manage your gigs</h3>
            <button className="btn-primary" type="button" onClick={() => openAuth("login")}>
              Sign in
            </button>
          </div>
        </div>
      </section>
    );
  }

  const statusOf = (gig: GigRowData): GigStatus => gig.status ?? "published";
  const visible = filter === "all" ? gigs : gigs.filter((g) => statusOf(g) === filter);
  const totals = {
    live: gigs.filter((g) => statusOf(g) === "published").length,
    views: gigs.reduce((sum, g) => sum + Number(g.views ?? 0), 0),
    orders: Object.values(ordersCount).reduce((sum, n) => sum + n, 0),
  };

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">Seller dashboard</div>
            <h2>Your gigs</h2>
            <p className="sub">Edit, pause or remove your gigs and track how they perform.</p>
          </div>
          <button className="btn-post" type="button" onClick={openPost}>
            + Create gig
          </button>
        </div>

        <div className="gd-summary-row">
          <div><span>Live gigs</span><strong>{totals.live}</strong></div>
          <div><span>Total views</span><strong>{totals.views}</strong></div>
          <div><span>Orders</span><strong>{totals.orders}</strong></div>
        </div>

        <div className="gd-filter" role="tablist">
          {(["all", "published", "paused", "draft"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key)}
            >
              {key === "all" ? "All" : STATUS_LABEL[key]}
              <span>{key === "all" ? gigs.length : gigs.filter((g) => statusOf(g) === key).length}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : visible.length === 0 ? (
          <div className="empty">
            <h3>{gigs.length === 0 ? "No gigs yet" : "Nothing here"}</h3>
            <p>
              {gigs.length === 0
                ? "Create your first gig to start getting orders."
                : "No gigs match this filter."}
            </p>
          </div>
        ) : (
          <ul className="order-list">
            {visible.map((gig) => {
              const status = statusOf(gig);
              return (
                <li key={gig.id} className="order-row gd-gig-row">
                  {gig.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="gd-gig-thumb" src={gig.images[0]} alt="" loading="lazy" />
                  ) : (
                    <span className="gd-gig-thumb placeholder" aria-hidden="true" />
                  )}
                  <div className="gd-gig-info">
                    <div className="order-title">
                      <Link href={`/gig/${gig.id}`}>{gig.title}</Link>
                    </div>
                    <div className="order-meta">
                      <span className={`gd-status ${status}`}>{STATUS_LABEL[status]}</span>
                      <span>{gig.category}</span>
                      <span>From ${formatPrice(gig.price)}</span>
                      <span>{Number(gig.views ?? 0)} views</span>
                      <span>{ordersCount[gig.id] ?? 0} orders</span>
                    </div>
                  </div>
                  <div className="order-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Link className="btn-ghost btn-sm" href={`/post-project?edit=${gig.id}`}>
                      Edit
                    </Link>
                    {status === "published" ? (
                      <button className="btn-ghost btn-sm" type="button" disabled={busyId === gig.id} onClick={() => void setStatus(gig, "paused")}>
                        Pause
                      </button>
                    ) : status === "paused" ? (
                      <button className="btn-ghost btn-sm" type="button" disabled={busyId === gig.id} onClick={() => void setStatus(gig, "published")}>
                        Resume
                      </button>
                    ) : null}
                    <button className="btn-ghost btn-sm danger" type="button" onClick={() => void deleteGig(gig.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
