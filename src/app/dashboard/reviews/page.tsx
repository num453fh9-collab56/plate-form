"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

interface Review {
  id: string; client_name: string; client_email: string; service: string;
  rating: number; title: string; content: string;
  is_featured: boolean; is_approved: boolean; created_at: string;
}

export default function ManageReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/reviews?mode=all");
    if (res.ok) { const d = await res.json(); setReviews(d.reviews ?? []); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", id }),
    });
    load();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "feature", id, featured: !current }),
    });
    load();
  };

  const remove = async (id: string) => {
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    load();
  };

  let filtered = reviews;
  if (filter === "pending") filtered = reviews.filter((r) => !r.is_approved);
  if (filter === "approved") filtered = reviews.filter((r) => r.is_approved);

  if (!user) return <section className="section"><div className="wrap"><p>Please sign in.</p></div></section>;

  return (
    <section className="section">
      <div className="wrap">
        <div className="mr-head">
          <div>
            <Link href="/dashboard" className="mr-back">← Dashboard</Link>
            <h1>Manage Reviews</h1>
          </div>
          <div className="mr-stats">
            <span className="mr-stat-badge">{reviews.filter((r) => !r.is_approved).length} pending</span>
            <span className="mr-stat-badge mr-stat-green">{reviews.filter((r) => r.is_approved).length} approved</span>
            <span className="mr-stat-badge mr-stat-gold">{reviews.filter((r) => r.is_featured).length} featured</span>
          </div>
        </div>

        <div className="mr-filters">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button key={f} className={`mr-filter ${filter === f ? "mr-filter-active" : ""}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="mr-list">
          {filtered.length === 0 ? (
            <div className="mr-empty">No {filter !== "all" ? filter : ""} reviews.</div>
          ) : filtered.map((r) => (
            <div key={r.id} className={`mr-card ${!r.is_approved ? "mr-card-pending" : ""}`}>
              <div className="mr-card-top">
                <div className="mr-card-av">{(r.client_name || "C")[0].toUpperCase()}</div>
                <div className="mr-card-info">
                  <strong>{r.client_name || "Anonymous"}</strong>
                  <span>{r.client_email}</span>
                </div>
                <div className="mr-card-stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ color: i < r.rating ? "#f59e0b" : "var(--border)" }}>★</span>
                  ))}
                </div>
              </div>
              {r.title && <h4 className="mr-card-title">{r.title}</h4>}
              <p className="mr-card-content">{r.content}</p>
              <div className="mr-card-meta">
                {r.service && <span className="mr-service">{r.service}</span>}
                <time>{new Date(r.created_at).toLocaleDateString()}</time>
                {r.is_featured && <span className="mr-featured-badge">⭐ Featured</span>}
                {!r.is_approved && <span className="mr-pending-badge">Pending</span>}
              </div>
              <div className="mr-card-actions">
                {!r.is_approved && <button className="mr-btn mr-btn-green" onClick={() => approve(r.id)}>Approve</button>}
                {r.is_approved && (
                  <button className="mr-btn mr-btn-gold" onClick={() => toggleFeatured(r.id, r.is_featured)}>
                    {r.is_featured ? "Unfeature" : "Feature"}
                  </button>
                )}
                <button className="mr-btn mr-btn-red" onClick={() => remove(r.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .mr-head{display:flex;justify-content:space-between;align-items:flex-end;padding:1.5rem 0;flex-wrap:wrap;gap:1rem}
        .mr-head h1{font-size:1.4rem;font-weight:800;margin:.25rem 0 0}
        .mr-back{font-size:.85rem;color:var(--accent);text-decoration:none;font-weight:600}
        .mr-stats{display:flex;gap:.5rem}
        .mr-stat-badge{font-size:.72rem;font-weight:700;padding:.3rem .7rem;border-radius:999px;background:var(--border);color:var(--text-secondary)}
        .mr-stat-green{background:#05966918;color:#059669}
        .mr-stat-gold{background:#f59e0b18;color:#d97706}

        .mr-filters{display:flex;gap:.3rem;margin-bottom:1rem}
        .mr-filter{padding:.4rem .8rem;border-radius:999px;border:1px solid var(--border);background:transparent;font-size:.78rem;font-weight:600;cursor:pointer;color:var(--text-secondary);transition:all .15s}
        .mr-filter:hover{border-color:var(--accent);color:var(--accent)}
        .mr-filter-active{background:var(--accent);color:#fff;border-color:var(--accent)}

        .mr-list{display:flex;flex-direction:column;gap:.7rem;padding-bottom:2rem}
        .mr-empty{text-align:center;padding:3rem;color:var(--text-secondary);background:var(--surface);border:1px solid var(--border);border-radius:.75rem}
        .mr-card{background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:1.25rem}
        .mr-card-pending{border-left:3px solid #ea580c}
        .mr-card-top{display:flex;align-items:center;gap:.7rem;margin-bottom:.5rem}
        .mr-card-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0066cc,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:800;flex-shrink:0}
        .mr-card-info{flex:1}
        .mr-card-info strong{font-size:.88rem;display:block}
        .mr-card-info span{font-size:.72rem;color:var(--text-secondary)}
        .mr-card-stars{font-size:.9rem}
        .mr-card-title{font-size:.9rem;font-weight:700;margin:0 0 .2rem}
        .mr-card-content{font-size:.84rem;color:var(--text-secondary);line-height:1.6;margin:0 0 .6rem}
        .mr-card-meta{display:flex;gap:.6rem;align-items:center;font-size:.72rem;color:var(--text-secondary);margin-bottom:.6rem;flex-wrap:wrap}
        .mr-service{background:rgba(0,102,204,.06);color:var(--accent);padding:.15rem .45rem;border-radius:999px;font-weight:600}
        .mr-featured-badge{background:#f59e0b18;color:#d97706;padding:.15rem .45rem;border-radius:999px;font-weight:600}
        .mr-pending-badge{background:#ea580c18;color:#ea580c;padding:.15rem .45rem;border-radius:999px;font-weight:600}
        .mr-card-actions{display:flex;gap:.4rem}
        .mr-btn{font-size:.74rem;padding:.35rem .7rem;border-radius:.4rem;border:1px solid var(--border);background:transparent;cursor:pointer;font-weight:600;transition:all .15s}
        .mr-btn-green{border-color:#059669;color:#059669}
        .mr-btn-green:hover{background:#059669;color:#fff}
        .mr-btn-gold{border-color:#d97706;color:#d97706}
        .mr-btn-gold:hover{background:#d97706;color:#fff}
        .mr-btn-red{border-color:#dc2626;color:#dc2626}
        .mr-btn-red:hover{background:#dc2626;color:#fff}
      `}</style>
    </section>
  );
}
