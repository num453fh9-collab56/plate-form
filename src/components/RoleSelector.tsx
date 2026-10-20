"use client";

import { useUI } from "@/lib/ui";

export default function RoleSelector() {
  const { closeRoleSelector } = useUI();

  return (
    <div className="overlay-backdrop" onClick={closeRoleSelector}>
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "1rem",
          padding: "2.5rem",
          maxWidth: "24rem",
          width: "90vw",
          textAlign: "center",
          boxShadow: "0 24px 64px rgba(0,0,0,.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: "1.3rem", marginTop: 0 }}>Welcome to Hirelyx</h2>
        <p style={{ color: "var(--text-secondary)", margin: "0.5rem 0 1.5rem", fontSize: "0.9rem" }}>
          You&apos;re all set! Explore our services and start your first project.
        </p>
        <button className="btn-primary" onClick={closeRoleSelector}>
          Get Started
        </button>
      </div>
    </div>
  );
}
