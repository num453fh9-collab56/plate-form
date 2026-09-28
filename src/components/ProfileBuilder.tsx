"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import { initials } from "@/lib/format";
import { MAX_AVATAR_SOURCE_BYTES, resizeImageToSquare } from "@/lib/media";
import SkillPicker from "./SkillPicker";
import IntroVideo from "./IntroVideo";

const AVAILABILITY: {
  value: string;
  key: "profile.availFull" | "profile.availPart" | "profile.availProject" | "profile.availNot";
}[] = [
  { value: "Full time", key: "profile.availFull" },
  { value: "Part time", key: "profile.availPart" },
  { value: "Project based", key: "profile.availProject" },
  { value: "Not available right now", key: "profile.availNot" },
];

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={"form-field" + (error ? " invalid" : "")}>
      <label>
        {label}
        {required ? <span className="req"> *</span> : null}
      </label>
      {children}
      <span className="error-msg">{error}</span>
    </div>
  );
}

function ProfileEditor() {
  const { closeProfile, toast } = useUI();
  const { user, profile, strength, updateProfile } = useAuth();
  const { t } = useI18n();
  const [triedSave, setTriedSave] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.classList.add("modal-open");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProfile();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeProfile]);

  if (!user) return null;

  const required = {
    fullName: profile.fullName.trim().length >= 2,
    title: profile.title.trim().length >= 3,
    bio: profile.bio.trim().length >= 40,
    phone: profile.phone.replace(/\D/g, "").length >= 7,
    avatar: profile.avatar.trim().length > 0,
  };

  const fieldError = (key: keyof typeof required) =>
    triedSave && !required[key] ? t("profile.fieldRequired") : "";

  const onAvatar = async (file: File) => {
    if (file.size > MAX_AVATAR_SOURCE_BYTES) {
      toast(t("video.tooLarge", { max: Math.round(MAX_AVATAR_SOURCE_BYTES / 1048576) }));
      return;
    }
    try {
      const dataUrl = await resizeImageToSquare(file);
      updateProfile({ avatar: dataUrl });
    } catch {
      toast(t("video.errRead"));
    }
  };

  const save = () => {
    setTriedSave(true);
    if (!Object.values(required).every(Boolean)) {
      toast(t("profile.fieldRequired"));
      return;
    }
    const persisted = updateProfile({});
    toast(persisted ? t("profile.saved") : t("video.quota"));
  };

  return (
    <div
      className="modal-overlay profile-overlay open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profileTitle"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeProfile();
      }}
    >
      <div className="profile-modal">
        <div className="profile-head">
          <div className="profile-head-id">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="profile-head-avatar" src={profile.avatar} alt="" />
            ) : (
              <span className="profile-head-avatar profile-head-initials">
                {initials(profile.fullName || user.name)}
              </span>
            )}
            <div className="profile-head-info">
              <strong id="profileTitle">{t("profile.title")}</strong>
              <span>{profile.title || t("profile.subtitle")}</span>
            </div>
          </div>
          <button className="modal-close" type="button" aria-label="Close" onClick={closeProfile}>
            &times;
          </button>
        </div>

        <div className="profile-body">
          <aside className="profile-side">
            <div className="strength-card">
              <div
                className="strength-ring"
                style={{
                  background: `conic-gradient(var(--accent) ${strength.percent}%, var(--line) ${strength.percent}%)`,
                }}
              >
                <div className="strength-ring-inner">
                  <strong>{strength.percent}%</strong>
                  <span>
                    {strength.completed}/{strength.total}
                  </span>
                </div>
              </div>
              <div className="strength-copy">
                <h3>{t("profile.strength")}</h3>
                <p>{t("profile.steps", { done: strength.completed, total: strength.total })}</p>
              </div>
            </div>

            <ul className="strength-list">
              {strength.items.map((item) => (
                <li key={String(item.key)} className={item.done ? "done" : ""}>
                  <span className="strength-check" aria-hidden="true">
                    {item.done ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : null}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </aside>

          <div className="profile-form">
            <section className="form-section">
              <div className="form-section-head">
                <h4>{t("profile.basics")}</h4>
                <p>{t("profile.basicsSub")}</p>
              </div>
              <div className="field-grid">
                <Field label={t("profile.fullName")} required error={fieldError("fullName")}>
                  <input
                    type="text"
                    autoComplete="name"
                    value={profile.fullName}
                    placeholder={t("auth.fullNamePlaceholder")}
                    onChange={(event) => updateProfile({ fullName: event.target.value })}
                  />
                </Field>
                <Field label={t("profile.profTitle")} required error={fieldError("title")}>
                  <input
                    type="text"
                    value={profile.title}
                    placeholder={t("profile.profTitlePlaceholder")}
                    onChange={(event) => updateProfile({ title: event.target.value })}
                  />
                </Field>
                <Field label={t("profile.country")}>
                  <input
                    type="text"
                    value={profile.country}
                    placeholder={t("profile.countryPlaceholder")}
                    onChange={(event) => updateProfile({ country: event.target.value })}
                  />
                </Field>
                <Field label={t("profile.languages")}>
                  <input
                    type="text"
                    value={profile.languages}
                    placeholder={t("profile.languagesPlaceholder")}
                    onChange={(event) => updateProfile({ languages: event.target.value })}
                  />
                </Field>
              </div>
            </section>

            <section className="form-section">
              <div className="form-section-head">
                <h4>{t("profile.about")}</h4>
                <p>{t("profile.aboutSub")}</p>
              </div>
              <Field label={t("profile.bio")} required error={fieldError("bio")}>
                <textarea
                  rows={5}
                  value={profile.bio}
                  placeholder={t("profile.bioPlaceholder")}
                  onChange={(event) => updateProfile({ bio: event.target.value })}
                />
                <span className="char-count">{profile.bio.trim().length} / 40+</span>
              </Field>
            </section>

            <section className="form-section">
              <div className="form-section-head">
                <h4>{t("profile.contact")}</h4>
                <p>{t("profile.contactSub")}</p>
              </div>
              <div className="field-grid">
                <Field label={t("profile.phone")} required error={fieldError("phone")}>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={profile.phone}
                    placeholder={t("profile.phonePlaceholder")}
                    onChange={(event) => updateProfile({ phone: event.target.value })}
                  />
                </Field>
                <Field label={t("profile.portfolio")}>
                  <input
                    type="url"
                    value={profile.portfolio}
                    placeholder={t("profile.portfolioPlaceholder")}
                    onChange={(event) => updateProfile({ portfolio: event.target.value })}
                  />
                </Field>
              </div>
            </section>

            <section className="form-section">
              <div className="form-section-head">
                <h4>{t("profile.work")}</h4>
                <p>{t("profile.workSub")}</p>
              </div>
              <div className="field-grid">
                <Field label={t("profile.rate")}>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={profile.hourlyRate}
                    placeholder={t("profile.ratePlaceholder")}
                    onChange={(event) => updateProfile({ hourlyRate: event.target.value })}
                  />
                </Field>
                <Field label={t("profile.availability")}>
                  <select
                    value={profile.availability}
                    onChange={(event) => updateProfile({ availability: event.target.value })}
                  >
                    <option value="">&mdash;</option>
                    {AVAILABILITY.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.key)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            <section className="form-section">
              <div className="form-section-head">
                <h4>{t("profile.skills")}</h4>
                <p>{t("profile.skillsSub")}</p>
              </div>
              <SkillPicker
                value={profile.skills}
                onChange={(skills) => updateProfile({ skills })}
                placeholder={t("profile.skillsPlaceholder")}
              />
            </section>

            <section className="form-section">
              <div className="form-section-head">
                <h4>{t("profile.photo")}</h4>
                <p>{t("profile.photoSub")}</p>
              </div>
              <div className="avatar-upload">
                <div className="avatar-preview">
                  {profile.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar} alt="" />
                  ) : (
                    initials(profile.fullName || user.name)
                  )}
                </div>
                <div className="avatar-actions">
                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    onClick={() => avatarRef.current?.click()}
                  >
                    {profile.avatar ? t("profile.photoChange") : t("profile.photoUpload")}
                  </button>
                  {profile.avatar && (
                    <button
                      type="button"
                      className="btn-ghost btn-sm danger"
                      onClick={() => updateProfile({ avatar: "" })}
                    >
                      {t("profile.remove")}
                    </button>
                  )}
                </div>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void onAvatar(file);
                    event.target.value = "";
                  }}
                />
              </div>
            </section>

            <section className="form-section">
              <div className="form-section-head">
                <h4>{t("profile.video")}</h4>
                <p>{t("profile.videoSub")}</p>
              </div>
              <IntroVideo
                src={profile.introVideo}
                name={profile.introVideoName}
                onChange={(src, name) => {
                  const persisted = updateProfile({ introVideo: src, introVideoName: name });
                  if (!persisted && src) toast(t("video.quota"));
                }}
              />
            </section>
          </div>
        </div>

        <div className="profile-foot">
          <span className="profile-foot-note">{t("profile.completeAll")}</span>
          <button type="button" className="btn-publish" onClick={save}>
            {t("profile.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfileBuilder() {
  const { isProfileOpen } = useUI();
  const { user } = useAuth();
  if (!isProfileOpen || !user) return null;
  return <ProfileEditor />;
}
