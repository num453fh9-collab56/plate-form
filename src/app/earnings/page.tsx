"use client";

import { useEffect, useState } from "react";
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

export default function EarningsPage() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const total = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

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
            {busy ? "Opening..." : connected ? "Manage / finish Stripe setup" : "Connect Stripe"}
          </button>
        </div>
        {error ? <p className="order-note">{error}</p> : null}
        <p className="sub" style={{ marginBottom: 16 }}>
          Total paid out: ${formatPrice(total)}
        </p>
        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : payouts.length === 0 ? (
          <div className="empty">
            <h3>No payouts yet</h3>
            <p>When a buyer accepts your delivery, your payout appears here.</p>
          </div>
        ) : (
          <ul className="order-list">
            {payouts.map((p) => (
              <li key={p.id} className="order-row">
                <div className="order-title">${formatPrice(p.amount)}</div>
                <div className="order-meta">
                  <span className={"status-pill " + (p.status === "paid" ? "ok" : p.status === "failed" ? "warn" : "muted")}>
                    {p.status}
                  </span>
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
