"use client";

import { useState } from "react";
import Link from "next/link";
import { useUI } from "@/lib/ui";

/* ==========================================================================
   HIRELYX · SERVICES PAGE
   Advanced services showcase with pricing tiers, feature checklists,
   process timeline, tech stack, and animated interactions.
   ========================================================================== */

interface ServiceTier {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

interface ServiceDetail {
  id: string;
  title: string;
  tagline: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  techStack: string[];
  deliverables: string[];
  tiers: ServiceTier[];
}

const SERVICES: ServiceDetail[] = [
  {
    id: "programming",
    title: "Programming & Tech",
    tagline: "Full-stack development that delivers",
    desc: "Frontend, backend, FastAPI, and API integration — we build scalable web applications and custom software solutions with Java, Python, Next.js, and modern frameworks.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    color: "#0066cc",
    techStack: ["Next.js", "React", "Python", "Java", "FastAPI", "TypeScript", "Supabase", "Vercel"],
    deliverables: ["Full-stack web apps", "REST & GraphQL APIs", "FastAPI backends", "Database design", "Third-party API integration", "Deployment & CI/CD"],
    tiers: [
      { name: "Starter", price: "$499", period: "per project", desc: "Landing page or simple website", features: ["Up to 5 pages", "Responsive design", "Contact form", "SEO basics", "1 round of revisions"], cta: "Get Started" },
      { name: "Professional", price: "$1,499", period: "per project", desc: "Full-stack app with API backend", features: ["Up to 15 pages", "Custom backend (FastAPI/Node)", "API integration", "Auth & database", "3 rounds of revisions", "Performance optimization"], highlighted: true, cta: "Most Popular" },
      { name: "Enterprise", price: "Custom", period: "quote", desc: "Complex platform or SaaS product", features: ["Unlimited scope", "Microservices architecture", "Multi-API integration", "Auth & payments", "Unlimited revisions", "3 months support"], cta: "Contact Us" },
    ],
  },
  {
    id: "marketing",
    title: "Digital Marketing",
    tagline: "Data-driven growth for your business",
    desc: "SEO, Web Analytics, Social Media Marketing, and Meta Ads campaigns. We drive real traffic, track every conversion, and scale what works.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    color: "#059669",
    techStack: ["Meta Ads", "Google Analytics", "Google Ads", "SEMrush", "Facebook Business", "Instagram"],
    deliverables: ["SEO audit & optimization", "Meta Ads campaigns", "Web analytics setup", "Social media strategy", "Monthly performance reports", "Competitor analysis"],
    tiers: [
      { name: "SEO & Analytics", price: "$499", period: "per month", desc: "Organic search + tracking setup", features: ["Full SEO audit", "Google Analytics setup", "Keyword research", "On-page optimization", "Monthly report"], cta: "Get Started" },
      { name: "Growth", price: "$1,499", period: "per month", desc: "SEO + Meta Ads + Social Media", features: ["Everything in SEO", "Meta Ads management", "Social media marketing", "Content calendar", "A/B testing", "Bi-weekly calls"], highlighted: true, cta: "Most Popular" },
      { name: "Scale", price: "$3,499", period: "per month", desc: "Full marketing management", features: ["Everything in Growth", "Dedicated strategist", "Advanced analytics dashboard", "Retargeting campaigns", "Influencer outreach", "Weekly strategy calls"], cta: "Contact Us" },
    ],
  },
  {
    id: "ai-agents",
    title: "Custom AI Agents",
    tagline: "Automate your business workflows",
    desc: "We build custom AI agents that handle repetitive tasks, answer customer queries, process data, and automate your entire business workflow from end to end.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" /><path d="M16 14h.01" /><path d="M8 14h.01" /><path d="M12 17v3" /><path d="M6 21h12" /><path d="M20 10a8 8 0 0 1-16 0" /></svg>,
    color: "#7c3aed",
    techStack: ["Python", "OpenAI API", "Claude API", "LangChain", "n8n", "FastAPI"],
    deliverables: ["Custom AI agent", "Workflow automation", "API connections", "Training & fine-tuning", "Monitoring dashboard", "Documentation"],
    tiers: [
      { name: "Chatbot", price: "$799", period: "per agent", desc: "AI chatbot for your site or app", features: ["Custom knowledge base", "Website/WhatsApp integration", "Natural conversations", "Analytics", "1 month support"], cta: "Get Started" },
      { name: "Workflow Agent", price: "$2,499", period: "per project", desc: "Custom AI agent for your workflows", features: ["Process analysis", "Multi-step agent pipeline", "API integrations", "Error handling", "3 months support", "Team training"], highlighted: true, cta: "Most Popular" },
      { name: "Enterprise AI", price: "Custom", period: "quote", desc: "Full-scale AI automation suite", features: ["Multiple agents", "Custom model fine-tuning", "Real-time processing", "Monitoring & alerts", "Ongoing support", "SLA guarantee"], cta: "Contact Us" },
    ],
  },
  {
    id: "social-ai",
    title: "Social Media AI & Animation",
    tagline: "AI-powered content that captivates",
    desc: "AI-generated social media content, animated videos, reels, and visual storytelling. We create scroll-stopping content that grows your audience.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
    color: "#ea580c",
    techStack: ["After Effects", "Premiere Pro", "RunwayML", "Midjourney", "CapCut", "Canva"],
    deliverables: ["AI animation videos", "Social media reels", "Content calendar", "Brand-consistent visuals", "Platform optimization", "Performance tracking"],
    tiers: [
      { name: "Starter", price: "$399", period: "per month", desc: "4 AI animation videos/month", features: ["4 short-form videos", "AI-generated visuals", "Music & captions", "Platform optimized", "1 revision per video"], cta: "Get Started" },
      { name: "Creator", price: "$999", period: "per month", desc: "12 videos + social content", features: ["12 short-form videos", "AI animations & reels", "Thumbnails & graphics", "Content calendar", "Unlimited revisions", "Analytics report"], highlighted: true, cta: "Most Popular" },
      { name: "Agency", price: "$2,499", period: "per month", desc: "Full social media content suite", features: ["30+ videos/month", "Multi-platform content", "Trend-based creation", "Community management", "Paid promotion support", "Weekly strategy calls"], cta: "Contact Us" },
    ],
  },
  {
    id: "prompt",
    title: "Prompt Engineering",
    tagline: "Get better AI outputs, guaranteed",
    desc: "Expert prompt design and optimization for ChatGPT, Claude, and custom LLMs. We craft prompts that transform how your business uses AI.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    color: "#dc2626",
    techStack: ["ChatGPT", "Claude", "Gemini", "LLaMA", "System Prompts", "RAG"],
    deliverables: ["Custom prompt library", "System prompt design", "A/B testing results", "Use-case documentation", "Team training session", "Optimization report"],
    tiers: [
      { name: "Starter", price: "$299", period: "per project", desc: "Prompt set for one use case", features: ["5 optimized prompts", "A/B tested", "Documentation", "1 use case", "1 revision round"], cta: "Get Started" },
      { name: "Professional", price: "$799", period: "per project", desc: "Full prompt system for your business", features: ["20+ prompts", "Multiple use cases", "System prompt design", "Chain-of-thought optimization", "Team training", "3 revision rounds"], highlighted: true, cta: "Most Popular" },
      { name: "Enterprise", price: "Custom", period: "quote", desc: "Ongoing prompt engineering partner", features: ["Unlimited prompts", "Custom AI workflows", "RAG optimization", "Fine-tuning guidance", "Monthly optimization", "Dedicated specialist"], cta: "Contact Us" },
    ],
  },
  {
    id: "n8n",
    title: "n8n & Workflow Automation",
    tagline: "Connect everything, automate anything",
    desc: "Build powerful automation workflows with n8n — connect your apps, CRMs, databases, and APIs. Eliminate manual work and let your systems talk to each other.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
    color: "#0891b2",
    techStack: ["n8n", "Zapier", "Make", "Webhooks", "REST APIs", "Google Sheets"],
    deliverables: ["Custom n8n workflows", "App-to-app integration", "Error handling & logging", "Scheduled automations", "Documentation", "Team training"],
    tiers: [
      { name: "Basic", price: "$399", period: "per workflow", desc: "Simple 2-3 app automation", features: ["1 workflow", "Up to 3 apps connected", "Error notifications", "Documentation", "1 month support"], cta: "Get Started" },
      { name: "Business", price: "$1,299", period: "per project", desc: "Multi-workflow automation system", features: ["Up to 5 workflows", "Unlimited app connections", "Conditional logic", "Data transformation", "Dashboard", "3 months support"], highlighted: true, cta: "Most Popular" },
      { name: "Enterprise", price: "Custom", period: "quote", desc: "Full business automation suite", features: ["Unlimited workflows", "Custom integrations", "Self-hosted n8n setup", "Real-time monitoring", "Ongoing support", "SLA guarantee"], cta: "Contact Us" },
    ],
  },
];

const PROCESS = [
  { num: "01", title: "Discovery", desc: "We learn about your business, goals, and requirements through a detailed consultation.", color: "#0066cc" },
  { num: "02", title: "Strategy", desc: "We create a detailed plan with timelines, milestones, and deliverables tailored to your project.", color: "#7c3aed" },
  { num: "03", title: "Build", desc: "Our team gets to work, providing regular updates and demos so you're always in the loop.", color: "#059669" },
  { num: "04", title: "Launch", desc: "We deliver, test thoroughly, and help you launch. Plus ongoing support to keep things running.", color: "#ea580c" },
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ServiceCard({ service, expanded, onToggle }: { service: ServiceDetail; expanded: boolean; onToggle: () => void }) {
  return (
    <div className={"svc-card" + (expanded ? " svc-card-expanded" : "")} id={service.id}>
      <button type="button" className="svc-card-header" onClick={onToggle}>
        <div className="svc-card-icon" style={{ background: `${service.color}12`, color: service.color }}>
          {service.icon}
        </div>
        <div className="svc-card-intro">
          <h3>{service.title}</h3>
          <p className="svc-tagline">{service.tagline}</p>
        </div>
        <span className={"svc-chevron" + (expanded ? " svc-chevron-open" : "")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
        </span>
      </button>

      {expanded && (
        <div className="svc-card-body">
          <p className="svc-desc">{service.desc}</p>

          <div className="svc-meta-row">
            <div className="svc-meta-block">
              <h4>Tech Stack</h4>
              <div className="svc-tags">
                {service.techStack.map((t) => (
                  <span key={t} className="svc-tag" style={{ borderColor: `${service.color}30`, color: service.color }}>{t}</span>
                ))}
              </div>
            </div>
            <div className="svc-meta-block">
              <h4>What You Get</h4>
              <ul className="svc-deliverables">
                {service.deliverables.map((d) => (
                  <li key={d}><span className="svc-check" style={{ color: service.color }}><CheckIcon /></span>{d}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ textAlign: "right", marginBottom: "1rem" }}>
            <Link href={`/services/${service.id}`} className="svc-detail-link" style={{ color: service.color }}>
              View full details →
            </Link>
          </div>

          <div className="svc-tiers">
            {service.tiers.map((tier) => (
              <div key={tier.name} className={"svc-tier" + (tier.highlighted ? " svc-tier-pop" : "")} style={tier.highlighted ? { borderColor: service.color } : undefined}>
                {tier.highlighted && <span className="svc-tier-badge" style={{ background: service.color }}>Recommended</span>}
                <h4>{tier.name}</h4>
                <div className="svc-tier-price">
                  <strong>{tier.price}</strong>
                  <span>{tier.period}</span>
                </div>
                <p className="svc-tier-desc">{tier.desc}</p>
                <ul className="svc-tier-features">
                  {tier.features.map((f) => (
                    <li key={f}><span className="svc-check" style={{ color: service.color }}><CheckIcon /></span>{f}</li>
                  ))}
                </ul>
                <a href="/contact" className={"svc-tier-btn" + (tier.highlighted ? " svc-tier-btn-primary" : "")} style={tier.highlighted ? { background: service.color } : undefined}>
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  const { openAuth } = useUI();
  const [expandedId, setExpandedId] = useState<string | null>("programming");

  return (
    <section className="section">
      <div className="wrap">
        {/* ── Hero ── */}
        <div className="svc-hero">
          <span className="land-kicker">Our Services</span>
          <h1>Everything You Need to Build & Grow</h1>
          <p>From idea to launch, we handle every aspect of your digital project with expertise and precision.</p>
        </div>

        {/* ── Process Timeline ── */}
        <div className="svc-process">
          <h2 className="svc-process-title">Our Process</h2>
          <div className="svc-process-grid">
            {PROCESS.map((step, i) => (
              <div key={step.num} className="svc-process-step">
                <div className="svc-process-num" style={{ background: step.color }}>{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < PROCESS.length - 1 && <span className="svc-process-arrow" style={{ color: step.color }}>→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Service Accordions ── */}
        <div className="svc-list">
          {SERVICES.map((svc) => (
            <ServiceCard
              key={svc.id}
              service={svc}
              expanded={expandedId === svc.id}
              onToggle={() => setExpandedId(expandedId === svc.id ? null : svc.id)}
            />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="svc-bottom-cta">
          <h2>Not sure which service you need?</h2>
          <p>Reach out and we&apos;ll help you figure out the best approach for your project.</p>
          <div className="svc-bottom-actions">
            <a href="/contact" className="btn-primary">Contact Us</a>
            <button type="button" className="btn-ghost" onClick={() => openAuth("signup")}>Create Account</button>
          </div>
        </div>
      </div>

      <style>{`
        .svc-hero {
          text-align: center;
          padding: 3rem 0 2rem;
        }
        .svc-hero h1 {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          margin: 0.75rem 0;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .svc-hero > p {
          color: var(--text-secondary);
          max-width: 560px;
          margin: 0 auto;
          font-size: 1.05rem;
        }

        /* Process */
        .svc-process {
          margin: 3rem 0;
          padding: 2.5rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
        }
        .svc-process-title {
          text-align: center;
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: var(--text-primary);
        }
        .svc-process-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .svc-process-step {
          position: relative;
          text-align: center;
        }
        .svc-process-num {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 800;
          font-size: 0.8rem;
          margin-bottom: 0.75rem;
        }
        .svc-process-step h3 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 0.4rem;
          color: var(--text-primary);
        }
        .svc-process-step p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .svc-process-arrow {
          position: absolute;
          right: -1.1rem;
          top: 12px;
          font-size: 1.4rem;
          font-weight: 700;
        }

        /* Accordion Cards */
        .svc-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 2rem 0 3rem;
        }
        .svc-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          overflow: hidden;
          transition: box-shadow 0.3s, border-color 0.3s;
        }
        .svc-card-expanded {
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
        }
        .svc-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          padding: 1.25rem 1.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          color: inherit;
          font: inherit;
        }
        .svc-card-header:hover {
          background: rgba(0,0,0,0.02);
        }
        .svc-card-icon {
          width: 52px;
          height: 52px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .svc-card-intro {
          flex: 1;
        }
        .svc-card-intro h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }
        .svc-tagline {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin: 0.15rem 0 0;
        }
        .svc-chevron {
          transition: transform 0.3s;
          color: var(--text-secondary);
        }
        .svc-chevron-open {
          transform: rotate(180deg);
        }

        /* Body */
        .svc-card-body {
          padding: 0 1.5rem 2rem;
          animation: svcSlide 0.3s ease;
        }
        @keyframes svcSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .svc-desc {
          color: var(--text-secondary);
          font-size: 0.92rem;
          line-height: 1.6;
          margin: 0 0 1.5rem;
          max-width: 640px;
        }
        .svc-meta-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .svc-meta-block h4 {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          margin: 0 0 0.75rem;
        }
        .svc-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .svc-tag {
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
          border: 1.5px solid;
        }
        .svc-deliverables {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        .svc-deliverables li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .svc-check {
          flex-shrink: 0;
        }

        /* Pricing Tiers */
        .svc-tiers {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .svc-tier {
          position: relative;
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: 1rem;
          padding: 1.75rem 1.25rem;
          text-align: center;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .svc-tier:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .svc-tier-pop {
          border-width: 2px;
          transform: scale(1.02);
        }
        .svc-tier-pop:hover {
          transform: scale(1.02) translateY(-3px);
        }
        .svc-tier-badge {
          position: absolute;
          top: -0.65rem;
          left: 50%;
          transform: translateX(-50%);
          padding: 0.2rem 0.8rem;
          border-radius: 999px;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
        .svc-tier h4 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          color: var(--text-primary);
        }
        .svc-tier-price strong {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .svc-tier-price span {
          display: block;
          font-size: 0.72rem;
          color: var(--text-secondary);
          margin-top: 0.1rem;
        }
        .svc-tier-desc {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin: 0.75rem 0;
        }
        .svc-tier-features {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
          text-align: left;
        }
        .svc-tier-features li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          color: var(--text-secondary);
          padding: 0.3rem 0;
        }
        .svc-tier-btn {
          display: inline-block;
          padding: 0.6rem 1.5rem;
          border-radius: 0.5rem;
          font-size: 0.82rem;
          font-weight: 600;
          text-decoration: none;
          color: var(--text-primary);
          border: 1.5px solid var(--border);
          transition: background 0.2s, transform 0.2s;
        }
        .svc-tier-btn:hover {
          background: rgba(0,0,0,0.04);
          transform: translateY(-1px);
        }
        .svc-tier-btn-primary {
          color: #fff;
          border-color: transparent;
        }
        .svc-tier-btn-primary:hover {
          opacity: 0.9;
          background: inherit;
        }

        .svc-detail-link {
          font-size: .85rem;
          font-weight: 700;
          text-decoration: none;
          transition: opacity .15s;
        }
        .svc-detail-link:hover {
          opacity: 0.7;
        }

        /* Bottom CTA */
        .svc-bottom-cta {
          text-align: center;
          padding: 3rem 0;
        }
        .svc-bottom-cta h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .svc-bottom-cta p {
          color: var(--text-secondary);
          margin: 0.5rem 0 1.5rem;
        }
        .svc-bottom-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .svc-process-grid { grid-template-columns: repeat(2, 1fr); }
          .svc-process-arrow { display: none; }
          .svc-meta-row { grid-template-columns: 1fr; }
          .svc-deliverables { grid-template-columns: 1fr; }
          .svc-tiers { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
          .svc-tier-pop { transform: none; }
        }
        @media (max-width: 500px) {
          .svc-process-grid { grid-template-columns: 1fr; max-width: 320px; margin: 0 auto; }
          .svc-card-header { padding: 1rem; }
        }
      `}</style>
    </section>
  );
}
