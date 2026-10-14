import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Hirelyx team for support, feedback, or business inquiries. Email us at support@hirelyx.com.",
  alternates: { canonical: "/contact" },
};

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "";

export default function ContactPage() {
  return (
    <main className="wrap" style={{ paddingBlock: "4rem" }}>
      <h1 className="page-title">Contact Us</h1>

      <section style={{ maxWidth: 620, margin: "2rem auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--muted)" }}>
          Have a question, need help, or want to share feedback? We&apos;d love to hear from you.
        </p>

        <div style={{ background: "var(--hover)", borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: 4 }}>Email Support</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              For general inquiries, order issues, or account help:
              {SUPPORT_EMAIL ? (
                <>
                  <br />
                  <strong style={{ color: "var(--accent)" }}>{SUPPORT_EMAIL}</strong>
                </>
              ) : (
                <> reach out through the Help Center.</>
              )}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: 4 }}>Response Time</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              We typically respond within 24–48 hours on business days.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: 4 }}>Live Chat</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Use our AI assistant Gemi (bottom-right corner) for instant answers to common questions.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
