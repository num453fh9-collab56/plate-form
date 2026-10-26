import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SERVICE_SLUGS } from "@/lib/content/services";
import { SOLUTION_SLUGS } from "@/lib/content/solutions";
import { EXPERTISE_SLUGS } from "@/lib/content/expertise";
import { CASE_STUDIES } from "@/lib/content/portfolio";
import { SITE_URL } from "@/lib/seo";

/* ==========================================================================
   HIRELYX · SITEMAP
   --------------------------------------------------------------------------
   Driven by the content modules, so a new service, solution, expertise area
   or case study appears here automatically.

   Placeholder case studies are excluded: they are noindex until real project
   detail replaces them, and a sitemap should not list pages we are asking
   search engines to ignore.
   ========================================================================== */

const now = new Date();

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
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/solutions`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/expertise`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE_URL}/portfolio`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/bookings`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const servicePages: MetadataRoute.Sitemap = SERVICE_SLUGS.map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const solutionPages: MetadataRoute.Sitemap = SOLUTION_SLUGS.map((slug) => ({
    url: `${SITE_URL}/solutions/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const expertisePages: MetadataRoute.Sitemap = EXPERTISE_SLUGS.map((slug) => ({
    url: `${SITE_URL}/expertise/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const casePages: MetadataRoute.Sitemap = CASE_STUDIES.filter((study) => !study.placeholder).map(
    (study) => ({
      url: `${SITE_URL}/portfolio/${study.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    }),
  );

  const blog = await blogEntries();

  return [
    ...staticPages,
    ...servicePages,
    ...solutionPages,
    ...expertisePages,
    ...casePages,
    ...blog,
  ];
}
