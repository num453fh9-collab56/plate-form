"use client";

import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";

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
            <h1 className="hero-title">
              <span>{t("hero.t1")}</span> <span>{t("hero.t2")}</span>
              <br />
              <span>{t("hero.t3")}</span>
            </h1>
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
    </section>
  );
}
