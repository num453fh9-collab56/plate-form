"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Project {
  id: string; title: string; description: string; service: string;
  status: string; stage: number; budget: string; deadline: string | null;
  client_name: string; created_at: string; updated_at: string;
}
interface Milestone {
  id: string; title: string; description: string; stage: number;
  status: string; due_date: string | null; completed_at: string | null; sort_order: number;
}
interface Activity {
  id: string; user_role: string; type: string; content: string; created_at: string;
}

const STAGES = [
  { label: "Discovery", icon: "🔍", color: "#0066cc", desc: "Understanding your requirements and goals" },
  { label: "Design", icon: "🎨", color: "#7c3aed", desc: "Creating wireframes, mockups, and plans" },
  { label: "Development", icon: "⚡", color: "#059669", desc: "Building your project with regular updates" },
  { label: "Testing", icon: "🧪", color: "#ea580c", desc: "Quality assurance and bug fixes" },
  { label: "Launch", icon: "🚀", color: "#dc2626", desc: "Deploying and going live" },
  { label: "Completed", icon: "✅", color: "#16a34a", desc: "Project delivered successfully" },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<{ name: string; size: number; type: string; path: string; created_at: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !id) return;
    const [p, m, a] = await Promise.all([
      sb.from("projects").select("*").eq("id", id).single(),
      sb.from("project_milestones").select("*").eq("project_id", id).order("sort_order"),
      sb.from("project_activity").select("*").eq("project_id", id).order("created_at", { ascending: true }),
    ]);
    if (p.data) setProject(p.data);
    setMilestones(m.data ?? []);
    setActivity(a.data ?? []);
    setLoading(false);
  }, [id]);

  const loadFiles = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`/api/files?projectId=${id}`);
    if (res.ok) { const d = await res.json(); setFiles(d.files ?? []); }
  }, [id]);

  useEffect(() => { load(); loadFiles(); }, [load, loadFiles]);

  const uploadFile = async (file: File) => {
    if (!id || uploading) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("projectId", id);
    await fetch("/api/files", { method: "POST", body: fd });
    setUploading(false);
    loadFiles();
    load();
  };

  const downloadFile = async (path: string, name: string) => {
    const res = await fetch("/api/files/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    if (res.ok) {
      const { url } = await res.json();
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
    }
  };

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !id) return;
    const ch = sb.channel(`proj-activity:${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "project_activity", filter: `project_id=eq.${id}` },
        (payload) => setActivity((prev) => prev.some((a) => a.id === (payload.new as Activity).id) ? prev : [...prev, payload.new as Activity]))
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activity]);

  const sendComment = async () => {
    if (!comment.trim() || sending || !user) return;
    const text = comment.trim();
    setComment("");
    setSending(true);
    const sb = getSupabase();
    if (sb) {
      await sb.from("project_activity").insert({
        project_id: id,
        user_id: user.sub,
        user_role: "client",
        type: "comment",
        content: text,
      });
      await sb.from("projects").update({ updated_at: new Date().toISOString() }).eq("id", id);
    }
    setSending(false);
  };

  if (loading) return <section className="section"><div className="wrap"><p style={{ textAlign: "center", padding: "4rem" }}>Loading project...</p></div></section>;
  if (!project) return <section className="section"><div className="wrap"><p style={{ textAlign: "center", padding: "4rem" }}>Project not found.</p></div></section>;

  const stg = STAGES[project.stage] ?? STAGES[0];
  const pct = Math.round(((project.stage + 1) / STAGES.length) * 100);

  return (
    <section className="section">
      <div className="wrap">
        <Link href="/projects" className="pd-back">← Back to Projects</Link>

        {/* Header */}
        <div className="pd-header">
          <div>
            <span className="pd-service">{project.service || "Project"}</span>
            <h1>{project.title}</h1>
            {project.description && <p className="pd-desc">{project.description}</p>}
          </div>
          <div className="pd-status" style={{ background: `${stg.color}12`, color: stg.color, borderColor: `${stg.color}30` }}>
            <span style={{ fontSize: "1.5rem" }}>{stg.icon}</span>
            <strong>{stg.label}</strong>
            <span className="pd-status-sub">{stg.desc}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="pd-progress-wrap">
          <div className="pd-progress-header">
            <h2>Progress</h2>
            <span className="pd-pct" style={{ color: stg.color }}>{pct}%</span>
          </div>
          <div className="pd-progress-bar">
            <div className="pd-progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, #0066cc, ${stg.color})` }} />
          </div>

          <div className="pd-timeline">
            {STAGES.slice(0, 5).map((s, i) => {
              const done = i < project.stage;
              const active = i === project.stage;
              return (
                <div key={s.label} className={`pd-tl-step ${done ? "pd-tl-done" : ""} ${active ? "pd-tl-active" : ""}`}>
                  <div className="pd-tl-dot" style={done || active ? { background: s.color, borderColor: s.color } : undefined}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span className="pd-tl-icon">{s.icon}</span>
                  <strong>{s.label}</strong>
                  <p>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pd-grid">
          {/* Milestones */}
          <div className="pd-card">
            <h2>Milestones</h2>
            <div className="pd-milestones">
              {milestones.map((m) => (
                <div key={m.id} className={`pd-ml ${m.status === "completed" ? "pd-ml-done" : m.status === "in_progress" ? "pd-ml-active" : ""}`}>
                  <div className="pd-ml-check">
                    {m.status === "completed" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : m.status === "in_progress" ? (
                      <div className="pd-ml-spinner" />
                    ) : (
                      <div className="pd-ml-circle" />
                    )}
                  </div>
                  <div>
                    <strong>{m.title}</strong>
                    {m.description && <p>{m.description}</p>}
                    {m.completed_at && <span className="pd-ml-date">Completed {new Date(m.completed_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="pd-card">
            <h2>Details</h2>
            <div className="pd-details">
              {project.budget && <div className="pd-detail"><span>Budget</span><strong>{project.budget}</strong></div>}
              {project.deadline && <div className="pd-detail"><span>Deadline</span><strong>{new Date(project.deadline).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" })}</strong></div>}
              <div className="pd-detail"><span>Started</span><strong>{new Date(project.created_at).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" })}</strong></div>
              <div className="pd-detail"><span>Last Update</span><strong>{timeAgo(project.updated_at)}</strong></div>
            </div>
          </div>
        </div>

        {/* Files */}
        {user && (
          <div className="pd-card pd-files">
            <div className="pd-files-head">
              <h2>Files</h2>
              <button className="pd-upload-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Uploading..." : "+ Upload File"}
              </button>
              <input ref={fileRef} type="file" hidden onChange={(e) => { if (e.target.files?.[0]) uploadFile(e.target.files[0]); e.target.value = ""; }} />
            </div>
            {files.length === 0 ? (
              <p className="pd-no-activity">No files yet. Upload files to share with the team.</p>
            ) : (
              <div className="pd-file-list">
                {files.map((f) => (
                  <div key={f.path} className="pd-file">
                    <span className="pd-file-icon">{getFileIcon(f.name)}</span>
                    <div className="pd-file-info">
                      <strong>{f.name.replace(/^\d+_/, "")}</strong>
                      <span>{fmtSize(f.size)}</span>
                    </div>
                    <button className="pd-file-dl" onClick={() => downloadFile(f.path, f.name)}>Download</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activity / Comments */}
        <div className="pd-card pd-activity">
          <h2>Activity & Comments</h2>
          <div className="pd-activity-list">
            {activity.length === 0 && <p className="pd-no-activity">No activity yet.</p>}
            {activity.map((a) => (
              <div key={a.id} className={`pd-act ${a.type === "status" ? "pd-act-status" : ""}`}>
                <div className="pd-act-av" style={{ background: a.user_role === "team" ? "linear-gradient(135deg,#0066cc,#0891b2)" : "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  {a.user_role === "team" ? "H" : "C"}
                </div>
                <div className="pd-act-body">
                  <div className="pd-act-meta">
                    <strong>{a.user_role === "team" ? "Hirelyx Team" : "You"}</strong>
                    <time>{fmtTime(a.created_at)}</time>
                  </div>
                  <p>{a.content}</p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {user && (
            <div className="pd-comment-box">
              <textarea
                placeholder="Write a comment or ask a question..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendComment(); } }}
                rows={2}
                maxLength={2000}
              />
              <button onClick={sendComment} disabled={!comment.trim() || sending}>
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .pd-back{display:inline-block;font-size:.85rem;color:var(--accent);text-decoration:none;font-weight:600;padding:1.5rem 0 .5rem}
        .pd-header{display:flex;justify-content:space-between;align-items:flex-start;gap:1.5rem;padding:1rem 0 2rem;flex-wrap:wrap}
        .pd-header h1{font-size:1.6rem;font-weight:800;margin:.3rem 0 .4rem}
        .pd-service{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary)}
        .pd-desc{font-size:.9rem;color:var(--text-secondary);line-height:1.6;max-width:560px;margin:0}
        .pd-status{display:flex;flex-direction:column;align-items:center;gap:.3rem;padding:1.2rem 1.5rem;border-radius:1rem;border:1.5px solid;text-align:center;min-width:160px}
        .pd-status strong{font-size:.95rem}
        .pd-status-sub{font-size:.7rem;opacity:.7;max-width:140px}

        .pd-progress-wrap{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem}
        .pd-progress-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem}
        .pd-progress-header h2{font-size:1rem;font-weight:700;margin:0}
        .pd-pct{font-size:1.4rem;font-weight:800}
        .pd-progress-bar{height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:1.5rem}
        .pd-progress-fill{height:100%;border-radius:4px;transition:width .6s ease}

        .pd-timeline{display:flex;justify-content:space-between;gap:.5rem;position:relative}
        .pd-timeline::before{content:"";position:absolute;top:16px;left:8%;right:8%;height:2px;background:var(--border)}
        .pd-tl-step{display:flex;flex-direction:column;align-items:center;text-align:center;z-index:1;flex:1}
        .pd-tl-dot{width:34px;height:34px;border-radius:50%;border:2.5px solid var(--border);background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;color:var(--text-secondary);margin-bottom:.4rem;transition:all .3s}
        .pd-tl-done .pd-tl-dot,.pd-tl-active .pd-tl-dot{color:#fff}
        .pd-tl-active .pd-tl-dot{transform:scale(1.15);box-shadow:0 0 0 6px rgba(0,102,204,.12)}
        .pd-tl-icon{font-size:1rem;margin-bottom:.15rem}
        .pd-tl-step strong{font-size:.72rem;color:var(--text-secondary)}
        .pd-tl-active strong{color:var(--text-primary)}
        .pd-tl-step p{font-size:.6rem;color:var(--text-secondary);margin:.15rem 0 0;display:none}

        .pd-grid{display:grid;grid-template-columns:1fr 300px;gap:1.25rem;margin-bottom:1.5rem}
        .pd-card{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.5rem}
        .pd-card h2{font-size:1rem;font-weight:700;margin:0 0 1rem}

        .pd-milestones{display:flex;flex-direction:column;gap:.6rem}
        .pd-ml{display:flex;gap:.7rem;align-items:flex-start;padding:.6rem;border-radius:.6rem;transition:background .15s}
        .pd-ml-active{background:rgba(0,102,204,.04)}
        .pd-ml-check{flex-shrink:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;margin-top:2px}
        .pd-ml-circle{width:14px;height:14px;border-radius:50%;border:2px solid var(--border)}
        .pd-ml-spinner{width:14px;height:14px;border-radius:50%;border:2px solid var(--accent);border-top-color:transparent;animation:mlSpin .8s linear infinite}
        @keyframes mlSpin{to{transform:rotate(360deg)}}
        .pd-ml strong{font-size:.85rem;display:block}
        .pd-ml p{font-size:.75rem;color:var(--text-secondary);margin:.15rem 0 0}
        .pd-ml-date{font-size:.68rem;color:var(--accent)}
        .pd-ml-done strong{text-decoration:line-through;opacity:.6}

        .pd-details{display:flex;flex-direction:column;gap:.8rem}
        .pd-detail{display:flex;justify-content:space-between;align-items:center;padding-bottom:.6rem;border-bottom:1px solid var(--border)}
        .pd-detail:last-child{border:none;padding:0}
        .pd-detail span{font-size:.78rem;color:var(--text-secondary)}
        .pd-detail strong{font-size:.82rem}

        .pd-activity{margin-bottom:2rem}
        .pd-activity-list{max-height:400px;overflow-y:auto;display:flex;flex-direction:column;gap:.6rem;margin-bottom:1rem;padding-right:.5rem}
        .pd-no-activity{text-align:center;color:var(--text-secondary);font-size:.85rem;padding:2rem}
        .pd-act{display:flex;gap:.6rem}
        .pd-act-status{opacity:.7}
        .pd-act-av{width:28px;height:28px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:800;flex-shrink:0;margin-top:2px}
        .pd-act-body{flex:1}
        .pd-act-meta{display:flex;align-items:center;gap:.5rem}
        .pd-act-meta strong{font-size:.8rem}
        .pd-act-meta time{font-size:.65rem;color:var(--text-secondary)}
        .pd-act-body p{font-size:.84rem;margin:.2rem 0 0;line-height:1.5;color:var(--text-primary);white-space:pre-wrap;word-break:break-word}
        .pd-act-status .pd-act-body p{font-style:italic;color:var(--text-secondary)}

        .pd-comment-box{display:flex;gap:.5rem;align-items:flex-end;border-top:1px solid var(--border);padding-top:.8rem}
        .pd-comment-box textarea{flex:1;resize:none;border:1px solid var(--border);border-radius:.6rem;padding:.55rem .75rem;font-size:.84rem;font-family:inherit;background:var(--bg);color:var(--text-primary);outline:none;max-height:80px}
        .pd-comment-box textarea:focus{border-color:var(--accent)}
        .pd-comment-box button{padding:.55rem 1.2rem;border-radius:.5rem;background:var(--accent);color:#fff;border:none;font-size:.82rem;font-weight:600;cursor:pointer;white-space:nowrap}
        .pd-comment-box button:disabled{opacity:.4;cursor:not-allowed}

        .pd-files{margin-bottom:1.5rem}
        .pd-files-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem}
        .pd-files-head h2{margin:0;font-size:1rem;font-weight:700}
        .pd-upload-btn{padding:.4rem .8rem;border-radius:.4rem;border:1px dashed var(--accent);color:var(--accent);background:transparent;font-size:.78rem;font-weight:600;cursor:pointer;transition:all .15s}
        .pd-upload-btn:hover{background:var(--accent);color:#fff;border-style:solid}
        .pd-upload-btn:disabled{opacity:.5;cursor:not-allowed}
        .pd-file-list{display:flex;flex-direction:column;gap:.4rem}
        .pd-file{display:flex;align-items:center;gap:.6rem;padding:.55rem .7rem;border:1px solid var(--border);border-radius:.5rem;transition:background .15s}
        .pd-file:hover{background:rgba(0,102,204,.03)}
        .pd-file-icon{font-size:1.2rem;flex-shrink:0}
        .pd-file-info{flex:1;min-width:0}
        .pd-file-info strong{font-size:.82rem;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .pd-file-info span{font-size:.68rem;color:var(--text-secondary)}
        .pd-file-dl{font-size:.72rem;padding:.3rem .6rem;border-radius:.35rem;border:1px solid var(--accent);color:var(--accent);background:transparent;cursor:pointer;font-weight:600;transition:all .15s;flex-shrink:0}
        .pd-file-dl:hover{background:var(--accent);color:#fff}

        @media(max-width:768px){
          .pd-grid{grid-template-columns:1fr}
          .pd-timeline{overflow-x:auto;padding-bottom:.5rem}
          .pd-tl-step{min-width:70px}
          .pd-header{flex-direction:column}
          .pd-status{flex-direction:row;min-width:auto;gap:.6rem}
        }
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

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "🖼️";
  if (["pdf"].includes(ext)) return "📕";
  if (["doc", "docx"].includes(ext)) return "📘";
  if (["xls", "xlsx", "csv"].includes(ext)) return "📗";
  if (["zip", "rar", "7z"].includes(ext)) return "📦";
  if (["mp4", "mov", "avi"].includes(ext)) return "🎬";
  if (["psd", "ai", "fig", "sketch"].includes(ext)) return "🎨";
  return "📄";
}
