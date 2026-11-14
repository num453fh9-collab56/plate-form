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

/** Profiles we actually control, used for Organization.sameAs. */
export const SOCIAL_PROFILES = ["https://github.com/saadamjad44"];

/**
 * The generated share card from app/opengraph-image.tsx.
 *
 * Next only inherits a file-based opengraph-image into routes that do not set
 * `openGraph` themselves, and every page here goes through pageMetadata(),
 * which does. So the default is applied explicitly rather than relied on —
 * without it only the home page carried an og:image.
 */
export const DEFAULT_OG_IMAGE = "/opengraph-image";

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
  const card = absolute(image || DEFAULT_OG_IMAGE);

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
      images: [{ url: card, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [card],
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
    sameAs: SOCIAL_PROFILES,
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

export function articleSchema({
  title,
  description,
  path,
  published,
  modified,
  author,
  image,
  section,
  tags,
}: {
  title: string;
  description: string;
  path: string;
  published: string;
  modified?: string | null;
  author?: string;
  image?: string | null;
  section?: string;
  tags?: readonly string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: absolute(path),
    mainEntityOfPage: { "@type": "WebPage", "@id": absolute(path) },
    datePublished: published,
    dateModified: modified || published,
    author: { "@type": author ? "Person" : "Organization", name: author || SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: absolute("/logo-mark.svg") },
    },
    ...(image ? { image: [absolute(image)] } : {}),
    ...(section ? { articleSection: section } : {}),
    ...(tags && tags.length > 0 ? { keywords: tags.join(", ") } : {}),
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
