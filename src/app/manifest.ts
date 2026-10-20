import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hirelyx — Professional Digital Services",
    short_name: "Hirelyx",
    description: "Professional digital services — web development, AI solutions, digital marketing, and more.",
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
      { name: "Services", url: "/services" },
      { name: "Contact", url: "/contact" },
      { name: "Portfolio", url: "/portfolio" },
    ],
  };
}
