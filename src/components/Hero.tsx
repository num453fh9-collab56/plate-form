"use client";

import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

const ROTATING_WORDS = ["Web Apps", "Mobile Apps", "AI Solutions", "UI/UX Design", "Marketing", "Automation"];

const TRUST_ITEMS = [
  { icon: "🛡️", label: "Secure Payments" },
  { icon: "⚡", label: "Fast Delivery" },
  { icon: "💬", label: "24/7 Support" },
  { icon: "✅", label: "Quality Guaranteed" },
];

function RotatingText() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="hero-rotating" aria-live="polite">
      <span className={`hero-rotating-word${visible ? " hero-rw-in" : " hero-rw-out"}`}>
        {ROTATING_WORDS[index]}
      </span>
    </span>
  );
}

export default function Hero() {
  const { user } = useAuth();
  const { openAuth, openProfile } = useUI();
  const { t } = useI18n();

  const scrollToServices = () => {
    document
      .getElementById("services")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-tag">
              <span className="hero-tag-dot" />
              Trusted by Businesses Worldwide
            </div>
            <h1 className="hero-title">
              <span>{t("hero.t1")}</span> <span>{t("hero.t2")}</span>
              <br />
              <span>{t("hero.t3")}</span>
            </h1>
            <p className="hero-speciality">
              Specializing in <RotatingText />
            </p>
            <p className="sub">{t("hero.sub")}</p>
            <div className="hero-cta">
              <button
                className="btn-primary"
                type="button"
                onClick={() => (user ? openProfile() : openAuth("signup"))}
              >
                {t("hero.cta1")}
              </button>
              <button
                className="btn-ghost"
                type="button"
                onClick={scrollToServices}
              >
                {t("hero.cta2")}
              </button>
            </div>
            <div className="hero-trust">
              {TRUST_ITEMS.map((item) => (
                <div key={item.label} className="hero-trust-item">
                  <span className="hero-trust-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero/hero-visual.png"
              alt="Hirelyx professional services team"
              width={1190}
              height={657}
              fetchPriority="high"
            />
          </div>
        </div>
      </div>

      <style>{`
        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 100px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          margin-bottom: 20px;
        }
        .hero-tag-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          animation: hero-dot-pulse 2s ease-in-out infinite;
        }
        @keyframes hero-dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .hero-speciality {
          font-size: clamp(15px, 2vw, 18px);
          color: var(--muted);
          margin: -4px 0 8px;
          font-weight: 500;
        }
        .hero-rotating {
          display: inline-block;
          min-width: 160px;
          text-align: left;
          position: relative;
        }
        .hero-rotating-word {
          display: inline-block;
          color: var(--accent);
          font-weight: 700;
          transition: opacity 0.4s, transform 0.4s;
        }
        .hero-rw-in {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-rw-out {
          opacity: 0;
          transform: translateY(8px);
        }
        .hero-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 16px 24px;
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }
        .hero-trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--muted);
          font-weight: 500;
        }
        .hero-trust-icon {
          font-size: 16px;
        }
        @media (max-width: 768px) {
          .hero-trust {
            gap: 10px 16px;
          }
          .hero-trust-item {
            font-size: 12px;
          }
        }
      `}</style>
    </section>
  );
}
