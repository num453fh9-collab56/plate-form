import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE = "https://www.hirelyx.com";

const SERVICES = ["programming", "marketing", "ai-agents", "social-ai", "prompt", "n8n"];

async function blogEntries(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(200);

  return (posts ?? []).map((post: { slug: string; updated_at: string }) => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/portfolio`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/bookings`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/reviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/help`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const servicePages: MetadataRoute.Sitemap = SERVICES.map((slug) => ({
    url: `${SITE}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const blog = await blogEntries();

  return [...staticPages, ...servicePages, ...blog];
}
