import { getSupabase } from "./supabase";
import type { PortfolioProject } from "./types";

/* ==========================================================================
   APEX · PORTFOLIO
   Portfolio projects now live in Supabase (`public.portfolio_projects`).
   Public read, owner-only write (enforced by RLS).
   ========================================================================== */

export const PORTFOLIO_CATEGORIES: string[] = [
  "Web Development",
  "AI Agents",
  "Mobile Apps",
  "UI/UX Design",
  "Branding",
  "Video",
  "Meta Ads",
  "Google Ads",
  "SEO & Copywriting",
];

export const PORTFOLIO_GLYPHS: Record<string, string> = {
  "Web Development": "WD",
  "AI Agents": "AI",
  "Mobile Apps": "MB",
  "UI/UX Design": "UX",
  Branding: "BR",
  Video: "VE",
  "Meta Ads": "MA",
  "Google Ads": "GA",
  "SEO & Copywriting": "WR",
};

export function portfolioGlyph(category: string): string {
  return PORTFOLIO_GLYPHS[category] ?? "PR";
}

function isImageSource(value: string): boolean {
  return /^(https?:\/\/|data:image\/|\/)/i.test(value.trim());
}

/* Background for the gradient fallback cover. */
export function coverStyle(cover: string): { backgroundImage: string } {
  const value = cover.trim();
  if (!value) return { backgroundImage: "linear-gradient(140deg, #1d1d1f 0%, #0066cc 100%)" };
  return { backgroundImage: isImageSource(value) ? `url("${value}")` : value };
}

/* Background for a project card: real image wins, gradient is the fallback. */
export function projectCoverStyle(project: PortfolioProject): { backgroundImage: string } {
  if (project.image && project.image.trim()) {
    return { backgroundImage: `url("${project.image.trim()}")` };
  }
  return coverStyle(project.cover);
}

interface PortfolioRow {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  summary: string | null;
  tags: string[] | null;
  link: string | null;
  image: string | null;
  cover: string | null;
  video: string | null;
  video_name: string | null;
  created_at?: string;
}

export function rowToProject(row: PortfolioRow): PortfolioProject {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category ?? PORTFOLIO_CATEGORIES[0],
    summary: row.summary ?? "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    link: row.link ?? "",
    image: row.image ?? "",
    cover: row.cover ?? "",
    video: row.video ?? undefined,
    videoName: row.video_name ?? undefined,
  };
}

export async function fetchPortfolioProjects(): Promise<PortfolioProject[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => rowToProject(row as PortfolioRow));
}

export async function fetchMyPortfolioProjects(
  userId: string,
): Promise<PortfolioProject[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => rowToProject(row as PortfolioRow));
}

export async function savePortfolioProject(
  userId: string,
  project: PortfolioProject,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from("portfolio_projects").upsert(
    {
      id: project.id,
      user_id: userId,
      title: project.title,
      category: project.category,
      summary: project.summary,
      tags: project.tags,
      link: project.link || null,
      image: project.image || null,
      cover: project.cover || null,
      video: project.video || null,
      video_name: project.videoName || null,
    },
    { onConflict: "id" },
  );
  return !error;
}

export async function deletePortfolioProject(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
  return !error;
}
