import type { TranslationKey } from "./i18n";

/* ==========================================================================
   HIRELYX · FOOTER NAVIGATION
   Data-driven category grid + footer link columns. Keeping this declarative
   means the footer markup stays small and every label is translatable.
   ========================================================================== */

export interface NavCategory {
  id: string;
  labelKey: TranslationKey;
  glyph: string;
  /** Taxonomy category to filter the marketplace by. Falls back to a text search. */
  marketplaceCategory?: string;
}

export type FooterAction = "postGig" | "becomeFreelancer";

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

/** The main marketplace categories, Fiverr-style. */
export const FOOTER_CATEGORIES: NavCategory[] = [
  {
    id: "programming",
    labelKey: "footer.catProgramming",
    glyph: "PT",
    marketplaceCategory: "Programming & Tech",
  },
  {
    id: "ai",
    labelKey: "footer.catAi",
    glyph: "AI",
    marketplaceCategory: "AI Services",
  },
  {
    id: "marketing",
    labelKey: "footer.catMarketing",
    glyph: "DM",
    marketplaceCategory: "Digital Marketing",
  },
  {
    id: "video",
    labelKey: "footer.catVideo",
    glyph: "VA",
    marketplaceCategory: "Video & Animation",
  },
  {
    id: "design",
    labelKey: "footer.catDesign",
    glyph: "GD",
    marketplaceCategory: "Graphics & Design",
  },
  {
    id: "writing",
    labelKey: "footer.catWriting",
    glyph: "WT",
    marketplaceCategory: "Writing & Translation",
  },
  {
    id: "mobile",
    labelKey: "footer.catMobile",
    glyph: "MB",
    marketplaceCategory: "Mobile Apps",
  },
  {
    id: "uiux",
    labelKey: "footer.catUiux",
    glyph: "UX",
    marketplaceCategory: "UI/UX Design",
  },
  {
    id: "data",
    labelKey: "footer.catData",
    glyph: "DA",
  },
  {
    id: "business",
    labelKey: "footer.catBusiness",
    glyph: "BI",
  },
  {
    id: "music",
    labelKey: "footer.catMusic",
    glyph: "MA",
  },
  {
    id: "photography",
    labelKey: "footer.catPhotography",
    glyph: "PH",
  },
];

/** Link columns shown beside the brand block — only links that lead somewhere real. */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: "clients",
    titleKey: "footer.forClients",
    links: [
      { labelKey: "footer.howItWorks", href: "/search" },
      { labelKey: "footer.buyingGuide", href: "/#portfolio" },
    ],
  },
  {
    id: "freelancers",
    titleKey: "footer.forFreelancers",
    links: [
      { labelKey: "footer.becomeFreelancer", action: "becomeFreelancer" },
      { labelKey: "footer.freelancerAcademy", href: "/search" },
    ],
  },
  {
    id: "business",
    titleKey: "footer.businessSolutions",
    links: [
      { labelKey: "footer.hireTalent", action: "postGig" },
    ],
  },
  {
    id: "company",
    titleKey: "footer.companySupport",
    links: [
      { labelKey: "footer.helpCenter", href: "/search" },
    ],
  },
];
