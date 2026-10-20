"use client";

import { useCallback, useRef, useState } from "react";
import { computeProfileStrength, useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { uploadDataUrl } from "@/lib/storage";
import { COUNTRIES } from "@/lib/countries";
import { initials } from "@/lib/format";
import AvatarUploader from "./AvatarUploader";
import BrandMark from "./BrandMark";

export default function ProfileBuilder() {
  const { profile, updateProfile, user } = useAuth();
  const { closeProfile, toast } = useUI();

  const [fullName, setFullName] = useState(profile.fullName || "");
  const [title, setTitle] = useState(profile.title || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [country, setCountry] = useState(profile.country || "");
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);

  const strength = computeProfileStrength({
    ...profile,
    fullName,
    title,
    phone,
    country,
    avatar: avatarData || profile.avatar,
  });

  const canContinue = fullName.trim().length >= 2 && phone.replace(/\D/g, "").length >= 7;

  const save = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      let avatarUrl = profile.avatar;
      if (avatarData && avatarData.startsWith("data:")) {
        const uploaded = await uploadDataUrl("avatars", user?.sub || "u", avatarData, "avatar");
        if (uploaded) avatarUrl = uploaded;
      }
      updateProfile({
        fullName: fullName.trim(),
        title: title.trim(),
        phone: phone.trim(),
        country,
        avatar: avatarUrl,
      });
      toast("Profile updated!");
      closeProfile();
    } catch {
      toast("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [saving, avatarData, fullName, title, phone, country, profile.avatar, user?.sub, updateProfile, toast, closeProfile]);

  return (
    <div className="pb-overlay">
      <div className="pb-panel">
        <button type="button" className="pb-close" onClick={closeProfile} aria-label="Close">×</button>

        <div className="pb-header">
          <BrandMark />
          <h2>Complete Your Profile</h2>
          <p>Help us personalize your experience.</p>
        </div>

        {/* Progress */}
        <div className="pb-progress">
          <div className="pb-progress-fill" style={{ width: `${strength.percent}%` }} />
        </div>
        <span className="pb-progress-label">{strength.percent}% complete</span>

        {step === 0 && (
          <div className="pb-step">
            {/* Avatar */}
            <div className="pb-avatar-section">
              <AvatarUploader
                value={avatarData || profile.avatar}
                fallback={initials(fullName)}
                onSave={(dataUrl: string) => setAvatarData(dataUrl)}
                onRemove={() => setAvatarData("")}
              />
              <span className="pb-avatar-hint">Upload a profile photo</span>
            </div>

            {/* Full Name */}
            <label className="pb-label">
              Full Name <span className="pb-req">*</span>
              <input
                className="pb-input"
                type="text"
                placeholder="e.g. Ahmad Khan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={60}
              />
            </label>

            {/* Company / Role */}
            <label className="pb-label">
              Company or Role
              <input
                className="pb-input"
                type="text"
                placeholder="e.g. CEO at TechCorp, Startup Founder"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={70}
              />
            </label>

            {/* Phone */}
            <label className="pb-label">
              Phone Number <span className="pb-req">*</span>
              <input
                className="pb-input"
                type="tel"
                placeholder="e.g. +92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
              />
            </label>

            {/* Country */}
            <label className="pb-label">
              Country
              <select
                className="pb-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Select your country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="pb-btn-primary"
              disabled={!canContinue}
              onClick={() => setStep(1)}
            >
              Continue
            </button>

            <button type="button" className="pb-skip" onClick={closeProfile}>
              I&apos;ll do this later
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="pb-step pb-step-review">
            <h3>Looking good!</h3>
            <p className="pb-review-sub">Here&apos;s a quick summary of your profile.</p>

            <div className="pb-review-card">
              <div className="pb-review-avatar">
                {(avatarData || profile.avatar) ? (
                  <img src={avatarData || profile.avatar} alt="" />
                ) : (
                  <div className="pb-review-initials">
                    {fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="pb-review-info">
                <strong>{fullName}</strong>
                {title && <span className="pb-review-title">{title}</span>}
                {phone && <span className="pb-review-detail">{phone}</span>}
                {country && <span className="pb-review-detail">{COUNTRIES.find((c) => c.code === country)?.name}</span>}
              </div>
            </div>

            {/* Checklist */}
            <div className="pb-checklist">
              {strength.items.map((item) => (
                <div key={item.key} className={"pb-check-item" + (item.done ? " pb-check-done" : "")}>
                  <span className="pb-check-icon">{item.done ? "✓" : "○"}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="pb-review-actions">
              <button type="button" className="pb-btn-ghost" onClick={() => setStep(0)}>
                ← Edit Info
              </button>
              <button
                type="button"
                className="pb-btn-primary"
                disabled={saving}
                onClick={save}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pb-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,.5); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: pbFadeIn .2s ease;
        }
        @keyframes pbFadeIn { from { opacity: 0 } to { opacity: 1 } }

        .pb-panel {
          background: var(--bg, #fff); border-radius: 1.25rem;
          max-width: 440px; width: 100%;
          max-height: 90vh; overflow-y: auto;
          padding: 2rem; position: relative;
          box-shadow: 0 24px 64px rgba(0,0,0,.2);
          animation: pbSlideUp .25s ease;
        }
        @keyframes pbSlideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }

        .pb-close {
          position: absolute; top: 1rem; right: 1rem;
          background: none; border: none; font-size: 1.5rem;
          color: var(--text-secondary); cursor: pointer;
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          border-radius: 50%; transition: background .15s;
        }
        .pb-close:hover { background: var(--surface, #f5f5f5) }

        .pb-header { text-align: center; margin-bottom: 1.25rem }
        .pb-header h2 { font-size: 1.3rem; font-weight: 800; margin: .75rem 0 .2rem }
        .pb-header p { font-size: .88rem; color: var(--text-secondary); margin: 0 }

        .pb-progress {
          height: 6px; background: var(--border, #e5e7eb);
          border-radius: 999px; overflow: hidden; margin-bottom: .3rem;
        }
        .pb-progress-fill {
          height: 100%; background: linear-gradient(90deg, #0066cc, #059669);
          border-radius: 999px; transition: width .4s ease;
        }
        .pb-progress-label {
          display: block; text-align: right; font-size: .7rem;
          color: var(--text-secondary); font-weight: 600; margin-bottom: 1.25rem;
        }

        .pb-step { display: flex; flex-direction: column; gap: 1rem }

        .pb-avatar-section { text-align: center }
        .pb-avatar-hint { display: block; font-size: .75rem; color: var(--text-secondary); margin-top: .3rem }

        .pb-label {
          display: flex; flex-direction: column; gap: .3rem;
          font-size: .82rem; font-weight: 600; color: var(--text-primary);
        }
        .pb-req { color: #dc2626 }
        .pb-input {
          padding: .6rem .8rem; border-radius: .5rem;
          border: 1px solid var(--border, #e5e7eb);
          font: inherit; font-size: .88rem;
          background: var(--bg, #fff); color: var(--text-primary);
          transition: border-color .15s;
        }
        .pb-input:focus { outline: none; border-color: #0066cc }
        select.pb-input { cursor: pointer }

        .pb-btn-primary {
          padding: .7rem 1.5rem; border-radius: .6rem;
          background: linear-gradient(135deg, #0066cc, #0891b2);
          color: #fff; border: none; font: inherit;
          font-size: .92rem; font-weight: 700; cursor: pointer;
          transition: transform .15s, box-shadow .15s;
        }
        .pb-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,102,204,.25) }
        .pb-btn-primary:disabled { opacity: .5; cursor: not-allowed }

        .pb-btn-ghost {
          padding: .6rem 1.2rem; border-radius: .6rem;
          background: none; border: 1px solid var(--border);
          color: var(--text-primary); font: inherit;
          font-size: .85rem; font-weight: 600; cursor: pointer;
          transition: background .15s;
        }
        .pb-btn-ghost:hover { background: var(--surface, #f5f5f5) }

        .pb-skip {
          background: none; border: none; color: var(--text-secondary);
          font: inherit; font-size: .8rem; cursor: pointer;
          text-align: center; padding: .3rem;
        }
        .pb-skip:hover { color: var(--text-primary) }

        /* Review step */
        .pb-step-review { text-align: center }
        .pb-step-review h3 { font-size: 1.15rem; font-weight: 800; margin: 0 }
        .pb-review-sub { font-size: .85rem; color: var(--text-secondary); margin: .3rem 0 1.25rem }

        .pb-review-card {
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem 1.25rem; border-radius: .75rem;
          background: var(--surface, #f9fafb); border: 1px solid var(--border);
          text-align: left;
        }
        .pb-review-avatar img {
          width: 56px; height: 56px; border-radius: 50%; object-fit: cover;
        }
        .pb-review-initials {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #0066cc, #059669);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; font-weight: 800;
        }
        .pb-review-info { display: flex; flex-direction: column; gap: .15rem }
        .pb-review-info strong { font-size: .95rem }
        .pb-review-title { font-size: .8rem; color: var(--text-secondary); font-weight: 500 }
        .pb-review-detail { font-size: .75rem; color: var(--text-secondary) }

        .pb-checklist {
          display: flex; flex-direction: column; gap: .35rem;
          margin: 1.25rem 0; text-align: left;
        }
        .pb-check-item {
          display: flex; align-items: center; gap: .5rem;
          font-size: .82rem; color: var(--text-secondary); font-weight: 500;
        }
        .pb-check-done { color: #059669 }
        .pb-check-icon { font-size: .75rem; width: 18px; text-align: center }

        .pb-review-actions {
          display: flex; gap: .75rem; justify-content: center; margin-top: .5rem;
        }

        @media (max-width: 480px) {
          .pb-panel { padding: 1.5rem 1.25rem }
        }
      `}</style>
    </div>
  );
}
