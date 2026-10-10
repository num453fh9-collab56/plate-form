/* ==========================================================================
   HIRELYX · SOCIAL & WEBSITE LINKS
   Each network accepts a full URL or just a username ("ahmad" →
   https://github.com/ahmad). Values are normalised on blur and validated
   against the network's domain so a GitHub link can't land in the LinkedIn
   field by mistake.
   ========================================================================== */

export type SocialKey = "website" | "linkedin" | "github" | "behance" | "dribbble";

export interface SocialNetwork {
  key: SocialKey;
  label: string;
  /** Hostnames accepted for this network (without "www."). */
  hosts: string[];
  /** Prefix used to build a URL from a bare username. */
  base?: string;
  placeholder: string;
}

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  { key: "website", label: "Website", hosts: [], placeholder: "https://yourname.com" },
  {
    key: "linkedin",
    label: "LinkedIn",
    hosts: ["linkedin.com"],
    base: "https://www.linkedin.com/in/",
    placeholder: "linkedin.com/in/username",
  },
  {
    key: "github",
    label: "GitHub",
    hosts: ["github.com"],
    base: "https://github.com/",
    placeholder: "github.com/username",
  },
  {
    key: "behance",
    label: "Behance",
    hosts: ["behance.net"],
    base: "https://www.behance.net/",
    placeholder: "behance.net/username",
  },
  {
    key: "dribbble",
    label: "Dribbble",
    hosts: ["dribbble.com"],
    base: "https://dribbble.com/",
    placeholder: "dribbble.com/username",
  },
];

const USERNAME = /^@?[A-Za-z0-9][A-Za-z0-9._-]{0,60}$/;

/** Turn user input into a full https URL when possible; returns trimmed input otherwise. */
export function normalizeLink(network: SocialNetwork, raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (network.base && USERNAME.test(value) && !value.includes(".")) {
    return network.base + value.replace(/^@/, "");
  }
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[\w-]+(\.[\w-]+)+/.test(value)) return `https://${value}`;
  return value;
}

export type LinkStatus = "empty" | "valid" | "invalid" | "wrong-site";

export function linkStatus(network: SocialNetwork, value: string): LinkStatus {
  const text = value.trim();
  if (!text) return "empty";
  let url: URL;
  try {
    url = new URL(normalizeLink(network, text));
  } catch {
    return "invalid";
  }
  if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) return "invalid";
  if (network.hosts.length === 0) return "valid";
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const onSite = network.hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  if (!onSite) return "wrong-site";
  /* A bare domain with no profile path isn't useful. */
  return url.pathname.replace(/\/+$/, "").length > 1 ? "valid" : "invalid";
}

/** Short display form, e.g. "github.com/ahmad". */
export function displayLink(value: string): string {
  return value.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/+$/, "");
}
