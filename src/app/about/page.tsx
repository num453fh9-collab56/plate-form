import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Hirelyx — a professional services team building web apps, mobile apps, AI solutions, and stunning designs for businesses worldwide.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Hirelyx — Professional Digital Services",
    description:
      "Hirelyx is a team of developers, designers, and engineers delivering world-class digital products. Web, mobile, AI, branding, and marketing.",
    type: "website",
  },
};

const VALUES = [
  {
    title: "Quality First",
    desc: "We don't cut corners. Every project gets our full attention, with thorough testing and polish before delivery.",
    icon: "🎯",
    color: "#0066cc",
  },
  {
    title: "Transparent Process",
    desc: "Regular updates, clear timelines, and honest communication. You always know where your project stands.",
    icon: "🔍",
    color: "#059669",
  },
  {
    title: "Client-Focused",
    desc: "Your goals are our goals. We listen, adapt, and go the extra mile to make sure you're satisfied.",
    icon: "🤝",
    color: "#7c3aed",
  },
  {
    title: "Modern Technology",
    desc: "We use the latest tools and frameworks to build products that are fast, scalable, and future-proof.",
    icon: "⚡",
    color: "#ea580c",
  },
];

const TIMELINE = [
  { year: "2024", title: "The Idea", desc: "Started as a PIAIC student project with a vision to build something real and useful." },
  { year: "2025", title: "First Launch", desc: "Launched Hirelyx as a platform with Supabase, Stripe, and Next.js — learning what clients really need." },
  { year: "2026", title: "Pivot to Services", desc: "Evolved into a professional services team, offering direct project delivery to clients worldwide." },
  { year: "Now", title: "Growing", desc: "Expanding our team and services, delivering high-quality digital products to clients across the globe." },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "4rem 1rem 2rem" }}>
        <div className="wrap">
          <span className="land-kicker" style={{ display: "inline-block" }}>About Us</span>
          <h1 className="page-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0.75rem 0" }}>
            We Build Digital Products That Matter
          </h1>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto" }}>
            Hirelyx is a team of developers, designers, and engineers passionate about creating
            exceptional digital experiences for businesses around the world.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="wrap" style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1.25rem", padding: "2.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: 0 }}>Our Story</h2>
          <p style={{ lineHeight: 1.8, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Hirelyx started as a student project at PIAIC — an ambitious idea to build a global
            freelance marketplace. After launching and getting real feedback, we realized that what
            clients really wanted wasn&apos;t another marketplace. They wanted a reliable team they could
            trust to build their projects from start to finish.
          </p>
          <p style={{ lineHeight: 1.8, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            So we pivoted. Today, Hirelyx is a professional services team that combines the agility
            of a startup with the quality of an agency. We handle web development, mobile apps, AI
            integrations, UI/UX design, branding, and digital marketing — all under one roof.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ padding: "3rem 1rem" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span className="land-kicker" style={{ display: "inline-block" }}>Our Values</span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.5rem 0" }}>What Drives Us</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {VALUES.map((v) => (
              <div key={v.title} style={{
                background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem",
                padding: "1.75rem", transition: "transform 0.3s, box-shadow 0.3s",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "0.75rem",
                  background: `${v.color}12`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1.4rem", marginBottom: "1rem",
                }}>{v.icon}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--text-primary)" }}>{v.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ padding: "3rem 1rem" }}>
        <div className="wrap" style={{ maxWidth: 640 }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span className="land-kicker" style={{ display: "inline-block" }}>Our Journey</span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.5rem 0" }}>How We Got Here</h2>
          </div>
          <div style={{ position: "relative", paddingLeft: "2.5rem" }}>
            <div style={{
              position: "absolute", left: "0.6rem", top: 8, bottom: 8, width: 2,
              background: "var(--border)", borderRadius: 2,
            }} />
            {TIMELINE.map((item, i) => (
              <div key={item.year} style={{ position: "relative", marginBottom: i < TIMELINE.length - 1 ? "2rem" : 0 }}>
                <div style={{
                  position: "absolute", left: "-2.15rem", top: 4, width: 14, height: 14,
                  borderRadius: "50%", background: i === TIMELINE.length - 1 ? "#0066cc" : "var(--surface)",
                  border: `2.5px solid ${i === TIMELINE.length - 1 ? "#0066cc" : "var(--border)"}`,
                }} />
                <span style={{
                  display: "inline-block", padding: "0.15rem 0.6rem", borderRadius: 999,
                  background: "rgba(0,102,204,0.08)", color: "#0066cc", fontSize: "0.72rem",
                  fontWeight: 700, marginBottom: "0.4rem",
                }}>{item.year}</span>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 0.3rem", color: "var(--text-primary)" }}>{item.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ padding: "3rem 1rem 4rem" }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Ready to Work Together?</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", maxWidth: 480, margin: "0.5rem auto 1.5rem" }}>
            Whether you need a website, an app, or a complete brand — we&apos;re here to help.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn-primary" style={{ padding: "0.7rem 1.75rem" }}>
              Contact Us
            </Link>
            <Link href="/services" className="btn-ghost" style={{ padding: "0.7rem 1.75rem" }}>
              View Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
