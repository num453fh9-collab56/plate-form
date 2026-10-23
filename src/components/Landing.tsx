"use client";

import { useEffect, useRef, useState } from "react";
import { useUI } from "@/lib/ui";
import { LANDING_VIDEOS } from "@/lib/site-media";
import TeamSection from "./TeamSection";

/* ==========================================================================
   HIRELYX · LANDING PAGE — SERVICES / PORTFOLIO SITE
   Shown to visitors. Showcases team skills, portfolio, and contact.
   ========================================================================== */

function Playlist({ srcs }: { srcs: string[] }) {
  const [index, setIndex] = useState(0);
  return (
    <video
      key={index}
      src={srcs[index]}
      autoPlay
      muted
      playsInline
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      onEnded={() => setIndex((i) => (i + 1) % srcs.length)}
    />
  );
}

const SERVICES = [
  {
    title: "Programming & Tech",
    desc: "Full-stack web development — frontend, backend, FastAPI, API integration. Built with Java, Python, Next.js, and modern frameworks.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    ),
    color: "#0066cc",
  },
  {
    title: "Digital Marketing",
    desc: "SEO, Web Analytics, Social Media Marketing, and Meta Ads campaigns that drive real traffic and measurable growth.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    ),
    color: "#059669",
  },
  {
    title: "Custom AI Agents",
    desc: "Automate your business workflows with custom AI agents, n8n integrations, and intelligent automation pipelines.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" /><path d="M16 14h.01" /><path d="M8 14h.01" /><path d="M12 17v3" /><path d="M6 21h12" /><path d="M20 10a8 8 0 0 1-16 0" /></svg>
    ),
    color: "#7c3aed",
  },
  {
    title: "Social Media AI & Animation",
    desc: "AI-powered social media content, animated videos, reels, and visual storytelling that captures your audience.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
    ),
    color: "#ea580c",
  },
  {
    title: "Prompt Engineering",
    desc: "Expert prompt design and optimization for ChatGPT, Claude, and custom LLMs. Get better AI outputs for your business.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    ),
    color: "#dc2626",
  },
  {
    title: "n8n & Workflow Automation",
    desc: "Build powerful automation workflows with n8n — connect your apps, automate tasks, and eliminate manual work.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
    ),
    color: "#0891b2",
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Tell Us What You Need",
    desc: "Reach out through our contact form or chat. Describe your project, timeline, and budget — we'll take it from there.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    ),
  },
  {
    num: "02",
    title: "We Build It",
    desc: "Our team gets to work. You'll receive regular updates and have full visibility into progress every step of the way.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    ),
  },
  {
    num: "03",
    title: "You Get Results",
    desc: "Review the deliverables, request revisions, and pay securely through Stripe only when you're satisfied.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    ),
  },
];

const WHY_ITEMS = [
  {
    title: "Verified Team",
    desc: "Every member of our team is verified. You always know who you're working with — no anonymous accounts.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
    ),
    color: "#0066cc",
  },
  {
    title: "Secure Payments",
    desc: "Pay securely through Stripe. Your money is protected until you approve the delivered work.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
    ),
    color: "#059669",
  },
  {
    title: "AI-Powered Support",
    desc: "Got questions? Our AI assistant is available 24/7 to help with anything platform-related.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    ),
    color: "#7c3aed",
  },
  {
    title: "Fast Turnaround",
    desc: "We value your time. Most projects are delivered ahead of schedule with no compromise on quality.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    color: "#ea580c",
  },
];

const STATS = [
  { value: "Secure", label: "Stripe Payments" },
  { value: "24/7", label: "AI Support" },
  { value: "100%", label: "Satisfaction Focus" },
  { value: "Fast", label: "Delivery" },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    const children = el.querySelectorAll(".reveal");
    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);
  return ref;
}

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={"land-stat" + (shown ? " visible" : "")}>
      <span className="land-stat-value">{value}</span>
      <span className="land-stat-label">{label}</span>
    </div>
  );
}

export default function Landing() {
  const { openAuth } = useUI();
  const revealRef = useScrollReveal();

  return (
    <div ref={revealRef}>
      {/* ── 1. HERO ── */}
      <section className="land-hero">
        <div className="land-hero-bg">
          {LANDING_VIDEOS.length > 0 ? (
            <Playlist srcs={LANDING_VIDEOS} />
          ) : (
            <div className="land-hero-fallback" aria-hidden="true" />
          )}
          <div className="land-hero-overlay" />
        </div>
        <div className="wrap land-hero-content">
          <span className="land-hero-badge-tag">
            <span className="land-hero-dot" /> Professional Services Team
          </span>
          <h1 className="land-hero-title">
            We build <em>digital products</em> that grow your business
          </h1>
          <p className="land-hero-sub">
            Web apps, mobile apps, AI solutions, and stunning designs — our team
            delivers quality work on time and on budget.
          </p>
          <div className="land-hero-actions">
            <button className="btn-primary land-hero-btn" type="button" onClick={() => openAuth("signup")}>
              Get Started — It&apos;s Free
            </button>
            <button
              className="land-hero-btn-outline"
              type="button"
              onClick={() => {
                document.getElementById("land-services")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Our Services
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. STATS ── */}
      <section className="land-stats-section reveal">
        <div className="wrap">
          <div className="land-stats-inner">
            <span className="land-stats-label">Why clients trust our team</span>
            <div className="land-stats-grid">
              {STATS.map((stat) => (
                <AnimatedStat key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SERVICES ── */}
      <section className="section land-categories reveal" id="land-services">
        <div className="wrap">
          <div className="land-section-head">
            <span className="land-kicker">What We Do</span>
            <h2>Our Services</h2>
            <p>From idea to launch — we handle every stage of your digital project.</p>
          </div>
          <div className="land-cat-grid">
            {SERVICES.map((svc) => (
              <div key={svc.title} className="land-cat-card reveal" style={{ color: svc.color }}>
                <div className="land-cat-card-bg" style={{ background: `linear-gradient(135deg, ${svc.color}12, ${svc.color}06)` }} />
                <div className="land-cat-card-content">
                  <span className="land-cat-card-icon" style={{ background: `${svc.color}12`, color: svc.color }}>{svc.icon}</span>
                  <span className="land-cat-card-name">{svc.title}</span>
                  <p className="land-cat-card-desc">{svc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ── */}
      <section className="section land-how reveal" id="land-how">
        <div className="wrap">
          <div className="land-section-head">
            <span className="land-kicker">Simple Process</span>
            <h2>How It Works</h2>
            <p>Three simple steps to bring your project to life.</p>
          </div>
          <div className="land-steps">
            {PROCESS_STEPS.map((step) => (
              <div key={step.num} className="land-step reveal">
                <div className="land-step-icon">{step.icon}</div>
                <span className="land-step-num">Step {step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="land-steps-connector" aria-hidden="true">
            <span /><span />
          </div>
        </div>
      </section>

      {/* ── 5. WHY HIRELYX ── */}
      <section className="section land-why reveal">
        <div className="wrap">
          <div className="land-section-head">
            <span className="land-kicker">Why Choose Us</span>
            <h2>The Hirelyx Advantage</h2>
            <p>Built for businesses that demand quality.</p>
          </div>
          <div className="land-why-grid">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="land-why-card reveal">
                <div className="land-why-icon" style={{ background: `${item.color}14`, color: item.color }}>
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. TEAM ── */}
      <TeamSection />

      {/* ── 7. VIDEO SECTION ── */}
      <section className="section land-video-section reveal">
        <div className="wrap">
          <div className="land-section-head">
            <span className="land-kicker">See It In Action</span>
            <h2>Watch How We Work</h2>
            <p>See our process and the quality we deliver.</p>
          </div>
          <div className="land-video-wrap">
            {LANDING_VIDEOS.length > 0 ? (
              <div className="land-video-player">
                <Playlist srcs={LANDING_VIDEOS} />
                <span className="land-video-brand">Hirelyx</span>
              </div>
            ) : (
              <div className="land-video-placeholder">
                <div className="land-video-play-btn" aria-hidden="true">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p>Your video will appear here</p>
                <span className="land-video-tag">Coming Soon</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 7. FINAL CTA ── */}
      <section className="section land-final-cta reveal">
        <div className="wrap">
          <div className="land-cta-card">
            <div className="land-cta-glow" aria-hidden="true" />
            <h2>Ready to start your project?</h2>
            <p>
              Tell us what you need and our team will make it happen.
              Quality work, on time, every time.
            </p>
            <div className="land-cta-actions">
              <button className="btn-primary land-cta-btn" type="button" onClick={() => openAuth("signup")}>
                Get Started — It&apos;s Free
              </button>
              <button
                className="land-cta-btn-outline"
                type="button"
                onClick={() => {
                  document.getElementById("land-services")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                View Our Services
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
