"use client";

import { useI18n } from "@/lib/i18n";
import { SOCIAL_NETWORKS, linkStatus, normalizeLink } from "@/lib/social";
import type { SocialKey, SocialNetwork } from "@/lib/social";

/* ==========================================================================
   HIRELYX · SOCIAL & WEBSITE LINKS
   One row per network with a coloured badge, inline validation and
   username → URL expansion on blur. The website row edits `portfolio`
   (the original single link field) so existing data keeps working.
   ========================================================================== */

const BADGES: Record<SocialKey, { text: string; color: string }> = {
  website: { text: "WWW", color: "#0066cc" },
  linkedin: { text: "in", color: "#0a66c2" },
  github: { text: "GH", color: "#24292f" },
  behance: { text: "Bē", color: "#1769ff" },
  dribbble: { text: "Dr", color: "#ea4c89" },
};

export default function SocialLinks({
  website,
  links,
  onChange,
}: {
  website: string;
  links: Record<string, string>;
  onChange: (patch: { portfolio?: string; socialLinks?: Record<string, string> }) => void;
}) {
  const { t } = useI18n();

  const valueFor = (key: SocialKey) => (key === "website" ? website : links[key] ?? "");

  const set = (network: SocialNetwork, value: string) => {
    if (network.key === "website") {
      onChange({ portfolio: value });
    } else {
      const next = { ...links, [network.key]: value };
      if (!value) delete next[network.key];
      onChange({ socialLinks: next });
    }
  };

  const filled = SOCIAL_NETWORKS.filter((network) => linkStatus(network, valueFor(network.key)) === "valid").length;

  return (
    <div className="wiz-card sl-card">
      <div className="wiz-card-head sl-head">
        <div>
          <h3>{t("links.title")}</h3>
          <p>{t("links.sub")}</p>
        </div>
        <span className={"sk-counter" + (filled > 0 ? " ok" : "")}>
          {filled}/{SOCIAL_NETWORKS.length}
        </span>
      </div>

      <div className="sl-list">
        {SOCIAL_NETWORKS.map((network, index) => {
          const value = valueFor(network.key);
          const status = linkStatus(network, value);
          const badge = BADGES[network.key];
          /* The first row doubles as the step checklist's jump target. */
          const inputId = index === 0 ? "field-links" : `field-link-${network.key}`;
          return (
            <div key={network.key} className={"sl-row status-" + status}>
              <span className="sl-badge" style={{ background: badge.color }} aria-hidden="true">
                {badge.text}
              </span>
              <div className="sl-input">
                <label htmlFor={inputId}>{network.label}</label>
                <input
                  id={inputId}
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  value={value}
                  placeholder={network.placeholder}
                  onChange={(event) => set(network, event.target.value)}
                  onBlur={(event) => {
                    const normalized = normalizeLink(network, event.target.value);
                    if (normalized !== event.target.value) set(network, normalized);
                  }}
                />
                {status === "invalid" ? <em>{t("links.invalid")}</em> : null}
                {status === "wrong-site" ? <em>{t("links.wrongSite", { site: network.label })}</em> : null}
              </div>
              <span className="sl-state" aria-hidden="true">
                {status === "valid" ? (
                  <a href={normalizeLink(network, value)} target="_blank" rel="noopener noreferrer" tabIndex={-1} title={t("links.open")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
                    </svg>
                  </a>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
