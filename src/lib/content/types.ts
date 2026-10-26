/* ==========================================================================
   HIRELYX · CONTENT MODEL
   --------------------------------------------------------------------------
   Every marketing page (services, solutions, expertise, portfolio) is driven
   by these typed records so new entries can be added without touching
   layout code. Keep slugs stable once shipped — they are public URLs.
   ========================================================================== */

/** Icon ids resolved by `components/site/Glyph.tsx`. */
export type GlyphId =
  | "python"
  | "wordpress"
  | "marketing"
  | "ai-agent"
  | "mcp"
  | "prompt"
  | "automation"
  | "software"
  | "growth"
  | "support"
  | "architecture"
  | "integration"
  | "analytics"
  | "shield"
  | "clock"
  | "users"
  | "spark"
  | "layers"
  | "terminal"
  | "search";

export interface Faq {
  q: string;
  a: string;
}

export interface Step {
  title: string;
  desc: string;
}

export interface Pair {
  title: string;
  desc: string;
}

export interface Tier {
  name: string;
  /** Display price exactly as the business quotes it, or "Custom". */
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlighted?: boolean;
  cta?: string;
}

/**
 * A link rendered inside the Services / Solutions / Expertise mega menu.
 * The menu itself is assembled in `lib/content/nav.ts`, which is the single
 * source of truth for navigation.
 */
export interface MenuLink {
  label: string;
  href: string;
  /** One-line hint shown under the label in the desktop mega menu. */
  hint?: string;
}

export interface Service {
  /** Public URL segment: /services/<slug> */
  slug: string;
  /** Short label for navigation and cards. */
  name: string;
  /** H1 on the service page. */
  title: string;
  /** <title> tag. */
  metaTitle: string;
  metaDescription: string;
  /** One-line positioning statement under the H1. */
  tagline: string;
  /** 1–2 sentences used on cards and the services index. */
  summary: string;
  /** Opening paragraphs on the service page. */
  intro: string[];
  glyph: GlyphId;
  /** Client-side problems this service solves. */
  problems: Pair[];
  /** Concrete capabilities. */
  capabilities: Pair[];
  /** Tangible things the client receives. */
  deliverables: string[];
  /** Technologies genuinely used for this service. */
  tech: string[];
  process: Step[];
  /** Omitted when the service is quoted per engagement. */
  tiers?: Tier[];
  /** Shown instead of / beside tiers. */
  pricingNote?: string;
  /** Scope-based engagement models for quote-only services. */
  engagements?: Pair[];
  faqs: Faq[];
  /** Slugs from `portfolio.ts`. */
  relatedWork: string[];
  /** Solution slugs that pair naturally with this service. */
  relatedSolutions: string[];
  /** High-intent keywords for metadata only — never keyword-stuffed on page. */
  keywords: string[];
}

export interface Solution {
  slug: string;
  name: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  tagline: string;
  summary: string;
  glyph: GlyphId;
  /** The business problem, stated the way a client would state it. */
  problem: string[];
  /** How Hirelyx approaches it. */
  approach: Pair[];
  outcomes: string[];
  /** Service slugs that deliver this solution. */
  services: string[];
  tech: string[];
  faqs: Faq[];
  keywords: string[];
}

export interface ExpertiseArea {
  slug: string;
  name: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  tagline: string;
  summary: string;
  glyph: GlyphId;
  /** Technologies grouped under this area, with how each serves clients. */
  stack: { name: string; note: string }[];
  /** What we actually build with it. */
  applications: Pair[];
  /** Service slugs where this expertise is applied. */
  services: string[];
  keywords: string[];
}

export interface Industry {
  slug: string;
  name: string;
  summary: string;
  useCases: string[];
  glyph: GlyphId;
}

export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  /** Category used by the portfolio filter. */
  category: string;
  /** Short card blurb. */
  summary: string;
  /** Cover image in /public/portfolio, or null to render a generated cover. */
  image: string | null;
  /** Services delivered — slugs from `services.ts`. */
  services: string[];
  tech: string[];
  challenge: string[];
  solution: string[];
  /** How the work was executed. */
  approach: Step[];
  /** Verified outcomes only. Leave empty when nothing is verifiable. */
  results: { label: string; value: string }[];
  /** Narrative outcome used when hard numbers are not available. */
  outcome: string[];
  /** Screens / artefacts. Each needs descriptive alt text. */
  screens: { src: string; alt: string }[];
  year: string;
  /**
   * True when the entry is a structural placeholder awaiting real project
   * data. Rendered with a visible "Content placeholder" flag so nothing
   * unverified is ever presented as a delivered result.
   */
  placeholder?: boolean;
}
