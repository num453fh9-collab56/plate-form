"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

interface Post {
  id: string; slug: string; title: string; excerpt: string; content: string;
  cover_image: string; author_name: string; category: string; tags: string[];
  read_time: number; views: number; status: string; is_featured: boolean;
  published_at: string; created_at: string;
}

const CATEGORIES = ["general", "tech", "marketing", "ai", "tutorials", "case-study"];

export default function ManageBlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", cover_image: "", author_name: "Hirelyx Team", category: "general", tags: "", read_time: "3" });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/blog?mode=all");
    if (res.ok) { const d = await res.json(); setPosts(d.posts ?? []); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (p: Post) => {
    setEditId(p.id);
    setForm({
      title: p.title, excerpt: p.excerpt, content: p.content,
      cover_image: p.cover_image, author_name: p.author_name,
      category: p.category, tags: p.tags.join(", "), read_time: String(p.read_time),
    });
    setShowEditor(true);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      read_time: parseInt(form.read_time) || 3,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (editId) {
      await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id: editId, ...payload }),
      });
    } else {
      await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...payload }),
      });
    }
    setForm({ title: "", excerpt: "", content: "", cover_image: "", author_name: "Hirelyx Team", category: "general", tags: "", read_time: "3" });
    setShowEditor(false);
    setEditId(null);
    setSaving(false);
    load();
  };

  const action = async (a: string, id: string, extra?: Record<string, unknown>) => {
    await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: a, id, ...extra }),
    });
    load();
  };

  const filtered = filter === "all" ? posts : posts.filter((p) => p.status === filter);

  if (!user) return <section className="section"><div className="wrap"><p>Please sign in.</p></div></section>;

  return (
    <section className="section">
      <div className="wrap">
        <div className="mb-head">
          <div>
            <Link href="/dashboard" className="mb-back">← Dashboard</Link>
            <h1>Manage Blog</h1>
          </div>
          <button className="btn-primary" onClick={() => { setShowEditor(!showEditor); setEditId(null); setForm({ title: "", excerpt: "", content: "", cover_image: "", author_name: "Hirelyx Team", category: "general", tags: "", read_time: "3" }); }}>
            {showEditor ? "Cancel" : "+ New Post"}
          </button>
        </div>

        {showEditor && (
          <div className="be-editor">
            <h3>{editId ? "Edit Post" : "New Blog Post"}</h3>
            <div className="be-grid">
              <div className="be-field be-full">
                <label>Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" style={{ fontSize: "1.1rem", fontWeight: 700 }} />
              </div>
              <div className="be-field be-full">
                <label>Excerpt</label>
                <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief description for cards and SEO" />
              </div>
              <div className="be-field">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="be-field">
                <label>Author</label>
                <input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} />
              </div>
              <div className="be-field">
                <label>Read Time (min)</label>
                <input type="number" min="1" value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} />
              </div>
              <div className="be-field">
                <label>Tags (comma separated)</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="nextjs, react, tips" />
              </div>
              <div className="be-field be-full">
                <label>Cover Image URL</label>
                <input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." />
              </div>
              <div className="be-field be-full">
                <label>Content (Markdown supported)</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your post here... Use **bold**, *italic*, ## headings, - lists, [links](url)" rows={16} />
              </div>
            </div>
            <button className="btn-primary" onClick={save} disabled={!form.title.trim() || saving} style={{ marginTop: "1rem" }}>
              {saving ? "Saving..." : editId ? "Update Post" : "Create Draft"}
            </button>
          </div>
        )}

        <div className="be-filters">
          {["all", "draft", "published"].map((f) => (
            <button key={f} className={`bl-cat ${filter === f ? "bl-cat-active" : ""}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({f === "all" ? posts.length : posts.filter((p) => p.status === f).length})
            </button>
          ))}
        </div>

        <div className="be-list">
          {filtered.length === 0 ? (
            <div className="be-empty">No {filter !== "all" ? filter : ""} posts.</div>
          ) : filtered.map((p) => (
            <div key={p.id} className="be-row">
              <div className="be-row-main">
                <div className="be-row-info">
                  <div className="be-row-top">
                    <strong>{p.title}</strong>
                    <span className={`be-status be-st-${p.status}`}>{p.status}</span>
                    {p.is_featured && <span className="be-feat">⭐</span>}
                  </div>
                  <div className="be-row-meta">
                    <span>{p.category}</span>
                    <span>{p.author_name}</span>
                    <span>{p.views} views</span>
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="be-row-actions">
                <button className="be-btn" onClick={() => startEdit(p)}>Edit</button>
                {p.status === "draft" && <button className="be-btn be-btn-green" onClick={() => action("publish", p.id)}>Publish</button>}
                {p.status === "published" && <button className="be-btn" onClick={() => action("unpublish", p.id)}>Unpublish</button>}
                <button className="be-btn be-btn-gold" onClick={() => action("feature", p.id, { featured: !p.is_featured })}>
                  {p.is_featured ? "Unfeature" : "Feature"}
                </button>
                {p.status === "published" && <Link href={`/blog/${p.slug}`} className="be-btn">View</Link>}
                <button className="be-btn be-btn-red" onClick={() => action("delete", p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .mb-head{display:flex;justify-content:space-between;align-items:flex-end;padding:1.5rem 0;flex-wrap:wrap;gap:1rem}
        .mb-head h1{font-size:1.4rem;font-weight:800;margin:.25rem 0 0}
        .mb-back{font-size:.85rem;color:var(--accent);text-decoration:none;font-weight:600}

        .be-editor{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem;animation:beSlide .3s ease}
        @keyframes beSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .be-editor h3{font-size:1.05rem;margin:0 0 1rem}
        .be-grid{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
        .be-field{display:flex;flex-direction:column;gap:.2rem}
        .be-full{grid-column:1/-1}
        .be-field label{font-size:.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em}
        .be-field input,.be-field select,.be-field textarea{padding:.5rem .65rem;border:1px solid var(--border);border-radius:.45rem;font-size:.84rem;font-family:inherit;background:var(--bg);color:var(--text-primary);outline:none;resize:vertical}
        .be-field input:focus,.be-field select:focus,.be-field textarea:focus{border-color:var(--accent)}

        .be-filters{display:flex;gap:.3rem;margin-bottom:1rem}
        .bl-cat{padding:.35rem .75rem;border-radius:999px;border:1px solid var(--border);background:transparent;font-size:.78rem;font-weight:600;cursor:pointer;color:var(--text-secondary);transition:all .15s}
        .bl-cat:hover{border-color:var(--accent);color:var(--accent)}
        .bl-cat-active{background:var(--accent);color:#fff;border-color:var(--accent)}

        .be-list{display:flex;flex-direction:column;gap:.6rem;padding-bottom:2rem}
        .be-empty{text-align:center;padding:3rem;color:var(--text-secondary);background:var(--surface);border:1px solid var(--border);border-radius:.75rem}
        .be-row{background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:1rem 1.25rem}
        .be-row-main{display:flex;align-items:center;gap:.8rem}
        .be-row-info{flex:1;min-width:0}
        .be-row-top{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
        .be-row-top strong{font-size:.92rem}
        .be-status{font-size:.65rem;font-weight:700;padding:.15rem .45rem;border-radius:999px}
        .be-st-draft{background:#64748b18;color:#64748b}
        .be-st-published{background:#05966918;color:#059669}
        .be-feat{font-size:.75rem}
        .be-row-meta{display:flex;gap:.8rem;font-size:.72rem;color:var(--text-secondary);margin-top:.2rem;flex-wrap:wrap}
        .be-row-actions{display:flex;gap:.35rem;margin-top:.6rem;flex-wrap:wrap}
        .be-btn{font-size:.72rem;padding:.3rem .65rem;border-radius:.4rem;border:1px solid var(--border);color:var(--text-secondary);background:transparent;cursor:pointer;font-weight:600;text-decoration:none;transition:all .15s}
        .be-btn:hover{border-color:var(--text-primary);color:var(--text-primary)}
        .be-btn-green{border-color:#059669;color:#059669}
        .be-btn-green:hover{background:#059669;color:#fff}
        .be-btn-gold{border-color:#d97706;color:#d97706}
        .be-btn-gold:hover{background:#d97706;color:#fff}
        .be-btn-red{border-color:#dc2626;color:#dc2626}
        .be-btn-red:hover{background:#dc2626;color:#fff}

        @media(max-width:600px){.be-grid{grid-template-columns:1fr}}
      `}</style>
    </section>
  );
}
