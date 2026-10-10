import type { GigColorPair } from "./types";
import type { TranslationKey } from "./i18n";

/* ==========================================================================
   HIRELYX · SKILLS & CATEGORIES TAXONOMY
   --------------------------------------------------------------------------
   Single source of truth for every category and sub-skill a freelancer can be
   listed under and every skill a client can filter by. The eight categories
   below are the ONLY allowed values across onboarding, gig creation and
   marketplace filtering. Add or edit a skill here and it propagates everywhere.
   ========================================================================== */

export interface TaxonomySkill {
  /** Stable slug — never reuse or rename once shipped (used for keys/filtering). */
  id: string;
  /** Human label shown on chips and stored on gigs/profiles. */
  label: string;
  /** Extra search terms (not displayed). */
  keywords?: string[];
}

export interface TaxonomyCategory {
  id: string;
  label: string;
  translationKey: TranslationKey;
  glyph: string;
  tagline: string;
  colors: GigColorPair;
  skills: TaxonomySkill[];
}

export const CATEGORIES: TaxonomyCategory[] = [
  {
    id: "web-development",
    label: "Programming & Tech",
    translationKey: "cat.webdev",
    glyph: "WD",
    tagline: "Websites, web apps, APIs & e-commerce",
    colors: ["#0066cc", "#003d7a"],
    skills: [
      { id: "full-stack", label: "Full-Stack Development" },
      { id: "frontend", label: "Frontend Development" },
      { id: "backend", label: "Backend Development" },
      { id: "react", label: "React" },
      { id: "nextjs", label: "Next.js" },
      { id: "vue", label: "Vue.js" },
      { id: "angular", label: "Angular" },
      { id: "nodejs", label: "Node.js" },
      { id: "typescript", label: "TypeScript" },
      { id: "javascript", label: "JavaScript" },
      { id: "python", label: "Python" },
      { id: "php", label: "PHP" },
      { id: "laravel", label: "Laravel" },
      { id: "django", label: "Django" },
      { id: "java", label: "Java" },
      { id: "dotnet", label: "C#/.NET" },
      { id: "go", label: "Go" },
      { id: "rest-api", label: "REST APIs", keywords: ["api"] },
      { id: "graphql", label: "GraphQL" },
      { id: "api-integration", label: "API Integration" },
      { id: "postgresql", label: "PostgreSQL", keywords: ["sql"] },
      { id: "mongodb", label: "MongoDB" },
      { id: "redis", label: "Redis" },
      { id: "devops", label: "DevOps" },
      { id: "docker", label: "Docker" },
      { id: "kubernetes", label: "Kubernetes" },
      { id: "ci-cd", label: "CI/CD" },
      { id: "aws", label: "AWS" },
      { id: "wordpress", label: "WordPress" },
      { id: "shopify", label: "Shopify" },
      { id: "webflow", label: "Webflow" },
      { id: "web-security", label: "Web Security" },
      { id: "testing-qa", label: "Testing & QA" },
      { id: "performance", label: "Performance Optimization" },
      { id: "web-accessibility", label: "Accessibility (a11y)" },
    ],
  },
  {
    id: "mobile-apps",
    label: "Mobile Apps",
    translationKey: "cat.mobile",
    glyph: "MB",
    tagline: "Native & cross-platform iOS and Android apps",
    colors: ["#156fc0", "#0a3f72"],
    skills: [
      { id: "mobile-app-dev", label: "Mobile Apps" },
      { id: "react-native", label: "React Native" },
      { id: "flutter", label: "Flutter" },
      { id: "swift-ios", label: "Swift (iOS)" },
      { id: "kotlin-android", label: "Kotlin (Android)" },
      { id: "swiftui", label: "SwiftUI" },
      { id: "jetpack-compose", label: "Jetpack Compose" },
      { id: "cross-platform", label: "Cross-Platform Apps" },
      { id: "native-ios", label: "Native iOS" },
      { id: "native-android", label: "Native Android" },
      { id: "app-store-optimization", label: "App Store Optimization" },
      { id: "mobile-ui", label: "Mobile UI" },
      { id: "push-notifications", label: "Push Notifications" },
      { id: "offline-sync", label: "Offline Sync" },
      { id: "firebase", label: "Firebase" },
    ],
  },
  {
    id: "ai-agents",
    label: "AI Services",
    translationKey: "cat.ai",
    glyph: "AI",
    tagline: "LLM apps, autonomous agents & automation",
    colors: ["#1a6fbf", "#0b3f73"],
    skills: [
      { id: "ai-agents", label: "AI Services" },
      { id: "llm-integration", label: "LLM Integration" },
      { id: "rag", label: "Retrieval-Augmented Generation (RAG)", keywords: ["rag"] },
      { id: "prompt-engineering", label: "Prompt Engineering" },
      { id: "openai-api", label: "OpenAI API" },
      { id: "anthropic-claude", label: "Anthropic Claude" },
      { id: "langchain", label: "LangChain" },
      { id: "llamaindex", label: "LlamaIndex" },
      { id: "vector-databases", label: "Vector Databases" },
      { id: "fine-tuning", label: "Fine-Tuning" },
      { id: "chatbot-development", label: "Chatbot Development" },
      { id: "conversational-ai", label: "Conversational AI" },
      { id: "ai-automation", label: "AI Automation" },
      { id: "workflow-automation", label: "Workflow Automation" },
      { id: "n8n-make", label: "n8n / Make" },
      { id: "zapier", label: "Zapier" },
      { id: "machine-learning", label: "Machine Learning" },
      { id: "deep-learning", label: "Deep Learning" },
      { id: "nlp", label: "NLP" },
      { id: "computer-vision", label: "Computer Vision" },
      { id: "generative-ai", label: "Generative AI" },
      { id: "tensorflow", label: "TensorFlow" },
      { id: "pytorch", label: "PyTorch" },
      { id: "data-analysis", label: "Data Analysis" },
      { id: "data-science", label: "Data Science" },
    ],
  },
  {
    id: "uiux-design",
    label: "UI/UX Design",
    translationKey: "cat.uiux",
    glyph: "UX",
    tagline: "Product, interface & experience design",
    colors: ["#2b7bc4", "#10508f"],
    skills: [
      { id: "ui-design", label: "UI Design" },
      { id: "ux-design", label: "UX Design" },
      { id: "product-design", label: "Product Design" },
      { id: "web-design", label: "Web Design" },
      { id: "mobile-app-design", label: "Mobile App Design" },
      { id: "design-systems", label: "Design Systems" },
      { id: "wireframing", label: "Wireframing" },
      { id: "prototyping", label: "Prototyping" },
      { id: "interaction-design", label: "Interaction Design" },
      { id: "user-research", label: "User Research" },
      { id: "usability-testing", label: "Usability Testing" },
      { id: "information-architecture", label: "Information Architecture" },
      { id: "figma", label: "Figma" },
      { id: "adobe-xd", label: "Adobe XD" },
      { id: "sketch", label: "Sketch" },
      { id: "design-accessibility", label: "Accessibility" },
      { id: "landing-page-design", label: "Landing Page Design" },
      { id: "dashboard-design", label: "Dashboard Design" },
    ],
  },
  {
    id: "branding",
    label: "Graphics & Design",
    translationKey: "cat.branding",
    glyph: "BR",
    tagline: "Logos, identity systems & visual assets",
    colors: ["#2f7fc9", "#0f4c81"],
    skills: [
      { id: "logo-design", label: "Logo Design" },
      { id: "brand-identity", label: "Brand Identity" },
      { id: "brand-guidelines", label: "Brand Guidelines" },
      { id: "visual-identity", label: "Visual Identity" },
      { id: "typography", label: "Typography" },
      { id: "illustration", label: "Illustration" },
      { id: "icon-design", label: "Icon Design" },
      { id: "packaging-design", label: "Packaging Design" },
      { id: "print-design", label: "Print Design" },
      { id: "social-media-graphics", label: "Social Media Graphics" },
      { id: "ad-creatives", label: "Ad Creatives" },
      { id: "photoshop", label: "Adobe Photoshop" },
      { id: "illustrator", label: "Adobe Illustrator" },
      { id: "branding-figma", label: "Figma" },
      { id: "canva", label: "Canva" },
      { id: "motion-graphics-branding", label: "Motion Graphics" },
    ],
  },
  {
    id: "video-production",
    label: "Video & Animation",
    translationKey: "cat.video",
    glyph: "VE",
    tagline: "Editing, motion, color & sound",
    colors: ["#1470c2", "#0a3f6e"],
    skills: [
      { id: "video-editing", label: "Video Editing" },
      { id: "short-form-editing", label: "Short-Form / Reels Editing" },
      { id: "youtube-editing", label: "YouTube Video Editing" },
      { id: "premiere-pro", label: "Premiere Pro" },
      { id: "after-effects", label: "After Effects" },
      { id: "davinci-resolve", label: "DaVinci Resolve" },
      { id: "final-cut-pro", label: "Final Cut Pro" },
      { id: "capcut", label: "CapCut" },
      { id: "motion-graphics", label: "Motion Graphics" },
      { id: "color-grading", label: "Color Grading" },
      { id: "sound-design", label: "Sound Design" },
      { id: "audio-mixing", label: "Audio Mixing" },
      { id: "subtitling", label: "Subtitling" },
      { id: "cinematography", label: "Cinematography" },
      { id: "product-video", label: "Product Video" },
      { id: "explainer-video", label: "Explainer Video" },
    ],
  },
  {
    id: "paid-marketing",
    label: "Digital Marketing",
    translationKey: "cat.marketing",
    glyph: "DM",
    tagline: "Campaigns, funnels, analytics & growth",
    colors: ["#4a90d9", "#1f5f9e"],
    skills: [
      { id: "meta-ads", label: "Meta Ads" },
      { id: "google-ads", label: "Google Ads" },
      { id: "tiktok-ads", label: "TikTok Ads" },
      { id: "linkedin-ads", label: "LinkedIn Ads" },
      { id: "youtube-ads", label: "YouTube Ads" },
      { id: "ppc", label: "PPC" },
      { id: "media-buying", label: "Media Buying" },
      { id: "campaign-management", label: "Campaign Management" },
      { id: "retargeting", label: "Retargeting" },
      { id: "conversion-optimization", label: "Conversion Optimization (CRO)" },
      { id: "landing-page-optimization", label: "Landing Page Optimization" },
      { id: "funnel-strategy", label: "Funnel Strategy" },
      { id: "marketing-analytics", label: "Marketing Analytics" },
      { id: "google-analytics", label: "Google Analytics" },
      { id: "tracking-attribution", label: "Tracking & Attribution" },
      { id: "ab-testing", label: "A/B Testing" },
      { id: "email-marketing", label: "Email Marketing" },
      { id: "marketing-automation", label: "Marketing Automation" },
      { id: "seo", label: "SEO" },
      { id: "content-marketing", label: "Content Marketing" },
      { id: "social-media-marketing", label: "Social Media Marketing" },
      { id: "influencer-marketing", label: "Influencer Marketing" },
      { id: "marketing-copywriting", label: "Copywriting" },
      { id: "growth-marketing", label: "Growth Marketing" },
    ],
  },
  {
    id: "writing",
    label: "Writing & Translation",
    translationKey: "cat.writing",
    glyph: "WR",
    tagline: "Long-form, technical, SEO & conversion copy",
    colors: ["#2f80c9", "#134f85"],
    skills: [
      { id: "copywriting", label: "Professional Copywriting" },
      { id: "website-copy", label: "Website Copy" },
      { id: "ad-copy", label: "Ad Copy" },
      { id: "email-copywriting", label: "Email Copywriting" },
      { id: "technical-writing", label: "Technical Writing" },
      { id: "blog-writing", label: "Blog Writing" },
      { id: "seo-writing", label: "SEO Writing" },
      { id: "content-writing", label: "Content Writing" },
      { id: "product-descriptions", label: "Product Descriptions" },
      { id: "scriptwriting", label: "Scriptwriting" },
      { id: "proofreading-editing", label: "Proofreading & Editing" },
      { id: "ux-writing", label: "UX Writing" },
      { id: "proposal-writing", label: "Grant / Proposal Writing" },
    ],
  },
];

/** The allowed category labels, in canonical order. */
export const CATEGORY_LABELS: string[] = CATEGORIES.map((category) => category.label);

const CATEGORY_INDEX: Record<string, TaxonomyCategory> = Object.fromEntries(
  CATEGORIES.map((category) => [category.label, category]),
);

const SKILL_INDEX: Record<string, { category: TaxonomyCategory; skill: TaxonomySkill }> =
  Object.fromEntries(
    CATEGORIES.flatMap((category) =>
      category.skills.map((skill) => [skill.label, { category, skill }] as const),
    ),
  );

/** Flat, de-duplicated list of every allowed skill label. */
export const ALL_SKILLS: string[] = Object.keys(SKILL_INDEX);

/** Search-friendly index used by pickers and filters. */
const SKILL_SEARCH: { label: string; haystack: string }[] = ALL_SKILLS.map((label) => ({
  label,
  haystack: `${label} ${(SKILL_INDEX[label].skill.keywords ?? []).join(" ")}`.toLowerCase(),
}));

/* A short, curated row for quick filters on the marketplace. */
export const POPULAR_SKILLS: string[] = [
  "React",
  "Next.js",
  "AI Agents",
  "LLM Integration",
  "UI Design",
  "Figma",
  "Logo Design",
  "Video Editing",
  "Meta Ads",
  "Google Ads",
  "SEO",
  "Copywriting",
].filter(isAllowedSkill);

export function getCategory(label: string): TaxonomyCategory | undefined {
  return CATEGORY_INDEX[label];
}

export function isAllowedCategory(label: string): boolean {
  return Object.prototype.hasOwnProperty.call(CATEGORY_INDEX, label);
}

export function isAllowedSkill(label: string): boolean {
  return Object.prototype.hasOwnProperty.call(SKILL_INDEX, label);
}

/** Category that owns a given skill, or undefined if the skill is not allowed. */
export function categoryForSkill(label: string): TaxonomyCategory | undefined {
  return SKILL_INDEX[label]?.category;
}

export function skillsForCategory(label: string): string[] {
  return CATEGORY_INDEX[label]?.skills.map((skill) => skill.label) ?? [];
}

export function glyphForCategory(label: string): string {
  return CATEGORY_INDEX[label]?.glyph ?? CATEGORIES[0].glyph;
}

export function translationKeyForCategory(label: string): TranslationKey {
  return CATEGORY_INDEX[label]?.translationKey ?? CATEGORIES[0].translationKey;
}

export function categoryColors(label: string): GigColorPair {
  return CATEGORY_INDEX[label]?.colors ?? CATEGORIES[0].colors;
}

/** Grouped skills, optionally scoped to one category and/or a search term. */
export function searchSkills(term: string, category?: string): TaxonomyCategory[] {
  const query = term.trim().toLowerCase();
  const pool = category && CATEGORY_INDEX[category] ? [CATEGORY_INDEX[category]] : CATEGORIES;
  return pool
    .map((group) => {
      if (!query) return group;
      const allowed = new Set(
        SKILL_SEARCH.filter((entry) => entry.haystack.includes(query)).map((entry) => entry.label),
      );
      return {
        ...group,
        skills: group.skills.filter((skill) => allowed.has(skill.label)),
      };
    })
    .filter((group) => group.skills.length > 0);
}

/**
 * Keep only platform-approved skills, drop duplicates and preserve input order.
 * Optionally restrict the result to a single category (used by gig creation).
 */
export function normalizeSkills(labels: readonly string[], category?: string): string[] {
  const allowed = category ? new Set(skillsForCategory(category)) : null;
  const seen = new Set<string>();
  const result: string[] = [];
  for (const label of labels) {
    const value = typeof label === "string" ? label.trim() : "";
    if (!value || seen.has(value) || !isAllowedSkill(value)) continue;
    if (allowed && !allowed.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

/** True when every selected skill is allowed and belongs to the category. */
export function skillsMatchCategory(labels: readonly string[], category: string): boolean {
  const allowed = new Set(skillsForCategory(category));
  return labels.every((label) => allowed.has(label));
}
