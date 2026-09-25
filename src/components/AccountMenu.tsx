"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { initials } from "@/lib/format";

type IconName =
  | "manage"
  | "groups"
  | "bell"
  | "post"
  | "wallet"
  | "profile"
  | "improve"
  | "certified"
  | "promote"
  | "rewards";

const ICON_PATHS: Record<IconName, ReactNode> = {
  manage: (
    <>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </>
  ),
  groups: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </>
  ),
  post: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  wallet: (
    <>
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <circle cx="17" cy="14" r="1.5" />
    </>
  ),
  profile: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  improve: (
    <>
      <path d="M23 6l-9.5 9.5-5-5L1 18" />
      <path d="M17 6h6v6" />
    </>
  ),
  certified: (
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
    </>
  ),
  promote: (
    <>
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </>
  ),
  rewards: (
    <>
      <path d="M20 12v10H4V12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </>
  ),
};

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

interface DashItem {
  id: string;
  labelKey: TranslationKey;
  icon: IconName;
  color: string;
  soft: string;
  badge?: string;
  value?: string;
}

const DASH_ITEMS: DashItem[] = [
  { id: "manage", labelKey: "account.manage", icon: "manage", color: "#0066cc", soft: "rgba(0,102,204,0.12)" },
  { id: "groups", labelKey: "account.groups", icon: "groups", color: "#7c3aed", soft: "rgba(124,58,237,0.12)" },
  {
    id: "notifications",
    labelKey: "account.notifications",
    icon: "bell",
    color: "#e11d48",
    soft: "rgba(225,29,72,0.12)",
    badge: "13",
  },
  { id: "post", labelKey: "account.postProject", icon: "post", color: "#059669", soft: "rgba(5,150,105,0.12)" },
  {
    id: "wallet",
    labelKey: "account.wallet",
    icon: "wallet",
    color: "#d97706",
    soft: "rgba(217,119,6,0.13)",
    value: "$0.00 USD",
  },
  { id: "profile", labelKey: "account.myProfile", icon: "profile", color: "#4f46e5", soft: "rgba(79,70,229,0.12)" },
  { id: "improve", labelKey: "account.improveProfile", icon: "improve", color: "#0891b2", soft: "rgba(8,145,178,0.12)" },
  {
    id: "certified",
    labelKey: "account.getCertified",
    icon: "certified",
    color: "#ca8a04",
    soft: "rgba(202,138,4,0.14)",
  },
  { id: "promote", labelKey: "account.promoteProfile", icon: "promote", color: "#db2777", soft: "rgba(219,39,119,0.12)" },
  { id: "rewards", labelKey: "account.myRewards", icon: "rewards", color: "#ea580c", soft: "rgba(234,88,12,0.12)" },
];

export default function AccountMenu() {
  const { user, signOut } = useAuth();
  const { openPost, toast } = useUI();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleItem = (item: DashItem) => {
    if (item.id === "post") {
      setOpen(false);
      openPost();
      return;
    }
    toast(t("account.soon", { item: t(item.labelKey) }));
  };

  return (
    <div className={"account-menu" + (open ? " open" : "")} ref={ref}>
      <button
        className="account-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {user?.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="account-avatar" src={user.picture} alt="" />
        ) : user ? (
          <span className="account-avatar account-initials">{initials(user.name)}</span>
        ) : (
          <span className="account-avatar account-guest">
            <Icon name="profile" />
          </span>
        )}
        <span className="account-name">
          {user ? user.name.split(" ")[0] : t("account.account")}
        </span>
        <svg
          className="chev"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div className="account-dropdown" role="menu">
        {user ? (
          <div className="account-head">
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt="" />
            ) : (
              <span className="account-avatar account-initials account-head-avatar">
                {initials(user.name)}
              </span>
            )}
            <div className="account-head-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        ) : (
          <div className="account-head guest">
            <strong>{t("account.welcomeTitle")}</strong>
            <span>{t("account.welcomeText")}</span>
          </div>
        )}

        <div className="dash-label">{t("account.dashboard")}</div>
        <ul className="dash-list">
          {DASH_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                className="dash-item"
                type="button"
                role="menuitem"
                onClick={() => handleItem(item)}
              >
                <span className="dash-icon" style={{ color: item.color, background: item.soft }}>
                  <Icon name={item.icon} />
                </span>
                <span className="dash-text">{t(item.labelKey)}</span>
                {item.badge && (
                  <span className="dash-badge" style={{ background: item.color }}>
                    {item.badge}
                  </span>
                )}
                {item.value && (
                  <span
                    className="dash-value"
                    style={{ color: item.color, background: item.soft }}
                  >
                    {item.value}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {user && (
          <button
            className="dash-signout"
            type="button"
            role="menuitem"
            onClick={() => {
              signOut();
              setOpen(false);
              toast(t("toast.signedOut"));
            }}
          >
            {t("account.signOut")}
          </button>
        )}
      </div>
    </div>
  );
}
