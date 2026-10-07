"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import { CATEGORY_OPTIONS } from "@/lib/gigs";

interface GigRowData {
  id: string;
  title: string;
  category: string | null;
  price: number;
  delivery_days: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const [gigs, setGigs] = useState<GigRowData[]>([]);
  const [ordersCount, setOrdersCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<GigRowData | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDelivery, setEditDelivery] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !user?.sub) return;
    const { data } = await supabase
      .from("gigs")
      .select("id, title, category, price, delivery_days")
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

  const startEdit = (gig: GigRowData) => {
    setEditing(gig);
    setEditTitle(gig.title);
    setEditPrice(String(gig.price));
    setEditDelivery(String(gig.delivery_days));
    setEditCategory(gig.category ?? CATEGORY_OPTIONS[0]);
  };

  const saveEdit = async () => {
    const supabase = getSupabase();
    if (!supabase || !editing) return;
    setSaving(true);
    setError(null);
    const { error: err } = await supabase
      .from("gigs")
      .update({
        title: editTitle.trim(),
        price: Number(editPrice) || 0,
        delivery_days: Math.max(1, Number(editDelivery) || 1),
        category: editCategory,
      })
      .eq("id", editing.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setEditing(null);
    void load();
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

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">Seller dashboard</div>
            <h2>Your gigs</h2>
            <p className="sub">Edit pricing, delivery time, category — or remove a gig.</p>
          </div>
          <Link className="btn-post" href="/search">
            Browse marketplace
          </Link>
        </div>

        {error ? <p className="order-note">{error}</p> : null}

        {editing ? (
          <div className="order-row" style={{ marginBottom: 16 }}>
            <div className="order-title">Edit gig</div>
            <div className="order-actions">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
                style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)" }}
              />
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)" }}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Price"
                style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)" }}
              />
              <input
                type="number"
                value={editDelivery}
                onChange={(e) => setEditDelivery(e.target.value)}
                placeholder="Delivery days"
                style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)" }}
              />
              <button className="btn-primary" type="button" disabled={saving} onClick={saveEdit}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="btn-ghost" type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : gigs.length === 0 ? (
          <div className="empty">
            <h3>No gigs yet</h3>
            <p>Post your first gig from the account menu → Post a project.</p>
          </div>
        ) : (
          <ul className="order-list">
            {gigs.map((gig) => (
              <li key={gig.id} className="order-row">
                <div className="order-title">
                  <Link href={`/gig/${gig.id}`}>{gig.title}</Link>
                </div>
                <div className="order-meta">
                  <span className="status-pill ok">{gig.category}</span>
                  <span>${formatPrice(gig.price)}</span>
                  <span>{gig.delivery_days} day delivery</span>
                  <span>{ordersCount[gig.id] ?? 0} orders</span>
                </div>
                <div className="order-actions" style={{ display: "flex", gap: 10 }}>
                  <button className="btn-ghost btn-sm" type="button" onClick={() => startEdit(gig)}>
                    Edit
                  </button>
                  <button className="btn-ghost btn-sm" type="button" onClick={() => deleteGig(gig.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
