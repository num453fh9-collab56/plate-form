import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

/* The page itself is a client component, so its metadata lives here.
   No Review or AggregateRating schema is emitted: the structured-data policy
   in lib/seo.ts only allows it once there is a verified review corpus. */
export const metadata: Metadata = pageMetadata({
  title: "Client Reviews — What Working With Hirelyx Is Like",
  description:
    "Feedback from clients on Hirelyx projects across Python development, AI agents, WordPress builds and digital marketing.",
  path: "/reviews",
  keywords: ["hirelyx reviews", "software agency reviews", "client feedback"],
});

export default function ReviewsLayout({ children }: { children: ReactNode }) {
  return children;
}
