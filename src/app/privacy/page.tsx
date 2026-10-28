import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { DocPage, PageHero } from "@/components/site/ui";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What data Hirelyx collects, how it is used, who it is shared with, and the choices you have over it.",
  path: "/privacy",
});

const UPDATED = "October 20, 2026";

const CRUMBS = [{ label: "Home", href: "/" }, { label: "Privacy Policy" }];

const TOC = [
  { id: "collect", label: "What we collect" },
  { id: "use", label: "How we use it" },
  { id: "share", label: "Who we share it with" },
  { id: "choices", label: "Your choices" },
  { id: "cookies", label: "Cookies and storage" },
  { id: "changes", label: "Changes" },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(CRUMBS)} />

      <PageHero
        crumbs={CRUMBS}
        kicker="Legal"
        title="Privacy Policy"
        lead={`Last updated ${UPDATED}. What we collect, why we collect it, who it reaches, and what you can ask us to do about it.`}
      />

      <DocPage toc={TOC}>
        <h2 id="collect">What we collect</h2>
        <ul>
          <li><strong>Account data:</strong> name, email, password (stored hashed by our auth provider) or your Google sign-in details.</li>
          <li><strong>Profile data:</strong> anything you add to your profile — photo, title, bio, phone, country, and social links.</li>
          <li><strong>Project data:</strong> bookings, projects, invoices, messages, reviews, and files you share with our team.</li>
          <li><strong>Payment data:</strong> handled by Stripe. We never see or store your full card number.</li>
          <li><strong>Technical data:</strong> error reports (page, browser type and error message) used to fix problems.</li>
        </ul>

        <h2 id="use">How we use it</h2>
        <ul>
          <li>To deliver our services: manage your projects, process payments and invoices, and communicate with you about your work.</li>
          <li>To keep the platform safe: prevent fraud and spam, and enforce our terms.</li>
          <li>To contact you about your account, projects, and bookings (for example, project updates and payment confirmations).</li>
        </ul>
        <p>We do not sell your personal data.</p>

        <h2 id="share">Who we share it with</h2>
        <ul>
          <li><strong>Our team</strong> members who are working on your project have access to relevant project details and communications.</li>
          <li><strong>Service providers</strong> that run the platform for us: Supabase (database and storage), Stripe (payments), Vercel (hosting), Resend (email) and Google (sign-in).</li>
          <li><strong>Authorities</strong> when required by law.</li>
        </ul>

        <h2 id="choices">Your choices</h2>
        <ul>
          <li>Edit your profile at any time from your settings page.</li>
          <li>Ask us to delete your account. Some records (such as completed invoices and payments) may be kept as required for tax and legal reasons.</li>
        </ul>

        <h2 id="cookies">Cookies and storage</h2>
        <p>
          We use your browser&apos;s storage to keep you signed in and remember preferences like language.
          We do not use advertising cookies.
        </p>

        <h2 id="changes">Changes</h2>
        <p>We may update this policy and will show the date of the latest version on this page.</p>
      </DocPage>
    </>
  );
}
