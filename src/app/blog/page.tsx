import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog · Hirelyx",
  description: "Tips, guides, and updates from the Hirelyx freelance marketplace.",
};

export default function BlogPage() {
  return (
    <main className="wrap" style={{ paddingBlock: "4rem" }}>
      <h1 className="page-title">Blog</h1>

      <section style={{ maxWidth: 620, margin: "2rem auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={{ fontSize: "3rem" }} aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
        <h2 style={{ fontSize: "1.3rem" }}>Coming Soon</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, maxWidth: 420 }}>
          We&apos;re working on articles about freelancing tips, platform guides, and success stories. Stay tuned!
        </p>
        <Link
          href="/"
          style={{ color: "var(--accent)", textDecoration: "underline", fontSize: "0.95rem" }}
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
