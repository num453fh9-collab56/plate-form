"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/* ==========================================================================
   HIRELYX · INSIGHTS LIST
   --------------------------------------------------------------------------
   Reads published posts from the existing GET /api/blog route (Supabase
   `blog_posts`, status = published). The previous blog page declared this
   state but never fetched, so it always rendered "Coming Soon" even when
   posts existed — this wires it to the API that was already there.
   ========================================================================== */

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  author_name: string;
  category: string;
  tags: string[];
  read_time: number;
  views: number;
  is_featured: boolean;
  published_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  tech: "Engineering",
  marketing: "Marketing",
  ai: "AI",
  tutorials: "Tutorials",
  "case-study": "Case studies",
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function PostCard({ post, featured }: { post: Post; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className={"hx-post" + (featured ? " hx-post-wide" : "")}>
      {post.cover_image ? (
        <div
          className="hx-post-media"
          style={{ backgroundImage: `url(${post.cover_image})` }}
          role="img"
          aria-label={`Cover image for ${post.title}`}
        />
      ) : null}
      <div className="hx-post-body">
        <div className="hx-chips">
          {featured ? <span className="hx-chip hx-chip-accent">Featured</span> : null}
          {post.category ? (
            <span className="hx-chip">{CATEGORY_LABELS[post.category] ?? post.category}</span>
          ) : null}
        </div>
        <h3>{post.title}</h3>
        {post.excerpt ? <p>{post.excerpt}</p> : null}
        <div className="hx-post-meta">
          {post.author_name ? <span>{post.author_name}</span> : null}
          {post.read_time ? <span>{post.read_time} min read</span> : null}
          {post.published_at ? <span>{formatDate(post.published_at)}</span> : null}
        </div>
      </div>
    </Link>
  );
}

export default function InsightsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    fetch("/api/blog", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("request failed"))))
      .then((data: { posts?: Post[] }) => {
        if (!active) return;
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return;
        setState("error");
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const categories = useMemo(() => {
    const present = Array.from(new Set(posts.map((post) => post.category).filter(Boolean)));
    return ["all", ...present];
  }, [posts]);

  const shown = category === "all" ? posts : posts.filter((post) => post.category === category);
  const featured = shown.filter((post) => post.is_featured);
  const regular = shown.filter((post) => !post.is_featured);

  if (state === "loading") {
    return (
      <p className="hx-lead" aria-live="polite">
        Loading articles…
      </p>
    );
  }

  if (state === "error") {
    return (
      <div className="hx-empty">
        <h2>We could not load the articles</h2>
        <p>
          Something went wrong fetching the latest posts. Please refresh, or{" "}
          <Link href="/contact" style={{ color: "var(--hx-accent)", fontWeight: 600 }}>
            tell us
          </Link>{" "}
          if it keeps happening.
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="hx-empty">
        <h2>Nothing published yet</h2>
        <p>
          We would rather publish nothing than publish filler. Engineering notes, case studies and
          technical write-ups will appear here as they are written.
        </p>
        <Link className="hx-btn hx-btn-secondary hx-btn-sm" href="/portfolio">
          Read a case study instead
        </Link>
      </div>
    );
  }

  return (
    <>
      {categories.length > 2 ? (
        <div className="hx-filters" role="group" aria-label="Filter articles by category">
          {categories.map((option) => (
            <button
              key={option}
              type="button"
              className="hx-filter"
              aria-pressed={category === option}
              onClick={() => setCategory(option)}
            >
              {option === "all" ? "All" : (CATEGORY_LABELS[option] ?? option)}
            </button>
          ))}
        </div>
      ) : null}

      <p className="hx-sr" aria-live="polite">
        {shown.length} {shown.length === 1 ? "article" : "articles"} shown.
      </p>

      <div className="hx-posts hx-mt-lg">
        {featured.map((post) => (
          <PostCard key={post.id} post={post} featured />
        ))}
        {regular.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </>
  );
}
