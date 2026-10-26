import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

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
        "/settings/",
        "/auth/",
        "/user/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
