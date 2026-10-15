"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";

interface Promo {
  id: string;
  gig_id: string;
  budget: number;
  spent: number;
  daily_budget: number;
  status: string;
  impressions: number;
  clicks: number;
  created_at: string;
}

async function getToken(): Promise<string | null> {
  const s = getSupabase();
  if (!s) return null;
  const { data } = await s.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function PromotedPage() {
  const { user } = useAuth();
  const { toast } = useUI();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [gigId, setGigId] = useState("");
  const [budget, setBudget] = useState("50");
  const [dailyBudget, setDailyBudget] = useState("10");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) { setLoading(false); return; }
    const res = await fetch("/api/promoted", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { const j = await res.json(); setPromos(j.promotions ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const create = async () => {
    if (!gigId.trim()) { toast("Enter a Gig ID"); return; }
    setBusy(true);
    const token = await getToken();
    const res = await fetch("/api/promoted", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ action: "create", gigId: gigId.trim(), budget: Number(budget), dailyBudget: Number(dailyBudget) }),
    });
    if (res.ok) { toast("Promotion created!"); setCreating(false); setGigId(""); void load(); }
    else { const j = await res.json(); toast(j.error || "Failed"); }
    setBusy(false);
  };

  const toggle = async (promoId: string, status: string) => {
    const token = await getToken();
    const action = status === "active" ? "pause" : "resume";
    await fetch("/api/promoted", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ action, promoId }),
    });
    toast(`Promotion ${action}d.`);
    void load();
  };

  if (!user?.sub) return <main className="container py-lg"><h1>Promoted Gigs</h1><p className="muted">Please sign in to manage promotions.</p></main>;
  if (loading) return <main className="container py-lg"><p>Loading...</p></main>;

  return (
    <main className="container py-lg" style={{ maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Promoted Gigs</h1>
          <p className="muted" style={{ margin: "4px 0 0" }}>Boost your gig visibility with paid promotions</p>
        </div>
        {!creating ? (
          <button className="btn-primary btn-sm" onClick={() => setCreating(true)}>New Promotion</button>
        ) : null}
      </div>

      {creating ? (
        <section className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px" }}>Create Promotion</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="text" placeholder="Gig ID" value={gigId} onChange={(e) => setGigId(e.target.value)}
              style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="muted" style={{ fontSize: "0.82rem", marginBottom: 4, display: "block" }}>Total Budget ($)</label>
                <input type="number" min="10" value={budget} onChange={(e) => setBudget(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)" }} />
              </div>
              <div>
                <label className="muted" style={{ fontSize: "0.82rem", marginBottom: 4, display: "block" }}>Daily Budget ($)</label>
                <input type="number" min="1" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary btn-sm" onClick={() => void create()} disabled={busy}>{busy ? "Creating..." : "Launch Promotion"}</button>
              <button className="btn-ghost btn-sm" onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </div>
        </section>
      ) : null}

      {promos.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p className="muted">No promotions yet. Create one to boost your gig!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {promos.map((p) => {
            const ctr = p.impressions > 0 ? ((p.clicks / p.impressions) * 100).toFixed(1) : "0.0";
            return (
              <div key={p.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="muted" style={{ fontSize: "0.82rem" }}>Gig: {p.gig_id.slice(0, 8)}...</span>
                  <span className={`badge badge-${p.status === "active" ? "green" : p.status === "paused" ? "yellow" : "red"}`}>{p.status}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{p.impressions.toLocaleString()}</div>
                    <div className="muted" style={{ fontSize: "0.78rem" }}>Impressions</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{p.clicks.toLocaleString()}</div>
                    <div className="muted" style={{ fontSize: "0.78rem" }}>Clicks</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{ctr}%</div>
                    <div className="muted" style={{ fontSize: "0.78rem" }}>CTR</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>${p.spent.toFixed(2)} / ${p.budget.toFixed(2)}</div>
                    <div className="muted" style={{ fontSize: "0.78rem" }}>Budget Used</div>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--hover)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (p.spent / p.budget) * 100)}%`, background: "var(--accent)", borderRadius: 3 }} />
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button className="btn-ghost btn-sm" onClick={() => void toggle(p.id, p.status)}>
                    {p.status === "active" ? "Pause" : "Resume"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
