"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useMarketplace } from "@/lib/marketplace";
import { getSupabase } from "@/lib/supabase";
import type { Gig } from "@/lib/types";

interface Wishlist {
  id: string;
  name: string;
  gig_ids: string[];
  created_at: string;
}

async function getToken(): Promise<string | null> {
  const s = getSupabase();
  if (!s) return null;
  const { data } = await s.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function WishlistsPage() {
  const { user } = useAuth();
  const { gigs: cachedGigs } = useMarketplace();
  const { toast } = useUI();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [compareList, setCompareList] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) { setLoading(false); return; }
    const res = await fetch("/api/wishlists", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { const j = await res.json(); setWishlists(j.wishlists ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const createList = async () => {
    const name = newName.trim() || "My List";
    setCreating(true);
    const token = await getToken();
    const res = await fetch("/api/wishlists", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ action: "create", name }),
    });
    if (res.ok) { toast("List created!"); setNewName(""); void load(); }
    setCreating(false);
  };

  const removeGig = async (wishlistId: string, gigId: string) => {
    const token = await getToken();
    await fetch("/api/wishlists", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ action: "remove-gig", wishlistId, gigId }),
    });
    toast("Gig removed from list.");
    void load();
  };

  const deleteList = async (wishlistId: string) => {
    const token = await getToken();
    await fetch("/api/wishlists", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ action: "delete", wishlistId }),
    });
    toast("List deleted.");
    void load();
  };

  const resolveGig = (id: string): Gig | null => cachedGigs.find((g) => g.id === id) ?? null;

  if (!user?.sub) return <main className="container py-lg"><h1>Wishlists</h1><p className="muted">Please sign in to manage your wishlists.</p></main>;
  if (loading) return <main className="container py-lg"><p>Loading...</p></main>;

  const compareWL = wishlists.find((w) => w.id === compareList);
  const compareGigs = compareWL ? compareWL.gig_ids.map(resolveGig).filter(Boolean) as Gig[] : [];

  return (
    <main className="container py-lg" style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Wishlists</h1>
          <p className="muted" style={{ margin: "4px 0 0" }}>Save and compare gigs side by side</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <input type="text" placeholder="New list name" value={newName} onChange={(e) => setNewName(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", minWidth: 200 }} />
        <button className="btn-primary btn-sm" onClick={() => void createList()} disabled={creating}>
          {creating ? "Creating..." : "Create List"}
        </button>
      </div>

      {compareList && compareGigs.length > 0 ? (
        <section className="card" style={{ padding: 24, marginBottom: 24, overflowX: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Comparing {compareGigs.length} Gigs</h3>
            <button className="btn-ghost btn-sm" onClick={() => setCompareList(null)}>Close</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px 12px" }}>Feature</th>
                {compareGigs.map((g) => (
                  <th key={g.id} style={{ textAlign: "center", padding: "8px 12px", minWidth: 140 }}>
                    <Link href={`/gig/${g.id}`} style={{ color: "var(--accent)" }}>{g.title.slice(0, 30)}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600 }}>Price</td>
                {compareGigs.map((g) => <td key={g.id} style={{ textAlign: "center", padding: "8px 12px" }}>${g.price}</td>)}
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600 }}>Seller</td>
                {compareGigs.map((g) => <td key={g.id} style={{ textAlign: "center", padding: "8px 12px" }}>{g.seller}</td>)}
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600 }}>Rating</td>
                {compareGigs.map((g) => <td key={g.id} style={{ textAlign: "center", padding: "8px 12px" }}>{g.rating?.toFixed(1) ?? "N/A"} ({g.reviews ?? 0})</td>)}
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600 }}>Delivery</td>
                {compareGigs.map((g) => <td key={g.id} style={{ textAlign: "center", padding: "8px 12px" }}>{g.delivery}</td>)}
              </tr>
              <tr>
                <td style={{ padding: "8px 12px", fontWeight: 600 }}>Category</td>
                {compareGigs.map((g) => <td key={g.id} style={{ textAlign: "center", padding: "8px 12px" }}>{g.category}</td>)}
              </tr>
            </tbody>
          </table>
        </section>
      ) : null}

      {wishlists.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p className="muted">No wishlists yet. Create one and add gigs to compare!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {wishlists.map((wl) => (
            <div key={wl.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>{wl.name} <span className="muted" style={{ fontWeight: 400, fontSize: "0.85rem" }}>({wl.gig_ids.length} gigs)</span></h3>
                <div style={{ display: "flex", gap: 8 }}>
                  {wl.gig_ids.length >= 2 ? (
                    <button className="btn-primary btn-sm" onClick={() => setCompareList(wl.id)}>Compare</button>
                  ) : null}
                  <button className="btn-ghost btn-sm" style={{ color: "#ef4444" }} onClick={() => void deleteList(wl.id)}>Delete</button>
                </div>
              </div>
              {wl.gig_ids.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {wl.gig_ids.map((gid) => {
                    const g = resolveGig(gid);
                    return (
                      <div key={gid} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "var(--hover)", fontSize: "0.85rem" }}>
                        <Link href={`/gig/${gid}`} style={{ color: "var(--accent)" }}>{g?.title?.slice(0, 25) ?? gid.slice(0, 8)}</Link>
                        {g ? <span className="muted">${g.price}</span> : null}
                        <button type="button" onClick={() => void removeGig(wl.id, gid)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 0, fontSize: "1rem" }}>&times;</button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="muted" style={{ fontSize: "0.85rem" }}>No gigs added yet. Save gigs from the marketplace!</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
