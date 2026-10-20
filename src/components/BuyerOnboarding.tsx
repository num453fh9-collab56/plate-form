"use client";

import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import BrandMark from "./BrandMark";

export default function BuyerOnboarding() {
  const { closeBuyerOnboard } = useUI();
  const { t } = useI18n();

  return (
    <div className="overlay-backdrop" onClick={closeBuyerOnboard}>
      <div
        className="buyer-onboard-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <BrandMark />
        <h2>Welcome, Buyer!</h2>
        <p style={{ color: "var(--text-secondary)", margin: "0.75rem 0 1.5rem" }}>
          You&apos;re all set to browse and hire top talent. Explore freelancer
          profiles, post projects, and find the perfect match for your needs.
        </p>
        <button className="btn btn-primary" onClick={closeBuyerOnboard}>
          Start Exploring
        </button>
      </div>

      <style>{`
        .buyer-onboard-panel {
          background: var(--surface);
          border-radius: 1rem;
          padding: 2.5rem;
          max-width: 28rem;
          width: 90vw;
          text-align: center;
          box-shadow: 0 24px 64px rgba(0,0,0,.25);
          animation: fadeUp .3s ease;
        }
        .buyer-onboard-panel h2 {
          margin: 1rem 0 0;
          font-size: 1.5rem;
          color: var(--text-primary);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
