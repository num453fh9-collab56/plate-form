"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import { initials } from "@/lib/format";
import { useIsAdmin } from "@/lib/admin";

function MenuIcon({ children }: { children: ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function AccountMenu() {
  const { user, signOut, strength, profile } = useAuth();
  const { openProfile, openMessages, toast } = useUI();
  const requireAuth = useRequireAuth();
  const { t } = useI18n();
  const router = useRouter();
  const isAdmin = useIsAdmin(user?.sub);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
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

  const go = (path: string) => { setOpen(false); router.push(path); };

  return (
    <div className={"account-menu" + (open ? " open" : "")} ref={ref}>
      <button
        className="account-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {user?.picture ? (
          <img className="account-avatar" src={user.picture} alt="" />
        ) : user ? (
          <span className="account-avatar account-initials">{initials(user.name)}</span>
        ) : (
          <span className="account-avatar account-guest">
            <MenuIcon><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></MenuIcon>
          </span>
        )}
        <span className="account-name">{user ? user.name.split(" ")[0] : t("account.account")}</span>
        <svg className="chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
      </button>

      <div className="account-dropdown" role="menu">
        {user ? (
          <>
            <div className="account-head">
              {user.picture ? (
                <img src={user.picture} alt="" />
              ) : (
                <span className="account-avatar account-initials account-head-avatar">{initials(user.name)}</span>
              )}
              <div className="account-head-info">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
            </div>

            {/* Profile strength */}
            <button className="account-strength" type="button" role="menuitem" onClick={() => { setOpen(false); go("/settings"); }}>
              <span className="account-strength-label">Profile</span>
              <span className="account-strength-bar"><span style={{ width: `${strength.percent}%` }} /></span>
              <span className="account-strength-value">{strength.percent}%</span>
            </button>

            {/* Menu items */}
            <div className="am-items">
              <button className="dash-item" type="button" role="menuitem" onClick={() => go("/dashboard")}>
                <span className="dash-icon" style={{ color: "#059669", background: "rgba(5,150,105,0.12)" }}>
                  <MenuIcon><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></MenuIcon>
                </span>
                <span className="dash-text">Dashboard</span>
              </button>

              <button className="dash-item" type="button" role="menuitem" onClick={() => go("/portal")}>
                <span className="dash-icon" style={{ color: "#0066cc", background: "rgba(0,102,204,0.12)" }}>
                  <MenuIcon><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></MenuIcon>
                </span>
                <span className="dash-text">Client Portal</span>
              </button>

              <button className="dash-item" type="button" role="menuitem" onClick={() => go("/invoices")}>
                <span className="dash-icon" style={{ color: "#7c3aed", background: "rgba(124,58,237,0.12)" }}>
                  <MenuIcon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></MenuIcon>
                </span>
                <span className="dash-text">Invoices</span>
              </button>

              <button className="dash-item" type="button" role="menuitem" onClick={() => { setOpen(false); openMessages(); }}>
                <span className="dash-icon" style={{ color: "#0891b2", background: "rgba(8,145,178,0.12)" }}>
                  <MenuIcon><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></MenuIcon>
                </span>
                <span className="dash-text">Messages</span>
              </button>

              <button className="dash-item" type="button" role="menuitem" onClick={() => go("/notifications")}>
                <span className="dash-icon" style={{ color: "#2563eb", background: "rgba(37,99,235,0.12)" }}>
                  <MenuIcon><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></MenuIcon>
                </span>
                <span className="dash-text">Notifications</span>
              </button>

              <button className="dash-item" type="button" role="menuitem" onClick={() => go("/settings")}>
                <span className="dash-icon" style={{ color: "#64748b", background: "rgba(100,116,139,0.12)" }}>
                  <MenuIcon><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></MenuIcon>
                </span>
                <span className="dash-text">Settings</span>
              </button>

              {isAdmin && (
                <button className="dash-item" type="button" role="menuitem" onClick={() => go("/admin")}>
                  <span className="dash-icon" style={{ color: "#dc2626", background: "rgba(220,38,38,0.12)" }}>
                    <MenuIcon><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></MenuIcon>
                  </span>
                  <span className="dash-text">Admin Panel</span>
                </button>
              )}
            </div>

            <button className="dash-signout" type="button" role="menuitem" onClick={() => { signOut(); setOpen(false); toast(t("toast.signedOut")); }}>
              {t("account.signOut")}
            </button>
          </>
        ) : (
          <div style={{ padding: "12px 16px" }}>
            <p style={{ color: "var(--muted)", marginBottom: 10, fontSize: "0.85rem" }}>
              Sign in to manage your projects, invoices and messages.
            </p>
            <button className="btn-primary" type="button" style={{ width: "100%" }} onClick={() => { setOpen(false); requireAuth(() => undefined); }}>
              Sign In / Join
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
