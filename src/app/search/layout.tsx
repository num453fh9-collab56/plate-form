import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Freelancers & Services",
  description:
    "Search and hire expert freelancers on Hirelyx. Browse thousands of services in design, development, writing, marketing, AI and more. Compare portfolios, read reviews, and order with confidence.",
  alternates: { canonical: "/search" },
  openGraph: {
    title: "Find Freelancers & Services — Hirelyx",
    description:
      "Search and hire expert freelancers for any project. Compare portfolios, read reviews, and order securely.",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
