"use client";

import type { Gig } from "@/lib/types";

/* Stub — marketplace GigCard kept for user profile page compatibility. */

export default function GigCard({ gig }: { gig: Gig }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "0.75rem",
      padding: "1.25rem",
    }}>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 0.4rem" }}>{gig.title}</h3>
      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>{gig.category}</p>
    </div>
  );
}
