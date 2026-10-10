import type { MetadataRoute } from "next";

/* Makes Hirelyx installable as an app ("Add to Home Screen" / "Install app"). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hirelyx — Hire Expert Freelance Talent",
    short_name: "Hirelyx",
    description: "Hire expert freelancers or sell your services.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f5f7",
    theme_color: "#0066cc",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Orders", url: "/orders" },
      { name: "Buyer requests", url: "/requests" },
      { name: "Create a gig", url: "/post-project" },
    ],
  };
}
