"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";

interface PayoutRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

type Period = "7d" | "30d" | "90d" | "all";

const PERIOD_LABELS: Record<Period, string> = { "7d": "7 days", "30d": "30 days", "90d": "90 days", all: "All time" };

function EarningsChart({ payouts, period }: { payouts: PayoutRow[]; period: Period }) {
  const now = Date.now();
  const cutoff = period === "all" ? 0 : now - ({ "7d": 7, "30d": 30, "90d": 90 }[period]) * 86400000;
  const filtered = payouts.filter((p) => p.status === "paid" && new Date(p.created_at).getTime() >= cutoff);

  const bucketCount = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 12 : Math.min(12, Math.max(4, Math.ceil((now - (filtered[filtered.length - 1] ? new Date(filtered[filtered.length - 1].created_at).getTime() : now)) / (7 * 86400000))));
  const bucketMs = period === "90d" ? 7 * 86400000 : period === "all" && bucketCount > 0 ? (now - cutoff || 30 * 86400000) / bucketCount : 86400000;

  const buckets: number[] = Array(bucketCount).fill(0);
  const labels: string[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const bucketEnd = now - (bucketCount - 1 - i) * bucketMs;
    const bucketStart = bucketEnd - bucketMs;
    for (const p of filtered) {
      const t = new Date(p.created_at).getTime();
      if (t >= bucketStart && t < bucketEnd) buckets[i] += Number(p.amount);
    }
    const d = new Date(bucketEnd);
    labels.push(period === "7d" ? d.toLocaleDateString(undefined, { weekday: "short" }) : d.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
  }

  const max = Math.max(...buckets, 1);

  return (
    <div className="earn-chart">
      <div className="earn-bars">
        {buckets.map((val, i) => (
          <div key={i} className="earn-bar-col">
            <div className="earn-bar-wrap">
              <div className="earn-bar" style={{ height: `${(val / max) * 100}%` }} />
            </div>
            <span className="earn-bar-label">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EarningsPage() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [period, setPeriod] = useState<Period>("30d");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !user?.sub) return;
    let cancelled = false;

    const run = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (token) {
        const statusRes = await fetch("/api/stripe/connect/status", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const status = (await statusRes.json().catch(() => ({}))) as {
          connected?: boolean;
          payoutsEnabled?: boolean;
        };
        if (!cancelled) {
          setConnected(!!status.connected);
          setPayoutsEnabled(!!status.payoutsEnabled);
        }
      }
      return supabase
        .from("payouts")
        .select("id, amount, currency, status, created_at")
        .order("created_at", { ascending: false });
    };

    void run().then(({ data }) => {
      if (cancelled) return;
      setPayouts((data ?? []) as PayoutRow[]);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const startOnboarding = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setError("Please sign in again.");
      setBusy(false);
      return;
    }
    const res = await fetch("/api/stripe/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    });
    const payload = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    setBusy(false);
    if (!res.ok || !payload.url) {
      setError(payload.error ?? "Could not start onboarding.");
      return;
    }
    window.location.href = payload.url;
  };

  const stats = useMemo(() => {
    const paid = payouts.filter((p) => p.status === "paid");
    const pending = payouts.filter((p) => p.status === "pending" || p.status === "in_transit");
    const totalPaid = paid.reduce((s, p) => s + Number(p.amount), 0);
    const totalPending = pending.reduce((s, p) => s + Number(p.amount), 0);
    const now = Date.now();
    const thisMonth = paid.filter((p) => {
      const d = new Date(p.created_at);
      const n = new Date(now);
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }).reduce((s, p) => s + Number(p.amount), 0);
    return { totalPaid, totalPending, thisMonth, count: payouts.length };
  }, [payouts]);

  if (!user) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Sign in to see earnings</h3>
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
            <div className="kicker">Earnings</div>
            <h2>Your earnings</h2>
            <p className="sub">
              {connected
                ? payoutsEnabled
                  ? "Stripe account connected — payouts enabled."
                  : "Stripe account connected — finish onboarding to receive payouts."
                : "Connect a Stripe account to receive payouts."}
            </p>
          </div>
          <button className="btn-post" type="button" onClick={startOnboarding} disabled={busy}>
            {busy ? "Opening..." : connected ? "Manage Stripe" : "Connect Stripe"}
          </button>
        </div>

        {error ? <p className="order-note">{error}</p> : null}

        {loading ? (
          <div className="empty">
            <div className="sf-spinner" />
            <p style={{ color: "var(--muted)" }}>Loading earnings…</p>
          </div>
        ) : (
          <>
            <div className="earn-overview">
              <div className="earn-card earn-card-main">
                <span className="earn-card-label">Total earned</span>
                <span className="earn-card-value">${formatPrice(stats.totalPaid)}</span>
                <span className="earn-card-sub">{stats.count} payout{stats.count !== 1 ? "s" : ""}</span>
              </div>
              <div className="earn-card">
                <span className="earn-card-label">This month</span>
                <span className="earn-card-value">${formatPrice(stats.thisMonth)}</span>
              </div>
              <div className="earn-card">
                <span className="earn-card-label">Pending</span>
                <span className="earn-card-value earn-pending">${formatPrice(stats.totalPending)}</span>
              </div>
            </div>

            {payouts.length > 0 && (
              <div className="earn-chart-section">
                <div className="earn-chart-header">
                  <h3>Revenue</h3>
                  <div className="earn-period-tabs">
                    {(["7d", "30d", "90d", "all"] as Period[]).map((p) => (
                      <button key={p} type="button" className={`earn-period${period === p ? " on" : ""}`} onClick={() => setPeriod(p)}>
                        {PERIOD_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>
                <EarningsChart payouts={payouts} period={period} />
              </div>
            )}

            {payouts.length === 0 ? (
              <div className="empty" style={{ marginTop: 24 }}>
                <h3>No payouts yet</h3>
                <p>When a buyer accepts your delivery, your payout appears here.</p>
              </div>
            ) : (
              <div className="earn-table-wrap">
                <h3 className="earn-table-title">Payout history</h3>
                <table className="earn-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id}>
                        <td>{new Date(p.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="earn-amt">${formatPrice(p.amount)}</td>
                        <td>
                          <span className={"status-pill " + (p.status === "paid" ? "ok" : p.status === "failed" ? "warn" : "muted")}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
