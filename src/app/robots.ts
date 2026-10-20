import type { MetadataRoute } from "next";

const SITE = "https://www.hirelyx.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/reset-password/",
        "/dashboard/",
        "/portal/",
        "/invoices/",
        "/projects/",
        "/notifications/",
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
