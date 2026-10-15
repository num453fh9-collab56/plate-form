import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE = "https://www.hirelyx.com";

async function dynamicEntries(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const entries: MetadataRoute.Sitemap = [];

  const { data: gigs } = await supabase
    .from("gigs")
    .select("id, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(500);

  for (const gig of (gigs ?? []) as { id: string; updated_at: string }[]) {
    entries.push({
      url: `${SITE}/gig/${gig.id}`,
      lastModified: new Date(gig.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, updated_at")
    .not("display_name", "is", null)
    .order("updated_at", { ascending: false })
    .limit(500);

  for (const profile of (profiles ?? []) as { id: string; updated_at: string }[]) {
    entries.push({
      url: `${SITE}/user/${profile.id}`,
      lastModified: new Date(profile.updated_at),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/requests`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/help`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const dynamic = await dynamicEntries();
  return [...staticPages, ...dynamic];
}
