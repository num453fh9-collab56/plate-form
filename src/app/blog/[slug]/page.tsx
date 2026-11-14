import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import ViewPing from "@/components/site/ViewPing";
import { Breadcrumbs } from "@/components/site/ui";
import { getPost, relatedPosts } from "@/lib/blog";
import { articleSchema, breadcrumbSchema, pageMetadata } from "@/lib/seo";

/* ==========================================================================
   HIRELYX · ARTICLE (/blog/[slug])
   --------------------------------------------------------------------------
   Server-rendered so the title, excerpt and body are in the initial HTML and
   the <head> carries a per-post canonical, description and Open Graph card.
   Revalidated rather than force-dynamic: articles change rarely and a cached
   page is both faster and cheaper to crawl.
   ========================================================================== */

/* A missing slug renders the not-found UI but responds 200, not 404.
   That is this Next version's streaming behaviour, not an oversight: with
   Cache Components every dynamic route streams a static shell first, and
   headers cannot change once streaming has begun (see
   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md,
   "Status codes"). A real 404 would mean checking the slug in proxy, ahead of
   the stream, which is a Supabase round trip on every /blog/* request.
   generateMetadata returns noindex instead, so these never reach the index —
   the outcome that actually matters here. */

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  /* Overrides the layout's `index, follow`, so a missing slug emits a single
     clean noindex instead of two contradictory robots tags. */
  if (!post) {
    return {
      title: "Article not found",
      robots: { index: false, follow: true },
    };
  }

  const description =
    post.excerpt?.trim() ||
    `${post.title} — an engineering note from the Hirelyx team.`;

  const base = pageMetadata({
    title: post.title,
    description,
    path: `/blog/${post.slug}`,
    type: "article",
    keywords: post.tags,
    ...(post.cover_image ? { image: post.cover_image } : {}),
  });

  return {
    ...base,
    authors: [{ name: post.author_name }],
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.published_at,
      ...(post.updated_at ? { modifiedTime: post.updated_at } : {}),
      authors: [post.author_name],
      ...(post.category ? { section: post.category } : {}),
      ...(post.tags?.length ? { tags: post.tags } : {}),
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await relatedPosts(post);
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Insights", href: "/blog" },
    { label: post.title },
  ];

  return (
    <section className="section">
      <ViewPing slug={post.slug} />
      <JsonLd
        data={[
          articleSchema({
            title: post.title,
            description: post.excerpt || post.title,
            path: `/blog/${post.slug}`,
            published: post.published_at,
            modified: post.updated_at,
            author: post.author_name,
            image: post.cover_image || null,
            section: post.category,
            tags: post.tags,
          }),
          breadcrumbSchema(crumbs),
        ]}
      />

      <div className="wrap">
        <article className="bp-article">
          <Breadcrumbs items={crumbs} />

          <header className="bp-header">
            <div className="bp-meta-top">
              <span className="bp-cat">{post.category}</span>
              <span className="bp-dot">·</span>
              <span>{post.read_time} min read</span>
            </div>
            <h1>{post.title}</h1>
            {post.excerpt && <p className="bp-excerpt">{post.excerpt}</p>}
            <div className="bp-author">
              <div className="bp-author-av">{post.author_name[0]}</div>
              <div>
                <strong>{post.author_name}</strong>
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            </div>
          </header>

          {post.cover_image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <div className="bp-cover">
              <img src={post.cover_image} alt={post.title} />
            </div>
          )}

          <div
            className="bp-content"
            dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
          />

          {post.tags.length > 0 && (
            <div className="bp-tags">
              {post.tags.map((t) => (
                <span key={t} className="bp-tag">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="bp-cta">
            <h2>Working on something like this?</h2>
            <p>
              We build <Link href="/services/python-development">Python and FastAPI backends</Link>,{" "}
              <Link href="/services/custom-ai-agents">custom AI agents</Link> and{" "}
              <Link href="/services/mcp-server-development">MCP servers</Link>. Tell us what you
              are trying to achieve and you will get a written scope and a fixed quote.
            </p>
            <div className="bp-cta-actions">
              <Link href="/contact" className="btn-primary">
                Get a proposal
              </Link>
              <Link href="/services" className="bp-cta-alt">
                Browse all services →
              </Link>
            </div>
          </div>

          {related.length > 0 && (
            <aside className="bp-related" aria-labelledby="bp-related-h">
              <h2 id="bp-related-h">Keep reading</h2>
              <ul>
                {related.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`}>
                      <span className="bp-related-cat">{p.category}</span>
                      <strong>{p.title}</strong>
                      {p.excerpt && <span className="bp-related-ex">{p.excerpt}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          <div className="bp-footer">
            <Link href="/blog" className="bp-back-btn">
              ← All articles
            </Link>
          </div>
        </article>
      </div>

      <style>{`
        .bp-article{max-width:760px;margin:0 auto;padding:1.5rem 0 3rem}
        .bp-header{margin:1.5rem 0 2rem}
        .bp-meta-top{display:flex;align-items:center;gap:.5rem;font-size:.78rem;color:var(--hx-fg-3);margin-bottom:.8rem}
        .bp-cat{font-weight:700;text-transform:uppercase;color:var(--hx-bronze);background:rgba(168,132,98,.12);padding:.2rem .5rem;border-radius:999px;font-size:.68rem;letter-spacing:.06em}
        .bp-dot{opacity:.4}
        .bp-header h1{font-family:var(--hx-font-display);font-size:clamp(1.9rem,1.3rem+2vw,2.6rem);font-weight:700;line-height:1.14;letter-spacing:-.025em;margin:0 0 .8rem;color:var(--hx-fg);text-wrap:balance}
        .bp-excerpt{font-size:1.08rem;color:var(--hx-fg-2);line-height:1.6;margin:0 0 1.4rem;text-wrap:pretty}
        .bp-author{display:flex;align-items:center;gap:.65rem}
        .bp-author-av{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#6b4a2e,#a88462);color:#1a120e;display:flex;align-items:center;justify-content:center;font-size:.9rem;font-weight:800}
        .bp-author strong{font-size:.88rem;display:block;color:var(--hx-fg)}
        .bp-author time{font-size:.75rem;color:var(--hx-fg-3)}

        .bp-cover{margin-bottom:2rem;border-radius:var(--hx-r);overflow:hidden;border:1px solid var(--hx-border)}
        .bp-cover img{width:100%;height:auto;display:block}

        .bp-content{font-size:1rem;line-height:1.8;color:var(--hx-fg-2)}
        .bp-content h2{font-family:var(--hx-font-display);font-size:1.45rem;font-weight:700;letter-spacing:-.02em;margin:2.4rem 0 .9rem;color:var(--hx-fg)}
        .bp-content h3{font-family:var(--hx-font-display);font-size:1.15rem;font-weight:650;margin:1.8rem 0 .6rem;color:var(--hx-fg)}
        .bp-content p{margin:0 0 1.2rem}
        .bp-content strong{color:var(--hx-fg);font-weight:600}
        .bp-content ul,.bp-content ol{margin:0 0 1.2rem;padding-left:1.4rem}
        .bp-content li{margin-bottom:.45rem}
        .bp-content code{background:var(--hx-surface-2);border:1px solid var(--hx-border);padding:.15rem .4rem;border-radius:.3rem;font-size:.86rem;font-family:var(--hx-font-mono)}
        .bp-content pre{background:var(--hx-surface-2);border:1px solid var(--hx-border);border-radius:var(--hx-r-sm);padding:1rem;overflow-x:auto;margin:0 0 1.2rem}
        .bp-content pre code{border:none;padding:0;background:none}
        .bp-content blockquote{border-left:3px solid var(--hx-bronze);padding:.4rem 1rem;margin:0 0 1.2rem;color:var(--hx-fg-3);font-style:italic}
        .bp-content a{color:var(--hx-bronze);text-decoration:underline;text-underline-offset:3px}
        .bp-content img{max-width:100%;border-radius:var(--hx-r-sm);margin:1rem 0}

        .bp-tags{display:flex;gap:.4rem;flex-wrap:wrap;margin:2rem 0 0}
        .bp-tag{font-size:.75rem;color:var(--hx-fg-3);background:var(--hx-surface);border:1px solid var(--hx-border);padding:.25rem .6rem;border-radius:999px;font-weight:600}

        .bp-cta{margin:3rem 0 0;padding:1.75rem;border:1px solid var(--hx-border);border-radius:var(--hx-r-lg);background:var(--hx-surface)}
        .bp-cta h2{font-family:var(--hx-font-display);font-size:1.25rem;font-weight:700;letter-spacing:-.02em;margin:0 0 .6rem;color:var(--hx-fg)}
        .bp-cta p{font-size:.95rem;line-height:1.7;color:var(--hx-fg-2);margin:0 0 1.2rem}
        .bp-cta a{color:var(--hx-bronze);text-decoration:underline;text-underline-offset:3px}
        .bp-cta-actions{display:flex;flex-wrap:wrap;align-items:center;gap:1rem}
        .bp-cta-actions .btn-primary{text-decoration:none;padding:11px 22px;border-radius:999px;font-size:.9rem}
        .bp-cta-alt{font-size:.9rem;font-weight:600}

        .bp-related{margin:3rem 0 0;padding-top:2rem;border-top:1px solid var(--hx-border)}
        .bp-related h2{font-family:var(--hx-font-display);font-size:1.15rem;font-weight:700;letter-spacing:-.02em;margin:0 0 1rem;color:var(--hx-fg)}
        .bp-related ul{list-style:none;margin:0;padding:0;display:grid;gap:.5rem}
        .bp-related a{display:block;padding:.9rem 1rem;border:1px solid var(--hx-border);border-radius:var(--hx-r);text-decoration:none;transition:border-color .2s,background .2s}
        .bp-related a:hover{border-color:var(--hx-bronze);background:var(--hx-surface)}
        .bp-related-cat{display:block;font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--hx-bronze);margin-bottom:.3rem}
        .bp-related strong{display:block;font-size:.95rem;font-weight:600;color:var(--hx-fg);line-height:1.4}
        .bp-related-ex{display:block;font-size:.83rem;color:var(--hx-fg-3);line-height:1.5;margin-top:.25rem;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}

        .bp-footer{display:flex;justify-content:space-between;align-items:center;margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--hx-border)}
        .bp-back-btn{color:var(--hx-bronze);text-decoration:none;font-weight:600;font-size:.9rem}
      `}</style>
    </section>
  );
}

const ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Minimal markdown. The source is escaped first: posts are written by signed-in
 * admins, but the body still reaches the page through dangerouslySetInnerHTML,
 * and escaping is what keeps a compromised editor account from becoming stored
 * XSS. Only the tags produced below survive.
 *
 * Links to our own pages stay in the same tab and carry no rel, so they pass
 * authority the way an internal link should; only off-site links get
 * target/noopener.
 */
function renderContent(md: string): string {
  const safe = (md ?? "").replace(/[&<>"']/g, (c) => ESCAPE[c]);

  return safe
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, (_m, text, href: string) => {
      const internal = href.startsWith("/");
      return internal
        ? `<a href="${href}">${text}</a>`
        : `<a href="${href}" target="_blank" rel="noopener nofollow">${text}</a>`;
    })
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*<\/li>)/, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hulo])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}
