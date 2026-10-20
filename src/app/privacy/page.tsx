import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn what data Hirelyx collects, how it is used, and how we protect your privacy.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "October 20, 2026";

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="wrap legal">
        <div className="kicker">Legal</div>
        <h1>Privacy Policy</h1>
        <p className="gw-muted">Last updated: {UPDATED}</p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Account data:</strong> name, email, password (stored hashed by our auth provider) or your Google sign-in details.</li>
          <li><strong>Profile data:</strong> anything you add to your profile — photo, title, bio, phone, country, and social links.</li>
          <li><strong>Project data:</strong> bookings, projects, invoices, messages, reviews, and files you share with our team.</li>
          <li><strong>Payment data:</strong> handled by Stripe. We never see or store your full card number.</li>
          <li><strong>Technical data:</strong> error reports (page, browser type and error message) used to fix problems.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To deliver our services: manage your projects, process payments and invoices, and communicate with you about your work.</li>
          <li>To keep the platform safe: prevent fraud and spam, and enforce our terms.</li>
          <li>To contact you about your account, projects, and bookings (for example, project updates and payment confirmations).</li>
        </ul>
        <p>We do not sell your personal data.</p>

        <h2>Who we share it with</h2>
        <ul>
          <li><strong>Our team</strong> members who are working on your project have access to relevant project details and communications.</li>
          <li><strong>Service providers</strong> that run the platform for us: Supabase (database and storage), Stripe (payments), Vercel (hosting), Resend (email) and Google (sign-in).</li>
          <li><strong>Authorities</strong> when required by law.</li>
        </ul>

        <h2>Your choices</h2>
        <ul>
          <li>Edit your profile at any time from your settings page.</li>
          <li>Ask us to delete your account. Some records (such as completed invoices and payments) may be kept as required for tax and legal reasons.</li>
        </ul>

        <h2>Cookies and storage</h2>
        <p>
          We use your browser&apos;s storage to keep you signed in and remember preferences like language.
          We do not use advertising cookies.
        </p>

        <h2>Changes</h2>
        <p>We may update this policy and will show the date of the latest version on this page.</p>
      </div>
    </section>
  );
}
