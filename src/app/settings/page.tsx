"use client";

import { useState, useCallback } from "react";
import { computeProfileStrength, useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { uploadDataUrl } from "@/lib/storage";
import { COUNTRIES } from "@/lib/countries";
import { initials, maskEmail } from "@/lib/format";
import Link from "next/link";
import AvatarUploader from "@/components/AvatarUploader";

type Tab = "profile" | "social" | "security" | "notifications";

export default function SettingsPage() {
  const { user, account, profile, updateProfile, changePassword, signOut } = useAuth();
  const { toast, openAuth } = useUI();

  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarData, setAvatarData] = useState<string | null>(null);

  const [fullName, setFullName] = useState(profile.fullName || "");
  const [title, setTitle] = useState(profile.title || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [country, setCountry] = useState(profile.country || "");
  const [languages, setLanguages] = useState(profile.languages || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [portfolio, setPortfolio] = useState(profile.portfolio || "");

  const socialLinks = profile.socialLinks ?? {};
  const [linkedin, setLinkedin] = useState(socialLinks.linkedin || "");
  const [github, setGithub] = useState(socialLinks.github || "");
  const [behance, setBehance] = useState(socialLinks.behance || "");
  const [dribbble, setDribbble] = useState(socialLinks.dribbble || "");
  const [twitter, setTwitter] = useState(socialLinks.twitter || "");

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNext, setPwNext] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwError, setPwError] = useState("");

  const [emailProjects, setEmailProjects] = useState(true);
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [emailChat, setEmailChat] = useState(true);
  const [emailBookings, setEmailBookings] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);

  const strength = computeProfileStrength({
    ...profile,
    fullName,
    title,
    phone,
    country,
    avatar: avatarData ?? profile.avatar,
  });

  const saveProfile = useCallback(async () => {
    if (saving) return;
    if (fullName.trim().length < 2) { toast("Name is required (min 2 characters)"); return; }
    setSaving(true);
    try {
      let avatarUrl = profile.avatar;
      if (avatarData && avatarData.startsWith("data:")) {
        const uploaded = await uploadDataUrl("avatars", user?.sub || "u", avatarData, "avatar");
        if (uploaded) avatarUrl = uploaded;
      } else if (avatarData === "") {
        avatarUrl = "";
      }
      updateProfile({
        fullName: fullName.trim(),
        title: title.trim(),
        phone: phone.trim(),
        country,
        languages: languages.trim(),
        bio: bio.trim(),
        portfolio: portfolio.trim(),
        avatar: avatarUrl,
        socialLinks: {
          linkedin: linkedin.trim(),
          github: github.trim(),
          behance: behance.trim(),
          dribbble: dribbble.trim(),
          twitter: twitter.trim(),
        },
      });
      setSaved(true);
      toast("Profile saved!");
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [saving, fullName, title, phone, country, languages, bio, portfolio, avatarData, linkedin, github, behance, dribbble, twitter, profile.avatar, user?.sub, updateProfile, toast]);

  const submitPassword = async () => {
    setPwError("");
    if (!pwCurrent) { setPwError("Enter your current password"); return; }
    if (pwNext.length < 8) { setPwError("New password must be at least 8 characters"); return; }
    if (pwNext !== pwConfirm) { setPwError("Passwords don't match"); return; }
    const result = await changePassword({ current: pwCurrent, next: pwNext });
    if (!result.ok) { setPwError("Failed to update password. Check your current password."); return; }
    setPwCurrent(""); setPwNext(""); setPwConfirm("");
    toast("Password updated!");
  };

  if (!user) {
    return (
      <section className="section"><div className="wrap" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: ".5rem" }}>Settings</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Please sign in to manage your settings.</p>
        <button className="btn-primary" onClick={() => openAuth("login")}>Sign In</button>
      </div></section>
    );
  }

  const isGoogle = account?.provider === "google" && !account.passwordHash;
  const masked = maskEmail(account?.email || user.email);
  const avatarSrc = avatarData ?? profile.avatar;

  return (
    <div>
      <section className="st-page">
        <div className="wrap">
          <div className="st-header">
            <div>
              <h1>Settings</h1>
              <p>Manage your profile, connections, security, and preferences.</p>
            </div>
            <Link href="/dashboard" className="st-back">← Dashboard</Link>
          </div>

          <div className="st-layout">
            {/* ═══ SIDEBAR ═══ */}
            <aside className="st-sidebar">
              <div className="st-profile-card">
                <div className="st-card-avatar">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="" className="st-card-img" />
                  ) : (
                    <div className="st-card-initials">{initials(fullName || user.name)}</div>
                  )}
                  <div className="st-card-status" />
                </div>
                <strong className="st-card-name">{fullName || user.name}</strong>
                {title && <span className="st-card-role">{title}</span>}
                <span className="st-card-email">{masked}</span>
                <div className="st-strength">
                  <div className="st-strength-bar">
                    <div className="st-strength-fill" style={{ width: `${strength.percent}%` }} />
                  </div>
                  <div className="st-strength-row">
                    <span className="st-strength-label">Profile Strength</span>
                    <span className="st-strength-pct" style={{ color: strength.percent === 100 ? "#059669" : "#0066cc" }}>{strength.percent}%</span>
                  </div>
                </div>
                {strength.percent < 100 && (
                  <div className="st-missing">
                    {strength.items.filter((i) => !i.done).map((i) => (
                      <span key={i.key} className="st-missing-item">○ {i.label}</span>
                    ))}
                  </div>
                )}
              </div>

              <nav className="st-nav">
                {([
                  { id: "profile" as const, label: "Profile", icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
                  { id: "social" as const, label: "Social Links", icon: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></> },
                  { id: "security" as const, label: "Security", icon: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> },
                  { id: "notifications" as const, label: "Notifications", icon: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></> },
                ]).map((item) => (
                  <button key={item.id} type="button" className={"st-nav-btn" + (tab === item.id ? " st-nav-active" : "")} onClick={() => setTab(item.id)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{item.icon}</svg>
                    {item.label}
                  </button>
                ))}
              </nav>

              <button type="button" className="st-signout" onClick={() => { signOut(); toast("Signed out"); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </aside>

            {/* ═══ CONTENT ═══ */}
            <div className="st-content">

              {/* ── PROFILE TAB ── */}
              {tab === "profile" && (
                <>
                  <div className="st-section">
                    <div className="st-section-head">
                      <h2>Profile Picture</h2>
                      <p>Upload a clear photo — clients trust real faces.</p>
                    </div>
                    <div className="st-avatar-area">
                      <AvatarUploader
                        value={avatarSrc}
                        fallback={initials(fullName || user.name)}
                        onSave={(dataUrl: string) => setAvatarData(dataUrl)}
                        onRemove={() => setAvatarData("")}
                      />
                    </div>
                  </div>

                  <div className="st-section">
                    <div className="st-section-head">
                      <h2>Personal Information</h2>
                      <p>Basic details that appear on your profile.</p>
                    </div>
                    <div className="st-grid-2">
                      <label className="st-field">
                        <span className="st-label">Full Name <span className="st-req">*</span></span>
                        <input className="st-input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Ahmad Khan" maxLength={60} />
                      </label>
                      <label className="st-field">
                        <span className="st-label">Company / Role</span>
                        <input className="st-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CEO at TechCorp" maxLength={70} />
                      </label>
                      <label className="st-field">
                        <span className="st-label">Phone Number <span className="st-req">*</span></span>
                        <input className="st-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +92 300 1234567" maxLength={20} />
                      </label>
                      <label className="st-field">
                        <span className="st-label">Country</span>
                        <select className="st-input" value={country} onChange={(e) => setCountry(e.target.value)}>
                          <option value="">Select your country</option>
                          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                      </label>
                      <label className="st-field">
                        <span className="st-label">Languages</span>
                        <input className="st-input" type="text" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="e.g. English, Urdu, Arabic" maxLength={80} />
                      </label>
                      <label className="st-field">
                        <span className="st-label">Website / Portfolio</span>
                        <input className="st-input" type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://your-site.com" maxLength={200} />
                      </label>
                    </div>
                  </div>

                  <div className="st-section">
                    <div className="st-section-head">
                      <h2>About You</h2>
                      <p>A short bio that tells clients who you are and what you do.</p>
                    </div>
                    <textarea className="st-textarea" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell clients about yourself, your business, and what you're looking for..." rows={4} maxLength={500} />
                    <span className="st-char-count">{bio.length}/500</span>
                  </div>

                  <div className="st-section">
                    <div className="st-section-head">
                      <h2>Profile Completion</h2>
                      <p>Complete all items to reach 100% and build client trust.</p>
                    </div>
                    <div className="st-checklist">
                      {strength.items.map((item) => (
                        <div key={item.key} className={"st-check-row" + (item.done ? " st-check-done" : "")}>
                          <span className="st-check-icon">{item.done ? "✓" : "○"}</span>
                          <span>{item.label}</span>
                          {item.done && <span className="st-check-badge">Done</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="st-save-bar">
                    {saved && <span className="st-saved-msg">Changes saved!</span>}
                    <button type="button" className="st-btn-primary" disabled={saving} onClick={saveProfile}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </>
              )}

              {/* ── SOCIAL LINKS TAB ── */}
              {tab === "social" && (
                <>
                  <div className="st-section">
                    <div className="st-section-head">
                      <h2>Social & Professional Links</h2>
                      <p>Add your profiles so clients can verify your skills and connect with you.</p>
                    </div>
                    <div className="st-social-fields">
                      <label className="st-social-field">
                        <span className="st-social-icon" style={{ color: "#0077b5" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.3 6.5a1.78 1.78 0 0 1-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>
                        </span>
                        <div className="st-social-input-wrap">
                          <span className="st-social-name">LinkedIn</span>
                          <input className="st-input" type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/your-profile" />
                        </div>
                      </label>

                      <label className="st-social-field">
                        <span className="st-social-icon" style={{ color: "var(--text-primary)" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                        </span>
                        <div className="st-social-input-wrap">
                          <span className="st-social-name">GitHub</span>
                          <input className="st-input" type="url" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/your-username" />
                        </div>
                      </label>

                      <label className="st-social-field">
                        <span className="st-social-icon" style={{ color: "#1da1f2" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </span>
                        <div className="st-social-input-wrap">
                          <span className="st-social-name">X (Twitter)</span>
                          <input className="st-input" type="url" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/your-handle" />
                        </div>
                      </label>

                      <label className="st-social-field">
                        <span className="st-social-icon" style={{ color: "#1769ff" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24C5.37 24 0 18.63 0 12S5.37 0 12 0s12 5.37 12 12-5.37 12-12 12zm3.85-16.77c-.06-.3-.22-.54-.46-.7a1.12 1.12 0 0 0-.83-.16c-.3.06-.54.22-.7.46L12 10.08l-1.85-3.25a1.12 1.12 0 0 0-.7-.46 1.12 1.12 0 0 0-.83.16c-.24.16-.4.4-.46.7-.06.3 0 .6.16.83L10.58 12l-2.26 3.94c-.16.24-.22.54-.16.83.06.3.22.54.46.7.16.1.34.16.54.16.1 0 .2-.02.3-.05.3-.06.54-.22.7-.46L12 13.92l1.85 3.25c.16.24.4.4.7.46.1.02.2.05.3.05.2 0 .38-.06.54-.16.24-.16.4-.4.46-.7.06-.3 0-.6-.16-.83L13.42 12l2.26-3.94c.16-.24.22-.54.16-.83z"/></svg>
                        </span>
                        <div className="st-social-input-wrap">
                          <span className="st-social-name">Behance</span>
                          <input className="st-input" type="url" value={behance} onChange={(e) => setBehance(e.target.value)} placeholder="https://behance.net/your-profile" />
                        </div>
                      </label>

                      <label className="st-social-field">
                        <span className="st-social-icon" style={{ color: "#ea4c89" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.81zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-2.03-1.806-4.7-2.907-7.627-2.907-.54 0-1.067.04-1.57.118zm10.14 3.14c-.21.29-1.9 2.49-5.69 4.02.227.47.443.95.645 1.43.07.17.14.34.21.51 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.29z"/></svg>
                        </span>
                        <div className="st-social-input-wrap">
                          <span className="st-social-name">Dribbble</span>
                          <input className="st-input" type="url" value={dribbble} onChange={(e) => setDribbble(e.target.value)} placeholder="https://dribbble.com/your-profile" />
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="st-save-bar">
                    {saved && <span className="st-saved-msg">Changes saved!</span>}
                    <button type="button" className="st-btn-primary" disabled={saving} onClick={saveProfile}>
                      {saving ? "Saving..." : "Save Social Links"}
                    </button>
                  </div>
                </>
              )}

              {/* ── SECURITY TAB ── */}
              {tab === "security" && (
                <>
                  <div className="st-section">
                    <div className="st-section-head">
                      <h2>Email Address</h2>
                      <p>Your account email — used for signing in and notifications.</p>
                    </div>
                    <div className="st-email-row">
                      <div className="st-email-left">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        <span className="st-email-value">{masked}</span>
                      </div>
                      <span className={"st-badge " + (isGoogle ? "st-badge-blue" : "st-badge-green")}>
                        {isGoogle ? "Google Account" : "Email & Password"}
                      </span>
                    </div>
                  </div>

                  {!isGoogle && (
                    <div className="st-section">
                      <div className="st-section-head">
                        <h2>Change Password</h2>
                        <p>Update your password regularly to keep your account secure.</p>
                      </div>
                      <div className="st-pw-fields">
                        <label className="st-field">
                          <span className="st-label">Current Password</span>
                          <input className="st-input" type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} autoComplete="current-password" />
                        </label>
                        <label className="st-field">
                          <span className="st-label">New Password</span>
                          <input className="st-input" type="password" value={pwNext} onChange={(e) => setPwNext(e.target.value)} autoComplete="new-password" placeholder="Min 8 characters" />
                        </label>
                        <label className="st-field">
                          <span className="st-label">Confirm New Password</span>
                          <input className="st-input" type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} autoComplete="new-password" />
                        </label>
                      </div>
                      {pwError && <p className="st-error">{pwError}</p>}
                      <button type="button" className="st-btn-primary" style={{ marginTop: ".75rem" }} onClick={submitPassword}>Update Password</button>
                    </div>
                  )}

                  {isGoogle && (
                    <div className="st-section">
                      <div className="st-section-head">
                        <h2>Password</h2>
                        <p>Your account is managed by Google. Change your password through Google account settings.</p>
                      </div>
                    </div>
                  )}

                  <div className="st-section">
                    <div className="st-section-head">
                      <h2>Active Sessions</h2>
                      <p>Devices currently signed in to your account.</p>
                    </div>
                    <div className="st-session-card">
                      <div className="st-session-left">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        <div>
                          <strong>This Browser</strong>
                          <span>Active now</span>
                        </div>
                      </div>
                      <span className="st-badge st-badge-green">Active</span>
                    </div>
                  </div>

                  <div className="st-section st-section-danger">
                    <div className="st-section-head">
                      <h2 style={{ color: "#dc2626" }}>Danger Zone</h2>
                      <p>Irreversible actions. Be careful.</p>
                    </div>
                    <button type="button" className="st-btn-danger" onClick={() => toast("Contact support@hirelyx.com to delete your account")}>
                      Delete Account
                    </button>
                  </div>
                </>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
              {tab === "notifications" && (
                <>
                  <div className="st-section">
                    <div className="st-section-head">
                      <h2>Email Notifications</h2>
                      <p>Control which emails you receive from Hirelyx.</p>
                    </div>
                    <div className="st-toggles">
                      {([
                        { label: "Project Updates", desc: "Milestones, status changes, and team comments on your projects.", checked: emailProjects, set: setEmailProjects },
                        { label: "Invoices & Payments", desc: "New invoices, payment confirmations, and receipts.", checked: emailInvoices, set: setEmailInvoices },
                        { label: "Chat Messages", desc: "Get notified when the team sends you a message.", checked: emailChat, set: setEmailChat },
                        { label: "Booking Confirmations", desc: "Reminders and confirmations for scheduled consultations.", checked: emailBookings, set: setEmailBookings },
                        { label: "Tips & New Features", desc: "Occasional updates about new services, features, and tips.", checked: emailMarketing, set: setEmailMarketing },
                      ]).map((item) => (
                        <label key={item.label} className="st-toggle-row">
                          <div>
                            <strong>{item.label}</strong>
                            <span>{item.desc}</span>
                          </div>
                          <input type="checkbox" className="st-toggle" checked={item.checked} onChange={(e) => item.set(e.target.checked)} />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="st-save-bar">
                    <button type="button" className="st-btn-primary" onClick={() => toast("Notification preferences saved!")}>
                      Save Preferences
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .st-page{padding:2rem 1rem 4rem}
        .st-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem;flex-wrap:wrap;gap:1rem}
        .st-header h1{font-size:1.6rem;font-weight:800;margin:0}
        .st-header p{color:var(--text-secondary);font-size:.9rem;margin:.2rem 0 0}
        .st-back{font-size:.85rem;color:var(--accent);text-decoration:none;font-weight:600}

        .st-layout{display:grid;grid-template-columns:280px 1fr;gap:2rem;align-items:start}

        .st-sidebar{position:sticky;top:5rem;display:flex;flex-direction:column;gap:1rem}
        .st-profile-card{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.5rem;text-align:center;display:flex;flex-direction:column;align-items:center}
        .st-card-avatar{position:relative;margin-bottom:.6rem}
        .st-card-img{width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--border)}
        .st-card-initials{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#0066cc,#059669);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:800}
        .st-card-status{position:absolute;bottom:2px;right:2px;width:14px;height:14px;border-radius:50%;background:#059669;border:3px solid var(--surface)}
        .st-card-name{font-size:.95rem;margin-bottom:.1rem}
        .st-card-role{font-size:.78rem;color:var(--text-secondary);display:block}
        .st-card-email{font-size:.72rem;color:var(--text-secondary);margin-top:.25rem}

        .st-strength{width:100%;margin-top:.75rem}
        .st-strength-bar{height:6px;background:var(--border);border-radius:999px;overflow:hidden}
        .st-strength-fill{height:100%;background:linear-gradient(90deg,#0066cc,#059669);border-radius:999px;transition:width .4s}
        .st-strength-row{display:flex;justify-content:space-between;margin-top:.25rem}
        .st-strength-label{font-size:.65rem;color:var(--text-secondary);font-weight:600}
        .st-strength-pct{font-size:.65rem;font-weight:800}

        .st-missing{margin-top:.5rem;display:flex;flex-direction:column;gap:.15rem;text-align:left;width:100%}
        .st-missing-item{font-size:.7rem;color:var(--text-secondary)}

        .st-nav{display:flex;flex-direction:column;gap:.25rem}
        .st-nav-btn{display:flex;align-items:center;gap:.6rem;padding:.6rem .8rem;border-radius:.5rem;background:none;border:none;font:inherit;font-size:.85rem;font-weight:500;color:var(--text-secondary);cursor:pointer;text-align:left;transition:all .15s}
        .st-nav-btn:hover{background:var(--surface);color:var(--text-primary)}
        .st-nav-active{background:var(--surface);color:var(--accent);font-weight:700;border:1px solid var(--border)}

        .st-signout{display:flex;align-items:center;gap:.5rem;padding:.5rem .8rem;border-radius:.5rem;background:none;border:none;font:inherit;font-size:.8rem;color:#dc2626;cursor:pointer;margin-top:.5rem;transition:background .15s}
        .st-signout:hover{background:#dc262608}

        .st-content{min-width:0}
        .st-section{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.5rem;margin-bottom:1.25rem}
        .st-section-head{margin-bottom:1.25rem}
        .st-section-head h2{font-size:1.05rem;font-weight:700;margin:0 0 .15rem}
        .st-section-head p{font-size:.82rem;color:var(--text-secondary);margin:0}
        .st-section-danger{border-color:#dc262630}

        .st-avatar-area{display:flex;justify-content:center}

        .st-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .st-field{display:flex;flex-direction:column;gap:.25rem}
        .st-label{font-size:.78rem;font-weight:600;color:var(--text-primary)}
        .st-req{color:#dc2626}

        .st-input{padding:.55rem .75rem;border-radius:.5rem;border:1px solid var(--border);font:inherit;font-size:.88rem;background:var(--bg);color:var(--text-primary);transition:border-color .15s}
        .st-input:focus{outline:none;border-color:#0066cc}
        select.st-input{cursor:pointer}

        .st-textarea{width:100%;padding:.6rem .8rem;border-radius:.5rem;border:1px solid var(--border);font:inherit;font-size:.88rem;background:var(--bg);color:var(--text-primary);resize:vertical;min-height:100px;transition:border-color .15s}
        .st-textarea:focus{outline:none;border-color:#0066cc}
        .st-char-count{display:block;text-align:right;font-size:.68rem;color:var(--text-secondary);margin-top:.25rem}

        .st-checklist{display:flex;flex-direction:column;gap:.4rem}
        .st-check-row{display:flex;align-items:center;gap:.5rem;font-size:.82rem;font-weight:500;color:var(--text-secondary);padding:.4rem .6rem;border-radius:.4rem;transition:background .15s}
        .st-check-done{color:#059669;background:#05966908}
        .st-check-icon{font-size:.78rem;width:20px;text-align:center}
        .st-check-badge{margin-left:auto;font-size:.62rem;font-weight:700;padding:.15rem .45rem;border-radius:999px;background:#05966914;color:#059669}

        .st-save-bar{display:flex;justify-content:flex-end;align-items:center;gap:1rem;margin-bottom:2rem}
        .st-saved-msg{font-size:.82rem;color:#059669;font-weight:600;animation:stFadeIn .3s}
        @keyframes stFadeIn{from{opacity:0}to{opacity:1}}

        .st-btn-primary{padding:.6rem 1.5rem;border-radius:.5rem;background:linear-gradient(135deg,#0066cc,#0891b2);color:#fff;border:none;font:inherit;font-size:.88rem;font-weight:700;cursor:pointer;transition:transform .15s,box-shadow .15s}
        .st-btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,102,204,.2)}
        .st-btn-primary:disabled{opacity:.5;cursor:not-allowed}

        .st-btn-danger{padding:.5rem 1.25rem;border-radius:.5rem;background:none;border:1px solid #dc262640;color:#dc2626;font:inherit;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .15s}
        .st-btn-danger:hover{background:#dc262608;border-color:#dc2626}

        /* Social Links */
        .st-social-fields{display:flex;flex-direction:column;gap:.75rem}
        .st-social-field{display:flex;align-items:flex-start;gap:.75rem;padding:.75rem;background:var(--bg);border-radius:.6rem;border:1px solid var(--border);transition:border-color .15s}
        .st-social-field:focus-within{border-color:#0066cc}
        .st-social-icon{width:40px;height:40px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--surface);border-radius:.5rem}
        .st-social-input-wrap{flex:1;display:flex;flex-direction:column;gap:.2rem}
        .st-social-name{font-size:.75rem;font-weight:700;color:var(--text-primary)}
        .st-social-input-wrap .st-input{border:none;padding:.3rem 0;font-size:.85rem;background:transparent}
        .st-social-input-wrap .st-input:focus{outline:none}

        /* Security */
        .st-email-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem}
        .st-email-left{display:flex;align-items:center;gap:.5rem}
        .st-email-value{font-size:.9rem;font-weight:600}
        .st-badge{font-size:.68rem;font-weight:700;padding:.2rem .6rem;border-radius:999px}
        .st-badge-green{background:#05966914;color:#059669}
        .st-badge-blue{background:#0066cc14;color:#0066cc}
        .st-pw-fields{display:flex;flex-direction:column;gap:.75rem;max-width:400px}
        .st-error{color:#dc2626;font-size:.82rem;margin:.5rem 0 0}

        .st-session-card{display:flex;justify-content:space-between;align-items:center;padding:.75rem;background:var(--bg);border-radius:.5rem}
        .st-session-left{display:flex;align-items:center;gap:.6rem}
        .st-session-left strong{font-size:.85rem;display:block}
        .st-session-left span{font-size:.72rem;color:var(--text-secondary);display:block}

        /* Notification toggles */
        .st-toggles{display:flex;flex-direction:column;gap:.5rem}
        .st-toggle-row{display:flex;justify-content:space-between;align-items:center;padding:.75rem;background:var(--bg);border-radius:.6rem;cursor:pointer;gap:1rem}
        .st-toggle-row strong{font-size:.85rem;display:block;color:var(--text-primary)}
        .st-toggle-row span{font-size:.72rem;color:var(--text-secondary);display:block;margin-top:.1rem}
        .st-toggle{width:40px;height:22px;appearance:none;-webkit-appearance:none;background:var(--border);border-radius:999px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}
        .st-toggle::before{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
        .st-toggle:checked{background:#059669}
        .st-toggle:checked::before{transform:translateX(18px)}

        @media(max-width:768px){
          .st-layout{grid-template-columns:1fr}
          .st-sidebar{position:static}
          .st-profile-card{flex-direction:row;text-align:left;gap:1rem;flex-wrap:wrap}
          .st-card-avatar{margin-bottom:0}
          .st-strength{margin-top:.5rem}
          .st-nav{flex-direction:row;overflow-x:auto;gap:.35rem}
          .st-nav-btn{white-space:nowrap;padding:.5rem .65rem;font-size:.8rem}
          .st-grid-2{grid-template-columns:1fr}
          .st-missing{display:none}
        }
      `}</style>
    </div>
  );
}
