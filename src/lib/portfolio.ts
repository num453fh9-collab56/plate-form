import type { PortfolioProject } from "./types";

/* ==========================================================================
   APEX · PORTFOLIO
   Curated, digital-only project showcase. Covers may be a CSS gradient (as
   shipped in the seed data) or an uploaded/remote image URL for user projects.
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

function isImageSource(cover: string): boolean {
  return /^(https?:\/\/|data:image\/|\/)/i.test(cover.trim());
}

export function coverStyle(cover: string): { backgroundImage: string } {
  const value = cover.trim();
  if (!value) return { backgroundImage: "linear-gradient(140deg, #1d1d1f 0%, #0066cc 100%)" };
  return { backgroundImage: isImageSource(value) ? `url("${value}")` : value };
}

export const SEED_PROJECTS: PortfolioProject[] = [
  {
    id: "pf-01",
    title: "SaaS Analytics Dashboard",
    category: "Web Development",
    summary:
      "A real-time analytics platform with role-based access, custom reports and a component-driven design system.",
    tags: ["React", "Next.js", "TypeScript", "PostgreSQL"],
    link: "https://example.com/analytics",
    cover: "linear-gradient(140deg, #0f63b0 0%, #062f5c 100%)",
  },
  {
    id: "pf-02",
    title: "AI Support Agent",
    category: "AI Agents",
    summary:
      "A retrieval-augmented assistant that answers customer questions from a live knowledge base and routes escalations.",
    tags: ["LLM", "RAG", "Python", "OpenAI API"],
    link: "https://example.com/ai-agent",
    cover: "linear-gradient(140deg, #1f74bf 0%, #0b3f73 100%)",
  },
  {
    id: "pf-03",
    title: "Meta Ads Growth Campaign",
    category: "Meta Ads",
    summary:
      "Full-funnel paid social campaign with creative testing and conversion tracking that cut cost per acquisition.",
    tags: ["Meta Ads", "Retargeting", "ROAS", "Analytics"],
    link: "https://example.com/meta-ads",
    cover: "linear-gradient(140deg, #2b82cd 0%, #0f4c81 100%)",
  },
  {
    id: "pf-04",
    title: "Headless E-Commerce Storefront",
    category: "Web Development",
    summary:
      "A high-performance storefront with headless checkout, subscription billing and lightning-fast product search.",
    tags: ["Next.js", "Shopify", "Stripe", "Tailwind CSS"],
    link: "https://example.com/storefront",
    cover: "linear-gradient(140deg, #0066cc 0%, #003d7a 100%)",
  },
  {
    id: "pf-05",
    title: "Mobile Banking App",
    category: "Mobile Apps",
    summary:
      "A cross-platform banking experience with biometric login, budgeting tools and secure account linking.",
    tags: ["React Native", "Expo", "Plaid", "TypeScript"],
    link: "https://example.com/banking",
    cover: "linear-gradient(140deg, #3d8fd0 0%, #1a5794 100%)",
  },
  {
    id: "pf-06",
    title: "Brand Identity System",
    category: "Branding",
    summary:
      "A complete identity system — logo suite, type and colour scales, and ready-to-use marketing templates.",
    tags: ["Figma", "Illustrator", "Design System", "Motion"],
    link: "https://example.com/brand",
    cover: "linear-gradient(140deg, #2f7fc9 0%, #0f4c81 100%)",
  },
  {
    id: "pf-07",
    title: "Short-Form Video Engine",
    category: "Video",
    summary:
      "A repeatable editing pipeline that turns raw footage into retention-optimised clips for Reels and TikTok.",
    tags: ["Premiere Pro", "After Effects", "CapCut"],
    link: "https://example.com/video",
    cover: "linear-gradient(140deg, #1470c2 0%, #0a3f6e 100%)",
  },
  {
    id: "pf-08",
    title: "SEO Content Engine",
    category: "SEO & Copywriting",
    summary:
      "A keyword-to-publish content system that lifted organic traffic with structured briefs and on-page SEO.",
    tags: ["SEO", "Content Strategy", "Copywriting"],
    link: "https://example.com/seo",
    cover: "linear-gradient(140deg, #2b82cd 0%, #104f88 100%)",
  },
];
