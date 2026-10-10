"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { initials, maskEmail } from "@/lib/format";

/* ==========================================================================
   HIRELYX · ACCOUNT & SETTINGS
   A secure, light-mode dashboard for personal information, security,
   identity verification and privacy controls. Profile editing — including
   portfolio projects — lives in the profile wizard.
   ========================================================================== */

type Tab = "personal" | "security";

const TABS: { id: Tab; labelKey: TranslationKey; icon: ReactNode }[] = [
  {
    id: "personal",
    labelKey: "account.tabPersonal",
    icon: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
  {
    id: "security",
    labelKey: "account.tabSecurity",
    icon: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </>
    ),
  },
];

function TabIcon({ children }: { children: ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function AccountSettingsModal() {
  const { user, account, profile, updateProfile, changePassword, signOut } = useAuth();
  const { closeAccount, toast } = useUI();
  const { t } = useI18n();

  const [tab, setTab] = useState<Tab>("personal");
  const [saved, setSaved] = useState(false);

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNext, setPwNext] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    document.body.classList.add("modal-open");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAccount();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeAccount]);

  if (!user || !account) return null;

  const masked = maskEmail(account.email);
  const isGoogle = account.provider === "google" && !account.passwordHash;

  const submitPassword = async () => {
    if (!pwCurrent) {
      setPwError(t("account.errCurrentPassword"));
      return;
    }
    if (pwNext.length < 8) {
      setPwError(t("auth.errPassword"));
      return;
    }
    if (pwNext !== pwConfirm) {
      setPwError(t("account.errPasswordMismatch"));
      return;
    }
    const result = await changePassword({ current: pwCurrent, next: pwNext });
    if (!result.ok) {
      setPwError(t(result.error));
      return;
    }
    setPwError("");
    setPwCurrent("");
    setPwNext("");
    setPwConfirm("");
    toast(t("account.passwordUpdated"));
  };

  const savePersonal = () => {
    if (profile.fullName.trim().length < 2) {
      toast(t("profile.fieldRequired"));
      return;
    }
    updateProfile({});
    setSaved(true);
    toast(t("account.saved"));
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div
      className="modal-overlay account-overlay open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accountTitle"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeAccount();
      }}
    >
      <div className="account-modal">
        <div className="account-top">
          <div className="account-id">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="account-big-avatar" src={profile.avatar} alt="" />
            ) : (
              <span className="account-big-avatar account-big-initials">
                {initials(profile.fullName || user.name)}
              </span>
            )}
            <div className="account-id-info">
              <h2 id="accountTitle">{profile.fullName || user.name}</h2>
              <p className="account-id-role">{profile.title || t("profile.subtitle")}</p>
              <div className="account-id-email">
                <span className="masked-email" title={t("account.maskedEmail")}>
                  {masked}
                </span>
                <span className="account-id-badge">{isGoogle ? t("account.providerGoogle") : t("account.providerEmail")}</span>
              </div>
            </div>
          </div>
          <button className="modal-close" type="button" aria-label="Close" onClick={closeAccount}>
            &times;
          </button>
        </div>

        <div className="account-body">
          <aside className="account-nav">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={"account-nav-item" + (tab === item.id ? " active" : "")}
                onClick={() => setTab(item.id)}
              >
                <span className="account-nav-icon">
                  <TabIcon>{item.icon}</TabIcon>
                </span>
                {t(item.labelKey)}
              </button>
            ))}

            <button
              className="account-signout"
              type="button"
              onClick={() => {
                signOut();
                closeAccount();
                toast(t("toast.signedOut"));
              }}
            >
              {t("account.signOut")}
            </button>
          </aside>

          <div className="account-content">
            {tab === "personal" && (
              <>
                <div className="account-section-head">
                  <h3>{t("account.tabPersonal")}</h3>
                  <p>{t("account.personalSub")}</p>
                </div>
                <div className="field-grid">
                  <div className="form-field">
                    <label>{t("profile.fullName")}</label>
                    <input
                      type="text"
                      value={profile.fullName}
                      placeholder={t("auth.fullNamePlaceholder")}
                      onChange={(event) => updateProfile({ fullName: event.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>{t("profile.profTitle")}</label>
                    <input
                      type="text"
                      value={profile.title}
                      placeholder={t("profile.profTitlePlaceholder")}
                      onChange={(event) => updateProfile({ title: event.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>{t("profile.phone")}</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      placeholder={t("profile.phonePlaceholder")}
                      onChange={(event) => updateProfile({ phone: event.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>{t("profile.country")}</label>
                    <input
                      type="text"
                      value={profile.country}
                      placeholder={t("profile.countryPlaceholder")}
                      onChange={(event) => updateProfile({ country: event.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>{t("profile.languages")}</label>
                    <input
                      type="text"
                      value={profile.languages}
                      placeholder={t("profile.languagesPlaceholder")}
                      onChange={(event) => updateProfile({ languages: event.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>{t("profile.portfolio")}</label>
                    <input
                      type="url"
                      value={profile.portfolio}
                      placeholder={t("profile.portfolioPlaceholder")}
                      onChange={(event) => updateProfile({ portfolio: event.target.value })}
                    />
                  </div>
                </div>
                <div className="form-field account-bio">
                  <label>{t("profile.bio")}</label>
                  <textarea
                    rows={4}
                    value={profile.bio}
                    placeholder={t("profile.bioPlaceholder")}
                    onChange={(event) => updateProfile({ bio: event.target.value })}
                  />
                </div>
                <div className="account-section-foot">
                  <span className="account-saved">{saved ? t("account.saved") : ""}</span>
                  <button className="btn-publish" type="button" onClick={savePersonal}>
                    {t("account.saveChanges")}
                  </button>
                </div>
              </>
            )}

            {tab === "security" && (
              <>
                <div className="account-section-head">
                  <h3>{t("account.securityTitle")}</h3>
                  <p>{t("account.securitySub")}</p>
                </div>

                <div className="account-row">
                  <div>
                    <strong>{t("account.password")}</strong>
                    <p>{isGoogle ? t("account.googleManaged") : t("account.passwordSub")}</p>
                  </div>
                  <span className={"status-pill " + (isGoogle ? "muted" : "ok")}>
                    {isGoogle ? t("account.providerGoogle") : t("account.providerEmail")}
                  </span>
                </div>

                {!isGoogle && (
                  <div className="account-form-block">
                    <div className="field-grid">
                      <div className="form-field">
                        <label>{t("account.currentPassword")}</label>
                        <input
                          type="password"
                          value={pwCurrent}
                          autoComplete="current-password"
                          onChange={(event) => setPwCurrent(event.target.value)}
                        />
                      </div>
                      <div className="form-field">
                        <label>{t("account.newPassword")}</label>
                        <input
                          type="password"
                          value={pwNext}
                          autoComplete="new-password"
                          onChange={(event) => setPwNext(event.target.value)}
                        />
                      </div>
                      <div className="form-field">
                        <label>{t("account.confirmPassword")}</label>
                        <input
                          type="password"
                          value={pwConfirm}
                          autoComplete="new-password"
                          onChange={(event) => setPwConfirm(event.target.value)}
                        />
                      </div>
                    </div>
                    {pwError ? <p className="account-error">{pwError}</p> : null}
                    <button className="btn-primary account-inline-btn" type="button" onClick={submitPassword}>
                      {t("account.updatePassword")}
                    </button>
                  </div>
                )}

              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountSettings() {
  const { isAccountOpen } = useUI();
  const { user } = useAuth();
  if (!isAccountOpen || !user) return null;
  return <AccountSettingsModal />;
}
