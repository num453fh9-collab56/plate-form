"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie-consent")) setShow(true);
    } catch {}
  }, []);

  const accept = () => {
    try { localStorage.setItem("cookie-consent", "1"); } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cc-bar">
      <p>
        We use cookies and local storage to keep you signed in and remember your preferences.
        See our <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <button type="button" className="btn-primary cc-btn" onClick={accept}>
        Got it
      </button>

      <style>{`
        .cc-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9000;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          padding: 1rem 1.5rem;
          background: var(--surface);
          border-top: 1px solid var(--border);
          box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
          animation: cc-slide 0.4s ease;
        }
        .cc-bar p {
          margin: 0;
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .cc-bar a {
          color: var(--accent);
          font-weight: 600;
          text-decoration: none;
        }
        .cc-bar a:hover {
          text-decoration: underline;
        }
        .cc-btn {
          white-space: nowrap;
          padding: 0.5rem 1.25rem;
          font-size: 0.82rem;
          border-radius: 8px;
        }
        @keyframes cc-slide {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .cc-bar {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
