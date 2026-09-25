import type { Gig, GigColorPair, GigDraft } from "./types";

export const ACCENT_COLORS: GigColorPair = ["#0066cc", "#003d7a"];

export const CATEGORY_GLYPHS: Record<string, string> = {
  "Website Development": "WD",
  "UI/UX": "UX",
  "Video Editing": "VE",
  AI: "AI",
};

export const CATEGORY_OPTIONS: string[] = [
  "Website Development",
  "UI/UX",
  "Video Editing",
  "AI",
];

export const SEED_GIGS: Gig[] = [
  {
    id: "seed-01",
    title: "Full-Stack Web Application Development with React & Node",
    description:
      "End-to-end product engineering: architecture, responsive UI, secure APIs, database design, testing and deployment.",
    seller: "Aisha Rahman",
    role: "Top Rated Seller",
    verified: true,
    rating: 4.9,
    reviews: 412,
    price: 450,
    delivery: "5 days",
    category: "Website Development",
    badge: "Top Rated",
    colors: ["#0066cc", "#003d7a"],
    glyph: "WD",
  },
  {
    id: "seed-02",
    title: "Complete Modern UI/UX Design System in Figma",
    description:
      "Research-backed interface design with reusable components, tokens, accessibility checks and a handoff-ready Figma file.",
    seller: "Marco Bianchi",
    role: "Level 2 Seller",
    verified: true,
    rating: 5,
    reviews: 288,
    price: 320,
    delivery: "3 days",
    category: "UI/UX",
    badge: "Pro",
    colors: ["#2b7bc4", "#10508f"],
    glyph: "UX",
  },
  {
    id: "seed-03",
    title: "SEO & Performance Website Optimization",
    description:
      "Keyword research, technical SEO fixes, content roadmap and conversion tracking to grow qualified organic traffic.",
    seller: "Linda Okafor",
    role: "Top Rated Seller",
    verified: true,
    rating: 4.8,
    reviews: 531,
    price: 260,
    delivery: "7 days",
    category: "Website Development",
    badge: "Best Seller",
    colors: ["#4a90d9", "#1f5f9e"],
    glyph: "WD",
  },
  {
    id: "seed-04",
    title: "Cinematic Video Editing & Color Grading for Brands",
    description:
      "Story-driven editing, motion graphics, sound design and broadcast-grade color grading for ads and social campaigns.",
    seller: "Daniel Cruz",
    role: "Level 2 Seller",
    verified: true,
    rating: 4.9,
    reviews: 194,
    price: 180,
    delivery: "4 days",
    category: "Video Editing",
    badge: "Pro",
    colors: ["#0a5aa8", "#062f5c"],
    glyph: "VE",
  },
  {
    id: "seed-05",
    title: "Custom AI & Machine Learning Model Development",
    description:
      "Data preparation, model training, evaluation and deployment with clear documentation and reproducible pipelines.",
    seller: "Dr. Priya Nair",
    role: "Top Rated Seller",
    verified: true,
    rating: 5,
    reviews: 137,
    price: 900,
    delivery: "10 days",
    category: "AI",
    badge: "Top Rated",
    colors: ["#1a6fbf", "#0b3f73"],
    glyph: "AI",
  },
  {
    id: "seed-06",
    title: "SEO-Optimized Website Content & Technical Copywriting",
    description:
      "Original, well-researched long-form content structured for search intent, readability and measurable rankings.",
    seller: "Emma Lindqvist",
    role: "Level 2 Seller",
    verified: true,
    rating: 4.8,
    reviews: 276,
    price: 120,
    delivery: "2 days",
    category: "Website Development",
    badge: "Best Seller",
    colors: ["#2f80c9", "#134f85"],
    glyph: "WD",
  },
  {
    id: "seed-07",
    title: "E-Commerce Store Development on Shopify & WooCommerce",
    description:
      "Conversion-focused storefronts with product setup, payment and shipping integration, speed tuning and analytics.",
    seller: "Tom Andersen",
    role: "Level 2 Seller",
    verified: true,
    rating: 4.7,
    reviews: 356,
    price: 390,
    delivery: "6 days",
    category: "Website Development",
    badge: "Pro",
    colors: ["#0066cc", "#002f5c"],
    glyph: "EC",
  },
  {
    id: "seed-08",
    title: "Mobile App UI Design for iOS & Android",
    description:
      "Platform-aware mobile interfaces with prototypes, design tokens and developer-ready specs for both app stores.",
    seller: "Sofia Petrova",
    role: "Top Rated Seller",
    verified: true,
    rating: 4.9,
    reviews: 221,
    price: 420,
    delivery: "5 days",
    category: "UI/UX",
    badge: "Best Seller",
    colors: ["#3d8fd0", "#1a5794"],
    glyph: "UI",
  },
  {
    id: "seed-09",
    title: "Professional YouTube & Short-Form Video Production",
    description:
      "Scripted edits with captions, hooks, thumbnails and pacing tailored for retention on YouTube, Reels and TikTok.",
    seller: "Nadia Haddad",
    role: "Level 2 Seller",
    verified: true,
    rating: 4.9,
    reviews: 302,
    price: 210,
    delivery: "3 days",
    category: "Video Editing",
    badge: "Pro",
    colors: ["#1470c2", "#0a3f6e"],
    glyph: "YT",
  },
  {
    id: "seed-10",
    title: "NLP Chatbot & LLM Integration for Your Business",
    description:
      "Custom retrieval pipelines, prompt engineering and API integration to deploy reliable assistants on your data.",
    seller: "Kevin Zhao",
    role: "Top Rated Seller",
    verified: true,
    rating: 5,
    reviews: 96,
    price: 750,
    delivery: "8 days",
    category: "AI",
    badge: "Top Rated",
    colors: ["#1f74bf", "#0c3e69"],
    glyph: "LLM",
  },
  {
    id: "seed-11",
    title: "Landing Page UI Design & Conversion Optimization",
    description:
      "High-converting landing pages with wireframes, responsive UI, A/B test variants and a developer-ready handoff.",
    seller: "James Whitfield",
    role: "Level 1 Seller",
    verified: false,
    rating: 4.8,
    reviews: 168,
    price: 150,
    delivery: "7 days",
    category: "UI/UX",
    badge: "Rising Talent",
    colors: ["#4d97d6", "#2263a0"],
    glyph: "UX",
  },
  {
    id: "seed-12",
    title: "AI Workflow Automation & Custom Chatbot Setup",
    description:
      "Automate repetitive business workflows and deploy a custom chatbot trained on your own documents and data.",
    seller: "Grace Mensah",
    role: "Level 2 Seller",
    verified: true,
    rating: 4.9,
    reviews: 143,
    price: 220,
    delivery: "4 days",
    category: "AI",
    badge: "Pro",
    colors: ["#0f63b0", "#07375f"],
    glyph: "AI",
  },
];

export function glyphFor(category: string): string {
  return CATEGORY_GLYPHS[category] ?? CATEGORY_GLYPHS[CATEGORY_OPTIONS[0]];
}

export function isCategory(value: string): boolean {
  return CATEGORY_OPTIONS.includes(value);
}

export function createGig(draft: GigDraft): Gig {
  const days = draft.deliveryDays;
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `gig-${Date.now()}`,
    title: draft.title,
    description: draft.description,
    seller: draft.seller,
    role: "New Seller",
    verified: false,
    rating: 0,
    reviews: 0,
    price: draft.price,
    delivery: `${days} ${days === 1 ? "day" : "days"}`,
    category: isCategory(draft.category) ? draft.category : CATEGORY_OPTIONS[0],
    badge: "New",
    colors: ACCENT_COLORS,
    glyph: glyphFor(draft.category),
    isNew: true,
  };
}
