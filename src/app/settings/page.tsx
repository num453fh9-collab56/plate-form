"use client";

import { useState, useCallback } from "react";
import { computeProfileStrength, useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { uploadDataUrl } from "@/lib/storage";
import { COUNTRIES } from "@/lib/countries";
import { initials, maskEmail } from "@/lib/format";
import Link from "next/link";
import AvatarUploader from "@/components/AvatarUploader";

type Tab = "profile" | "security" | "notifications";

export default function SettingsPage() {
  const { user, account, profile, updateProfile, changePassword, signOut } = useAuth();
  const { toast, openAuth } = useUI();

  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [avatarData, setAvatarData] = useState<string | null>(null);

  // Profile fields
  const [fullName, setFullName] = useState(profile.fullName || "");
  const [title, setTitle] = useState(profile.title || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [country, setCountry] = useState(profile.country || "");
  const [city, setCity] = useState(profile.bio?.startsWith("city:") ? profile.bio.slice(5) : "");
  const [languages, setLanguages] = useState(profile.languages || "");

  // Security fields
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNext, setPwNext] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwError, setPwError] = useState("");

  // Notification prefs
  const [emailProjects, setEmailProjects] = useState(true);
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [emailChat, setEmailChat] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);

  const strength = computeProfileStrength({
    ...profile,
    fullName,
    title,
    phone,
    country,
    avatar: avatarData || profile.avatar,
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
        avatar: avatarUrl,
      });
      toast("Profile saved!");
    } catch {
      toast("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [saving, fullName, title, phone, country, languages, avatarData, profile.avatar, user?.sub, updateProfile, toast]);

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

  return (
    <main>
      <section className="st-page">
        <div className="wrap">
          {/* Page Header */}
          <div className="st-header">
            <div>
              <h1>Settings</h1>
              <p>Manage your profile, security, and preferences.</p>
            </div>
            <Link href="/dashboard" className="st-back">← Dashboard</Link>
          </div>

          <div className="st-layout">
            {/* Sidebar */}
            <aside className="st-sidebar">
              {/* Profile card */}
              <div className="st-profile-card">
                <div className="st-avatar-wrap">
                  {(avatarData || profile.avatar) ? (
                    <img src={avatarData || profile.avatar} alt="" className="st-avatar-img" />
                  ) : (
                    <div className="st-avatar-placeholder">{initials(fullName || user.name)}</div>
                  )}
                </div>
                <strong className="st-card-name">{fullName || user.name}</strong>
                {title && <span className="st-card-role">{title}</span>}
                <span className="st-card-email">{masked}</span>

                {/* Strength ring */}
                <div className="st-strength">
                  <div className="st-strength-bar">
                    <div className="st-strength-fill" style={{ width: `${strength.percent}%` }} />
                  </div>
                  <span className="st-strength-label">{strength.percent}% complete</span>
                </div>
              </div>

              {/* Nav tabs */}
              <nav className="st-nav">
                <button type="button" className={"st-nav-btn" + (tab === "profile" ? " st-nav-active" : "")} onClick={() => setTab("profile")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile
                </button>
                <button type="button" className={"st-nav-btn" + (tab === "security" ? " st-nav-active" : "")} onClick={() => setTab("security")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Security
                </button>
                <button type="button" className={"st-nav-btn" + (tab === "notifications" ? " st-nav-active" : "")} onClick={() => setTab("notifications")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  Notifications
                </button>
              </nav>

              <button type="button" className="st-signout" onClick={() => { signOut(); toast("Signed out"); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </aside>

            {/* Main content */}
            <div className="st-content">

              {/* ══════════ PROFILE TAB ══════════ */}
              {tab === "profile" && (
                <>
                  <div className="st-section">
                    <h2>Profile Picture</h2>
                    <p className="st-section-sub">Upload a photo so clients can recognize you.</p>
                    <div className="st-avatar-upload">
                      <AvatarUploader
                        value={avatarData || profile.avatar}
                        fallback={initials(fullName || user.name)}
                        onSave={(dataUrl: string) => setAvatarData(dataUrl)}
                        onRemove={() => setAvatarData("")}
                      />
                    </div>
                  </div>

                  <div className="st-section">
                    <h2>Personal Information</h2>
                    <p className="st-section-sub">This information helps us personalize your experience.</p>

                    <div className="st-fields">
                      <label className="st-field">
                        <span className="st-field-label">Full Name <span className="st-req">*</span></span>
                        <input className="st-input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Ahmad Khan" maxLength={60} />
                      </label>

                      <label className="st-field">
                        <span className="st-field-label">Company / Role</span>
                        <input className="st-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CEO at TechCorp, Startup Founder" maxLength={70} />
                        <span className="st-field-hint">This appears on your profile card.</span>
                      </label>

                      <label className="st-field">
                        <span className="st-field-label">Phone Number <span className="st-req">*</span></span>
                        <input className="st-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +92 300 1234567" maxLength={20} />
                      </label>

                      <label className="st-field">
                        <span className="st-field-label">Country</span>
                        <select className="st-input" value={country} onChange={(e) => setCountry(e.target.value)}>
                          <option value="">Select your country</option>
                          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                      </label>

                      <label className="st-field">
                        <span className="st-field-label">City</span>
                        <input className="st-input" type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Lahore, Karachi" maxLength={40} />
                      </label>

                      <label className="st-field">
                        <span className="st-field-label">Languages</span>
                        <input className="st-input" type="text" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="e.g. English, Urdu, Arabic" maxLength={80} />
                      </label>
                    </div>
                  </div>

                  {/* Profile checklist */}
                  <div className="st-section">
                    <h2>Profile Completion</h2>
                    <p className="st-section-sub">Complete all items to reach 100%.</p>
                    <div className="st-checklist">
                      {strength.items.map((item) => (
                        <div key={item.key} className={"st-check-row" + (item.done ? " st-check-done" : "")}>
                          <span className="st-check-icon">{item.done ? "✓" : "○"}</span>
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="st-save-bar">
                    <button type="button" className="st-btn-primary" disabled={saving} onClick={saveProfile}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </>
              )}

              {/* ══════════ SECURITY TAB ══════════ */}
              {tab === "security" && (
                <>
                  <div className="st-section">
                    <h2>Email Address</h2>
                    <p className="st-section-sub">Your account email address.</p>
                    <div className="st-email-row">
                      <span className="st-email-value">{masked}</span>
                      <span className={"st-badge " + (isGoogle ? "st-badge-blue" : "st-badge-green")}>
                        {isGoogle ? "Google Account" : "Email & Password"}
                      </span>
                    </div>
                  </div>

                  {!isGoogle && (
                    <div className="st-section">
                      <h2>Change Password</h2>
                      <p className="st-section-sub">Update your password to keep your account secure.</p>
                      <div className="st-fields st-fields-narrow">
                        <label className="st-field">
                          <span className="st-field-label">Current Password</span>
                          <input className="st-input" type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} autoComplete="current-password" />
                        </label>
                        <label className="st-field">
                          <span className="st-field-label">New Password</span>
                          <input className="st-input" type="password" value={pwNext} onChange={(e) => setPwNext(e.target.value)} autoComplete="new-password" placeholder="Min 8 characters" />
                        </label>
                        <label className="st-field">
                          <span className="st-field-label">Confirm New Password</span>
                          <input className="st-input" type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} autoComplete="new-password" />
                        </label>
                      </div>
                      {pwError && <p className="st-error">{pwError}</p>}
                      <button type="button" className="st-btn-primary" style={{ marginTop: ".75rem" }} onClick={submitPassword}>
                        Update Password
                      </button>
                    </div>
                  )}

                  {isGoogle && (
                    <div className="st-section">
                      <h2>Password</h2>
                      <p className="st-section-sub">Your account is managed by Google. Password changes should be made through your Google account settings.</p>
                    </div>
                  )}

                  <div className="st-section">
                    <h2>Sessions</h2>
                    <p className="st-section-sub">Manage your active sessions.</p>
                    <div className="st-session-row">
                      <div>
                        <strong>Current Session</strong>
                        <span className="st-session-detail">This browser · Active now</span>
                      </div>
                      <span className="st-badge st-badge-green">Active</span>
                    </div>
                  </div>
                </>
              )}

              {/* ══════════ NOTIFICATIONS TAB ══════════ */}
              {tab === "notifications" && (
                <>
                  <div className="st-section">
                    <h2>Email Notifications</h2>
                    <p className="st-section-sub">Choose what emails you receive.</p>

                    <div className="st-toggles">
                      <label className="st-toggle-row">
                        <div>
                          <strong>Project Updates</strong>
                          <span>Get notified about milestones, status changes, and comments.</span>
                        </div>
                        <input type="checkbox" className="st-toggle" checked={emailProjects} onChange={(e) => setEmailProjects(e.target.checked)} />
                      </label>
                      <label className="st-toggle-row">
                        <div>
                          <strong>Invoice & Payment</strong>
                          <span>Receive invoices, payment confirmations, and receipts.</span>
                        </div>
                        <input type="checkbox" className="st-toggle" checked={emailInvoices} onChange={(e) => setEmailInvoices(e.target.checked)} />
                      </label>
                      <label className="st-toggle-row">
                        <div>
                          <strong>Chat Messages</strong>
                          <span>Get notified when the team sends you a message.</span>
                        </div>
                        <input type="checkbox" className="st-toggle" checked={emailChat} onChange={(e) => setEmailChat(e.target.checked)} />
                      </label>
                      <label className="st-toggle-row">
                        <div>
                          <strong>Tips & Updates</strong>
                          <span>Occasional emails about new services and features.</span>
                        </div>
                        <input type="checkbox" className="st-toggle" checked={emailMarketing} onChange={(e) => setEmailMarketing(e.target.checked)} />
                      </label>
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
        .st-page { padding: 2rem 1rem 4rem }

        .st-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem }
        .st-header h1 { font-size: 1.6rem; font-weight: 800; margin: 0 }
        .st-header p { color: var(--text-secondary); font-size: .9rem; margin: .2rem 0 0 }
        .st-back { font-size: .85rem; color: var(--accent); text-decoration: none; font-weight: 600 }

        .st-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: start }

        /* Sidebar */
        .st-sidebar { position: sticky; top: 5rem; display: flex; flex-direction: column; gap: 1rem }

        .st-profile-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 1rem;
          padding: 1.5rem; text-align: center; display: flex; flex-direction: column; align-items: center;
        }
        .st-avatar-wrap { margin-bottom: .75rem }
        .st-avatar-img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid var(--border) }
        .st-avatar-placeholder {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #0066cc, #059669);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; font-weight: 800;
        }
        .st-card-name { font-size: .95rem; margin-bottom: .1rem }
        .st-card-role { font-size: .78rem; color: var(--text-secondary); display: block }
        .st-card-email { font-size: .72rem; color: var(--text-secondary); margin-top: .3rem }

        .st-strength { width: 100%; margin-top: .75rem }
        .st-strength-bar { height: 5px; background: var(--border); border-radius: 999px; overflow: hidden }
        .st-strength-fill { height: 100%; background: linear-gradient(90deg, #0066cc, #059669); border-radius: 999px; transition: width .4s }
        .st-strength-label { display: block; text-align: right; font-size: .65rem; color: var(--text-secondary); font-weight: 600; margin-top: .2rem }

        .st-nav { display: flex; flex-direction: column; gap: .25rem }
        .st-nav-btn {
          display: flex; align-items: center; gap: .6rem;
          padding: .6rem .8rem; border-radius: .5rem;
          background: none; border: none; font: inherit;
          font-size: .85rem; font-weight: 500; color: var(--text-secondary);
          cursor: pointer; text-align: left; transition: all .15s;
        }
        .st-nav-btn:hover { background: var(--surface); color: var(--text-primary) }
        .st-nav-active { background: var(--surface); color: var(--accent); font-weight: 700; border: 1px solid var(--border) }

        .st-signout {
          display: flex; align-items: center; gap: .5rem;
          padding: .5rem .8rem; border-radius: .5rem;
          background: none; border: none; font: inherit;
          font-size: .8rem; color: #dc2626; cursor: pointer;
          margin-top: .5rem; transition: background .15s;
        }
        .st-signout:hover { background: #dc262608 }

        /* Content area */
        .st-content { min-width: 0 }

        .st-section {
          background: var(--surface); border: 1px solid var(--border); border-radius: 1rem;
          padding: 1.5rem; margin-bottom: 1.25rem;
        }
        .st-section h2 { font-size: 1.05rem; font-weight: 700; margin: 0 0 .15rem }
        .st-section-sub { font-size: .82rem; color: var(--text-secondary); margin: 0 0 1.25rem }

        .st-avatar-upload { display: flex; justify-content: center }

        .st-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem }
        .st-fields-narrow { max-width: 480px; grid-template-columns: 1fr }

        .st-field { display: flex; flex-direction: column; gap: .25rem }
        .st-field-label { font-size: .78rem; font-weight: 600; color: var(--text-primary) }
        .st-req { color: #dc2626 }
        .st-field-hint { font-size: .7rem; color: var(--text-secondary) }

        .st-input {
          padding: .55rem .75rem; border-radius: .5rem;
          border: 1px solid var(--border); font: inherit; font-size: .88rem;
          background: var(--bg); color: var(--text-primary); transition: border-color .15s;
        }
        .st-input:focus { outline: none; border-color: #0066cc }
        select.st-input { cursor: pointer }

        .st-save-bar { display: flex; justify-content: flex-end; margin-bottom: 2rem }
        .st-btn-primary {
          padding: .6rem 1.5rem; border-radius: .5rem;
          background: linear-gradient(135deg, #0066cc, #0891b2);
          color: #fff; border: none; font: inherit; font-size: .88rem; font-weight: 700;
          cursor: pointer; transition: transform .15s, box-shadow .15s;
        }
        .st-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,102,204,.2) }
        .st-btn-primary:disabled { opacity: .5; cursor: not-allowed }

        .st-error { color: #dc2626; font-size: .82rem; margin: .5rem 0 0 }

        /* Security */
        .st-email-row { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap }
        .st-email-value { font-size: .9rem; font-weight: 600 }
        .st-badge { font-size: .68rem; font-weight: 700; padding: .2rem .6rem; border-radius: 999px }
        .st-badge-green { background: #05966914; color: #059669 }
        .st-badge-blue { background: #0066cc14; color: #0066cc }

        .st-session-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: .75rem; background: var(--bg); border-radius: .5rem;
        }
        .st-session-row strong { font-size: .85rem; display: block }
        .st-session-detail { font-size: .75rem; color: var(--text-secondary); display: block }

        /* Checklist */
        .st-checklist { display: flex; flex-direction: column; gap: .4rem }
        .st-check-row {
          display: flex; align-items: center; gap: .5rem;
          font-size: .82rem; font-weight: 500; color: var(--text-secondary);
          padding: .35rem .5rem; border-radius: .35rem;
        }
        .st-check-done { color: #059669; background: #05966908 }
        .st-check-icon { font-size: .78rem; width: 20px; text-align: center }

        /* Notification toggles */
        .st-toggles { display: flex; flex-direction: column; gap: .5rem }
        .st-toggle-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: .75rem; background: var(--bg); border-radius: .6rem;
          cursor: pointer; gap: 1rem;
        }
        .st-toggle-row strong { font-size: .85rem; display: block; color: var(--text-primary) }
        .st-toggle-row span { font-size: .75rem; color: var(--text-secondary); display: block; margin-top: .1rem }
        .st-toggle {
          width: 40px; height: 22px; appearance: none; -webkit-appearance: none;
          background: var(--border); border-radius: 999px; position: relative;
          cursor: pointer; transition: background .2s; flex-shrink: 0;
        }
        .st-toggle::before {
          content: ""; position: absolute; top: 2px; left: 2px;
          width: 18px; height: 18px; border-radius: 50%; background: #fff;
          transition: transform .2s; box-shadow: 0 1px 3px rgba(0,0,0,.15);
        }
        .st-toggle:checked { background: #059669 }
        .st-toggle:checked::before { transform: translateX(18px) }

        @media (max-width: 768px) {
          .st-layout { grid-template-columns: 1fr }
          .st-sidebar { position: static; flex-direction: column }
          .st-profile-card { flex-direction: row; text-align: left; gap: 1rem }
          .st-avatar-wrap { margin-bottom: 0 }
          .st-nav { flex-direction: row; overflow-x: auto }
          .st-nav-btn { white-space: nowrap }
          .st-fields { grid-template-columns: 1fr }
        }
      `}</style>
    </main>
  );
}
