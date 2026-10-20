"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

interface Project {
  id: string; title: string; description: string; service: string;
  status: string; stage: number; budget: string; deadline: string | null;
  client_name: string; client_email: string; created_at: string; updated_at: string;
}

const STAGES = ["Discovery", "Design", "Development", "Testing", "Launch", "Completed"];
const STAGE_COLORS = ["#0066cc", "#7c3aed", "#059669", "#ea580c", "#dc2626", "#16a34a"];
const SERVICES = ["Programming & Tech", "Digital Marketing", "Custom AI Agents", "Social Media AI & Animation", "Prompt Engineering", "n8n & Workflow Automation"];

export default function ManageProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", client_name: "", client_email: "", service: "", budget: "", deadline: "" });
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/projects");
    if (!res.ok) return;
    const data = await res.json();
    setProjects(data.projects ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...form }),
    });
    setForm({ title: "", description: "", client_name: "", client_email: "", service: "", budget: "", deadline: "" });
    setShowForm(false);
    setCreating(false);
    load();
  };

  const advanceStage = async (projectId: string, currentStage: number) => {
    if (currentStage >= 5) return;
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-stage", projectId, stage: currentStage + 1 }),
    });
    load();
  };

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  if (!user) return <section className="section"><div className="wrap"><p>Please sign in.</p></div></section>;

  return (
    <section className="section">
      <div className="wrap">
        <div className="mp-head">
          <div>
            <Link href="/dashboard" className="mp-back">← Dashboard</Link>
            <h1>Manage Projects</h1>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ New Project"}
          </button>
        </div>

        {showForm && (
          <div className="mp-form">
            <h3>Create New Project</h3>
            <div className="mp-form-grid">
              <div className="mp-field">
                <label>Project Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. E-commerce Website" />
              </div>
              <div className="mp-field">
                <label>Service</label>
                <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                  <option value="">Select service</option>
                  {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="mp-field">
                <label>Client Name</label>
                <input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Client name" />
              </div>
              <div className="mp-field">
                <label>Client Email</label>
                <input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} placeholder="client@email.com" />
              </div>
              <div className="mp-field">
                <label>Budget</label>
                <input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. $1,500" />
              </div>
              <div className="mp-field">
                <label>Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div className="mp-field mp-field-full">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the project..." rows={3} />
              </div>
            </div>
            <button className="btn-primary" onClick={create} disabled={!form.title.trim() || creating} style={{ marginTop: "1rem" }}>
              {creating ? "Creating..." : "Create Project"}
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mp-filters">
          {["all", "discovery", "design", "development", "testing", "launch", "completed"].map((f) => (
            <button key={f} className={`mp-filter ${filter === f ? "mp-filter-active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="mp-filter-count">{f === "all" ? projects.length : projects.filter((p) => p.status === f).length}</span>
            </button>
          ))}
        </div>

        {/* Project list */}
        <div className="mp-list">
          {filtered.length === 0 ? (
            <div className="mp-empty">No projects {filter !== "all" ? `in "${filter}"` : "yet"}.</div>
          ) : filtered.map((p) => (
            <div key={p.id} className="mp-row">
              <div className="mp-row-main">
                <div className="mp-row-status" style={{ background: STAGE_COLORS[p.stage] }} />
                <div className="mp-row-info">
                  <strong>{p.title}</strong>
                  <div className="mp-row-meta">
                    {p.client_name && <span>👤 {p.client_name}</span>}
                    {p.service && <span>🏷️ {p.service}</span>}
                    {p.budget && <span>💰 {p.budget}</span>}
                  </div>
                </div>
                <span className="mp-row-stage" style={{ background: `${STAGE_COLORS[p.stage]}14`, color: STAGE_COLORS[p.stage] }}>
                  {STAGES[p.stage]}
                </span>
              </div>
              <div className="mp-row-actions">
                {p.stage < 5 && (
                  <button className="mp-advance" onClick={() => advanceStage(p.id, p.stage)}>
                    Advance to {STAGES[p.stage + 1]} →
                  </button>
                )}
                <Link href={`/projects/${p.id}`} className="mp-view">View</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .mp-head{display:flex;justify-content:space-between;align-items:flex-end;padding:1.5rem 0;flex-wrap:wrap;gap:1rem}
        .mp-head h1{font-size:1.4rem;font-weight:800;margin:.25rem 0 0}
        .mp-back{font-size:.85rem;color:var(--accent);text-decoration:none;font-weight:600}

        .mp-form{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem;animation:mpSlide .3s ease}
        @keyframes mpSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .mp-form h3{font-size:1.05rem;margin:0 0 1rem}
        .mp-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}
        .mp-field{display:flex;flex-direction:column;gap:.3rem}
        .mp-field-full{grid-column:1/-1}
        .mp-field label{font-size:.75rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em}
        .mp-field input,.mp-field select,.mp-field textarea{padding:.55rem .7rem;border:1px solid var(--border);border-radius:.5rem;font-size:.85rem;font-family:inherit;background:var(--bg);color:var(--text-primary);outline:none}
        .mp-field input:focus,.mp-field select:focus,.mp-field textarea:focus{border-color:var(--accent)}
        .mp-field textarea{resize:vertical}

        .mp-filters{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1rem;padding:.5rem 0}
        .mp-filter{padding:.35rem .7rem;border-radius:999px;border:1px solid var(--border);background:transparent;font-size:.78rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:.35rem;color:var(--text-secondary);transition:all .15s}
        .mp-filter:hover{border-color:var(--accent);color:var(--accent)}
        .mp-filter-active{background:var(--accent);color:#fff;border-color:var(--accent)}
        .mp-filter-count{font-size:.65rem;background:var(--hover);padding:.1rem .35rem;border-radius:999px}
        .mp-filter-active .mp-filter-count{background:rgba(255,255,255,.2)}

        .mp-list{display:flex;flex-direction:column;gap:.6rem;padding-bottom:2rem}
        .mp-empty{text-align:center;padding:3rem;color:var(--text-secondary);font-size:.88rem}
        .mp-row{background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:1rem 1.25rem;transition:box-shadow .2s}
        .mp-row:hover{box-shadow:0 4px 16px rgba(0,0,0,.05)}
        .mp-row-main{display:flex;align-items:center;gap:.8rem}
        .mp-row-status{width:4px;height:36px;border-radius:2px;flex-shrink:0}
        .mp-row-info{flex:1;min-width:0}
        .mp-row-info strong{font-size:.92rem;display:block}
        .mp-row-meta{display:flex;gap:.8rem;font-size:.72rem;color:var(--text-secondary);margin-top:.2rem;flex-wrap:wrap}
        .mp-row-stage{font-size:.72rem;font-weight:700;padding:.25rem .6rem;border-radius:999px;flex-shrink:0}
        .mp-row-actions{display:flex;gap:.5rem;margin-top:.7rem;justify-content:flex-end}
        .mp-advance{font-size:.75rem;padding:.35rem .8rem;border-radius:.4rem;border:1px solid var(--accent);color:var(--accent);background:transparent;cursor:pointer;font-weight:600;transition:all .15s}
        .mp-advance:hover{background:var(--accent);color:#fff}
        .mp-view{font-size:.75rem;padding:.35rem .8rem;border-radius:.4rem;border:1px solid var(--border);color:var(--text-secondary);text-decoration:none;font-weight:600;transition:all .15s}
        .mp-view:hover{border-color:var(--text-primary);color:var(--text-primary)}

        @media(max-width:600px){.mp-form-grid{grid-template-columns:1fr}.mp-row-meta{flex-direction:column;gap:.2rem}}
      `}</style>
    </section>
  );
}
