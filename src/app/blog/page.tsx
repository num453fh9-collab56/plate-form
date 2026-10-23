"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Post {
  id: string; slug: string; title: string; excerpt: string; cover_image: string;
  author_name: string; category: string; tags: string[]; read_time: number;
  views: number; is_featured: boolean; published_at: string;
}

const CATEGORIES = ["general", "tech", "marketing", "ai", "tutorials", "case-study"];

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  useEffect(() => { setLoading(false); }, []);

  const featured = posts.filter((p) => p.is_featured);
  const regular = posts.filter((p) => !p.is_featured);

  return (
    <section className="section">
      <div className="wrap">
        <div className="bl-head">
          <div>
            <h1>Blog</h1>
            <p>Insights, tutorials, and updates from the Hirelyx team.</p>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>Loading...</p>
        ) : posts.length === 0 ? (
          <div className="bl-empty">
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
            <h2>Coming Soon</h2>
            <p>We&apos;re working on some great content — tutorials, case studies, and insights. Check back soon!</p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="bl-featured">
                {featured.map((p) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="bl-feat-card">
                    {p.cover_image && <div className="bl-feat-img" style={{ backgroundImage: `url(${p.cover_image})` }} />}
                    <div className="bl-feat-body">
                      <span className="bl-feat-badge">Featured</span>
                      <span className="bl-tag">{p.category}</span>
                      <h2>{p.title}</h2>
                      {p.excerpt && <p>{p.excerpt}</p>}
                      <div className="bl-meta">
                        <span>{p.author_name}</span>
                        <span>{p.read_time} min read</span>
                        <span>{new Date(p.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="bl-grid">
              {regular.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="bl-card">
                  {p.cover_image && <div className="bl-card-img" style={{ backgroundImage: `url(${p.cover_image})` }} />}
                  <div className="bl-card-body">
                    <div className="bl-card-top">
                      <span className="bl-tag">{p.category}</span>
                      <span className="bl-read">{p.read_time} min</span>
                    </div>
                    <h3>{p.title}</h3>
                    {p.excerpt && <p className="bl-card-excerpt">{p.excerpt.slice(0, 120)}{p.excerpt.length > 120 ? "..." : ""}</p>}
                    <div className="bl-meta">
                      <span>{p.author_name}</span>
                      <span>{new Date(p.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        .bl-head{padding:2rem 0 1rem}
        .bl-head h1{font-size:1.6rem;font-weight:800;margin:0}
        .bl-head p{color:var(--text-secondary);font-size:.9rem;margin:.2rem 0 0}

        .bl-cats{display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:1.5rem;padding:.5rem 0}
        .bl-cat{padding:.35rem .75rem;border-radius:999px;border:1px solid var(--border);background:transparent;font-size:.78rem;font-weight:600;cursor:pointer;color:var(--text-secondary);transition:all .15s;text-transform:capitalize}
        .bl-cat:hover{border-color:var(--accent);color:var(--accent)}
        .bl-cat-active{background:var(--accent);color:#fff;border-color:var(--accent)}

        .bl-empty{text-align:center;padding:4rem 1rem;background:var(--surface);border:1px solid var(--border);border-radius:1rem}
        .bl-empty h2{font-size:1.2rem;margin:0 0 .4rem}
        .bl-empty p{color:var(--text-secondary);font-size:.88rem;margin:0}

        .bl-featured{margin-bottom:2rem}
        .bl-feat-card{display:grid;grid-template-columns:1fr 1fr;background:var(--surface);border:1px solid var(--border);border-radius:1rem;overflow:hidden;text-decoration:none;color:inherit;transition:box-shadow .2s}
        .bl-feat-card:hover{box-shadow:0 8px 30px rgba(0,0,0,.08)}
        .bl-feat-img{min-height:280px;background-size:cover;background-position:center;background-color:var(--border)}
        .bl-feat-body{padding:2rem;display:flex;flex-direction:column;justify-content:center}
        .bl-feat-badge{display:inline-block;font-size:.65rem;font-weight:700;text-transform:uppercase;color:#f59e0b;background:#f59e0b14;padding:.2rem .5rem;border-radius:999px;width:fit-content;margin-bottom:.5rem}
        .bl-feat-body h2{font-size:1.3rem;font-weight:800;margin:.4rem 0 .5rem;line-height:1.3}
        .bl-feat-body p{font-size:.88rem;color:var(--text-secondary);line-height:1.6;margin:0 0 1rem}

        .bl-tag{font-size:.65rem;font-weight:700;text-transform:uppercase;color:var(--accent);background:rgba(0,102,204,.06);padding:.15rem .45rem;border-radius:999px}
        .bl-read{font-size:.65rem;color:var(--text-secondary)}
        .bl-meta{display:flex;gap:1rem;font-size:.72rem;color:var(--text-secondary);margin-top:auto}

        .bl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.25rem;padding-bottom:2rem}
        .bl-card{background:var(--surface);border:1px solid var(--border);border-radius:1rem;overflow:hidden;text-decoration:none;color:inherit;transition:transform .2s,box-shadow .2s;display:flex;flex-direction:column}
        .bl-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,.07)}
        .bl-card-img{height:180px;background-size:cover;background-position:center;background-color:var(--border)}
        .bl-card-body{padding:1.25rem;display:flex;flex-direction:column;flex:1}
        .bl-card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem}
        .bl-card-body h3{font-size:1rem;font-weight:700;margin:0 0 .35rem;line-height:1.35}
        .bl-card-excerpt{font-size:.82rem;color:var(--text-secondary);line-height:1.5;margin:0 0 .8rem}

        @media(max-width:768px){.bl-feat-card{grid-template-columns:1fr}.bl-feat-img{min-height:200px}}
        @media(max-width:500px){.bl-grid{grid-template-columns:1fr}}
      `}</style>
    </section>
  );
}
