import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About us · Hirelyx",
  description: "Learn about Hirelyx — the freelance marketplace connecting buyers with skilled freelancers worldwide.",
};

export default function AboutPage() {
  return (
    <main className="wrap" style={{ paddingBlock: "4rem" }}>
      <h1 className="page-title">About Hirelyx</h1>

      <section className="info-section" style={{ maxWidth: 720, margin: "2rem auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--fg)" }}>
          Hirelyx is a freelance marketplace that connects businesses and individuals with skilled freelancers across the globe. Whether you need a website built, a logo designed, content written, or a marketing campaign launched — Hirelyx makes it easy to find the right talent.
        </p>

        <h2 style={{ fontSize: "1.3rem", marginTop: "0.5rem" }}>Our Mission</h2>
        <p style={{ lineHeight: 1.7, color: "var(--muted)" }}>
          To empower freelancers and businesses by providing a secure, transparent, and easy-to-use platform where great work happens every day.
        </p>

        <h2 style={{ fontSize: "1.3rem", marginTop: "0.5rem" }}>Why Hirelyx?</h2>
        <ul style={{ lineHeight: 1.8, color: "var(--muted)", paddingLeft: "1.25rem" }}>
          <li>Secure payments through Stripe with escrow protection</li>
          <li>Multiple service categories — from programming to design to marketing</li>
          <li>Seller levels and ratings for quality assurance</li>
          <li>Built-in messaging, video calls, and milestone tracking</li>
          <li>Support for 16 languages and multiple currencies</li>
          <li>Dispute resolution with admin review</li>
        </ul>

        <h2 style={{ fontSize: "1.3rem", marginTop: "0.5rem" }}>Get Started</h2>
        <p style={{ lineHeight: 1.7, color: "var(--muted)" }}>
          Ready to hire or start freelancing?{" "}
          <Link href="/how-it-works" style={{ color: "var(--accent)", textDecoration: "underline" }}>
            Learn how it works
          </Link>{" "}
          or{" "}
          <Link href="/search" style={{ color: "var(--accent)", textDecoration: "underline" }}>
            browse services
          </Link>{" "}
          to get started today.
        </p>
      </section>
    </main>
  );
}
