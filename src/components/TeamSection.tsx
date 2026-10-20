"use client";

import { useEffect, useRef, useState } from "react";

/* ==========================================================================
   HIRELYX · TEAM SECTION
   Advanced team showcase with animated cards, skill tags, role badges,
   hover effects, and scroll-reveal animations.
   ========================================================================== */

interface TeamMember {
  name: string;
  role: string;
  badge: string;
  badgeColor: string;
  bio: string;
  skills: string[];
  avatar: string;
  gradient: string;
}

const TEAM: TeamMember[] = [
  {
    name: "Ahmad",
    role: "Full-Stack Developer & Founder",
    badge: "Founder",
    badgeColor: "#0066cc",
    bio: "Leads technical vision — frontend, backend, FastAPI, and API integrations. Builds end-to-end with Python, Java, and Next.js.",
    skills: ["Next.js", "Python", "Java", "FastAPI", "API Integration", "Supabase"],
    avatar: "A",
    gradient: "linear-gradient(135deg, #0066cc, #0891b2)",
  },
  {
    name: "Team Member",
    role: "Digital Marketing Specialist",
    badge: "Marketing Lead",
    badgeColor: "#059669",
    bio: "Drives growth through SEO, Web Analytics, Social Media Marketing, and Meta Ads campaigns that deliver measurable results.",
    skills: ["SEO", "Meta Ads", "Google Analytics", "Social Media", "Web Analytics"],
    avatar: "M",
    gradient: "linear-gradient(135deg, #059669, #10b981)",
  },
  {
    name: "Team Member",
    role: "AI Agent & n8n Developer",
    badge: "AI & Automation",
    badgeColor: "#7c3aed",
    bio: "Builds custom AI agents and n8n automation workflows that eliminate manual work and supercharge business operations.",
    skills: ["Custom AI Agents", "n8n", "LangChain", "Prompt Engineering", "Workflow Automation"],
    avatar: "N",
    gradient: "linear-gradient(135deg, #7c3aed, #a855f7)",
  },
  {
    name: "Team Member",
    role: "Social Media AI & Animation",
    badge: "Content Lead",
    badgeColor: "#ea580c",
    bio: "Creates AI-powered animation videos, reels, and social media content that captures audiences and grows your brand.",
    skills: ["AI Animation", "Video Editing", "Social Media AI", "Reels", "Content Strategy"],
    avatar: "S",
    gradient: "linear-gradient(135deg, #ea580c, #f97316)",
  },
];

function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={"team-card reveal" + (hovered ? " team-card-hover" : "")}
      style={{ transitionDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="team-card-top">
        <div className="team-avatar" style={{ background: member.gradient }}>
          <span>{member.avatar}</span>
          <div className="team-avatar-ring" />
        </div>
        <div className="team-badge" style={{ background: `${member.badgeColor}14`, color: member.badgeColor }}>
          {member.badge}
        </div>
      </div>

      <h3 className="team-name">{member.name}</h3>
      <p className="team-role">{member.role}</p>
      <p className="team-bio">{member.bio}</p>

      <div className="team-skills">
        {member.skills.map((skill) => (
          <span key={skill} className="team-skill" style={{ borderColor: `${member.badgeColor}30`, color: member.badgeColor }}>
            {skill}
          </span>
        ))}
      </div>

      <div className="team-card-glow" style={{ background: member.gradient }} />
    </div>
  );
}

export default function TeamSection() {
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
      { threshold: 0.1 },
    );
    const children = el.querySelectorAll(".reveal");
    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section team-section" id="team" ref={ref}>
      <div className="wrap">
        <div className="land-section-head reveal">
          <span className="land-kicker">Our Team</span>
          <h2>Meet the People Behind Hirelyx</h2>
          <p>A talented team of developers, designers, and engineers ready to build your next project.</p>
        </div>

        <div className="team-grid">
          {TEAM.map((member, i) => (
            <TeamCard key={member.role} member={member} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        .team-section {
          padding: 5rem 0;
        }
        .team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-top: 3rem;
        }
        .team-card {
          position: relative;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          padding: 2rem 1.5rem 1.75rem;
          text-align: center;
          overflow: hidden;
          transition: transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s cubic-bezier(.4,0,.2,1), border-color 0.35s;
        }
        .team-card-hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.12);
          border-color: transparent;
        }
        .team-card-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .team-avatar {
          position: relative;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.02em;
        }
        .team-avatar-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          pointer-events: none;
        }
        .team-card-hover .team-avatar {
          transform: scale(1.08);
          transition: transform 0.35s cubic-bezier(.4,0,.2,1);
        }
        .team-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .team-name {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0.5rem 0 0.15rem;
          color: var(--text-primary);
        }
        .team-role {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin: 0 0 0.75rem;
          font-weight: 500;
        }
        .team-bio {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 1rem;
        }
        .team-skills {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.4rem;
        }
        .team-skill {
          display: inline-block;
          padding: 0.22rem 0.6rem;
          border-radius: 999px;
          font-size: 0.68rem;
          font-weight: 600;
          border: 1.5px solid;
          letter-spacing: 0.01em;
          transition: background 0.2s, transform 0.2s;
        }
        .team-card-hover .team-skill {
          background: rgba(0,0,0,0.03);
        }
        .team-card-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          opacity: 0;
          transition: opacity 0.35s;
        }
        .team-card-hover .team-card-glow {
          opacity: 1;
        }

        @media (max-width: 1024px) {
          .team-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .team-grid { grid-template-columns: 1fr; max-width: 400px; margin: 2rem auto 0; }
          .team-card { padding: 1.5rem 1.25rem; }
        }
      `}</style>
    </section>
  );
}
