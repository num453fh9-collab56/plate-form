import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buyer Requests — Find Freelance Work",
  description:
    "Browse open buyer requests on Hirelyx. Freelancers can send proposals to win projects in design, development, writing, marketing and more.",
  alternates: { canonical: "/requests" },
  openGraph: {
    title: "Buyer Requests — Find Freelance Work on Hirelyx",
    description:
      "Browse open project requests from buyers. Send proposals, win projects, and grow your freelance career.",
  },
};

export default function RequestsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
