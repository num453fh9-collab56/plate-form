"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUI } from "@/lib/ui";

interface Tier {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlighted?: boolean;
}

interface FAQ {
  q: string;
  a: string;
}

interface Service {
  slug: string;
  title: string;
  tagline: string;
  desc: string;
  longDesc: string;
  icon: string;
  color: string;
  techStack: string[];
  deliverables: string[];
  process: { title: string; desc: string }[];
  tiers: Tier[];
  faqs: FAQ[];
}

const SERVICES: Service[] = [
  {
    slug: "programming",
    title: "Programming & Tech",
    tagline: "Full-stack development that delivers",
    desc: "Frontend, backend, FastAPI, and API integration — we build scalable web applications and custom software solutions.",
    longDesc: "From landing pages to complex SaaS platforms, our development team builds production-ready applications using modern frameworks like Next.js, React, Python, FastAPI, and TypeScript. We handle the entire stack — frontend UI, backend APIs, database design, authentication, payments, and deployment.",
    icon: "💻",
    color: "#0066cc",
    techStack: ["Next.js", "React", "Python", "Java", "FastAPI", "TypeScript", "Supabase", "PostgreSQL", "Vercel", "Docker"],
    deliverables: ["Full-stack web applications", "REST & GraphQL APIs", "FastAPI backends", "Database architecture", "Third-party API integration", "Authentication & payments", "Deployment & CI/CD", "Performance optimization"],
    process: [
      { title: "Requirements Gathering", desc: "We map out every feature, user flow, and technical requirement through detailed discussions." },
      { title: "Architecture & Design", desc: "We plan the tech stack, database schema, API structure, and create wireframes before writing code." },
      { title: "Iterative Development", desc: "We build in sprints with regular demos. You see progress every week and can provide feedback." },
      { title: "Testing & Launch", desc: "Thorough QA, performance testing, security audit, then deployment with zero-downtime." },
    ],
    tiers: [
      { name: "Starter", price: "$499", period: "per project", desc: "Landing page or simple website", features: ["Up to 5 pages", "Responsive design", "Contact form", "SEO basics", "1 round of revisions"] },
      { name: "Professional", price: "$1,499", period: "per project", desc: "Full-stack app with API backend", features: ["Up to 15 pages", "Custom backend (FastAPI/Node)", "API integration", "Auth & database", "3 rounds of revisions", "Performance optimization"], highlighted: true },
      { name: "Enterprise", price: "Custom", period: "quote", desc: "Complex platform or SaaS product", features: ["Unlimited scope", "Microservices architecture", "Multi-API integration", "Auth & payments", "Unlimited revisions", "3 months support"] },
    ],
    faqs: [
      { q: "What technologies do you use?", a: "We primarily work with Next.js, React, TypeScript, Python, FastAPI, and Supabase. We choose the best stack for each project based on requirements." },
      { q: "Can you work with my existing codebase?", a: "Yes! We can take over, refactor, or extend existing projects. We'll do a code audit first to understand the current state." },
      { q: "Do you provide hosting?", a: "We help you deploy to Vercel, AWS, or your preferred platform. We set up CI/CD so future deployments are automatic." },
      { q: "What about ongoing maintenance?", a: "All plans include post-launch bug fixes. Enterprise includes 3 months of support. Extended maintenance packages are available." },
    ],
  },
  {
    slug: "marketing",
    title: "Digital Marketing",
    tagline: "Data-driven growth for your business",
    desc: "SEO, Web Analytics, Social Media Marketing, and Meta Ads campaigns that drive real results.",
    longDesc: "We don't just run ads — we build complete growth systems. From SEO audits and keyword strategy to Meta Ads campaigns and analytics dashboards, every decision is backed by data. We track every conversion, optimize what works, and scale your marketing budget efficiently.",
    icon: "📈",
    color: "#059669",
    techStack: ["Meta Ads", "Google Analytics", "Google Ads", "SEMrush", "Ahrefs", "Facebook Business", "Instagram", "LinkedIn Ads", "Hotjar"],
    deliverables: ["SEO audit & optimization", "Meta Ads campaigns", "Google Ads setup", "Web analytics & tracking", "Social media strategy", "Content marketing plan", "Monthly performance reports", "Competitor analysis"],
    process: [
      { title: "Audit & Research", desc: "We analyze your current presence, competitors, and target audience to find opportunities." },
      { title: "Strategy & Planning", desc: "We create a custom marketing plan with clear KPIs, budget allocation, and timeline." },
      { title: "Execution & Testing", desc: "We launch campaigns, A/B test creatives, and optimize based on real-time data." },
      { title: "Report & Scale", desc: "Monthly reports with actionable insights. We scale what works and cut what doesn't." },
    ],
    tiers: [
      { name: "SEO & Analytics", price: "$499", period: "per month", desc: "Organic search + tracking setup", features: ["Full SEO audit", "Google Analytics setup", "Keyword research", "On-page optimization", "Monthly report"] },
      { name: "Growth", price: "$1,499", period: "per month", desc: "SEO + Meta Ads + Social Media", features: ["Everything in SEO", "Meta Ads management", "Social media marketing", "Content calendar", "A/B testing", "Bi-weekly calls"], highlighted: true },
      { name: "Scale", price: "$3,499", period: "per month", desc: "Full marketing management", features: ["Everything in Growth", "Dedicated strategist", "Advanced analytics dashboard", "Retargeting campaigns", "Influencer outreach", "Weekly strategy calls"] },
    ],
    faqs: [
      { q: "How long before I see results?", a: "Paid ads can show results within days. SEO typically takes 2-3 months for meaningful organic traffic improvements." },
      { q: "Do I need a big budget for ads?", a: "We can work with budgets starting from $500/month on Meta Ads. We optimize spend to maximize your ROI." },
      { q: "Will I own the ad accounts?", a: "Absolutely. All ad accounts, analytics, and data belong to you. We work inside your accounts." },
      { q: "How do you report results?", a: "Monthly reports with key metrics, insights, and recommendations. Growth and Scale plans include live dashboards." },
    ],
  },
  {
    slug: "ai-agents",
    title: "Custom AI Agents",
    tagline: "Automate your business workflows",
    desc: "We build custom AI agents that handle repetitive tasks, answer customer queries, and automate your workflows.",
    longDesc: "From simple chatbots to multi-step AI agent pipelines, we build intelligent automation that transforms your business. Using OpenAI, Claude, LangChain, and custom tooling, we create agents that understand your data, make decisions, and take actions — saving you hours of manual work every day.",
    icon: "🤖",
    color: "#7c3aed",
    techStack: ["Python", "OpenAI API", "Claude API", "LangChain", "n8n", "FastAPI", "Pinecone", "ChromaDB", "Supabase"],
    deliverables: ["Custom AI chatbot", "Multi-step agent pipeline", "Knowledge base integration", "API & tool connections", "Monitoring dashboard", "Error handling & fallbacks", "Documentation", "Team training"],
    process: [
      { title: "Process Analysis", desc: "We map your current workflows to identify where AI can save the most time and reduce errors." },
      { title: "Agent Design", desc: "We design the agent architecture — tools, knowledge base, decision logic, and integration points." },
      { title: "Build & Train", desc: "We build the agent, connect your data sources, and fine-tune responses until accuracy meets your standards." },
      { title: "Deploy & Monitor", desc: "We deploy with monitoring, error alerts, and usage analytics. Ongoing optimization as your needs evolve." },
    ],
    tiers: [
      { name: "Chatbot", price: "$799", period: "per agent", desc: "AI chatbot for your site or app", features: ["Custom knowledge base", "Website/WhatsApp integration", "Natural conversations", "Analytics", "1 month support"] },
      { name: "Workflow Agent", price: "$2,499", period: "per project", desc: "Custom AI agent for your workflows", features: ["Process analysis", "Multi-step agent pipeline", "API integrations", "Error handling", "3 months support", "Team training"], highlighted: true },
      { name: "Enterprise AI", price: "Custom", period: "quote", desc: "Full-scale AI automation suite", features: ["Multiple agents", "Custom model fine-tuning", "Real-time processing", "Monitoring & alerts", "Ongoing support", "SLA guarantee"] },
    ],
    faqs: [
      { q: "What types of tasks can an AI agent handle?", a: "Customer support, data processing, lead qualification, content generation, scheduling, reporting — any repetitive task with clear rules." },
      { q: "Can it connect to my existing tools?", a: "Yes. We integrate with CRMs, databases, Slack, email, Google Workspace, and virtually any API-enabled tool." },
      { q: "How accurate are the responses?", a: "We use RAG (retrieval-augmented generation) with your data to ensure high accuracy. We test extensively before launch." },
      { q: "What happens when the agent can't answer?", a: "We build graceful fallbacks — the agent escalates to a human team member with full context." },
    ],
  },
  {
    slug: "social-ai",
    title: "Social Media AI & Animation",
    tagline: "AI-powered content that captivates",
    desc: "AI-generated social media content, animated videos, reels, and visual storytelling that grows your audience.",
    longDesc: "We combine AI tools with professional editing to create scroll-stopping social media content. From AI-generated animations and reels to full content calendars, we help brands maintain a consistent, high-quality presence across all platforms without the overhead of a full creative team.",
    icon: "🎬",
    color: "#ea580c",
    techStack: ["After Effects", "Premiere Pro", "RunwayML", "Midjourney", "ElevenLabs", "CapCut", "Canva", "Stable Diffusion"],
    deliverables: ["AI animation videos", "Short-form reels & TikToks", "Content calendar", "Brand-consistent visuals", "Thumbnail & graphic design", "Platform optimization", "Performance tracking"],
    process: [
      { title: "Brand Audit", desc: "We study your brand voice, visual style, target audience, and current content performance." },
      { title: "Content Strategy", desc: "We create a content calendar with themes, formats, and posting schedule optimized for each platform." },
      { title: "Production", desc: "We produce AI-enhanced videos, animations, and graphics — reviewed and approved before posting." },
      { title: "Analyze & Iterate", desc: "We track engagement, views, and growth. Monthly reports guide what we create next." },
    ],
    tiers: [
      { name: "Starter", price: "$399", period: "per month", desc: "4 AI animation videos/month", features: ["4 short-form videos", "AI-generated visuals", "Music & captions", "Platform optimized", "1 revision per video"] },
      { name: "Creator", price: "$999", period: "per month", desc: "12 videos + social content", features: ["12 short-form videos", "AI animations & reels", "Thumbnails & graphics", "Content calendar", "Unlimited revisions", "Analytics report"], highlighted: true },
      { name: "Agency", price: "$2,499", period: "per month", desc: "Full social media content suite", features: ["30+ videos/month", "Multi-platform content", "Trend-based creation", "Community management", "Paid promotion support", "Weekly strategy calls"] },
    ],
    faqs: [
      { q: "What platforms do you create content for?", a: "Instagram, TikTok, YouTube Shorts, LinkedIn, Twitter/X, and Facebook. We optimize format and style for each platform." },
      { q: "Do I approve content before posting?", a: "Always. You review and approve every piece of content before it goes live." },
      { q: "Can you match my existing brand style?", a: "Yes. We study your brand guidelines and create content that's visually consistent with your existing identity." },
      { q: "What AI tools do you use?", a: "RunwayML, Midjourney, Stable Diffusion, ElevenLabs for voiceover, and professional editing software for the final polish." },
    ],
  },
  {
    slug: "prompt",
    title: "Prompt Engineering",
    tagline: "Get better AI outputs, guaranteed",
    desc: "Expert prompt design and optimization for ChatGPT, Claude, and custom LLMs.",
    longDesc: "The difference between a good AI output and a great one is the prompt. We design, test, and optimize prompts and system instructions that transform how your team uses AI. From customer service scripts to content generation pipelines, we make AI work reliably for your specific use cases.",
    icon: "💬",
    color: "#dc2626",
    techStack: ["ChatGPT", "Claude", "Gemini", "LLaMA", "System Prompts", "RAG", "Few-shot Learning", "Chain-of-Thought"],
    deliverables: ["Custom prompt library", "System prompt design", "A/B testing results", "Use-case documentation", "Team training session", "Optimization report", "Prompt templates"],
    process: [
      { title: "Use Case Mapping", desc: "We identify your AI use cases and current pain points with LLM outputs." },
      { title: "Prompt Design", desc: "We craft prompts using chain-of-thought, few-shot learning, and structured output techniques." },
      { title: "Testing & Optimization", desc: "We A/B test prompts, measure quality, and iterate until outputs consistently meet your standards." },
      { title: "Documentation & Training", desc: "We deliver a documented prompt library and train your team to use and maintain it." },
    ],
    tiers: [
      { name: "Starter", price: "$299", period: "per project", desc: "Prompt set for one use case", features: ["5 optimized prompts", "A/B tested", "Documentation", "1 use case", "1 revision round"] },
      { name: "Professional", price: "$799", period: "per project", desc: "Full prompt system for your business", features: ["20+ prompts", "Multiple use cases", "System prompt design", "Chain-of-thought optimization", "Team training", "3 revision rounds"], highlighted: true },
      { name: "Enterprise", price: "Custom", period: "quote", desc: "Ongoing prompt engineering partner", features: ["Unlimited prompts", "Custom AI workflows", "RAG optimization", "Fine-tuning guidance", "Monthly optimization", "Dedicated specialist"] },
    ],
    faqs: [
      { q: "What's the difference between basic and optimized prompts?", a: "Optimized prompts use techniques like chain-of-thought reasoning, structured outputs, and context management to get consistently better results." },
      { q: "Which AI models do you work with?", a: "ChatGPT (GPT-4), Claude, Gemini, LLaMA, and custom fine-tuned models. We'll recommend the best model for your use case." },
      { q: "Can you help with our existing AI workflows?", a: "Absolutely. We audit your current prompts, identify improvement areas, and optimize them for better accuracy and consistency." },
      { q: "Do you provide ongoing support?", a: "Enterprise plans include monthly optimization. For other plans, we offer support packages for ongoing prompt maintenance." },
    ],
  },
  {
    slug: "n8n",
    title: "n8n & Workflow Automation",
    tagline: "Connect everything, automate anything",
    desc: "Build powerful automation workflows with n8n — connect your apps, CRMs, databases, and APIs.",
    longDesc: "Stop doing things manually. We build automation workflows that connect your tools, sync your data, and handle repetitive tasks automatically. Using n8n, Zapier, Make, and custom integrations, we eliminate manual work and let your systems talk to each other — saving your team hours every week.",
    icon: "⚡",
    color: "#0891b2",
    techStack: ["n8n", "Zapier", "Make", "Webhooks", "REST APIs", "Google Sheets", "Airtable", "Slack API", "Notion API"],
    deliverables: ["Custom n8n workflows", "App-to-app integrations", "Scheduled automations", "Error handling & logging", "Conditional logic & branching", "Documentation", "Team training"],
    process: [
      { title: "Workflow Audit", desc: "We map your current manual processes and identify the highest-impact automation opportunities." },
      { title: "Design & Plan", desc: "We design the workflow architecture, data flow, error handling, and integration points." },
      { title: "Build & Test", desc: "We build the automations, test edge cases, and ensure data flows correctly end-to-end." },
      { title: "Deploy & Train", desc: "We deploy, document everything, and train your team to monitor and manage the workflows." },
    ],
    tiers: [
      { name: "Basic", price: "$399", period: "per workflow", desc: "Simple 2-3 app automation", features: ["1 workflow", "Up to 3 apps connected", "Error notifications", "Documentation", "1 month support"] },
      { name: "Business", price: "$1,299", period: "per project", desc: "Multi-workflow automation system", features: ["Up to 5 workflows", "Unlimited app connections", "Conditional logic", "Data transformation", "Dashboard", "3 months support"], highlighted: true },
      { name: "Enterprise", price: "Custom", period: "quote", desc: "Full business automation suite", features: ["Unlimited workflows", "Custom integrations", "Self-hosted n8n setup", "Real-time monitoring", "Ongoing support", "SLA guarantee"] },
    ],
    faqs: [
      { q: "What tools can you connect?", a: "Virtually any tool with an API — CRMs, email, Slack, Google Workspace, Airtable, Notion, databases, payment systems, and hundreds more." },
      { q: "n8n vs Zapier — which should I use?", a: "n8n is more powerful, self-hostable, and cost-effective for complex workflows. Zapier is simpler for basic automations. We'll recommend the best fit." },
      { q: "What happens if a workflow fails?", a: "We build error handling into every workflow — notifications, retries, and logging so nothing falls through the cracks." },
      { q: "Can you automate AI tasks?", a: "Yes! We combine n8n with AI APIs to create intelligent automations — auto-categorize emails, generate reports, process documents, and more." },
    ],
  },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
  );
}

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { openAuth } = useUI();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const service = SERVICES.find((s) => s.slug === slug);

  if (!service) {
    return (
      <section className="section"><div className="wrap" style={{ textAlign: "center", padding: "4rem" }}>
        <h1 style={{ fontSize: "1.3rem" }}>Service not found</h1>
        <Link href="/services" style={{ color: "var(--accent)", marginTop: "1rem", display: "inline-block" }}>← View all services</Link>
      </div></section>
    );
  }

  return (
    <main>
      {/* Hero */}
      <section className="sd-hero" style={{ "--svc-color": service.color } as React.CSSProperties}>
        <div className="wrap">
          <Link href="/services" className="sd-back">← All Services</Link>
          <div className="sd-hero-content">
            <div>
              <span className="sd-icon">{service.icon}</span>
              <h1>{service.title}</h1>
              <p className="sd-tagline">{service.tagline}</p>
              <p className="sd-long-desc">{service.longDesc}</p>
              <div className="sd-hero-actions">
                <Link href="/contact" className="btn-primary">Start a Project</Link>
                <Link href="/bookings" className="btn-ghost">Book Consultation</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section sd-section">
        <div className="wrap">
          <h2 className="sd-section-title">Tech Stack</h2>
          <p className="sd-section-sub">Tools and technologies we use for {service.title.toLowerCase()} projects.</p>
          <div className="sd-tech-grid">
            {service.techStack.map((t) => (
              <span key={t} className="sd-tech-tag">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="section sd-section">
        <div className="wrap">
          <h2 className="sd-section-title">What You Get</h2>
          <p className="sd-section-sub">Every project includes these deliverables.</p>
          <div className="sd-del-grid">
            {service.deliverables.map((d) => (
              <div key={d} className="sd-del-item">
                <CheckIcon color={service.color} />
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section sd-section" style={{ background: "var(--surface)" }}>
        <div className="wrap">
          <h2 className="sd-section-title">Our Process</h2>
          <p className="sd-section-sub">How we deliver {service.title.toLowerCase()} projects, step by step.</p>
          <div className="sd-process">
            {service.process.map((step, i) => (
              <div key={step.title} className="sd-process-step">
                <div className="sd-process-num" style={{ background: `${service.color}14`, color: service.color }}>{i + 1}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section sd-section">
        <div className="wrap">
          <h2 className="sd-section-title">Pricing</h2>
          <p className="sd-section-sub">Transparent pricing with no hidden fees.</p>
          <div className="sd-tiers">
            {service.tiers.map((tier) => (
              <div key={tier.name} className={"sd-tier" + (tier.highlighted ? " sd-tier-pop" : "")}>
                {tier.highlighted && <span className="sd-tier-badge">Most Popular</span>}
                <h3>{tier.name}</h3>
                <div className="sd-tier-price">
                  <strong>{tier.price}</strong>
                  <span>{tier.period}</span>
                </div>
                <p className="sd-tier-desc">{tier.desc}</p>
                <ul className="sd-tier-features">
                  {tier.features.map((f) => (
                    <li key={f}>
                      <CheckIcon color={tier.highlighted ? service.color : "var(--text-secondary)"} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className={tier.highlighted ? "btn-primary sd-tier-cta" : "btn-ghost sd-tier-cta"}>
                  {tier.price === "Custom" ? "Contact Us" : "Get Started"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section sd-section" style={{ background: "var(--surface)" }}>
        <div className="wrap" style={{ maxWidth: 700 }}>
          <h2 className="sd-section-title">Frequently Asked Questions</h2>
          <div className="sd-faqs">
            {service.faqs.map((faq, i) => (
              <div key={faq.q} className={"sd-faq" + (openFaq === i ? " sd-faq-open" : "")}>
                <button type="button" className="sd-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="sd-faq-icon">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && <p className="sd-faq-a">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ padding: "3rem 1rem 4rem" }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Ready to get started?</h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: 480, margin: ".5rem auto 1.5rem" }}>
            Tell us about your project and we&apos;ll get back to you within 24 hours.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn-primary" style={{ padding: ".7rem 1.75rem" }}>Start a Project</Link>
            <Link href="/bookings" className="btn-ghost" style={{ padding: ".7rem 1.75rem" }}>Book a Call</Link>
          </div>
        </div>
      </section>

      <style>{`
        .sd-hero{padding:3rem 1rem 2.5rem;border-bottom:1px solid var(--border)}
        .sd-back{font-size:.85rem;color:var(--accent);text-decoration:none;font-weight:600;display:inline-block;margin-bottom:1.5rem}
        .sd-hero-content{max-width:700px}
        .sd-icon{font-size:3rem;display:block;margin-bottom:.75rem}
        .sd-hero h1{font-size:clamp(1.8rem,4vw,2.4rem);font-weight:800;margin:0 0 .4rem;letter-spacing:-.02em}
        .sd-tagline{font-size:1.1rem;color:var(--svc-color);font-weight:600;margin:0 0 1rem}
        .sd-long-desc{font-size:.95rem;line-height:1.8;color:var(--text-secondary);margin:0 0 1.5rem}
        .sd-hero-actions{display:flex;gap:.75rem;flex-wrap:wrap}

        .sd-section{padding:3rem 1rem}
        .sd-section-title{font-size:1.4rem;font-weight:800;text-align:center;margin:0 0 .3rem}
        .sd-section-sub{text-align:center;color:var(--text-secondary);font-size:.92rem;margin:0 0 2rem}

        .sd-tech-grid{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center}
        .sd-tech-tag{padding:.45rem 1rem;border-radius:999px;background:var(--surface);border:1px solid var(--border);font-size:.82rem;font-weight:600;color:var(--text-primary);transition:all .15s}
        .sd-tech-tag:hover{border-color:var(--svc-color);color:var(--svc-color)}

        .sd-del-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.6rem;max-width:800px;margin:0 auto}
        .sd-del-item{display:flex;align-items:center;gap:.6rem;padding:.6rem .8rem;border-radius:.5rem;font-size:.88rem;font-weight:500;color:var(--text-primary);background:var(--surface);border:1px solid var(--border)}

        .sd-process{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.25rem;max-width:900px;margin:0 auto}
        .sd-process-step{display:flex;gap:1rem;align-items:flex-start}
        .sd-process-num{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:800;flex-shrink:0}
        .sd-process-step h3{font-size:.95rem;font-weight:700;margin:0 0 .25rem}
        .sd-process-step p{font-size:.82rem;color:var(--text-secondary);line-height:1.6;margin:0}

        .sd-tiers{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem;max-width:960px;margin:0 auto}
        .sd-tier{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.75rem;display:flex;flex-direction:column;position:relative}
        .sd-tier-pop{border-color:var(--svc-color);box-shadow:0 4px 24px rgba(0,0,0,.06)}
        .sd-tier-badge{position:absolute;top:-10px;left:50%;transform:translateX(-50%);padding:.2rem .8rem;border-radius:999px;background:var(--svc-color);color:#fff;font-size:.68rem;font-weight:700;white-space:nowrap}
        .sd-tier h3{font-size:1.05rem;font-weight:700;margin:0 0 .5rem}
        .sd-tier-price{margin-bottom:.5rem}
        .sd-tier-price strong{font-size:1.5rem;font-weight:800}
        .sd-tier-price span{font-size:.78rem;color:var(--text-secondary);margin-left:.25rem}
        .sd-tier-desc{font-size:.82rem;color:var(--text-secondary);margin:0 0 1rem}
        .sd-tier-features{list-style:none;padding:0;margin:0 0 1.5rem;display:flex;flex-direction:column;gap:.4rem;flex:1}
        .sd-tier-features li{display:flex;align-items:center;gap:.5rem;font-size:.82rem;color:var(--text-primary)}
        .sd-tier-cta{text-align:center;display:block;padding:.6rem 1rem;border-radius:.5rem}

        .sd-faqs{display:flex;flex-direction:column;gap:.5rem}
        .sd-faq{background:var(--bg);border:1px solid var(--border);border-radius:.75rem;overflow:hidden;transition:border-color .2s}
        .sd-faq-open{border-color:var(--svc-color)}
        .sd-faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;padding:1rem 1.25rem;background:none;border:none;cursor:pointer;font:inherit;font-size:.92rem;font-weight:600;color:var(--text-primary);text-align:left}
        .sd-faq-icon{font-size:1.2rem;color:var(--text-secondary);flex-shrink:0}
        .sd-faq-a{padding:0 1.25rem 1rem;font-size:.85rem;line-height:1.7;color:var(--text-secondary);margin:0;animation:sdFadeIn .2s ease}
        @keyframes sdFadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}

        @media(max-width:600px){
          .sd-tiers{grid-template-columns:1fr}
          .sd-process{grid-template-columns:1fr}
          .sd-del-grid{grid-template-columns:1fr}
        }
      `}</style>
    </main>
  );
}
