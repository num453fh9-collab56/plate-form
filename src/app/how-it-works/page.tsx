import type { Metadata } from "next";
import Link from "next/link";
import { PLATFORM_FEE_RATE } from "@/lib/fees";

export const metadata: Metadata = {
  title: "How Hirelyx works",
  description: "How buying and selling freelance services works on Hirelyx.",
};

const BUYER_STEPS = [
  { title: "Find or request", body: "Browse gigs with fixed packages, or post a request with your budget and let sellers send proposals." },
  { title: "Pay securely", body: "Pay by card through Stripe. The money is held until you approve the work — the seller is not paid upfront." },
  { title: "Work together", body: "Chat, share files, jump on a video call and request revisions until it is right." },
  { title: "Approve & review", body: "Approve the delivery (or each milestone) to release payment, then leave a review." },
];

const SELLER_STEPS = [
  { title: "Build your profile", body: "Add your skills, experience, portfolio and an intro video so buyers trust you." },
  { title: "Create gigs", body: "Offer up to three packages with clear deliverables, extras, FAQs and buyer requirements." },
  { title: "Win more work", body: "Reply to buyer requests with proposals, and send custom offers or milestone plans in chat." },
  { title: "Deliver & get paid", body: `Deliver through the order page. When the buyer approves, you receive the amount minus the ${Math.round(PLATFORM_FEE_RATE * 100)}% platform fee.` },
];

export default function HowItWorksPage() {
  return (
    <section className="section">
      <div className="wrap info-page">
        <div className="section-head">
          <div>
            <div className="kicker">How it works</div>
            <h2>Hire with confidence. Sell with ease.</h2>
            <p className="sub">Hirelyx connects businesses with freelancers — and protects both sides.</p>
          </div>
        </div>

        <h3 id="buyers" className="info-h">For buyers</h3>
        <ol className="info-steps">
          {BUYER_STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="info-step-num">{i + 1}</span>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>

        <h3 id="sellers" className="info-h">For sellers</h3>
        <ol className="info-steps">
          {SELLER_STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="info-step-num">{i + 1}</span>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>

        <h3 className="info-h">Seller levels</h3>
        <div className="info-grid">
          <div><strong>New Seller</strong><p>Everyone starts here.</p></div>
          <div><strong>Level 1</strong><p>10+ completed orders, 4.4+ rating, 60+ days on Hirelyx.</p></div>
          <div><strong>Level 2</strong><p>50+ orders, 4.6+ rating, 85%+ on-time delivery, 120+ days.</p></div>
          <div><strong>Top Rated</strong><p>100+ orders, 4.8+ rating, 90%+ on-time delivery, 180+ days.</p></div>
        </div>

        <div className="info-cta">
          <Link className="btn-primary" href="/search">Browse gigs</Link>
          <Link className="btn-ghost" href="/requests/new">Post a request</Link>
          <Link className="btn-ghost" href="/help">Help center</Link>
        </div>
      </div>
    </section>
  );
}
