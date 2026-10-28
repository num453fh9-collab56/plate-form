import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { DocPage, PageHero } from "@/components/site/ui";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The terms that govern engagements with Hirelyx: accounts, payments, project delivery, intellectual property, confidentiality and liability.",
  path: "/terms",
});

const UPDATED = "October 20, 2026";

const CRUMBS = [{ label: "Home", href: "/" }, { label: "Terms of Service" }];

const TOC = [
  { id: "about", label: "1. About Hirelyx" },
  { id: "accounts", label: "2. Accounts" },
  { id: "payments", label: "3. Services and Payments" },
  { id: "delivery", label: "4. Project Delivery" },
  { id: "ip", label: "5. Intellectual Property" },
  { id: "conduct", label: "6. Content and Conduct" },
  { id: "confidentiality", label: "7. Confidentiality" },
  { id: "liability", label: "8. Liability" },
  { id: "changes", label: "9. Changes" },
];

export default function TermsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(CRUMBS)} />

      <PageHero
        crumbs={CRUMBS}
        kicker="Legal"
        title="Terms of Service"
        lead={`Last updated ${UPDATED}. These terms apply to every Hirelyx engagement alongside the written scope for your specific project.`}
      />

      <DocPage toc={TOC}>

        <h2 id="about">1. About Hirelyx</h2>
        <p>
          Hirelyx is a professional digital services team that provides web development, AI solutions,
          digital marketing, automation, and creative services to clients worldwide. When you use our
          website or engage our services, you agree to these terms.
        </p>

        <h2 id="accounts">2. Accounts</h2>
        <p>
          You must be at least 18 years old and provide accurate information. You are responsible for
          activity on your account and for keeping your password safe.
        </p>

        <h2 id="payments">3. Services and Payments</h2>
        <ul>
          <li>All service pricing is discussed and agreed upon before work begins.</li>
          <li>Payments are made in US dollars through our payment provider, Stripe.</li>
          <li>Payment terms (upfront, milestone-based, or upon completion) are specified in the project agreement.</li>
          <li>Invoices are sent via the platform and paid through Stripe checkout.</li>
        </ul>

        <h2 id="delivery">4. Project Delivery</h2>
        <ul>
          <li>Delivery timelines are agreed upon during project scoping and documented in the project agreement.</li>
          <li>Revisions are included as specified in the chosen service tier.</li>
          <li>Either party may request project cancellation with written notice. Refunds for cancelled projects are handled on a case-by-case basis based on work completed.</li>
        </ul>

        <h2 id="ip">5. Intellectual Property</h2>
        <p>
          Upon full payment, you receive ownership rights to the final delivered work product. Hirelyx
          retains the right to showcase completed projects in our portfolio unless otherwise agreed.
          You may not resell, redistribute, or claim authorship of any proprietary tools, templates,
          or frameworks used during development.
        </p>

        <h2 id="conduct">6. Content and Conduct</h2>
        <p>
          You keep ownership of any content, data, or materials you provide to us for the project.
          You grant Hirelyx a licence to use these materials solely for project delivery. You may not
          use our services for illegal, infringing, or harmful purposes.
        </p>

        <h2 id="confidentiality">7. Confidentiality</h2>
        <p>
          We treat all project details, business information, and client data as confidential.
          We will not share your information with third parties without your consent, except where
          required by law.
        </p>

        <h2 id="liability">8. Liability</h2>
        <p>
          Our services are provided in good faith with professional care. To the extent permitted by
          law, Hirelyx is not liable for indirect losses, and our total liability for any claim is
          limited to the amount paid for the specific service in question.
        </p>

        <h2 id="changes">9. Changes</h2>
        <p>
          We may update these terms. We will show the date of the latest version on this page, and
          continued use of Hirelyx after an update means you accept the new terms.
        </p>
      </DocPage>
    </>
  );
}
