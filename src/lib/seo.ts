import type { Metadata } from "next";

/* ==========================================================================
   HIRELYX · SEO HELPERS
   --------------------------------------------------------------------------
   One place for the canonical origin, page metadata construction and
   structured data.

   Structured-data policy: we emit Organization, WebSite, Service,
   BreadcrumbList and FAQPage only, and only where the page genuinely shows
   that content. No Review, AggregateRating or Product markup is emitted —
   we have no verified review corpus, and fabricating one is both dishonest
   and a manual-action risk.
   ========================================================================== */

export const SITE_URL = "https://www.hirelyx.com";
export const SITE_NAME = "Hirelyx";
export const SUPPORT_EMAIL = "support@hirelyx.com";

export function absolute(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Build page metadata with a canonical URL and matching Open Graph tags. */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
  image,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
  type?: "website" | "article";
  image?: string;
}): Metadata {
  return {
    title,
    description,
    ...(keywords && keywords.length > 0 ? { keywords: [...keywords] } : {}),
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      locale: "en_US",
      ...(image ? { images: [{ url: absolute(image) }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [absolute(image)] } : {}),
    },
  };
}

/* ───────────────────────────────────────────────── structured data ─────── */

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Hirelyx builds Python and FastAPI backends, custom AI agents, MCP servers, WordPress sites and measured digital marketing programmes.",
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absolute("/logo-mark.svg"),
    description:
      "Digital engineering team delivering Python development, custom AI agents, MCP server development, prompt engineering, WordPress development and digital marketing.",
    email: SUPPORT_EMAIL,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SUPPORT_EMAIL,
      url: absolute("/contact"),
      availableLanguage: ["English", "Chinese"],
    },
  };
}

export function breadcrumbSchema(items: readonly { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absolute(item.href) } : {}),
    })),
  };
}

export function serviceSchema({
  name,
  description,
  path,
  serviceType,
}: {
  name: string;
  description: string;
  path: string;
  serviceType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: absolute(path),
    ...(serviceType ? { serviceType } : {}),
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: "Worldwide",
  };
}

/** Only call this where the questions and answers are visible on the page. */
export function faqSchema(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
