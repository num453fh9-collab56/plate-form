import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Hirelyx team for support, feedback, or business inquiries. Email us at support@hirelyx.com.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="wrap" style={{ paddingBlock: "4rem" }}>
      <h1 className="page-title">Contact Us</h1>

      <section style={{ maxWidth: 620, margin: "2rem auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--muted)" }}>
          Have a question, need help, or want to share feedback? Fill out the form below and we&apos;ll get back to you.
        </p>

        <ContactForm />

        <div style={{ background: "var(--hover)", borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: 4 }}>Email</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              You can also email us directly at{" "}
              <strong style={{ color: "var(--accent)" }}>support@hirelyx.com</strong>
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
              Use the chat widget (bottom-right corner) to message our team directly.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
