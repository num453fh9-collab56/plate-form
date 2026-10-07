"use client";

import Link from "next/link";
import { useUI } from "@/lib/ui";
import { useRouter } from "next/navigation";
import { CATEGORY_OPTIONS } from "@/lib/gigs";

const CATEGORY_COLORS: Record<string, string> = {
  "Programming & Tech": "#00715a",
  "Mobile Apps": "#003912",
  "AI Services": "#7a3e9d",
  "UI/UX Design": "#005a9e",
  "Graphics & Design": "#c2440e",
  "Video & Animation": "#a91d32",
  "Digital Marketing": "#0e6e6e",
  "Writing & Translation": "#8a6d1a",
};

export default function Landing() {
  const { openAuth } = useUI();
  const router = useRouter();

  return (
    <>
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap" style={{ display: "flex", gap: 18, overflowX: "auto", padding: "14px 0" }}>
          {CATEGORY_OPTIONS.map((cat) => (
            <Link
              key={cat}
              href={`/search?category=${encodeURIComponent(cat)}`}
              style={{ whiteSpace: "nowrap", color: "var(--muted)", fontWeight: 600, fontSize: "0.9rem" }}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.15, maxWidth: 640 }}>
            Make it all happen with <span style={{ color: "var(--accent)" }}>freelancers</span>
          </h1>
          <button
            className="btn-primary"
            type="button"
            onClick={() => openAuth("signup")}
            style={{ height: 48, padding: "0 28px", whiteSpace: "nowrap" }}
          >
            Join now
          </button>
        </div>

        <div className="wrap" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <div>
            <strong>Access a pool of top talent</strong>
            <p className="order-note">Across {CATEGORY_OPTIONS.length} categories and thousands of services.</p>
          </div>
          <div>
            <strong>Simple, easy-to-use experience</strong>
            <p className="order-note">Post a project or hire in minutes.</p>
          </div>
          <div>
            <strong>Quality work, within budget</strong>
            <p className="order-note">Secure payment and buyer protection.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 style={{ marginBottom: 18 }}>Popular services</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => router.push(`/search?category=${encodeURIComponent(cat)}`)}
                style={{
                  background: CATEGORY_COLORS[cat] ?? "#00715a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 16,
                  padding: 20,
                  minHeight: 150,
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2>Ready to start?</h2>
          <p className="sub" style={{ margin: "10px auto 20px", maxWidth: 520 }}>
            Create a free account to post projects, hire experts, and get work done.
          </p>
          <button className="btn-primary" type="button" onClick={() => openAuth("signup")}>
            Join Apex for free
          </button>
        </div>
      </section>
    </>
  );
}
