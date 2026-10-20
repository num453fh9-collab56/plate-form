"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, computeProfileStrength } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import DashboardWelcome from "@/components/DashboardWelcome";
import TwoFactorSetup from "@/components/TwoFactorSetup";

/* ==========================================================================
   HIRELYX · CLIENT DASHBOARD
   Clean dashboard with profile overview, quick actions,
   profile strength meter, and account management.
   ========================================================================== */

function ProfileStrengthCard() {
  const { profile } = useAuth();
  const { openProfile } = useUI();
  const strength = computeProfileStrength(profile);
  const pct = strength.percent;
  const color = pct >= 80 ? "#059669" : pct >= 50 ? "#ea580c" : "#dc2626";

  return (
    <div className="db-card db-strength">
      <h3>Profile Strength</h3>
      <div className="db-strength-ring">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 264} 264`}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <span className="db-strength-pct" style={{ color }}>{pct}%</span>
      </div>
      <div className="db-strength-items">
        {strength.items.slice(0, 5).map((item) => (
          <div key={item.key} className={"db-strength-item" + (item.done ? " done" : "")}>
            <span className="db-strength-check">{item.done ? "✓" : "○"}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      {pct < 100 && (
        <button type="button" className="btn-primary db-btn-small" onClick={openProfile}>
          Complete Profile
        </button>
      )}
    </div>
  );
}

function QuickActions() {
  const { openProfile, openAccount, openMessages } = useUI();

  const actions = [
    { label: "Edit Profile", icon: "✏️", action: openProfile },
    { label: "Account Settings", icon: "⚙️", action: openAccount },
    { label: "Messages", icon: "💬", action: openMessages },
    { label: "Chat Inbox", icon: "📨", href: "/dashboard/chat" },
    { label: "My Projects", icon: "📊", href: "/projects" },
    { label: "Book Consultation", icon: "📅", href: "/bookings" },
    { label: "My Invoices", icon: "📄", href: "/invoices" },
    { label: "Manage Projects", icon: "🗂️", href: "/dashboard/projects" },
    { label: "Manage Bookings", icon: "🗓️", href: "/dashboard/bookings" },
    { label: "Manage Invoices", icon: "💳", href: "/dashboard/invoices" },
    { label: "Reviews", icon: "⭐", href: "/reviews" },
    { label: "Manage Reviews", icon: "✅", href: "/dashboard/reviews" },
    { label: "Analytics", icon: "📈", href: "/dashboard/analytics" },
    { label: "Manage Blog", icon: "✍️", href: "/dashboard/blog" },
    { label: "Our Services", icon: "🌐", href: "/services" },
  ];

  return (
    <div className="db-card db-actions">
      <h3>Quick Actions</h3>
      <div className="db-actions-grid">
        {actions.map((a) =>
          a.href ? (
            <Link key={a.label} href={a.href} className="db-action-btn">
              <span className="db-action-icon">{a.icon}</span>
              <span>{a.label}</span>
            </Link>
          ) : (
            <button key={a.label} type="button" className="db-action-btn" onClick={a.action}>
              <span className="db-action-icon">{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}

function ProfileOverview() {
  const { user, profile } = useAuth();
  if (!user) return null;

  return (
    <div className="db-card db-overview">
      <div className="db-overview-top">
        <div className="db-overview-avatar">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar} alt="" />
          ) : (
            <span>{(user.name ?? "U")[0].toUpperCase()}</span>
          )}
        </div>
        <div className="db-overview-info">
          <h3>{profile.fullName || user.name || "User"}</h3>
          <p>{profile.title || "Hirelyx Member"}</p>
          <span className="db-overview-email">{user.email}</span>
        </div>
      </div>
      {profile.bio && <p className="db-overview-bio">{profile.bio}</p>}
      {profile.skills && profile.skills.length > 0 && (
        <div className="db-overview-skills">
          {profile.skills.slice(0, 8).map((skill: string) => (
            <span key={skill} className="db-overview-skill">{skill}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardInner() {
  const { user } = useAuth();
  const { openAuth } = useUI();

  if (!user) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Sign in to access your dashboard</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Manage your profile, track projects, and connect with our team.
            </p>
            <button className="btn-primary" type="button" onClick={() => openAuth("login")}>Sign in</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head" style={{ paddingTop: 0 }}>
          <div>
            <h2>Dashboard</h2>
            <p className="sub">Welcome back to Hirelyx.</p>
          </div>
        </div>

        <DashboardWelcome />

        <div className="db-grid">
          <ProfileOverview />
          <ProfileStrengthCard />
          <QuickActions />
        </div>

        <TwoFactorSetup />
      </div>

      <style>{`
        .db-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin: 2rem 0;
        }
        .db-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.75rem;
        }
        .db-card h3 {
          font-size: 0.92rem;
          font-weight: 700;
          margin: 0 0 1rem;
          color: var(--text-primary);
        }

        /* Profile Overview */
        .db-overview {
          grid-column: 1 / -1;
        }
        .db-overview-top {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 1rem;
        }
        .db-overview-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0066cc, #0891b2);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .db-overview-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .db-overview-avatar span {
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
        }
        .db-overview-info h3 {
          font-size: 1.15rem;
          margin: 0;
        }
        .db-overview-info p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0.15rem 0;
        }
        .db-overview-email {
          font-size: 0.75rem;
          color: var(--text-secondary);
          opacity: 0.7;
        }
        .db-overview-bio {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 1rem;
        }
        .db-overview-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .db-overview-skill {
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 600;
          background: rgba(0,102,204,0.08);
          color: #0066cc;
        }

        /* Strength */
        .db-strength {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .db-strength-ring {
          position: relative;
          margin-bottom: 1rem;
        }
        .db-strength-pct {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
        }
        .db-strength-items {
          width: 100%;
          text-align: left;
          margin-bottom: 1rem;
        }
        .db-strength-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .db-strength-item.done {
          color: #059669;
        }
        .db-strength-check {
          width: 18px;
          text-align: center;
          font-weight: 700;
        }
        .db-btn-small {
          padding: 0.5rem 1.25rem;
          font-size: 0.8rem;
        }

        /* Quick Actions */
        .db-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
        }
        .db-action-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.7rem 0.9rem;
          border: 1.5px solid var(--border);
          border-radius: 0.6rem;
          background: var(--bg);
          font: inherit;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-primary);
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .db-action-btn:hover {
          border-color: var(--accent, #0066cc);
          background: rgba(0,102,204,0.04);
          transform: translateY(-1px);
        }
        .db-action-icon {
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .db-grid { grid-template-columns: 1fr; }
          .db-overview { grid-column: 1; }
        }
      `}</style>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<section className="section"><div className="wrap"><p style={{ color: "var(--muted)" }}>Loading dashboard...</p></div></section>}>
      <DashboardInner />
    </Suspense>
  );
}
