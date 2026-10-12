"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useUI } from "@/lib/ui";
import { useRouter } from "next/navigation";
import { CATEGORY_OPTIONS } from "@/lib/gigs";
import { LANDING_VIDEOS } from "@/lib/site-media";

/* ==========================================================================
   HIRELYX · LANDING PAGE
   Shown to visitors who are not signed in. Designed to convert.
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

const CATEGORY_IMAGES: Record<string, string> = {
  "Programming & Tech": "/portfolio/saas-analytics-dashboard.jpg",
  "Mobile Apps": "/portfolio/mobile-banking-app.jpg",
  "AI Services": "/portfolio/ai-support-agent.jpg",
  "UI/UX Design": "/portfolio/ecommerce-storefront.jpg",
  "Graphics & Design": "/portfolio/brand-identity-system.jpg",
  "Video & Animation": "/portfolio/short-form-video-engine.jpg",
  "Digital Marketing": "/portfolio/meta-ads-campaign.jpg",
  "Writing & Translation": "/portfolio/seo-content-engine.jpg",
};

const CATEGORY_ICONS: Record<string, ReactNode> = {
  "Programming & Tech": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
  ),
  "Mobile Apps": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
  ),
  "AI Services": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" /><path d="M16 14h.01" /><path d="M8 14h.01" /><path d="M12 17v3" /><path d="M6 21h12" /><path d="M20 10a8 8 0 0 1-16 0" /></svg>
  ),
  "UI/UX Design": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
  ),
  "Graphics & Design": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" /></svg>
  ),
  "Video & Animation": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
  ),
  "Digital Marketing": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  ),
  "Writing & Translation": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
  ),
};

const STATS = [
  { value: "Secure", label: "Escrow Payments" },
  { value: "0%", label: "Buyer Fee" },
  { value: "24/7", label: "AI Support" },
  { value: "16", label: "Languages" },
];

const STEPS = [
  {
    num: "01",
    title: "Post Your Project",
    desc: "Describe what you need — from a logo to a full app. Get matched with the right experts in minutes.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
    ),
  },
  {
    num: "02",
    title: "Hire the Best",
    desc: "Browse profiles, compare portfolios, read reviews. Hire with confidence — every freelancer is verified.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
  },
  {
    num: "03",
    title: "Get Results",
    desc: "Collaborate seamlessly, track progress, and pay securely. Only release payment when you're satisfied.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    ),
  },
];

const WHY_ITEMS = [
  {
    title: "Verified Talent",
    desc: "Every freelancer goes through a rigorous vetting process. Skills, portfolio, and identity — all verified.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
    ),
    color: "#0066cc",
  },
  {
    title: "Secure Payments",
    desc: "Your money stays safe in escrow until you approve the work. Stripe-powered, bank-level security.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
    ),
    color: "#059669",
  },
  {
    title: "24/7 Support",
    desc: "Our dedicated team is always here to help. Real humans, real solutions, around the clock.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    ),
    color: "#7c3aed",
  },
  {
    title: "Money-Back Guarantee",
    desc: "Not satisfied? Get a full refund. We stand behind the quality of work delivered on Hirelyx.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
    ),
    color: "#ea580c",
  },
];

const TESTIMONIALS: { name: string; role: string; avatar: string; color: string; rating: number; text: string }[] = [];

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

function StarRating({ count }: { count: number }) {
  return (
    <span className="land-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export default function Landing() {
  const { openAuth } = useUI();
  const router = useRouter();
  const revealRef = useScrollReveal();

  return (
    <div ref={revealRef}>
      {/* ── Category Bar ── */}
      <div className="land-cat-bar">
        <div className="wrap land-cat-scroll">
          {CATEGORY_OPTIONS.map((cat) => (
            <Link
              key={cat}
              href={`/search?category=${encodeURIComponent(cat)}`}
              className="land-cat-link"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

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
            <span className="land-hero-dot" /> #1 Freelance Marketplace
          </span>
          <h1 className="land-hero-title">
            Find the perfect <em>freelance</em> services for your business
          </h1>
          <p className="land-hero-sub">
            Hire expert freelancers for any project. From stunning designs to powerful applications —
            get quality work done, fast.
          </p>
          <div className="land-hero-actions">
            <button className="btn-primary land-hero-btn" type="button" onClick={() => openAuth("signup")}>
              Get Started — It&apos;s Free
            </button>
            <button
              className="land-hero-btn-outline"
              type="button"
              onClick={() => {
                document.getElementById("land-how")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              How It Works
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. TRUSTED BY / STATS ── */}
      <section className="land-stats-section reveal">
        <div className="wrap">
          <div className="land-stats-inner">
            <span className="land-stats-label">Why freelancers &amp; businesses choose Hirelyx</span>
            <div className="land-stats-grid">
              {STATS.map((stat) => (
                <AnimatedStat key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ── */}
      <section className="section land-how reveal" id="land-how">
        <div className="wrap">
          <div className="land-section-head">
            <span className="land-kicker">Simple Process</span>
            <h2>How Hirelyx Works</h2>
            <p>Three simple steps to get your project done by world-class freelancers.</p>
          </div>
          <div className="land-steps">
            {STEPS.map((step) => (
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

      {/* ── 4. CATEGORIES SHOWCASE ── */}
      <section className="section land-categories reveal">
        <div className="wrap">
          <div className="land-section-head">
            <span className="land-kicker">Explore</span>
            <h2>Popular Services</h2>
            <p>Browse talent across every category. Whatever you need, there&apos;s a freelancer for it.</p>
          </div>
          <div className="land-cat-grid">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                className="land-cat-card reveal"
                onClick={() => router.push(`/search?category=${encodeURIComponent(cat)}`)}
              >
                <div
                  className="land-cat-card-bg"
                  style={{ backgroundImage: `url(${CATEGORY_IMAGES[cat]})` }}
                />
                <div className="land-cat-card-content">
                  <span className="land-cat-card-icon">
                    {CATEGORY_ICONS[cat] ?? null}
                  </span>
                  <span className="land-cat-card-name">{cat}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. WHY HIRELYX ── */}
      <section className="section land-why reveal">
        <div className="wrap">
          <div className="land-section-head">
            <span className="land-kicker">Why Choose Us</span>
            <h2>The Hirelyx Advantage</h2>
            <p>Built for ambitious businesses and talented professionals.</p>
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

      {/* ── 6. VIDEO SECTION ── */}
      <section className="section land-video-section reveal">
        <div className="wrap">
          <div className="land-section-head">
            <span className="land-kicker">See It In Action</span>
            <h2>Watch How It Works</h2>
            <p>See how Hirelyx connects businesses with world-class freelance talent.</p>
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

      {/* ── 7. TESTIMONIALS — only shown when real reviews exist ── */}
      {TESTIMONIALS.length > 0 && (
        <section className="section land-testimonials reveal">
          <div className="wrap">
            <div className="land-section-head">
              <span className="land-kicker">Testimonials</span>
              <h2>What Our Users Say</h2>
              <p>Real feedback from real users.</p>
            </div>
            <div className="land-testimonial-grid">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="land-testimonial reveal">
                  <StarRating count={t.rating} />
                  <p className="land-testimonial-text">&ldquo;{t.text}&rdquo;</p>
                  <div className="land-testimonial-author">
                    <span className="land-testimonial-avatar" style={{ background: t.color }}>
                      {t.avatar}
                    </span>
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. FINAL CTA ── */}
      <section className="section land-final-cta reveal">
        <div className="wrap">
          <div className="land-cta-card">
            <div className="land-cta-glow" aria-hidden="true" />
            <h2>Ready to get started?</h2>
            <p>
              Start hiring expert freelancers or offer your skills to the world.
              Create your free account today.
            </p>
            <div className="land-cta-actions">
              <button className="btn-primary land-cta-btn" type="button" onClick={() => openAuth("signup")}>
                Join Hirelyx — It&apos;s Free
              </button>
              <button
                className="land-cta-btn-outline"
                type="button"
                onClick={() => router.push("/search")}
              >
                Browse Talent
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
