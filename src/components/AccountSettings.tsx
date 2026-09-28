"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { initials, maskEmail } from "@/lib/format";
import type { PortfolioProject } from "@/lib/types";
import {
  PORTFOLIO_CATEGORIES,
  coverStyle,
  portfolioGlyph,
} from "@/lib/portfolio";

/* ==========================================================================
   APEX · ACCOUNT & SETTINGS
   A secure, light-mode dashboard for personal information, security,
   identity verification, portfolio projects and privacy controls.
   ========================================================================== */

type Tab = "personal" | "security" | "verification" | "portfolio" | "privacy";

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
  {
    id: "verification",
    labelKey: "account.tabVerification",
    icon: (
      <>
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
  },
  {
    id: "portfolio",
    labelKey: "account.tabPortfolio",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
      </>
    ),
  },
  {
    id: "privacy",
    labelKey: "account.tabPrivacy",
    icon: (
      <>
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={"toggle" + (checked ? " on" : "")}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-knob" />
    </button>
  );
}

function uid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `pf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
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

  const [draft, setDraft] = useState<PortfolioProject>({
    id: "",
    title: "",
    category: PORTFOLIO_CATEGORIES[0],
    summary: "",
    tags: [],
    link: "",
    cover: "",
  });
  const [tagText, setTagText] = useState("");

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

  const phoneVerified = profile.phone.replace(/\D/g, "").length >= 7;

  const submitPassword = () => {
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
    const result = changePassword({ current: pwCurrent, next: pwNext });
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

  const addProject = () => {
    const title = draft.title.trim();
    if (title.length < 3) {
      toast(t("account.projectTitleShort"));
      return;
    }
    const tags = tagText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 8);
    const project: PortfolioProject = {
      ...draft,
      id: uid(),
      title,
      tags,
      summary: draft.summary.trim(),
      link: draft.link.trim(),
      cover: draft.cover.trim(),
      updatedAt: Date.now(),
    };
    updateProfile({ portfolioProjects: [project, ...profile.portfolioProjects] });
    setDraft({
      id: "",
      title: "",
      category: PORTFOLIO_CATEGORIES[0],
      summary: "",
      tags: [],
      link: "",
      cover: "",
    });
    setTagText("");
    toast(t("account.projectAdded"));
  };

  const removeProject = (id: string) => {
    updateProfile({
      portfolioProjects: profile.portfolioProjects.filter((item) => item.id !== id),
    });
    toast(t("account.projectRemoved"));
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

                <div className="account-row">
                  <div>
                    <strong>{t("account.twoFactor")}</strong>
                    <p>{t("account.twoFactorSub")}</p>
                  </div>
                  <Toggle
                    checked={profile.twoFactor}
                    label={t("account.twoFactor")}
                    onChange={(value) => updateProfile({ twoFactor: value })}
                  />
                </div>
              </>
            )}

            {tab === "verification" && (
              <>
                <div className="account-section-head">
                  <h3>{t("account.verificationTitle")}</h3>
                  <p>{t("account.verificationSub")}</p>
                </div>
                <div className="verify-grid">
                  {[
                    { id: "email", label: t("account.verEmail"), note: masked, done: true },
                    {
                      id: "phone",
                      label: t("account.verPhone"),
                      note: phoneVerified ? profile.phone : t("account.addPhone"),
                      done: phoneVerified,
                    },
                    {
                      id: "identity",
                      label: t("account.verIdentity"),
                      note: profile.idVerified ? t("account.verified") : t("account.notVerifiedNote"),
                      done: profile.idVerified,
                    },
                    {
                      id: "payment",
                      label: t("account.verPayment"),
                      note: profile.paymentVerified ? t("account.verified") : t("account.notVerifiedNote"),
                      done: profile.paymentVerified,
                    },
                  ].map((item) => (
                    <div className="verify-card" key={item.id}>
                      <span className={"verify-icon" + (item.done ? " ok" : "")} aria-hidden="true">
                        {item.done ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                            <path d="M12 8v5" />
                            <path d="M12 16h.01" />
                          </svg>
                        )}
                      </span>
                      <div className="verify-info">
                        <strong>{item.label}</strong>
                        <span>{item.note}</span>
                      </div>
                      <span className={"status-pill " + (item.done ? "ok" : "warn")}>
                        {item.done ? t("account.verified") : t("account.notVerified")}
                      </span>
                      {!item.done && item.id !== "phone" && (
                        <button
                          className="btn-ghost account-inline-btn"
                          type="button"
                          onClick={() => {
                            if (item.id === "identity") {
                              updateProfile({ idVerified: true });
                              toast(t("account.identitySubmitted"));
                            } else {
                              updateProfile({ paymentVerified: true });
                              toast(t("account.paymentAdded"));
                            }
                          }}
                        >
                          {t("account.verifyNow")}
                        </button>
                      )}
                      {!item.done && item.id === "phone" && (
                        <button
                          className="btn-ghost account-inline-btn"
                          type="button"
                          onClick={() => setTab("personal")}
                        >
                          {t("account.addPhone")}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "portfolio" && (
              <>
                <div className="account-section-head">
                  <h3>{t("account.portfolioTitle")}</h3>
                  <p>{t("account.portfolioSub")}</p>
                </div>

                <div className="account-form-block">
                  <div className="field-grid">
                    <div className="form-field">
                      <label>{t("account.projectTitle")}</label>
                      <input
                        type="text"
                        value={draft.title}
                        placeholder={t("account.projectTitlePlaceholder")}
                        onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label>{t("account.projectCategory")}</label>
                      <select
                        value={draft.category}
                        onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                      >
                        {PORTFOLIO_CATEGORIES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>{t("account.projectTags")}</label>
                      <input
                        type="text"
                        value={tagText}
                        placeholder="React, Next.js, TypeScript"
                        onChange={(event) => setTagText(event.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label>{t("account.projectLink")}</label>
                      <input
                        type="url"
                        value={draft.link}
                        placeholder="https://your-project.com"
                        onChange={(event) => setDraft({ ...draft, link: event.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label>{t("account.projectCover")}</label>
                      <input
                        type="url"
                        value={draft.cover}
                        placeholder="https://…/cover.jpg"
                        onChange={(event) => setDraft({ ...draft, cover: event.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label>{t("profile.bio")}</label>
                      <input
                        type="text"
                        value={draft.summary}
                        placeholder={t("account.projectSummaryPlaceholder")}
                        onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
                      />
                    </div>
                  </div>
                  <button className="btn-primary account-inline-btn" type="button" onClick={addProject}>
                    + {t("account.addProject")}
                  </button>
                </div>

                {profile.portfolioProjects.length === 0 ? (
                  <p className="account-empty">{t("account.noProjects")}</p>
                ) : (
                  <ul className="project-manage">
                    {profile.portfolioProjects.map((project) => (
                      <li key={project.id}>
                        <span className="project-manage-cover" style={coverStyle(project.cover)}>
                          {portfolioGlyph(project.category)}
                        </span>
                        <div className="project-manage-info">
                          <strong>{project.title}</strong>
                          <span>
                            {project.category}
                            {project.tags.length > 0 ? ` · ${project.tags.join(", ")}` : ""}
                          </span>
                        </div>
                        <button
                          className="btn-ghost btn-sm danger"
                          type="button"
                          onClick={() => removeProject(project.id)}
                        >
                          {t("account.removeProject")}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {tab === "privacy" && (
              <>
                <div className="account-section-head">
                  <h3>{t("account.privacyTitle")}</h3>
                  <p>{t("account.privacySub")}</p>
                </div>
                <div className="account-row">
                  <div>
                    <strong>{t("account.maskEmail")}</strong>
                    <p>{t("account.maskEmailSub")}</p>
                  </div>
                  <Toggle
                    checked={profile.emailMasked}
                    label={t("account.maskEmail")}
                    onChange={(value) => updateProfile({ emailMasked: value })}
                  />
                </div>
                <div className="account-row">
                  <div>
                    <strong>{t("account.publicProfile")}</strong>
                    <p>{t("account.publicProfileSub")}</p>
                  </div>
                  <Toggle
                    checked={profile.profilePublic}
                    label={t("account.publicProfile")}
                    onChange={(value) => updateProfile({ profilePublic: value })}
                  />
                </div>
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
