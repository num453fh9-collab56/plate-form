import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

/* The page itself is a client component, so its metadata lives here. */
export const metadata: Metadata = pageMetadata({
  title: "Book a Consultation — Free 30-Minute Technical Call",
  description:
    "Book a free consultation with the Hirelyx team. Bring a problem, a half-built system or a rough idea, and you will get a straight technical answer before any commercial conversation.",
  path: "/bookings",
  keywords: [
    "book a technical consultation",
    "free software development consultation",
    "ai agent consultation",
    "python development consultation",
  ],
});

export default function BookingsLayout({ children }: { children: ReactNode }) {
  return children;
}
