import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Hirelyx",
  description: "What data Hirelyx collects and how it is used.",
};

const UPDATED = "October 10, 2026";

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
          <li><strong>Profile data:</strong> anything you add to your profile — photo, title, bio, skills, country, portfolio and intro video.</li>
          <li><strong>Marketplace data:</strong> gigs, requests, proposals, orders, messages, reviews and disputes.</li>
          <li><strong>Payment data:</strong> handled by Stripe. We never see or store your full card number.</li>
          <li><strong>Technical data:</strong> error reports (page, browser type and error message) used to fix problems.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To run the marketplace: show your profile and gigs, process orders and payouts, and deliver messages.</li>
          <li>To keep the platform safe: prevent fraud and spam, enforce our terms and resolve disputes.</li>
          <li>To contact you about your account and orders (for example, order and payment notifications).</li>
        </ul>
        <p>We do not sell your personal data.</p>

        <h2>Who we share it with</h2>
        <ul>
          <li><strong>Other users</strong> see your public profile, gigs and reviews. Messages are visible only to the people in the conversation; Hirelyx admins may review messages when resolving a dispute.</li>
          <li><strong>Service providers</strong> that run the platform for us: Supabase (database and storage), Stripe (payments), Vercel/Netlify (hosting), Resend (email) and Google (sign-in).</li>
          <li><strong>Authorities</strong> when required by law.</li>
        </ul>

        <h2>Your choices</h2>
        <ul>
          <li>Edit your profile at any time from your account menu.</li>
          <li>Ask us to delete your account. Some records (such as completed orders and payments) may be kept as required for tax and legal reasons.</li>
        </ul>

        <h2>Cookies and storage</h2>
        <p>
          We use your browser&apos;s storage to keep you signed in and remember preferences like language and currency.
          We do not use advertising cookies.
        </p>

        <h2>Changes</h2>
        <p>We may update this policy and will show the date of the latest version on this page.</p>
      </div>
    </section>
  );
}
