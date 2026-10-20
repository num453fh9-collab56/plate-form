import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Answers to common questions about projects, bookings, payments, and working with the Hirelyx team.",
  alternates: { canonical: "/help" },
};

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@hirelyx.com";

const FAQ: { group: string; items: [string, string][] }[] = [
  {
    group: "Getting Started",
    items: [
      ["How do I start a project?", "Visit our Contact page or book a free consultation. Tell us about your goals and requirements, and we'll take it from there."],
      ["What services do you offer?", "We offer six core services: Programming & Tech, Digital Marketing, Custom AI Agents, Social Media AI & Animation, Prompt Engineering, and n8n & Workflow Automation."],
      ["Do you work with international clients?", "Yes! We work with clients worldwide. Communication is handled through our platform, email, and video calls."],
      ["How long does a typical project take?", "It depends on the scope. A website takes 2–4 weeks, a mobile app 4–8 weeks, and larger projects may take 2–3 months. We agree on a timeline before starting."],
    ],
  },
  {
    group: "Projects & Tracking",
    items: [
      ["How can I track my project?", "Once your project starts, you can track its progress in the Client Portal. You'll see the current stage, milestones, and a timeline — all updated in real time."],
      ["What stages does a project go through?", "Every project follows six stages: Discovery → Design → Development → Testing → Launch → Completed. You can see your project's stage in the portal."],
      ["Can I communicate with the team during development?", "Absolutely. Each project has a built-in activity feed where you can leave comments and ask questions. You can also use the live chat widget or book a call."],
      ["Can I upload files for my project?", "Yes. The project detail page has a file upload section where you can share documents, images, and other assets with the team (up to 10 MB per file)."],
    ],
  },
  {
    group: "Bookings & Consultations",
    items: [
      ["How do I book a consultation?", "Visit the Bookings page, pick an available time slot from the calendar, fill in your details, and confirm. You'll get a confirmation."],
      ["Can I cancel or reschedule a booking?", "Yes. Go to the Bookings page, find your booking in the 'My Bookings' tab, and cancel it. Then book a new slot that works better."],
      ["Are consultations free?", "Initial consultations are free. We use them to understand your requirements and discuss the best approach for your project."],
    ],
  },
  {
    group: "Payments & Invoices",
    items: [
      ["How do I pay?", "We send you an invoice through the platform. You can pay securely via Stripe using any major credit or debit card."],
      ["When do I need to pay?", "Payment terms are agreed upon before the project starts. For larger projects, we typically work with milestone-based payments."],
      ["Where can I see my invoices?", "All your invoices and quotes are available in the Invoices page. Sign in to view, download, or pay them online."],
      ["What currencies do you accept?", "We support USD, PKR, EUR, and GBP. The currency is set when the invoice is created."],
    ],
  },
  {
    group: "Account & Security",
    items: [
      ["How do I sign in?", "Click 'Sign In' in the top navigation. You can sign in with your email (using a one-time code) or with Google."],
      ["How do I access the Client Portal?", "After signing in, go to the Portal page from the navigation menu. You'll see your projects, bookings, and invoices in one place."],
      ["Is my data secure?", "Yes. We use Supabase with Row Level Security, which means you can only see your own data. All payments are processed securely through Stripe."],
    ],
  },
];

function FaqSchema() {
  const allFaqs = FAQ.flatMap((group) =>
    group.items.map(([q, a]) => ({
      "@type": "Question" as const,
      name: q,
      acceptedAnswer: { "@type": "Answer" as const, text: a },
    })),
  );
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: allFaqs,
        }),
      }}
    />
  );
}

export default function HelpPage() {
  return (
    <section className="section">
      <FaqSchema />
      <div className="wrap info-page">
        <div className="section-head">
          <div>
            <div className="kicker">Help center</div>
            <h2>How can we help?</h2>
            <p className="sub">Quick answers about projects, bookings, payments, and more.</p>
          </div>
        </div>

        {FAQ.map((group) => (
          <div key={group.group} id={group.group.toLowerCase().replace(/[^a-z]+/g, "-")} className="gd-faq info-faq">
            <h3 className="info-h">{group.group}</h3>
            {group.items.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        ))}

        <div className="gw-card info-contact">
          <h3>Still need help?</h3>
          <p className="gw-muted">
            Can&apos;t find what you&apos;re looking for? Reach out to our team — we&apos;re happy to help.
          </p>
          <div className="info-cta">
            <Link className="btn-primary" href="/contact">Contact Us</Link>
            {SUPPORT_EMAIL ? (
              <a className="btn-ghost" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
