import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Hirelyx team for support, feedback, or business inquiries. Email us at support@hirelyx.com.",
  alternates: { canonical: "/contact" },
};

const CONTACT_METHODS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    ),
    title: "Email Us",
    desc: "For general inquiries and support",
    value: "support@hirelyx.com",
    href: "mailto:support@hirelyx.com",
    color: "#0066cc",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    ),
    title: "Live Chat",
    desc: "Chat with Gemi, our AI assistant",
    value: "Available 24/7",
    color: "#7c3aed",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    ),
    title: "Book a Call",
    desc: "Schedule a free consultation",
    value: "Pick a time slot",
    href: "/bookings",
    color: "#059669",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
    title: "Response Time",
    desc: "We typically reply within",
    value: "24–48 hours",
    color: "#ea580c",
  },
];

export default function ContactPage() {
  return (
    <main>
      <section style={{ textAlign: "center", padding: "3.5rem 1rem 1.5rem" }}>
        <div className="wrap">
          <span className="land-kicker" style={{ display: "inline-block" }}>Get In Touch</span>
          <h1 className="page-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0.75rem 0" }}>
            Let&apos;s Talk About Your Project
          </h1>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--text-secondary)", maxWidth: 560, margin: "0 auto" }}>
            Have a question, need help, or ready to start? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: "4rem" }}>
        <div className="ct-grid">
          <div className="ct-info">
            <div className="ct-methods">
              {CONTACT_METHODS.map((m) => (
                <div key={m.title} className="ct-method">
                  <div className="ct-method-icon" style={{ background: `${m.color}12`, color: m.color }}>
                    {m.icon}
                  </div>
                  <div className="ct-method-body">
                    <h3>{m.title}</h3>
                    <p>{m.desc}</p>
                    {m.href ? (
                      m.href.startsWith("mailto:") ? (
                        <a href={m.href} className="ct-method-link" style={{ color: m.color }}>{m.value}</a>
                      ) : (
                        <Link href={m.href} className="ct-method-link" style={{ color: m.color }}>{m.value}</Link>
                      )
                    ) : (
                      <span className="ct-method-value" style={{ color: m.color }}>{m.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="ct-faq-hint">
              <h3>Looking for answers?</h3>
              <p>Check our Help Center for quick answers to common questions.</p>
              <Link href="/help" className="ct-faq-link">
                Visit Help Center
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>

          <div className="ct-form-wrap">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.25rem" }}>Send Us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <style>{`
        .ct-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          align-items: start;
          max-width: 1000px;
          margin: 0 auto;
        }
        .ct-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .ct-methods {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .ct-method {
          display: flex;
          gap: 1rem;
          padding: 1.1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.875rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ct-method:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }
        .ct-method-icon {
          width: 44px;
          height: 44px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ct-method-body h3 {
          font-size: 0.9rem;
          font-weight: 700;
          margin: 0 0 0.15rem;
          color: var(--text-primary);
        }
        .ct-method-body p {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin: 0 0 0.25rem;
          line-height: 1.4;
        }
        .ct-method-link, .ct-method-value {
          font-size: 0.82rem;
          font-weight: 700;
          text-decoration: none;
        }
        .ct-method-link:hover {
          text-decoration: underline;
        }
        .ct-faq-hint {
          padding: 1.25rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.875rem;
        }
        .ct-faq-hint h3 {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0 0 0.3rem;
          color: var(--text-primary);
        }
        .ct-faq-hint p {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin: 0 0 0.75rem;
          line-height: 1.5;
        }
        .ct-faq-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--accent);
          text-decoration: none;
        }
        .ct-faq-link:hover {
          text-decoration: underline;
        }
        .ct-form-wrap {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 2rem;
        }
        @media (max-width: 768px) {
          .ct-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .ct-form-wrap {
            padding: 1.5rem;
          }
        }
      `}</style>
    </main>
  );
}
