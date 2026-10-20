"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

interface Stats {
  totalProjects: number; activeProjects: number; completedProjects: number;
  totalBookings: number; confirmedBookings: number; upcomingSlots: number;
  totalInvoices: number; totalRevenue: number; outstandingAmount: number;
  paidInvoices: number; pendingQuotes: number;
  projectsByService: { service: string; count: number }[];
  revenueByMonth: { month: string; amount: number }[];
  recentActivity: { type: string; title: string; date: string; status: string }[];
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [projRes, bookRes, invRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/bookings?mode=all-bookings"),
        fetch("/api/invoices"),
      ]);
      const [projData, bookData, invData] = await Promise.all([
        projRes.ok ? projRes.json() : { projects: [] },
        bookRes.ok ? bookRes.json() : { bookings: [] },
        invRes.ok ? invRes.json() : { invoices: [] },
      ]);

      const projects = projData.projects ?? [];
      const bookings = bookData.bookings ?? [];
      const invoices = invData.invoices ?? [];

      const serviceCount: Record<string, number> = {};
      projects.forEach((p: { service: string }) => {
        if (p.service) serviceCount[p.service] = (serviceCount[p.service] || 0) + 1;
      });

      const monthRevenue: Record<string, number> = {};
      invoices.filter((i: { status: string }) => i.status === "paid").forEach((i: { paid_at: string; total: number }) => {
        const m = i.paid_at ? new Date(i.paid_at).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "Unknown";
        monthRevenue[m] = (monthRevenue[m] || 0) + i.total;
      });

      const recent: Stats["recentActivity"] = [];
      projects.slice(0, 3).forEach((p: { title: string; updated_at: string; status: string }) =>
        recent.push({ type: "project", title: p.title, date: p.updated_at, status: p.status }));
      bookings.slice(0, 3).forEach((b: { client_name: string; created_at: string; status: string }) =>
        recent.push({ type: "booking", title: b.client_name || "Booking", date: b.created_at, status: b.status }));
      invoices.slice(0, 3).forEach((i: { invoice_number: string; created_at: string; status: string }) =>
        recent.push({ type: "invoice", title: i.invoice_number, date: i.created_at, status: i.status }));
      recent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setStats({
        totalProjects: projects.length,
        activeProjects: projects.filter((p: { status: string }) => p.status !== "completed").length,
        completedProjects: projects.filter((p: { status: string }) => p.status === "completed").length,
        totalBookings: bookings.length,
        confirmedBookings: bookings.filter((b: { status: string }) => b.status === "confirmed").length,
        upcomingSlots: 0,
        totalInvoices: invoices.length,
        totalRevenue: invoices.filter((i: { status: string }) => i.status === "paid").reduce((s: number, i: { total: number }) => s + i.total, 0),
        outstandingAmount: invoices.filter((i: { type: string; status: string }) => i.type === "invoice" && (i.status === "sent" || i.status === "overdue")).reduce((s: number, i: { total: number }) => s + i.total, 0),
        paidInvoices: invoices.filter((i: { status: string }) => i.status === "paid").length,
        pendingQuotes: invoices.filter((i: { type: string; status: string }) => i.type === "quote" && i.status === "sent").length,
        projectsByService: Object.entries(serviceCount).map(([service, count]) => ({ service, count })).sort((a, b) => b.count - a.count),
        revenueByMonth: Object.entries(monthRevenue).map(([month, amount]) => ({ month, amount })),
        recentActivity: recent.slice(0, 8),
      });
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!user) return <section className="section"><div className="wrap"><p>Please sign in.</p></div></section>;
  if (loading) return <section className="section"><div className="wrap"><p style={{ textAlign: "center", padding: "4rem" }}>Loading analytics...</p></div></section>;
  if (!stats) return <section className="section"><div className="wrap"><p style={{ textAlign: "center", padding: "4rem" }}>Failed to load.</p></div></section>;

  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const maxRev = Math.max(...stats.revenueByMonth.map((r) => r.amount), 1);

  return (
    <section className="section">
      <div className="wrap">
        <div className="an-head">
          <div>
            <Link href="/dashboard" className="an-back">← Dashboard</Link>
            <h1>Analytics</h1>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="an-kpis">
          <div className="an-kpi">
            <span className="an-kpi-icon" style={{ background: "#0066cc15", color: "#0066cc" }}>📊</span>
            <div><span className="an-kpi-label">Active Projects</span><strong>{stats.activeProjects}</strong></div>
          </div>
          <div className="an-kpi">
            <span className="an-kpi-icon" style={{ background: "#05966915", color: "#059669" }}>💰</span>
            <div><span className="an-kpi-label">Total Revenue</span><strong style={{ color: "#059669" }}>{fmt(stats.totalRevenue)}</strong></div>
          </div>
          <div className="an-kpi">
            <span className="an-kpi-icon" style={{ background: "#ea580c15", color: "#ea580c" }}>📅</span>
            <div><span className="an-kpi-label">Bookings</span><strong>{stats.confirmedBookings}</strong></div>
          </div>
          <div className="an-kpi">
            <span className="an-kpi-icon" style={{ background: "#dc262615", color: "#dc2626" }}>📄</span>
            <div><span className="an-kpi-label">Outstanding</span><strong style={{ color: "#dc2626" }}>{fmt(stats.outstandingAmount)}</strong></div>
          </div>
        </div>

        <div className="an-grid">
          {/* Revenue Chart */}
          <div className="an-card">
            <h3>Revenue by Month</h3>
            {stats.revenueByMonth.length === 0 ? (
              <p className="an-empty-chart">No revenue data yet.</p>
            ) : (
              <div className="an-chart">
                {stats.revenueByMonth.map((r) => (
                  <div key={r.month} className="an-bar-wrap">
                    <div className="an-bar" style={{ height: `${(r.amount / maxRev) * 160}px` }}>
                      <span className="an-bar-val">{fmt(r.amount)}</span>
                    </div>
                    <span className="an-bar-label">{r.month}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects by Service */}
          <div className="an-card">
            <h3>Projects by Service</h3>
            {stats.projectsByService.length === 0 ? (
              <p className="an-empty-chart">No projects yet.</p>
            ) : (
              <div className="an-service-list">
                {stats.projectsByService.map((s) => (
                  <div key={s.service} className="an-service-row">
                    <span className="an-service-name">{s.service}</span>
                    <div className="an-service-bar-wrap">
                      <div className="an-service-bar" style={{ width: `${(s.count / (stats.projectsByService[0]?.count || 1)) * 100}%` }} />
                    </div>
                    <strong className="an-service-count">{s.count}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="an-grid">
          {/* Quick Stats */}
          <div className="an-card">
            <h3>Overview</h3>
            <div className="an-overview">
              <div className="an-ov-row"><span>Total Projects</span><strong>{stats.totalProjects}</strong></div>
              <div className="an-ov-row"><span>Completed</span><strong style={{ color: "#059669" }}>{stats.completedProjects}</strong></div>
              <div className="an-ov-row"><span>Total Bookings</span><strong>{stats.totalBookings}</strong></div>
              <div className="an-ov-row"><span>Total Invoices</span><strong>{stats.totalInvoices}</strong></div>
              <div className="an-ov-row"><span>Paid Invoices</span><strong style={{ color: "#059669" }}>{stats.paidInvoices}</strong></div>
              <div className="an-ov-row"><span>Pending Quotes</span><strong style={{ color: "#ea580c" }}>{stats.pendingQuotes}</strong></div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="an-card">
            <h3>Recent Activity</h3>
            {stats.recentActivity.length === 0 ? (
              <p className="an-empty-chart">No activity yet.</p>
            ) : (
              <div className="an-activity">
                {stats.recentActivity.map((a, i) => (
                  <div key={i} className="an-act-row">
                    <span className="an-act-icon">
                      {a.type === "project" ? "📊" : a.type === "booking" ? "📅" : "📄"}
                    </span>
                    <div className="an-act-info">
                      <strong>{a.title}</strong>
                      <span>{a.type} · {a.status}</span>
                    </div>
                    <time>{timeAgo(a.date)}</time>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .an-head{display:flex;justify-content:space-between;align-items:flex-end;padding:1.5rem 0;flex-wrap:wrap;gap:1rem}
        .an-head h1{font-size:1.4rem;font-weight:800;margin:.25rem 0 0}
        .an-back{font-size:.85rem;color:var(--accent);text-decoration:none;font-weight:600}

        .an-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem}
        .an-kpi{display:flex;align-items:center;gap:.8rem;background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:1.1rem 1.2rem}
        .an-kpi-icon{width:44px;height:44px;border-radius:.6rem;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0}
        .an-kpi-label{font-size:.68rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);letter-spacing:.04em;display:block}
        .an-kpi strong{font-size:1.3rem;display:block;margin-top:.1rem}

        .an-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.5rem}
        .an-card{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.5rem}
        .an-card h3{font-size:.95rem;font-weight:700;margin:0 0 1rem}
        .an-empty-chart{text-align:center;color:var(--text-secondary);font-size:.85rem;padding:2rem}

        .an-chart{display:flex;align-items:flex-end;gap:.8rem;min-height:180px;padding-top:1rem}
        .an-bar-wrap{display:flex;flex-direction:column;align-items:center;flex:1}
        .an-bar{background:linear-gradient(180deg,#0066cc,#0891b2);border-radius:.35rem .35rem 0 0;min-height:8px;width:100%;max-width:48px;position:relative;transition:height .5s ease}
        .an-bar-val{position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:.62rem;font-weight:700;color:var(--text-secondary);white-space:nowrap}
        .an-bar-label{font-size:.65rem;color:var(--text-secondary);margin-top:.4rem;font-weight:600}

        .an-service-list{display:flex;flex-direction:column;gap:.6rem}
        .an-service-row{display:flex;align-items:center;gap:.6rem}
        .an-service-name{font-size:.78rem;font-weight:600;min-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .an-service-bar-wrap{flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden}
        .an-service-bar{height:100%;background:linear-gradient(90deg,#0066cc,#7c3aed);border-radius:4px;transition:width .5s ease}
        .an-service-count{font-size:.82rem;min-width:24px;text-align:right}

        .an-overview{display:flex;flex-direction:column;gap:.5rem}
        .an-ov-row{display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid var(--border)}
        .an-ov-row:last-child{border:none}
        .an-ov-row span{font-size:.82rem;color:var(--text-secondary)}
        .an-ov-row strong{font-size:.95rem}

        .an-activity{display:flex;flex-direction:column;gap:.4rem}
        .an-act-row{display:flex;align-items:center;gap:.6rem;padding:.45rem 0;border-bottom:1px solid var(--border)}
        .an-act-row:last-child{border:none}
        .an-act-icon{font-size:1rem}
        .an-act-info{flex:1;min-width:0}
        .an-act-info strong{font-size:.82rem;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .an-act-info span{font-size:.68rem;color:var(--text-secondary);text-transform:capitalize}
        .an-act-row time{font-size:.68rem;color:var(--text-secondary);white-space:nowrap}

        @media(max-width:768px){.an-kpis{grid-template-columns:repeat(2,1fr)}.an-grid{grid-template-columns:1fr}}
        @media(max-width:500px){.an-kpis{grid-template-columns:1fr}}
      `}</style>
    </section>
  );
}

function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60000) return "just now";
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}
