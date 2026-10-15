"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";

interface ReferralData {
  code: string;
  credits: number;
  totalReferred: number;
  referrals: { id: string; status: string; created_at: string }[];
}

async function getToken(): Promise<string | null> {
  const s = getSupabase();
  if (!s) return null;
  const { data } = await s.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function ReferralsPage() {
  const { user } = useAuth();
  const { toast } = useUI();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyCode, setApplyCode] = useState("");
  const [applying, setApplying] = useState(false);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) { setLoading(false); return; }
    const res = await fetch("/api/referrals", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleApply = async () => {
    const code = applyCode.trim();
    if (!code) return;
    setApplying(true);
    const token = await getToken();
    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ action: "apply", code }),
    });
    const j = await res.json();
    if (res.ok) { toast("Referral applied! You got $5 credit."); setApplyCode(""); void load(); }
    else toast(j.error || "Failed to apply referral.");
    setApplying(false);
  };

  const copyLink = () => {
    if (!data?.code) return;
    const link = `${window.location.origin}?ref=${data.code}`;
    void navigator.clipboard.writeText(link).then(() => toast("Referral link copied!")).catch(() => {});
  };

  if (!user?.sub) return <main className="container py-lg"><h1>Referral Program</h1><p className="muted">Please sign in to access your referral program.</p></main>;
  if (loading) return <main className="container py-lg"><p>Loading...</p></main>;

  return (
    <main className="container py-lg" style={{ maxWidth: 700 }}>
      <h1>Referral Program</h1>
      <p className="muted" style={{ marginBottom: 24 }}>Invite friends and earn credits! You get $10 for each friend who joins, and they get $5.</p>

      {data?.code ? (
        <section className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 12px" }}>Your Referral Code</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <code style={{ fontSize: "1.2rem", padding: "8px 16px", background: "var(--hover)", borderRadius: 8 }}>{data.code}</code>
            <button className="btn-primary btn-sm" onClick={copyLink}>Copy Link</button>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>${data.credits?.toFixed(2) ?? "0.00"}</div>
              <div className="muted" style={{ fontSize: "0.85rem" }}>Credits Earned</div>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{data.totalReferred ?? 0}</div>
              <div className="muted" style={{ fontSize: "0.85rem" }}>Friends Referred</div>
            </div>
          </div>
        </section>
      ) : null}

      {data?.referrals && data.referrals.length > 0 ? (
        <section className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 12px" }}>Referral History</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.referrals.map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span className="muted">{new Date(r.created_at).toLocaleDateString()}</span>
                <span className={`badge badge-${r.status === "completed" ? "green" : "yellow"}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 12px" }}>Have a Referral Code?</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Enter referral code"
            value={applyCode}
            onChange={(e) => setApplyCode(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)" }}
          />
          <button className="btn-primary btn-sm" onClick={() => void handleApply()} disabled={applying}>
            {applying ? "Applying..." : "Apply"}
          </button>
        </div>
      </section>
    </main>
  );
}
