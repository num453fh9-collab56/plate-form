import { createClient } from "@supabase/supabase-js";

/* ==========================================================================
   HIRELYX · BLOG DATA (server)
   --------------------------------------------------------------------------
   Read-side access to published posts for server components, generateMetadata
   and the sitemap. Writes still go through /api/blog, which owns auth.

   This exists so an article's title, excerpt and body are in the initial HTML
   and in the <head>. The route used to fetch client-side, which left every
   post sharing the layout's generic title and shipping an empty document.
   ========================================================================== */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author_name: string;
  author_avatar: string;
  category: string;
  tags: string[];
  read_time: number;
  views: number;
  published_at: string;
  updated_at: string | null;
}

/** Null when Supabase is not configured, so builds without env still work. */
function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const sb = client();
  if (!sb) return null;

  const { data } = await sb
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return (data as BlogPost | null) ?? null;
}

export async function listPosts(limit = 200): Promise<BlogPost[]> {
  const sb = client();
  if (!sb) return [];

  const { data } = await sb
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data as BlogPost[] | null) ?? [];
}

/**
 * Posts to link to from the end of an article: same category first, then the
 * most recent of anything else, so a thin category still yields three links
 * rather than a dead end.
 */
export async function relatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const all = (await listPosts(60)).filter((p) => p.slug !== post.slug);
  const sameCategory = all.filter((p) => p.category === post.category);
  const rest = all.filter((p) => p.category !== post.category);
  return [...sameCategory, ...rest].slice(0, limit);
}
