import type { Metadata } from "next";
import Link from "next/link";
import { PLATFORM_FEE_RATE } from "@/lib/fees";

export const metadata: Metadata = {
  title: "Help center · Hirelyx",
  description: "Answers to common questions about orders, payments, refunds and disputes on Hirelyx.",
};

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "";
const FEE = `${Math.round(PLATFORM_FEE_RATE * 100)}%`;

const FAQ: { group: string; items: [string, string][] }[] = [
  {
    group: "Orders & payments",
    items: [
      ["How do I pay?", "By card through Stripe at checkout. Prices are charged in US dollars; other currencies on the site are shown for convenience."],
      ["When does the seller get paid?", "Only after you accept the delivery (or approve a milestone). Until then the payment is held."],
      ["What are custom offers and milestones?", "A seller can send you a tailored offer in chat. Larger offers can be split into milestones — you approve and release payment for each part separately."],
      ["Can I ask for changes?", "Yes. After a delivery, use “Request revision” on the order page and explain what should change."],
    ],
  },
  {
    group: "Cancellations, refunds & disputes",
    items: [
      ["Can I cancel an order?", "Unpaid orders can be cancelled anytime. After payment, the seller can cancel and refund you, and you can cancel yourself if the order is past its due date and not delivered."],
      ["What if we can't agree?", "Open a dispute from the order page. Both sides explain their position and a Hirelyx admin decides: a full refund, a partial refund or releasing payment to the seller."],
      ["How long do refunds take?", "Refunds go back to your original card. Banks usually show them within 5–10 business days."],
    ],
  },
  {
    group: "Selling",
    items: [
      ["What does Hirelyx charge sellers?", `A ${FEE} platform fee on each completed order or milestone. Buyers pay the listed price.`],
      ["How do I receive payouts?", "Connect a payout account from the Earnings page. Payouts are sent automatically when buyers approve your work."],
      ["How do seller levels work?", "Levels update automatically from completed orders, rating, on-time delivery and account age. See How it works for the exact requirements."],
    ],
  },
  {
    group: "Account & safety",
    items: [
      ["I forgot my password.", "Use “Forgot password?” on the sign-in screen and we will email you a reset link."],
      ["How do I stay safe?", "Keep all communication and payments on Hirelyx. Never pay outside the platform — we cannot protect payments made elsewhere."],
      ["How do I report a user or gig?", "Message our team with a link to the gig or profile. We review reports and can pause gigs or ban accounts."],
    ],
  },
];

export default function HelpPage() {
  return (
    <section className="section">
      <div className="wrap info-page">
        <div className="section-head">
          <div>
            <div className="kicker">Help center</div>
            <h2>How can we help?</h2>
            <p className="sub">Quick answers about orders, payments and safety.</p>
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
            For a problem with an order, open a dispute from the order page — it reaches our team directly.
            {SUPPORT_EMAIL ? " For anything else, email us." : ""}
          </p>
          <div className="info-cta">
            <Link className="btn-primary" href="/orders">Go to my orders</Link>
            {SUPPORT_EMAIL ? (
              <a className="btn-ghost" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
