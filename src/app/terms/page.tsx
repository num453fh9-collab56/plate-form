import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms and conditions for using Hirelyx professional digital services.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "October 20, 2026";

export default function TermsPage() {
  return (
    <section className="section">
      <div className="wrap legal">
        <div className="kicker">Legal</div>
        <h1>Terms of Service</h1>
        <p className="gw-muted">Last updated: {UPDATED}</p>

        <h2>1. About Hirelyx</h2>
        <p>
          Hirelyx is a professional digital services team that provides web development, AI solutions,
          digital marketing, automation, and creative services to clients worldwide. When you use our
          website or engage our services, you agree to these terms.
        </p>

        <h2>2. Accounts</h2>
        <p>
          You must be at least 18 years old and provide accurate information. You are responsible for
          activity on your account and for keeping your password safe.
        </p>

        <h2>3. Services and Payments</h2>
        <ul>
          <li>All service pricing is discussed and agreed upon before work begins.</li>
          <li>Payments are made in US dollars through our payment provider, Stripe.</li>
          <li>Payment terms (upfront, milestone-based, or upon completion) are specified in the project agreement.</li>
          <li>Invoices are sent via the platform and paid through Stripe checkout.</li>
        </ul>

        <h2>4. Project Delivery</h2>
        <ul>
          <li>Delivery timelines are agreed upon during project scoping and documented in the project agreement.</li>
          <li>Revisions are included as specified in the chosen service tier.</li>
          <li>Either party may request project cancellation with written notice. Refunds for cancelled projects are handled on a case-by-case basis based on work completed.</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>
          Upon full payment, you receive ownership rights to the final delivered work product. Hirelyx
          retains the right to showcase completed projects in our portfolio unless otherwise agreed.
          You may not resell, redistribute, or claim authorship of any proprietary tools, templates,
          or frameworks used during development.
        </p>

        <h2>6. Content and Conduct</h2>
        <p>
          You keep ownership of any content, data, or materials you provide to us for the project.
          You grant Hirelyx a licence to use these materials solely for project delivery. You may not
          use our services for illegal, infringing, or harmful purposes.
        </p>

        <h2>7. Confidentiality</h2>
        <p>
          We treat all project details, business information, and client data as confidential.
          We will not share your information with third parties without your consent, except where
          required by law.
        </p>

        <h2>8. Liability</h2>
        <p>
          Our services are provided in good faith with professional care. To the extent permitted by
          law, Hirelyx is not liable for indirect losses, and our total liability for any claim is
          limited to the amount paid for the specific service in question.
        </p>

        <h2>9. Changes</h2>
        <p>
          We may update these terms. We will show the date of the latest version on this page, and
          continued use of Hirelyx after an update means you accept the new terms.
        </p>
      </div>
    </section>
  );
}
