import type { Metadata } from "next";
import { PLATFORM_FEE_RATE } from "@/lib/fees";

export const metadata: Metadata = {
  title: "Terms of Service · Hirelyx",
  description: "The rules for using the Hirelyx marketplace.",
};

const FEE = `${Math.round(PLATFORM_FEE_RATE * 100)}%`;
const UPDATED = "October 10, 2026";

export default function TermsPage() {
  return (
    <section className="section">
      <div className="wrap legal">
        <div className="kicker">Legal</div>
        <h1>Terms of Service</h1>
        <p className="gw-muted">Last updated: {UPDATED}</p>

        <h2>1. About Hirelyx</h2>
        <p>
          Hirelyx is an online marketplace where buyers purchase services from independent freelancers
          (&quot;sellers&quot;). Hirelyx is not a party to the agreement between a buyer and a seller, but provides the
          platform, payment handling and dispute resolution described below.
        </p>

        <h2>2. Accounts</h2>
        <p>
          You must be at least 18 years old and provide accurate information. You are responsible for activity on
          your account and for keeping your password safe. One person may not operate multiple accounts to
          manipulate reviews, levels or search ranking.
        </p>

        <h2>3. Orders and payments</h2>
        <ul>
          <li>Buyers pay the listed price (or the accepted offer or proposal) in US dollars through our payment provider, Stripe.</li>
          <li>Payments are held until the buyer accepts the delivery or approves a milestone, then released to the seller.</li>
          <li>Sellers pay a platform fee of {FEE} of each released amount.</li>
          <li>All payments for work found on Hirelyx must be made through Hirelyx. Taking payment outside the platform is not allowed.</li>
        </ul>

        <h2>4. Delivery, revisions and cancellations</h2>
        <ul>
          <li>Sellers must deliver the agreed work by the due date shown on the order.</li>
          <li>Buyers may request revisions within the scope that was agreed.</li>
          <li>A seller may cancel an order before completion, which refunds the buyer. A buyer may cancel an unpaid order, or a paid order that is past its due date and has not been delivered.</li>
        </ul>

        <h2>5. Disputes</h2>
        <p>
          If buyer and seller cannot agree, either may open a dispute from the order page. Hirelyx reviews the order,
          messages and deliveries and may issue a full refund, a partial refund or release payment to the seller.
          Amounts already released through approved milestones are not refundable through a dispute.
        </p>

        <h2>6. Content and conduct</h2>
        <p>
          You keep ownership of content you upload, and grant Hirelyx a licence to display it on the platform. Unless
          agreed otherwise, the buyer receives the rights to the final delivered work once it is paid for. You may
          not post illegal, infringing, misleading or abusive content, or offer services that break the law.
        </p>

        <h2>7. Suspension</h2>
        <p>
          We may pause gigs or suspend accounts that break these terms, harm other users or put payments at risk.
        </p>

        <h2>8. Liability</h2>
        <p>
          The platform is provided &quot;as is&quot;. To the extent permitted by law, Hirelyx is not liable for indirect
          losses, and our total liability for any claim is limited to the fees we earned from the order in question.
        </p>

        <h2>9. Changes</h2>
        <p>
          We may update these terms. We will show the date of the latest version on this page, and continued use of
          Hirelyx after an update means you accept the new terms.
        </p>
      </div>
    </section>
  );
}
