"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  service: string;
  status: string;
  stage: number;
  budget: string;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

const STAGES = [
  { label: "Discovery", icon: "🔍", color: "#0066cc" },
  { label: "Design", icon: "🎨", color: "#7c3aed" },
  { label: "Development", icon: "⚡", color: "#059669" },
  { label: "Testing", icon: "🧪", color: "#ea580c" },
  { label: "Launch", icon: "🚀", color: "#dc2626" },
  { label: "Completed", icon: "✅", color: "#16a34a" },
];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !user) { setLoading(false); return; }
    const { data } = await sb
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (!user) {
    return (
      <section className="section"><div className="wrap" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: ".5rem" }}>My Projects</h1>
        <p style={{ color: "var(--text-secondary)" }}>Please sign in to view your projects.</p>
      </div></section>
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="pj-head">
          <div>
            <h1>My Projects</h1>
            <p>Track your project progress in real-time.</p>
          </div>
          <Link href="/contact" className="btn-primary">Start New Project</Link>
        </div>

        {loading ? (
          <div className="pj-loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="pj-empty">
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
            <h2>No projects yet</h2>
            <p>When you start a project with us, you can track its progress here.</p>
            <Link href="/contact" className="btn-primary" style={{ marginTop: "1rem" }}>Start a Project</Link>
          </div>
        ) : (
          <div className="pj-grid">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="pj-card">
                <div className="pj-card-top">
                  <span className="pj-card-service">{p.service || "Project"}</span>
                  <span className="pj-card-status" style={{ background: `${STAGES[p.stage]?.color ?? "#666"}18`, color: STAGES[p.stage]?.color }}>
                    {STAGES[p.stage]?.icon} {STAGES[p.stage]?.label ?? p.status}
                  </span>
                </div>
                <h3 className="pj-card-title">{p.title}</h3>
                {p.description && <p className="pj-card-desc">{p.description.slice(0, 100)}{p.description.length > 100 ? "..." : ""}</p>}

                {/* Progress bar */}
                <div className="pj-progress">
                  <div className="pj-progress-bar">
                    <div
                      className="pj-progress-fill"
                      style={{ width: `${Math.min(((p.stage + 1) / STAGES.length) * 100, 100)}%`, background: STAGES[p.stage]?.color }}
                    />
                  </div>
                  <span className="pj-progress-text">{Math.round(((p.stage + 1) / STAGES.length) * 100)}%</span>
                </div>

                {/* Stage dots */}
                <div className="pj-stages">
                  {STAGES.slice(0, 5).map((s, i) => (
                    <div key={s.label} className={`pj-stage-dot ${i < p.stage ? "pj-stage-done" : i === p.stage ? "pj-stage-active" : ""}`}>
                      <span className="pj-dot" style={i <= p.stage ? { background: STAGES[p.stage]?.color, borderColor: STAGES[p.stage]?.color } : undefined} />
                      <span className="pj-stage-label">{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="pj-card-footer">
                  {p.budget && <span>💰 {p.budget}</span>}
                  {p.deadline && <span>📅 {new Date(p.deadline).toLocaleDateString([], { month: "short", day: "numeric" })}</span>}
                  <span>🕐 Updated {timeAgo(p.updated_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .pj-head{display:flex;justify-content:space-between;align-items:center;padding:2rem 0 1.5rem;flex-wrap:wrap;gap:1rem}
        .pj-head h1{font-size:1.6rem;font-weight:800;margin:0}
        .pj-head p{color:var(--text-secondary);margin:.25rem 0 0;font-size:.9rem}
        .pj-loading{text-align:center;padding:4rem;color:var(--text-secondary)}
        .pj-empty{text-align:center;padding:4rem 1rem;background:var(--surface);border:1px solid var(--border);border-radius:1rem}
        .pj-empty h2{font-size:1.2rem;margin:0 0 .4rem}
        .pj-empty p{color:var(--text-secondary);font-size:.88rem;margin:0}

        .pj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:1.25rem;padding-bottom:2rem}
        .pj-card{display:block;background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.5rem;text-decoration:none;color:inherit;transition:transform .2s,box-shadow .2s}
        .pj-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,.08)}
        .pj-card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.7rem}
        .pj-card-service{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary)}
        .pj-card-status{font-size:.72rem;font-weight:700;padding:.25rem .6rem;border-radius:999px}
        .pj-card-title{font-size:1.05rem;font-weight:700;margin:0 0 .35rem;color:var(--text-primary)}
        .pj-card-desc{font-size:.82rem;color:var(--text-secondary);line-height:1.5;margin:0 0 1rem}

        .pj-progress{display:flex;align-items:center;gap:.6rem;margin:.8rem 0}
        .pj-progress-bar{flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden}
        .pj-progress-fill{height:100%;border-radius:3px;transition:width .5s ease}
        .pj-progress-text{font-size:.7rem;font-weight:700;color:var(--text-secondary);min-width:32px;text-align:right}

        .pj-stages{display:flex;justify-content:space-between;margin:.6rem 0 1rem;position:relative}
        .pj-stages::before{content:"";position:absolute;top:8px;left:10%;right:10%;height:2px;background:var(--border);z-index:0}
        .pj-stage-dot{display:flex;flex-direction:column;align-items:center;gap:.3rem;z-index:1}
        .pj-dot{width:18px;height:18px;border-radius:50%;border:2px solid var(--border);background:var(--bg);transition:all .3s}
        .pj-stage-done .pj-dot{transform:scale(.85)}
        .pj-stage-active .pj-dot{transform:scale(1.1);box-shadow:0 0 0 4px rgba(0,102,204,.15)}
        .pj-stage-label{font-size:.58rem;color:var(--text-secondary);font-weight:600;text-align:center}
        .pj-stage-active .pj-stage-label{color:var(--text-primary);font-weight:700}

        .pj-card-footer{display:flex;gap:1rem;font-size:.72rem;color:var(--text-secondary);flex-wrap:wrap}

        @media(max-width:500px){.pj-grid{grid-template-columns:1fr}.pj-stage-label{display:none}}
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
