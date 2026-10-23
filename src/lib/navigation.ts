import type { TranslationKey } from "./i18n";

/* ==========================================================================
   HIRELYX · FOOTER NAVIGATION
   Services grid + footer link columns for the services/portfolio site.
   ========================================================================== */

export interface NavCategory {
  id: string;
  labelKey: TranslationKey;
  glyph: string;
}

export type FooterAction = "contact" | "signup";

export interface FooterLink {
  labelKey: TranslationKey;
  href?: string;
  action?: FooterAction;
}

export interface FooterColumn {
  id: string;
  titleKey: TranslationKey;
  links: FooterLink[];
}

export const FOOTER_CATEGORIES: NavCategory[] = [
  { id: "programming", labelKey: "footer.catProgramming", glyph: "PT" },
  { id: "marketing", labelKey: "footer.catMarketing", glyph: "DM" },
  { id: "ai-agents", labelKey: "footer.catAiAgents", glyph: "AI" },
  { id: "social-ai", labelKey: "footer.catSocialAi", glyph: "SA" },
  { id: "prompt", labelKey: "footer.catPrompt", glyph: "PE" },
  { id: "n8n", labelKey: "footer.catN8n", glyph: "N8" },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: "services",
    titleKey: "footer.forClients",
    links: [
      { labelKey: "footer.howItWorks", href: "/how-it-works" },
      { labelKey: "footer.clientPortal", href: "/portal" },
      { labelKey: "footer.contactUs", href: "/contact" },
    ],
  },
  {
    id: "company",
    titleKey: "footer.companySupport",
    links: [
      { labelKey: "footer.aboutUs", href: "/about" },
      { labelKey: "footer.helpCenter", href: "/help" },
      { labelKey: "footer.terms", href: "/terms" },
      { labelKey: "footer.privacy", href: "/privacy" },
    ],
  },
];
