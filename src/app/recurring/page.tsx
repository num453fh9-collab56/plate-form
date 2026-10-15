"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";

interface RecurringOrder {
  id: string;
  gig_id: string | null;
  buyer_id: string;
  seller_id: string;
  title: string;
  amount: number;
  frequency: string;
  next_charge_at: string;
  status: string;
  total_charged: number;
  orders_created: number;
  created_at: string;
}

async function getToken(): Promise<string | null> {
  const s = getSupabase();
  if (!s) return null;
  const { data } = await s.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function RecurringPage() {
  const { user } = useAuth();
  const { toast } = useUI();
  const [orders, setOrders] = useState<RecurringOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) { setLoading(false); return; }
    const res = await fetch("/api/recurring", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { const j = await res.json(); setOrders(j.recurring ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const doAction = async (recurringId: string, action: string) => {
    const token = await getToken();
    const res = await fetch("/api/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ action, recurringId }),
    });
    if (res.ok) { toast(`Subscription ${action}${action.endsWith("e") ? "d" : "ed"}.`); void load(); }
    else { const j = await res.json(); toast(j.error || "Failed"); }
  };

  const freqLabel = (f: string) => {
    const map: Record<string, string> = { weekly: "Weekly", biweekly: "Every 2 weeks", monthly: "Monthly", quarterly: "Quarterly" };
    return map[f] ?? f;
  };

  if (!user?.sub) return <main className="container py-lg"><h1>Recurring Orders</h1><p className="muted">Please sign in to manage recurring orders.</p></main>;
  if (loading) return <main className="container py-lg"><p>Loading...</p></main>;

  return (
    <main className="container py-lg" style={{ maxWidth: 800 }}>
      <h1>Recurring Orders</h1>
      <p className="muted" style={{ marginBottom: 24 }}>Manage your subscription-style recurring orders</p>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p className="muted">No recurring orders yet. Set up recurring orders from the order page for regular services!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {orders.map((o) => {
            const isBuyer = o.buyer_id === user.sub;
            const nextDate = new Date(o.next_charge_at);
            return (
              <div key={o.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1rem" }}>{o.title}</h3>
                    <span className="muted" style={{ fontSize: "0.82rem" }}>{isBuyer ? "You're paying" : "You're receiving"}</span>
                  </div>
                  <span className={`badge badge-${o.status === "active" ? "green" : o.status === "paused" ? "yellow" : "red"}`}>{o.status}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>${o.amount.toFixed(2)}</div>
                    <div className="muted" style={{ fontSize: "0.78rem" }}>{freqLabel(o.frequency)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>${o.total_charged.toFixed(2)}</div>
                    <div className="muted" style={{ fontSize: "0.78rem" }}>Total Charged</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{o.orders_created}</div>
                    <div className="muted" style={{ fontSize: "0.78rem" }}>Orders Created</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{nextDate.toLocaleDateString()}</div>
                    <div className="muted" style={{ fontSize: "0.78rem" }}>Next Charge</div>
                  </div>
                </div>

                {isBuyer && o.status !== "cancelled" ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    {o.status === "active" ? (
                      <button className="btn-ghost btn-sm" onClick={() => void doAction(o.id, "pause")}>Pause</button>
                    ) : o.status === "paused" ? (
                      <button className="btn-primary btn-sm" onClick={() => void doAction(o.id, "pause")}>Resume</button>
                    ) : null}
                    <button className="btn-ghost btn-sm" style={{ color: "#ef4444" }} onClick={() => void doAction(o.id, "cancel")}>Cancel</button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
