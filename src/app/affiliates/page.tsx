"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";

interface Affiliate {
  id: string;
  affiliate_code: string;
  commission_rate: number;
  total_earned: number;
  total_clicks: number;
  total_conversions: number;
  status: string;
}

interface Conversion {
  id: string;
  commission: number;
  status: string;
  created_at: string;
}

async function getToken(): Promise<string | null> {
  const s = getSupabase();
  if (!s) return null;
  const { data } = await s.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function AffiliatesPage() {
  const { user } = useAuth();
  const { toast } = useUI();
  const [enrolled, setEnrolled] = useState(false);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) { setLoading(false); return; }
    const res = await fetch("/api/affiliates", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const j = await res.json();
      setEnrolled(j.enrolled);
      if (j.affiliate) setAffiliate(j.affiliate);
      if (j.conversions) setConversions(j.conversions);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const enroll = async () => {
    setEnrolling(true);
    const token = await getToken();
    const res = await fetch("/api/affiliates", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ action: "enroll" }),
    });
    if (res.ok) { toast("Welcome to the affiliate program!"); void load(); }
    else { const j = await res.json(); toast(j.error || "Failed to enroll."); }
    setEnrolling(false);
  };

  const copyLink = () => {
    if (!affiliate?.affiliate_code) return;
    const link = `${window.location.origin}?aff=${affiliate.affiliate_code}`;
    void navigator.clipboard.writeText(link).then(() => toast("Affiliate link copied!")).catch(() => {});
  };

  if (!user?.sub) return <main className="container py-lg"><h1>Affiliate Program</h1><p className="muted">Please sign in to access the affiliate program.</p></main>;
  if (loading) return <main className="container py-lg"><p>Loading...</p></main>;

  if (!enrolled) {
    return (
      <main className="container py-lg" style={{ maxWidth: 600, textAlign: "center" }}>
        <h1>Affiliate Program</h1>
        <p className="muted" style={{ marginBottom: 24 }}>Earn 10% commission on every order made through your affiliate link. Share WorkVortex and earn money!</p>
        <div className="card" style={{ padding: 32 }}>
          <h3 style={{ margin: "0 0 8px" }}>How it works</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left", marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontWeight: 700, color: "var(--accent)", minWidth: 24 }}>1.</span>
              <span>Sign up for the affiliate program</span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontWeight: 700, color: "var(--accent)", minWidth: 24 }}>2.</span>
              <span>Share your unique affiliate link</span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontWeight: 700, color: "var(--accent)", minWidth: 24 }}>3.</span>
              <span>Earn 10% commission on orders from your referrals</span>
            </div>
          </div>
          <button className="btn-primary" onClick={() => void enroll()} disabled={enrolling}>
            {enrolling ? "Enrolling..." : "Join Affiliate Program"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-lg" style={{ maxWidth: 800 }}>
      <h1>Affiliate Dashboard</h1>
      <p className="muted" style={{ marginBottom: 24 }}>Track your affiliate performance and earnings</p>

      <section className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 12px" }}>Your Affiliate Link</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <code style={{ fontSize: "1rem", padding: "8px 16px", background: "var(--hover)", borderRadius: 8 }}>{affiliate?.affiliate_code}</code>
          <button className="btn-primary btn-sm" onClick={copyLink}>Copy Link</button>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>${affiliate?.total_earned?.toFixed(2) ?? "0.00"}</div>
          <div className="muted" style={{ fontSize: "0.82rem" }}>Total Earned</div>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>{affiliate?.total_clicks ?? 0}</div>
          <div className="muted" style={{ fontSize: "0.82rem" }}>Total Clicks</div>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>{affiliate?.total_conversions ?? 0}</div>
          <div className="muted" style={{ fontSize: "0.82rem" }}>Conversions</div>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>{((affiliate?.commission_rate ?? 0.1) * 100).toFixed(0)}%</div>
          <div className="muted" style={{ fontSize: "0.82rem" }}>Commission Rate</div>
        </div>
      </div>

      {conversions.length > 0 ? (
        <section className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 12px" }}>Recent Conversions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {conversions.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span className="muted">{new Date(c.created_at).toLocaleDateString()}</span>
                <span style={{ fontWeight: 600 }}>${c.commission.toFixed(2)}</span>
                <span className={`badge badge-${c.status === "paid" ? "green" : "yellow"}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <p className="muted">No conversions yet. Share your link to start earning!</p>
        </div>
      )}
    </main>
  );
}
