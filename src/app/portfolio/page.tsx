import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Portfolio — Our Work",
  description: "Explore projects delivered by the Hirelyx team — web apps, AI solutions, marketing campaigns, and more.",
  alternates: { canonical: "/portfolio" },
};

interface Project {
  title: string;
  category: string;
  desc: string;
  tags: string[];
  color: string;
  icon: string;
  results: string[];
}

const PROJECTS: Project[] = [
  {
    title: "Hirelyx Platform",
    category: "Programming & Tech",
    desc: "A full-stack Next.js + Supabase platform with real-time chat, Stripe payments, project tracking, booking system, and admin dashboard — built from scratch.",
    tags: ["Next.js", "Supabase", "Stripe", "TypeScript", "Realtime"],
    color: "#0066cc",
    icon: "🌐",
    results: ["60+ pages deployed", "6 integrated services", "Real-time client portal"],
  },
  {
    title: "AI Customer Support Agent",
    category: "Custom AI Agents",
    desc: "Custom AI chatbot for an e-commerce store — handles FAQs, order tracking, and product recommendations using GPT-4 with retrieval-augmented generation.",
    tags: ["OpenAI", "Python", "RAG", "FastAPI", "Vector DB"],
    color: "#7c3aed",
    icon: "🤖",
    results: ["70% fewer support tickets", "24/7 automated responses", "Multilingual support"],
  },
  {
    title: "Social Media Growth Campaign",
    category: "Digital Marketing",
    desc: "Full social media strategy and execution for a SaaS startup — content calendar, paid ads, and analytics tracking across Instagram, LinkedIn, and Twitter.",
    tags: ["Meta Ads", "Content Strategy", "Analytics", "SEO", "LinkedIn"],
    color: "#059669",
    icon: "📈",
    results: ["3x follower growth in 3 months", "45% increase in engagement", "Consistent posting schedule"],
  },
  {
    title: "AI Video & Animation Pipeline",
    category: "Social Media AI & Animation",
    desc: "Automated content pipeline using AI video generation, voiceover synthesis, and auto-editing for a content creator producing daily short-form videos.",
    tags: ["AI Video", "ElevenLabs", "Automation", "FFmpeg", "n8n"],
    color: "#ea580c",
    icon: "🎬",
    results: ["30 videos/month automated", "50% time saved", "Consistent brand style"],
  },
  {
    title: "E-commerce Prompt Library",
    category: "Prompt Engineering",
    desc: "Curated prompt library and system prompt engineering for an e-commerce brand — product descriptions, email sequences, and ad copy generation.",
    tags: ["ChatGPT", "Claude", "Copywriting", "Templates", "A/B Testing"],
    color: "#dc2626",
    icon: "💬",
    results: ["200+ optimized prompts", "60% faster content creation", "Consistent brand voice"],
  },
  {
    title: "Business Workflow Automation",
    category: "n8n & Workflow Automation",
    desc: "End-to-end workflow automation for a digital agency — CRM sync, invoice generation, client onboarding, Slack notifications, and reporting dashboards.",
    tags: ["n8n", "Zapier", "Airtable", "Slack API", "Google Sheets"],
    color: "#0891b2",
    icon: "⚡",
    results: ["15 hours/week saved", "Zero manual data entry", "Real-time team notifications"],
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(PROJECTS.map((p) => p.category)))];

export default function PortfolioPage() {
  return (
    <main>
      <section style={{ textAlign: "center", padding: "4rem 1rem 2rem" }}>
        <div className="wrap">
          <span className="land-kicker" style={{ display: "inline-block" }}>Portfolio</span>
          <h1 className="page-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0.75rem 0" }}>
            Projects We&apos;ve Delivered
          </h1>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto" }}>
            Real work, real results. Here are some of the projects our team has
            built across web development, AI, marketing, and automation.
          </p>
        </div>
      </section>

      <section className="section" style={{ padding: "1rem 1rem 4rem" }}>
        <div className="wrap">
          <div className="pf-grid">
            {PROJECTS.map((p) => (
              <article key={p.title} className="pf-card">
                <div className="pf-card-header" style={{ background: `${p.color}0a`, borderColor: `${p.color}20` }}>
                  <span className="pf-icon" style={{ background: `${p.color}14`, color: p.color }}>{p.icon}</span>
                  <div>
                    <span className="pf-cat" style={{ color: p.color }}>{p.category}</span>
                    <h2>{p.title}</h2>
                  </div>
                </div>

                <p className="pf-desc">{p.desc}</p>

                <div className="pf-results">
                  <span className="pf-results-label">Key Results</span>
                  {p.results.map((r) => (
                    <div key={r} className="pf-result">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                <div className="pf-tags">
                  {p.tags.map((t) => (
                    <span key={t} className="pf-tag" style={{ background: `${p.color}0a`, color: p.color, borderColor: `${p.color}20` }}>{t}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="pf-cta">
            <h2>Have a project in mind?</h2>
            <p>Let&apos;s discuss how we can help bring your idea to life.</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" className="btn-primary" style={{ padding: "0.7rem 1.75rem" }}>Start a Project</Link>
              <Link href="/services" className="btn-ghost" style={{ padding: "0.7rem 1.75rem" }}>View Services</Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .pf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:1.5rem}

        .pf-card{background:var(--surface);border:1px solid var(--border);border-radius:1.25rem;overflow:hidden;display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s}
        .pf-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.08)}

        .pf-card-header{padding:1.5rem 1.5rem 1rem;display:flex;align-items:flex-start;gap:1rem;border-bottom:1px solid var(--border)}
        .pf-icon{width:48px;height:48px;border-radius:.75rem;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0}
        .pf-cat{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
        .pf-card-header h2{font-size:1.1rem;font-weight:800;margin:.15rem 0 0;color:var(--text-primary)}

        .pf-desc{padding:1rem 1.5rem;font-size:.88rem;line-height:1.7;color:var(--text-secondary);flex:1}

        .pf-results{padding:0 1.5rem 1rem;display:flex;flex-direction:column;gap:.35rem}
        .pf-results-label{font-size:.68rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);letter-spacing:.05em;margin-bottom:.2rem}
        .pf-result{display:flex;align-items:center;gap:.5rem;font-size:.82rem;font-weight:600;color:var(--text-primary)}

        .pf-tags{display:flex;flex-wrap:wrap;gap:.35rem;padding:0 1.5rem 1.5rem}
        .pf-tag{font-size:.68rem;font-weight:600;padding:.2rem .55rem;border-radius:999px;border:1px solid}

        .pf-cta{text-align:center;margin-top:3rem;padding:3rem 1.5rem;background:var(--surface);border:1px solid var(--border);border-radius:1.25rem}
        .pf-cta h2{font-size:1.5rem;font-weight:800;margin:0 0 .4rem}
        .pf-cta p{color:var(--text-secondary);margin:0 0 1.5rem}

        @media(max-width:500px){.pf-grid{grid-template-columns:1fr}.pf-card-header{padding:1.25rem}.pf-desc,.pf-results,.pf-tags{padding-left:1.25rem;padding-right:1.25rem}}
      `}</style>
    </main>
  );
}
