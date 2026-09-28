"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";

type Mode = "signup" | "login";

interface Values {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

const EMPTY: Values = { name: "", email: "", password: "", confirm: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordValid(value: string): boolean {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

function AuthForm({ initialMode }: { initialMode: Mode }) {
  const { closeAuth, openProfile, toast } = useUI();
  const {
    configured,
    renderGoogleButton,
    setGoogleSuccessHandler,
    signUpWithEmail,
    signInWithEmail,
  } = useAuth();
  const { t } = useI18n();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, TranslationKey>>>({});
  const [formError, setFormError] = useState<TranslationKey | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const googleHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add("modal-open");
    const focusTimer = window.setTimeout(() => nameRef.current?.focus(), 80);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAuth();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeAuth]);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    let attempts = 0;
    const tryRender = () => {
      if (cancelled) return;
      const host = googleHostRef.current;
      if (host) {
        host.replaceChildren();
        if (renderGoogleButton(host)) return;
      }
      if (attempts < 25) {
        attempts += 1;
        window.setTimeout(tryRender, 200);
      }
    };
    tryRender();
    return () => {
      cancelled = true;
    };
  }, [configured, renderGoogleButton]);

  useEffect(() => {
    setGoogleSuccessHandler(() => {
      closeAuth();
      openProfile();
    });
    return () => setGoogleSuccessHandler(null);
  }, [setGoogleSuccessHandler, closeAuth, openProfile]);

  const setField = (field: keyof Values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFormError(null);
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof Values, TranslationKey>> = {};
    if (mode === "signup" && values.name.trim().length < 2) next.name = "auth.errName";
    if (!EMAIL_RE.test(values.email.trim())) next.email = "auth.errEmail";
    if (!passwordValid(values.password)) next.password = "auth.errPassword";
    if (mode === "signup" && values.password !== values.confirm) {
      next.confirm = "auth.errPasswordMatch";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const result =
      mode === "signup"
        ? signUpWithEmail({
            name: values.name.trim(),
            email: values.email,
            password: values.password,
          })
        : signInWithEmail({ email: values.email, password: values.password });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    toast(t("auth.welcome", { name: values.name.trim().split(" ")[0] || "there" }));
    closeAuth();
    openProfile();
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
    setFormError(null);
  };

  return (
    <div
      className="modal-overlay auth-overlay open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="authModalTitle"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeAuth();
      }}
    >
      <div className="auth-modal">
        <button className="modal-close auth-close" type="button" aria-label="Close" onClick={closeAuth}>
          &times;
        </button>

        <aside className="auth-aside">
          <div className="auth-aside-inner">
            <span className="logo auth-logo">
              <span className="mark" aria-hidden="true">
                <svg className="apex" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <circle cx="20" cy="20" r="18.4" stroke="#111111" strokeWidth="1.2" />
                  <path d="M20 8L30 28H25L20 18L15 28H10L20 8Z" fill="#111111" />
                  <path d="M16 23H24" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <b>
                Ap<span className="accent">ex</span>
              </b>
            </span>
            <h2 className="auth-aside-title">{t("auth.asideTitle")}</h2>
            <p className="auth-aside-sub">{t("auth.asideSub")}</p>
            <ul className="auth-points">
              {(["1", "2", "3"] as const).map((n) => {
                const titleKey = `auth.asidePoint${n}Title` as TranslationKey;
                const textKey = `auth.asidePoint${n}Text` as TranslationKey;
                return (
                  <li key={n}>
                    <span className="tick" aria-hidden="true">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <div>
                      <strong>{t(titleKey)}</strong>
                      <p>{t(textKey)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <div className="auth-panel">
          <div className="auth-panel-head">
            <h3 id="authModalTitle">
              {mode === "signup" ? t("auth.joinTitle") : t("auth.loginTitle")}
            </h3>
            <p>{mode === "signup" ? t("auth.joinSub") : t("auth.loginSub")}</p>
          </div>

          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={"auth-tab" + (mode === "signup" ? " active" : "")}
              onClick={() => switchMode("signup")}
            >
              {t("auth.tabSignup")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={"auth-tab" + (mode === "login" ? " active" : "")}
              onClick={() => switchMode("login")}
            >
              {t("auth.tabLogin")}
            </button>
          </div>

          {configured ? (
            <div className="google-host" ref={googleHostRef} />
          ) : (
            <button
              type="button"
              className="social-btn google disabled"
              onClick={() => toast(t("auth.googleUnavailable"))}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.69h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.74 2.98-4.3 2.98-7.26Z" />
                <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22Z" />
                <path fill="#FBBC05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.35-2.59Z" />
                <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.35 2.59C7.2 7.72 9.4 5.96 12 5.96Z" />
              </svg>
              {t("auth.continueGoogle")}
            </button>
          )}

          <div className="auth-divider">
            <span>{t("auth.or")}</span>
          </div>

          <form className="auth-form" onSubmit={submit} noValidate>
            {mode === "signup" && (
              <div className={"form-field" + (errors.name ? " invalid" : "")}>
                <label htmlFor="authName">{t("auth.fullName")}</label>
                <input
                  id="authName"
                  ref={nameRef}
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  placeholder={t("auth.fullNamePlaceholder")}
                  onChange={(event) => setField("name", event.target.value)}
                />
                <span className="error-msg">{errors.name && t(errors.name)}</span>
              </div>
            )}

            <div className={"form-field" + (errors.email ? " invalid" : "")}>
              <label htmlFor="authEmail">{t("auth.email")}</label>
              <input
                id="authEmail"
                type="email"
                autoComplete="email"
                value={values.email}
                placeholder={t("auth.emailPlaceholder")}
                onChange={(event) => setField("email", event.target.value)}
              />
              <span className="error-msg">{errors.email && t(errors.email)}</span>
            </div>

            <div className={"form-field" + (errors.password ? " invalid" : "")}>
              <label htmlFor="authPassword">{t("auth.password")}</label>
              <input
                id="authPassword"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={values.password}
                placeholder={t("auth.passwordPlaceholder")}
                onChange={(event) => setField("password", event.target.value)}
              />
              <span className="error-msg">
                {errors.password ? t(errors.password) : mode === "signup" ? t("auth.passwordHint") : ""}
              </span>
            </div>

            {mode === "signup" && (
              <div className={"form-field" + (errors.confirm ? " invalid" : "")}>
                <label htmlFor="authConfirm">{t("auth.confirmPassword")}</label>
                <input
                  id="authConfirm"
                  type="password"
                  autoComplete="new-password"
                  value={values.confirm}
                  placeholder={t("auth.passwordPlaceholder")}
                  onChange={(event) => setField("confirm", event.target.value)}
                />
                <span className="error-msg">{errors.confirm && t(errors.confirm)}</span>
              </div>
            )}

            {formError && <div className="auth-form-error">{t(formError)}</div>}

            <button className="btn-primary auth-submit" type="submit">
              {mode === "signup" ? t("auth.createAccount") : t("auth.logIn")}
            </button>
          </form>

          <p className="auth-terms">{t("auth.terms")}</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthModal() {
  const { isAuthOpen, authMode } = useUI();
  if (!isAuthOpen) return null;
  return <AuthForm key={authMode} initialMode={authMode} />;
}
