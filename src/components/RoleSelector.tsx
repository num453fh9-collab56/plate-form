"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import type { UserRole } from "@/lib/types";
import BrandMark from "./BrandMark";

const ROLES: { id: UserRole; icon: string; title: string; sub: string; points: string[] }[] = [
  {
    id: "freelancer",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    title: "I'm a Freelancer",
    sub: "I want to offer my services and earn money",
    points: ["Create service listings (Lyxes)", "Set your own rates", "Build your portfolio", "Get hired by clients worldwide"],
  },
  {
    id: "buyer",
    icon: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8v4h8V3z",
    title: "I'm a Buyer",
    sub: "I want to hire talented freelancers for my projects",
    points: ["Browse thousands of services", "Post project requests", "Manage orders & deliveries", "Find verified professionals"],
  },
  {
    id: "both",
    icon: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a3 3 0 110 6 3 3 0 010-6zm0 14.2a8 8 0 01-6.4-3.2c.03-2.12 4.27-3.28 6.4-3.28s6.37 1.16 6.4 3.28A8 8 0 0112 20.2z",
    title: "I Do Both",
    sub: "I hire freelancers and also offer my own services",
    points: ["Full access to all features", "Switch between buyer & seller", "Separate dashboards for each", "Maximum flexibility"],
  },
];

export default function RoleSelector() {
  const { updateProfile } = useAuth();
  const { closeRoleSelector, openProfile, openBuyerOnboard } = useUI();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [saving, setSaving] = useState(false);

  const handleContinue = () => {
    if (!selected || saving) return;
    setSaving(true);
    updateProfile({ role: selected });

    if (selected === "buyer") {
      closeRoleSelector();
      openBuyerOnboard();
    } else {
      closeRoleSelector();
      openProfile();
    }
  };

  return (
    <div className="ob-shell" role="dialog" aria-modal="true" aria-labelledby="roleSelectorTitle">
      <div className="ob-aurora" aria-hidden="true" />

      <header className="ob-topbar">
        <span className="ob-brand">
          <BrandMark className="ob-brand-mark" />
          <b>Hire<span>lyx</span></b>
        </span>
      </header>

      <main className="ob-main">
        <div className="ob-flow" style={{ maxWidth: 860 }}>
          <div className="ob-entry-head" style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="ob-kicker">
              <span className="ob-kicker-dot" aria-hidden="true" />
              Welcome to Hirelyx
            </span>
            <h1 id="roleSelectorTitle">How do you want to use Hirelyx?</h1>
            <p>Choose your role to get a personalized experience. You can always change this later.</p>
          </div>

          <div className="role-cards">
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                className={"role-card" + (selected === role.id ? " selected" : "")}
                onClick={() => setSelected(role.id)}
              >
                {role.id === "both" && <span className="role-card-badge">Most Flexible</span>}
                <span className="role-card-icon" aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={role.icon} />
                  </svg>
                </span>
                <h2>{role.title}</h2>
                <p>{role.sub}</p>
                <ul>
                  {role.points.map((point) => (
                    <li key={point}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>
                <span className="role-card-check" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 36 }}>
            <button
              type="button"
              className="ob-btn-primary"
              disabled={!selected || saving}
              onClick={handleContinue}
              style={{ minWidth: 220, fontSize: "1.05rem", padding: "14px 40px" }}
            >
              {saving ? "Setting up…" : "Continue"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
