"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";

interface Review {
  id: string; client_name: string; service: string; rating: number;
  title: string; content: string; is_featured: boolean; created_at: string;
}

/* Keep in step with src/lib/content/services.ts — these strings are stored
   on review records, so renaming one does not rewrite existing rows. */
const SERVICES = [
  "Python Development",
  "WordPress Development",
  "Digital Marketing",
  "Custom AI Agents",
  "MCP Server Development",
  "Prompt Engineering",
];

export default function ReviewsPage() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", content: "", service: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/reviews");
    if (res.ok) { const d = await res.json(); setReviews(d.reviews ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.content.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submit",
        client_name: user?.name ?? "",
        client_email: user?.email ?? "",
        ...form,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setSuccess(true);
      setShowForm(false);
      setForm({ rating: 5, title: "", content: "", service: "" });
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  const featured = reviews.filter((r) => r.is_featured);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";

  return (
    <section className="section">
      <div className="wrap">
        <div className="rv-head">
          <div>
            <h1>Client Reviews</h1>
            <p>See what our clients say about working with us.</p>
          </div>
          <div className="rv-head-stats">
            <div className="rv-avg">
              <strong>{avgRating}</strong>
              <div className="rv-stars">{renderStars(parseFloat(avgRating))}</div>
              <span>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
            </div>
            <button className="btn-primary" onClick={() => user ? setShowForm(!showForm) : openAuth("login")}>
              {showForm ? "Cancel" : "Write a Review"}
            </button>
          </div>
        </div>

        {success && (
          <div className="rv-success">Thank you! Your review has been submitted and will appear after approval.</div>
        )}

        {showForm && user && (
          <div className="rv-form">
            <h3>Share Your Experience</h3>
            <div className="rv-rating-select">
              <label>Rating</label>
              <div className="rv-star-btns">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} className={`rv-star-btn ${n <= form.rating ? "rv-star-active" : ""}`} onClick={() => setForm({ ...form, rating: n })}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="rv-form-grid">
              <div className="rv-field">
                <label>Service</label>
                <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                  <option value="">Select service</option>
                  {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="rv-field">
                <label>Title (optional)</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sum up your experience" />
              </div>
            </div>
            <div className="rv-field" style={{ marginTop: ".5rem" }}>
              <label>Your Review *</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Tell us about your experience..." rows={4} maxLength={2000} />
            </div>
            <button className="btn-primary" onClick={submit} disabled={!form.content.trim() || submitting} style={{ marginTop: ".8rem" }}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}

        {/* Featured Reviews */}
        {featured.length > 0 && (
          <div className="rv-featured">
            <h2>Featured Reviews</h2>
            <div className="rv-featured-grid">
              {featured.map((r) => (
                <div key={r.id} className="rv-featured-card">
                  <div className="rv-stars">{renderStars(r.rating)}</div>
                  {r.title && <h4>{r.title}</h4>}
                  <p>{r.content}</p>
                  <div className="rv-card-footer">
                    <strong>{r.client_name || "Client"}</strong>
                    {r.service && <span>{r.service}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Reviews */}
        <div className="rv-all">
          <h2>All Reviews</h2>
          {loading ? (
            <p style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>Loading...</p>
          ) : reviews.length === 0 ? (
            <div className="rv-empty">
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="rv-list">
              {reviews.map((r) => (
                <div key={r.id} className="rv-card">
                  <div className="rv-card-top">
                    <div className="rv-card-av">{(r.client_name || "C")[0].toUpperCase()}</div>
                    <div>
                      <strong>{r.client_name || "Client"}</strong>
                      <div className="rv-stars rv-stars-sm">{renderStars(r.rating)}</div>
                    </div>
                    <time>{new Date(r.created_at).toLocaleDateString()}</time>
                  </div>
                  {r.title && <h4 className="rv-card-title">{r.title}</h4>}
                  <p className="rv-card-content">{r.content}</p>
                  {r.service && <span className="rv-card-service">{r.service}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .rv-head{display:flex;justify-content:space-between;align-items:flex-end;padding:2rem 0 1.5rem;flex-wrap:wrap;gap:1rem}
        .rv-head h1{font-size:1.6rem;font-weight:800;margin:0}
        .rv-head p{color:var(--text-secondary);font-size:.9rem;margin:.2rem 0 0}
        .rv-head-stats{display:flex;align-items:center;gap:1.5rem}
        .rv-avg{text-align:center}
        .rv-avg strong{font-size:1.8rem;display:block}
        .rv-avg span{font-size:.7rem;color:var(--text-secondary)}

        .rv-stars{display:flex;gap:2px}
        .rv-stars-sm{font-size:.75rem}
        .rv-success{background:#05966920;color:#059669;padding:.8rem 1.2rem;border-radius:.6rem;font-weight:600;font-size:.88rem;margin-bottom:1rem;text-align:center}

        .rv-form{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem;animation:rvSlide .3s ease}
        @keyframes rvSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .rv-form h3{font-size:1.05rem;margin:0 0 1rem}
        .rv-rating-select{margin-bottom:.8rem}
        .rv-rating-select label{font-size:.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em;display:block;margin-bottom:.3rem}
        .rv-star-btns{display:flex;gap:.2rem}
        .rv-star-btn{width:36px;height:36px;border-radius:.4rem;border:1px solid var(--border);background:transparent;font-size:1.2rem;cursor:pointer;color:var(--border);transition:all .15s}
        .rv-star-active{color:#f59e0b;border-color:#f59e0b;background:#f59e0b12}
        .rv-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
        .rv-field{display:flex;flex-direction:column;gap:.2rem}
        .rv-field label{font-size:.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em}
        .rv-field input,.rv-field select,.rv-field textarea{padding:.5rem .65rem;border:1px solid var(--border);border-radius:.45rem;font-size:.84rem;font-family:inherit;background:var(--bg);color:var(--text-primary);outline:none;resize:vertical}
        .rv-field input:focus,.rv-field select:focus,.rv-field textarea:focus{border-color:var(--accent)}

        .rv-featured{margin-bottom:2rem}
        .rv-featured h2{font-size:1.1rem;font-weight:700;margin:0 0 1rem}
        .rv-featured-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
        .rv-featured-card{background:linear-gradient(135deg,#0066cc08,#7c3aed08);border:1.5px solid #0066cc20;border-radius:1rem;padding:1.5rem;position:relative}
        .rv-featured-card::before{content:"⭐";position:absolute;top:12px;right:14px;font-size:1rem}
        .rv-featured-card h4{font-size:.95rem;margin:.5rem 0 .3rem}
        .rv-featured-card p{font-size:.84rem;color:var(--text-secondary);line-height:1.6;margin:0 0 .8rem}
        .rv-card-footer{display:flex;justify-content:space-between;align-items:center;font-size:.78rem}
        .rv-card-footer span{color:var(--text-secondary)}

        .rv-all h2{font-size:1.1rem;font-weight:700;margin:0 0 1rem}
        .rv-empty{text-align:center;padding:3rem;background:var(--surface);border:1px solid var(--border);border-radius:1rem;color:var(--text-secondary)}
        .rv-list{display:flex;flex-direction:column;gap:.8rem;padding-bottom:2rem}
        .rv-card{background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:1.25rem}
        .rv-card-top{display:flex;align-items:center;gap:.7rem;margin-bottom:.5rem}
        .rv-card-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0066cc,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:800;flex-shrink:0}
        .rv-card-top strong{font-size:.88rem;display:block}
        .rv-card-top time{margin-left:auto;font-size:.7rem;color:var(--text-secondary)}
        .rv-card-title{font-size:.9rem;font-weight:700;margin:0 0 .3rem}
        .rv-card-content{font-size:.84rem;color:var(--text-secondary);line-height:1.6;margin:0 0 .5rem}
        .rv-card-service{font-size:.68rem;font-weight:600;color:var(--accent);background:rgba(0,102,204,.06);padding:.2rem .5rem;border-radius:999px}

        @media(max-width:600px){.rv-form-grid{grid-template-columns:1fr}.rv-head{flex-direction:column;align-items:flex-start}.rv-head-stats{width:100%;justify-content:space-between}}
      `}</style>
    </section>
  );
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < Math.round(rating) ? "#f59e0b" : "var(--border)", fontSize: "inherit" }}>★</span>
  ));
}
