"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function DashboardWelcome() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !user) return null;

  const firstName = (user.name ?? "").split(" ")[0] || "there";

  return (
    <div className="dash-welcome">
      <div className="dash-welcome-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <div className="dash-welcome-copy">
        <h3>Welcome to Hirelyx, {firstName}!</h3>
        <p>Get started in three simple steps and begin your freelancing journey today.</p>
        <div className="dash-welcome-steps">
          <div className="dash-welcome-step">
            <span className="dash-welcome-step-num">1</span>
            Complete Your Profile
          </div>
          <div className="dash-welcome-step">
            <span className="dash-welcome-step-num">2</span>
            Create Your First Gig
          </div>
          <div className="dash-welcome-step">
            <span className="dash-welcome-step-num">3</span>
            Start Earning
          </div>
        </div>
      </div>
      <button
        type="button"
        className="dash-welcome-close"
        aria-label="Dismiss welcome message"
        onClick={() => setDismissed(true)}
      >
        ✕
      </button>
    </div>
  );
}
