"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Post {
  id: string; slug: string; title: string; excerpt: string; content: string;
  cover_image: string; author_name: string; author_avatar: string;
  category: string; tags: string[]; read_time: number; views: number;
  published_at: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/blog?slug=${slug}`);
    if (res.ok) { const d = await res.json(); setPost(d.post ?? null); }
    setLoading(false);
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <section className="section"><div className="wrap"><p style={{ textAlign: "center", padding: "4rem" }}>Loading...</p></div></section>;
  if (!post) return (
    <section className="section"><div className="wrap" style={{ textAlign: "center", padding: "4rem" }}>
      <h1 style={{ fontSize: "1.3rem" }}>Post not found</h1>
      <Link href="/blog" style={{ color: "var(--accent)" }}>← Back to Blog</Link>
    </div></section>
  );

  return (
    <section className="section">
      <div className="wrap">
        <article className="bp-article">
          <Link href="/blog" className="bp-back">← Back to Blog</Link>

          <header className="bp-header">
            <div className="bp-meta-top">
              <span className="bp-cat">{post.category}</span>
              <span className="bp-dot">·</span>
              <span>{post.read_time} min read</span>
              <span className="bp-dot">·</span>
              <span>{post.views} views</span>
            </div>
            <h1>{post.title}</h1>
            {post.excerpt && <p className="bp-excerpt">{post.excerpt}</p>}
            <div className="bp-author">
              <div className="bp-author-av">{post.author_name[0]}</div>
              <div>
                <strong>{post.author_name}</strong>
                <time>{new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</time>
              </div>
            </div>
          </header>

          {post.cover_image && (
            <div className="bp-cover">
              <img src={post.cover_image} alt={post.title} />
            </div>
          )}

          <div className="bp-content" dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />

          {post.tags.length > 0 && (
            <div className="bp-tags">
              {post.tags.map((t) => <span key={t} className="bp-tag">#{t}</span>)}
            </div>
          )}

          <div className="bp-footer">
            <Link href="/blog" className="bp-back-btn">← More Articles</Link>
            <Link href="/contact" className="btn-primary">Work With Us</Link>
          </div>
        </article>
      </div>

      <style>{`
        .bp-article{max-width:720px;margin:0 auto;padding:1.5rem 0 3rem}
        .bp-back{font-size:.85rem;color:var(--accent);text-decoration:none;font-weight:600;display:inline-block;margin-bottom:1.5rem}
        .bp-header{margin-bottom:2rem}
        .bp-meta-top{display:flex;align-items:center;gap:.5rem;font-size:.78rem;color:var(--text-secondary);margin-bottom:.8rem}
        .bp-cat{font-weight:700;text-transform:uppercase;color:var(--accent);background:rgba(0,102,204,.06);padding:.15rem .45rem;border-radius:999px;font-size:.68rem}
        .bp-dot{opacity:.4}
        .bp-header h1{font-size:2rem;font-weight:800;line-height:1.25;margin:0 0 .6rem}
        .bp-excerpt{font-size:1.05rem;color:var(--text-secondary);line-height:1.65;margin:0 0 1.2rem}
        .bp-author{display:flex;align-items:center;gap:.6rem}
        .bp-author-av{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#0066cc,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:800}
        .bp-author strong{font-size:.88rem;display:block}
        .bp-author time{font-size:.75rem;color:var(--text-secondary)}

        .bp-cover{margin-bottom:2rem;border-radius:1rem;overflow:hidden}
        .bp-cover img{width:100%;height:auto;display:block}

        .bp-content{font-size:.95rem;line-height:1.8;color:var(--text-primary)}
        .bp-content h2{font-size:1.3rem;font-weight:700;margin:2rem 0 .8rem}
        .bp-content h3{font-size:1.1rem;font-weight:700;margin:1.5rem 0 .6rem}
        .bp-content p{margin:0 0 1.2rem}
        .bp-content ul,.bp-content ol{margin:0 0 1.2rem;padding-left:1.5rem}
        .bp-content li{margin-bottom:.4rem}
        .bp-content code{background:var(--surface);border:1px solid var(--border);padding:.15rem .4rem;border-radius:.3rem;font-size:.85rem}
        .bp-content pre{background:var(--surface);border:1px solid var(--border);border-radius:.6rem;padding:1rem;overflow-x:auto;margin:0 0 1.2rem}
        .bp-content pre code{border:none;padding:0;background:none}
        .bp-content blockquote{border-left:3px solid var(--accent);padding:.5rem 1rem;margin:0 0 1.2rem;color:var(--text-secondary);font-style:italic}
        .bp-content a{color:var(--accent);text-decoration:underline}
        .bp-content img{max-width:100%;border-radius:.6rem;margin:1rem 0}

        .bp-tags{display:flex;gap:.4rem;flex-wrap:wrap;margin:2rem 0}
        .bp-tag{font-size:.75rem;color:var(--accent);background:rgba(0,102,204,.06);padding:.25rem .6rem;border-radius:999px;font-weight:600}

        .bp-footer{display:flex;justify-content:space-between;align-items:center;padding-top:2rem;border-top:1px solid var(--border)}
        .bp-back-btn{color:var(--accent);text-decoration:none;font-weight:600;font-size:.88rem}

        @media(max-width:600px){.bp-header h1{font-size:1.5rem}}
      `}</style>
    </section>
  );
}

function renderContent(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*<\/li>)/, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hulo])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}
