/* Assigns a topic-appropriate showcase video to gigs/projects. */

export function topicVideoFor(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes("ecommerce") || t.includes("e-commerce") || t.includes("store") || t.includes("shop")) {
    return "/videos/ecommerce.mp4";
  }
  if (
    t.includes("design") ||
    t.includes("brand") ||
    t.includes("ui/ux") ||
    t.includes("logo") ||
    t.includes("identity")
  ) {
    return "/videos/showcase-1.mp4";
  }
  if (
    t.includes("ads") ||
    t.includes("marketing") ||
    t.includes("video") ||
    t.includes("seo") ||
    t.includes("copy") ||
    t.includes("content")
  ) {
    return "/videos/showcase-2.mp4";
  }
  if (
    t.includes("web") ||
    t.includes("developer") ||
    t.includes("development") ||
    t.includes("app") ||
    t.includes("ai") ||
    t.includes("mobile") ||
    t.includes("software")
  ) {
    return "/videos/developer.mp4";
  }
  return null;
}
