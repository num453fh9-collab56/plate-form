"use client";

import { useEffect, useRef, useState } from "react";

interface TeamMember {
  name: string;
  role: string;
  badge: string;
  badgeColor: string;
  bio: string;
  skills: string[];
  certifications: string[];
  experience: string;
  avatar: string;
  gradient: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

const TEAM: TeamMember[] = [
  {
    name: "Ahmad",
    role: "Full-Stack Developer & Founder",
    badge: "Founder",
    badgeColor: "#0066cc",
    bio: "Leads technical vision — frontend, backend, FastAPI, and API integrations. Builds end-to-end with Python, Java, and Next.js.",
    skills: ["Next.js", "Python", "Java", "FastAPI", "TypeScript", "Supabase"],
    certifications: ["PIAIC Certified", "Full-Stack Development"],
    experience: "3+ Years",
    avatar: "A",
    gradient: "linear-gradient(135deg, #0066cc, #0891b2)",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Nauman Ali",
    role: "Frontend Developer & UI/UX Designer",
    badge: "Frontend Lead",
    badgeColor: "#4f46e5",
    bio: "Crafts pixel-perfect interfaces with React and Next.js. Specializes in responsive design, animations, and user experience.",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Figma", "UI/UX"],
    certifications: ["Google UX Design", "Meta Frontend Developer"],
    experience: "2+ Years",
    avatar: "N",
    gradient: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Team Member",
    role: "Digital Marketing Specialist",
    badge: "Marketing Lead",
    badgeColor: "#059669",
    bio: "Drives growth through SEO, Web Analytics, Social Media Marketing, and Meta Ads campaigns that deliver measurable results.",
    skills: ["SEO", "Meta Ads", "Google Analytics", "Social Media", "Content Strategy"],
    certifications: ["Google Ads Certified", "Meta Blueprint"],
    experience: "4+ Years",
    avatar: "M",
    gradient: "linear-gradient(135deg, #059669, #10b981)",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Team Member",
    role: "AI Agent & Automation Developer",
    badge: "AI & Automation",
    badgeColor: "#7c3aed",
    bio: "Builds custom AI agents and n8n automation workflows that eliminate manual work and supercharge business operations.",
    skills: ["Custom AI Agents", "n8n", "LangChain", "Python", "Prompt Engineering"],
    certifications: ["OpenAI Developer", "n8n Expert"],
    experience: "3+ Years",
    avatar: "AI",
    gradient: "linear-gradient(135deg, #7c3aed, #a855f7)",
    github: "https://github.com",
  },
  {
    name: "Team Member",
    role: "Social Media AI & Animation",
    badge: "Content Lead",
    badgeColor: "#ea580c",
    bio: "Creates AI-powered animation videos, reels, and social media content that captures audiences and grows your brand.",
    skills: ["AI Animation", "Video Editing", "RunwayML", "After Effects", "Content Strategy"],
    certifications: ["Adobe Certified", "AI Video Production"],
    experience: "2+ Years",
    avatar: "S",
    gradient: "linear-gradient(135deg, #ea580c, #f97316)",
    linkedin: "https://linkedin.com",
  },
];

function SocialIcon({ type }: { type: "linkedin" | "github" | "portfolio" }) {
  if (type === "linkedin") return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.3 6.5a1.78 1.78 0 0 1-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66z" /></svg>
  );
  if (type === "github") return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
  );
}

function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  const [hovered, setHovered] = useState(false);
  const hasSocials = member.linkedin || member.github || member.portfolio;

  return (
    <div
      className={"tm-card reveal" + (hovered ? " tm-card-hover" : "")}
      style={{ transitionDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="tm-card-top">
        <div className="tm-avatar" style={{ background: member.gradient }}>
          <span>{member.avatar}</span>
        </div>
        <div className="tm-badge" style={{ background: `${member.badgeColor}14`, color: member.badgeColor }}>
          {member.badge}
        </div>
      </div>

      <h3 className="tm-name">{member.name}</h3>
      <p className="tm-role">{member.role}</p>

      {/* Experience & Verified */}
      <div className="tm-meta">
        <span className="tm-exp">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          {member.experience}
        </span>
        <span className="tm-verified">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          Verified
        </span>
      </div>

      <p className="tm-bio">{member.bio}</p>

      {/* Certifications */}
      {member.certifications.length > 0 && (
        <div className="tm-certs">
          {member.certifications.map((cert) => (
            <span key={cert} className="tm-cert">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={member.badgeColor} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="8" r="6" /><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" /></svg>
              {cert}
            </span>
          ))}
        </div>
      )}

      {/* Skills */}
      <div className="tm-skills">
        {member.skills.map((skill) => (
          <span key={skill} className="tm-skill" style={{ borderColor: `${member.badgeColor}30`, color: member.badgeColor }}>
            {skill}
          </span>
        ))}
      </div>

      {/* Social Links */}
      {hasSocials && (
        <div className="tm-socials">
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="tm-social" style={{ color: "#0077b5" }} aria-label="LinkedIn">
              <SocialIcon type="linkedin" />
            </a>
          )}
          {member.github && (
            <a href={member.github} target="_blank" rel="noopener noreferrer" className="tm-social" style={{ color: "var(--text-primary)" }} aria-label="GitHub">
              <SocialIcon type="github" />
            </a>
          )}
          {member.portfolio && (
            <a href={member.portfolio} target="_blank" rel="noopener noreferrer" className="tm-social" style={{ color: member.badgeColor }} aria-label="Portfolio">
              <SocialIcon type="portfolio" />
            </a>
          )}
        </div>
      )}

      <div className="tm-glow" style={{ background: member.gradient }} />
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
          <p>A verified team of developers, marketers, and AI specialists — real skills, real results.</p>
        </div>

        <div className="tm-grid">
          {TEAM.map((member, i) => (
            <TeamCard key={member.role} member={member} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        .team-section { padding: 5rem 0 }

        .tm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem; margin-top: 3rem;
        }

        .tm-card {
          position: relative; background: var(--surface);
          border: 1px solid var(--border); border-radius: 1.25rem;
          padding: 2rem 1.5rem 1.75rem; text-align: center; overflow: hidden;
          transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s, border-color .35s;
          display: flex; flex-direction: column; align-items: center;
        }
        .tm-card-hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,.12);
          border-color: transparent;
        }

        .tm-card-top { display: flex; flex-direction: column; align-items: center; gap: .75rem; margin-bottom: .75rem }

        .tm-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; font-weight: 800; color: #fff;
          transition: transform .35s cubic-bezier(.4,0,.2,1);
        }
        .tm-card-hover .tm-avatar { transform: scale(1.08) }

        .tm-badge {
          display: inline-block; padding: .25rem .75rem; border-radius: 999px;
          font-size: .68rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
        }

        .tm-name { font-size: 1.1rem; font-weight: 700; margin: .4rem 0 .1rem; color: var(--text-primary) }
        .tm-role { font-size: .8rem; color: var(--text-secondary); margin: 0 0 .5rem; font-weight: 500 }

        .tm-meta {
          display: flex; align-items: center; gap: .75rem; margin-bottom: .6rem;
          font-size: .72rem; font-weight: 600;
        }
        .tm-exp { display: flex; align-items: center; gap: .25rem; color: var(--text-secondary) }
        .tm-verified { display: flex; align-items: center; gap: .25rem; color: #059669 }

        .tm-bio { font-size: .8rem; color: var(--text-secondary); line-height: 1.6; margin: 0 0 .75rem }

        .tm-certs { display: flex; flex-wrap: wrap; justify-content: center; gap: .35rem; margin-bottom: .75rem }
        .tm-cert {
          display: inline-flex; align-items: center; gap: .3rem;
          padding: .2rem .55rem; border-radius: 999px;
          font-size: .65rem; font-weight: 600; color: var(--text-primary);
          background: var(--bg); border: 1px solid var(--border);
        }

        .tm-skills { display: flex; flex-wrap: wrap; justify-content: center; gap: .35rem; margin-bottom: .75rem }
        .tm-skill {
          display: inline-block; padding: .2rem .55rem; border-radius: 999px;
          font-size: .65rem; font-weight: 600; border: 1.5px solid;
          transition: background .2s;
        }
        .tm-card-hover .tm-skill { background: var(--hover) }

        .tm-socials { display: flex; gap: .5rem; margin-top: auto; padding-top: .25rem }
        .tm-social {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg); border: 1px solid var(--border);
          transition: transform .2s, box-shadow .2s;
          text-decoration: none;
        }
        .tm-social:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.1) }

        .tm-glow {
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          opacity: 0; transition: opacity .35s;
        }
        .tm-card-hover .tm-glow { opacity: 1 }

        @media (max-width: 600px) {
          .tm-grid { grid-template-columns: 1fr; max-width: 400px; margin: 2rem auto 0 }
          .tm-card { padding: 1.5rem 1.25rem }
        }
      `}</style>
    </section>
  );
}
