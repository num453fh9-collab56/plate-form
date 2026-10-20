"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import Link from "next/link";

interface Project { id: string; title: string; service: string; status: string; stage: number; updated_at: string; }
interface Booking { id: string; status: string; service: string; created_at: string; booking_slots: { date: string; start_time: string; end_time: string; title: string } | null; }
interface Invoice { id: string; invoice_number: string; type: string; status: string; total: number; currency: string; created_at: string; }

const STAGE_LABELS = ["Discovery", "Design", "Development", "Testing", "Launch", "Completed"];
const STAGE_COLORS = ["#0066cc", "#7c3aed", "#059669", "#ea580c", "#dc2626", "#16a34a"];

export default function ClientPortal() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const [projects, setProjects] = useState<Project[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const [pRes, bRes, iRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/bookings?mode=my-bookings"),
      fetch("/api/invoices?mode=my"),
    ]);
    const [pData, bData, iData] = await Promise.all([
      pRes.ok ? pRes.json() : { projects: [] },
      bRes.ok ? bRes.json() : { bookings: [] },
      iRes.ok ? iRes.json() : { invoices: [] },
    ]);
    setProjects(pData.projects ?? []);
    setBookings(bData.bookings ?? []);
    setInvoices(iData.invoices ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (!user) {
    return (
      <section className="section"><div className="wrap cp-login">
        <h1>Client Portal</h1>
        <p>Sign in to access your projects, bookings, and invoices in one place.</p>
        <button className="btn-primary" onClick={() => openAuth("login")}>Sign In</button>
      </div></section>
    );
  }

  const fmt = (n: number, c: string) => `${c === "PKR" ? "Rs " : "$"}${n.toFixed(2)}`;
  const activeProjects = projects.filter((p) => p.status !== "completed");
  const upcomingBookings = bookings.filter((b) => b.status === "confirmed");
  const unpaidInvoices = invoices.filter((i) => i.type === "invoice" && (i.status === "sent" || i.status === "overdue"));
  const totalOwed = unpaidInvoices.reduce((s, i) => s + i.total, 0);

  return (
    <section className="section">
      <div className="wrap">
        <div className="cp-head">
          <div>
            <h1>Welcome back, {user.name?.split(" ")[0] || "there"}!</h1>
            <p>Your projects, bookings, and invoices — all in one place.</p>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>Loading your portal...</p>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="cp-stats">
              <div className="cp-stat">
                <span className="cp-stat-num">{activeProjects.length}</span>
                <span className="cp-stat-label">Active Projects</span>
              </div>
              <div className="cp-stat">
                <span className="cp-stat-num">{upcomingBookings.length}</span>
                <span className="cp-stat-label">Upcoming Meetings</span>
              </div>
              <div className="cp-stat">
                <span className="cp-stat-num" style={totalOwed > 0 ? { color: "#dc2626" } : undefined}>{fmt(totalOwed, "USD")}</span>
                <span className="cp-stat-label">Outstanding</span>
              </div>
              <div className="cp-stat">
                <span className="cp-stat-num" style={{ color: "#059669" }}>{invoices.filter((i) => i.status === "paid").length}</span>
                <span className="cp-stat-label">Paid Invoices</span>
              </div>
            </div>

            {/* Active Projects */}
            <div className="cp-section">
              <div className="cp-sec-head">
                <h2>Active Projects</h2>
                <Link href="/projects" className="cp-link">View All →</Link>
              </div>
              {activeProjects.length === 0 ? (
                <div className="cp-empty">No active projects. <Link href="/contact">Start one</Link></div>
              ) : (
                <div className="cp-proj-grid">
                  {activeProjects.slice(0, 4).map((p) => (
                    <Link key={p.id} href={`/projects/${p.id}`} className="cp-proj">
                      <div className="cp-proj-top">
                        <span className="cp-proj-service">{p.service || "Project"}</span>
                        <span className="cp-proj-stage" style={{ background: `${STAGE_COLORS[p.stage]}14`, color: STAGE_COLORS[p.stage] }}>
                          {STAGE_LABELS[p.stage]}
                        </span>
                      </div>
                      <strong>{p.title}</strong>
                      <div className="cp-proj-bar">
                        <div style={{ width: `${((p.stage + 1) / 6) * 100}%`, background: STAGE_COLORS[p.stage] }} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Bookings */}
            <div className="cp-section">
              <div className="cp-sec-head">
                <h2>Upcoming Bookings</h2>
                <Link href="/bookings" className="cp-link">Book New →</Link>
              </div>
              {upcomingBookings.length === 0 ? (
                <div className="cp-empty">No upcoming bookings. <Link href="/bookings">Book a consultation</Link></div>
              ) : (
                <div className="cp-book-list">
                  {upcomingBookings.slice(0, 3).map((b) => (
                    <div key={b.id} className="cp-book">
                      <span className="cp-book-icon">📅</span>
                      <div>
                        <strong>{b.booking_slots?.title ?? "Consultation"}</strong>
                        {b.booking_slots && (
                          <span>{new Date(b.booking_slots.date + "T00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {fmtTime(b.booking_slots.start_time)}</span>
                        )}
                      </div>
                      {b.service && <span className="cp-book-service">{b.service}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invoices */}
            <div className="cp-section">
              <div className="cp-sec-head">
                <h2>Recent Invoices</h2>
                <Link href="/invoices" className="cp-link">View All →</Link>
              </div>
              {invoices.length === 0 ? (
                <div className="cp-empty">No invoices yet.</div>
              ) : (
                <div className="cp-inv-list">
                  {invoices.slice(0, 5).map((inv) => (
                    <Link key={inv.id} href="/invoices" className="cp-inv">
                      <div>
                        <strong>{inv.invoice_number}</strong>
                        <span className="cp-inv-type">{inv.type}</span>
                      </div>
                      <span className={`cp-inv-status cp-inv-${inv.status}`}>{inv.status}</span>
                      <strong className="cp-inv-total">{fmt(inv.total, inv.currency)}</strong>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="cp-actions">
              <Link href="/contact" className="cp-action-btn">💬 Contact Team</Link>
              <Link href="/bookings" className="cp-action-btn">📅 Book Meeting</Link>
              <Link href="/reviews" className="cp-action-btn">⭐ Leave Review</Link>
              <Link href="/faq" className="cp-action-btn">❓ FAQ</Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        .cp-login{text-align:center;padding:4rem 1rem}
        .cp-login h1{font-size:1.5rem;font-weight:800;margin:0 0 .5rem}
        .cp-login p{color:var(--text-secondary);margin:0 0 1rem}

        .cp-head{padding:2rem 0 1.5rem}
        .cp-head h1{font-size:1.5rem;font-weight:800;margin:0}
        .cp-head p{color:var(--text-secondary);font-size:.9rem;margin:.2rem 0 0}

        .cp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem}
        .cp-stat{background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:1.2rem;text-align:center}
        .cp-stat-num{font-size:1.5rem;font-weight:800;display:block}
        .cp-stat-label{font-size:.7rem;font-weight:600;text-transform:uppercase;color:var(--text-secondary);letter-spacing:.04em;margin-top:.2rem;display:block}

        .cp-section{margin-bottom:2rem}
        .cp-sec-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem}
        .cp-sec-head h2{font-size:1.05rem;font-weight:700;margin:0}
        .cp-link{font-size:.82rem;color:var(--accent);text-decoration:none;font-weight:600}
        .cp-empty{text-align:center;padding:1.5rem;background:var(--surface);border:1px solid var(--border);border-radius:.6rem;color:var(--text-secondary);font-size:.85rem}
        .cp-empty a{color:var(--accent)}

        .cp-proj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.8rem}
        .cp-proj{background:var(--surface);border:1px solid var(--border);border-radius:.7rem;padding:1rem;text-decoration:none;color:inherit;transition:box-shadow .2s}
        .cp-proj:hover{box-shadow:0 4px 16px rgba(0,0,0,.06)}
        .cp-proj-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem}
        .cp-proj-service{font-size:.65rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary)}
        .cp-proj-stage{font-size:.65rem;font-weight:700;padding:.15rem .45rem;border-radius:999px}
        .cp-proj strong{font-size:.88rem;display:block;margin-bottom:.5rem}
        .cp-proj-bar{height:4px;background:var(--border);border-radius:2px;overflow:hidden}
        .cp-proj-bar div{height:100%;border-radius:2px;transition:width .5s ease}

        .cp-book-list{display:flex;flex-direction:column;gap:.5rem}
        .cp-book{display:flex;align-items:center;gap:.7rem;background:var(--surface);border:1px solid var(--border);border-radius:.6rem;padding:.8rem 1rem}
        .cp-book-icon{font-size:1.2rem}
        .cp-book strong{font-size:.85rem;display:block}
        .cp-book span{font-size:.72rem;color:var(--text-secondary)}
        .cp-book-service{margin-left:auto;font-size:.68rem;font-weight:600;color:var(--accent);background:rgba(0,102,204,.06);padding:.15rem .4rem;border-radius:999px}

        .cp-inv-list{display:flex;flex-direction:column;gap:.4rem}
        .cp-inv{display:flex;align-items:center;gap:1rem;background:var(--surface);border:1px solid var(--border);border-radius:.6rem;padding:.7rem 1rem;text-decoration:none;color:inherit;transition:background .15s}
        .cp-inv:hover{background:rgba(0,102,204,.02)}
        .cp-inv strong{font-size:.85rem}
        .cp-inv-type{font-size:.62rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);background:var(--border);padding:.1rem .35rem;border-radius:.25rem;margin-left:.4rem}
        .cp-inv-status{font-size:.65rem;font-weight:700;padding:.15rem .45rem;border-radius:999px;margin-left:auto}
        .cp-inv-sent{background:#0066cc18;color:#0066cc}
        .cp-inv-paid{background:#05966918;color:#059669}
        .cp-inv-overdue{background:#dc262618;color:#dc2626}
        .cp-inv-draft{background:#64748b18;color:#64748b}
        .cp-inv-total{min-width:70px;text-align:right;font-size:.9rem}

        .cp-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem;padding-bottom:2rem}
        .cp-action-btn{text-align:center;padding:.9rem;background:var(--surface);border:1px solid var(--border);border-radius:.6rem;text-decoration:none;color:var(--text-primary);font-size:.82rem;font-weight:600;transition:all .15s}
        .cp-action-btn:hover{border-color:var(--accent);color:var(--accent)}

        @media(max-width:768px){.cp-stats{grid-template-columns:repeat(2,1fr)}.cp-actions{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:500px){.cp-stats{grid-template-columns:1fr}.cp-proj-grid{grid-template-columns:1fr}}
      `}</style>
    </section>
  );
}

function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}
