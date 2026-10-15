import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Earnings",
  robots: { index: false, follow: false },
};

export default function EarningsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
