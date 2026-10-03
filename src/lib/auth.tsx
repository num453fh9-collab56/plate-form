"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { createExternalStore } from "./external-store";
import { isAllowedCategory } from "./taxonomy";
import type { Account, AuthState, Profile, User } from "./types";
import type { TranslationKey } from "./i18n";
import { useUI } from "./ui";

const AUTH_KEY = "wv_auth_v1";
const LEGACY_USER_KEY = "wv_user";
const CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();
export const GOOGLE_CONFIGURED =
  CLIENT_ID.length > 0 && /\.apps\.googleusercontent\.com$/.test(CLIENT_ID);

export const EMPTY_PROFILE: Profile = {
  fullName: "",
  title: "",
  primaryCategory: "",
  bio: "",
  phone: "",
  country: "",
  languages: "",
  avatar: "",
  skills: [],
  hourlyRate: "",
  projectRate: "",
  availability: "",
  portfolio: "",
  introVideo: "",
  introVideoName: "",
  portfolioProjects: [],
  emailMasked: true,
  profilePublic: true,
  twoFactor: false,
  idVerified: false,
  paymentVerified: false,
  updatedAt: 0,
};

const EMPTY_STATE: AuthState = {
  version: 1,
  accounts: [],
  sessionId: null,
  updatedAt: 0,
};

export type AuthResult = { ok: true } | { ok: false; error: TranslationKey };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function uid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `acc_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/* Lightweight, non-reversible hash so passwords are never stored in plain text.
   Client-side LocalStorage cannot offer true security, but this avoids the
   worst case and keeps the structure ready for a real backend later. */
function hashPassword(password: string): string {
  const salted = `apex::${password}::v1`;
  let h1 = 0xdeadbeef ^ salted.length;
  let h2 = 0x41c6ce57 ^ salted.length;
  for (let i = 0; i < salted.length; i += 1) {
    const ch = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16).padStart(8, "0")}${(h1 >>> 0)
    .toString(16)
    .padStart(8, "0")}`;
}

function makeProfile(partial: Partial<Profile>): Profile {
  return { ...EMPTY_PROFILE, ...partial, updatedAt: Date.now() };
}

function makeAccount(input: {
  name: string;
  email: string;
  provider: "google" | "email";
  picture?: string;
  passwordHash: string;
  profile?: Partial<Profile>;
}): Account {
  const now = Date.now();
  return {
    id: uid(),
    email: normalizeEmail(input.email),
    name: input.name.trim() || "Apex user",
    picture: input.picture ?? "",
    provider: input.provider,
    passwordHash: input.passwordHash,
    profile: makeProfile(input.profile ?? {}),
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeAccount(account: Account): Account {
  return {
    ...account,
    provider: account.provider === "google" ? "google" : "email",
    picture: account.picture ?? "",
    passwordHash: account.passwordHash ?? "",
    profile: {
      ...EMPTY_PROFILE,
      ...(account.profile ?? {}),
      skills: Array.isArray(account.profile?.skills) ? account.profile.skills : [],
      portfolioProjects: Array.isArray(account.profile?.portfolioProjects)
        ? account.profile.portfolioProjects
        : [],
    },
  };
}

function readState(): AuthState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthState;
      if (parsed && Array.isArray(parsed.accounts)) {
        return {
          version: 1,
          sessionId: typeof parsed.sessionId === "string" ? parsed.sessionId : null,
          accounts: parsed.accounts
            .filter((account): account is Account => Boolean(account))
            .map(normalizeAccount),
          updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0,
        };
      }
    }

    const legacy = window.localStorage.getItem(LEGACY_USER_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as User;
      if (parsed && (parsed.email || parsed.name)) {
        const account = makeAccount({
          name: parsed.name || "Apex user",
          email: parsed.email || `${uid()}@apex.local`,
          provider: "google",
          picture: parsed.picture,
          passwordHash: "",
          profile: { fullName: parsed.name || "", avatar: parsed.picture || "" },
        });
        const migrated: AuthState = {
          version: 1,
          sessionId: account.id,
          accounts: [account],
          updatedAt: Date.now(),
        };
        persistState(migrated);
        return migrated;
      }
    }
  } catch {
    /* corrupted storage — start clean */
  }
  return EMPTY_STATE;
}

function persistState(state: AuthState): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

const authStore = createExternalStore<AuthState>(readState, EMPTY_STATE);

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleButtonOptions {
  type?: string;
  theme?: string;
  size?: string;
  shape?: string;
  text?: string;
  logo_alignment?: string;
  width?: number;
}

interface GoogleIdApi {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: GoogleButtonOptions): void;
  prompt(): void;
  disableAutoSelect(): void;
}

interface GoogleGlobal {
  accounts: { id: GoogleIdApi };
}

function getGoogle(): GoogleGlobal | undefined {
  return (window as unknown as { google?: GoogleGlobal }).google;
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/* ======================= PROFILE STRENGTH (14 steps) ======================= */

export interface StrengthItem {
  key: keyof Profile;
  label: string;
  done: boolean;
}

export interface ProfileStrength {
  items: StrengthItem[];
  completed: number;
  total: number;
  percent: number;
}

export function computeProfileStrength(profile: Profile): ProfileStrength {
  const rate = Number(profile.hourlyRate);
  const items: StrengthItem[] = [
    { key: "fullName", label: "Full name", done: profile.fullName.trim().length >= 2 },
    { key: "title", label: "Professional title", done: profile.title.trim().length >= 3 },
    {
      key: "primaryCategory",
      label: "Primary category",
      done: isAllowedCategory(profile.primaryCategory),
    },
    { key: "bio", label: "Bio / description", done: profile.bio.trim().length >= 40 },
    {
      key: "phone",
      label: "Phone number",
      done: profile.phone.replace(/\D/g, "").length >= 7,
    },
    { key: "avatar", label: "Profile picture", done: profile.avatar.trim().length > 0 },
    { key: "skills", label: "3+ skills", done: profile.skills.length >= 3 },
    { key: "country", label: "Country / location", done: profile.country.trim().length >= 2 },
    { key: "languages", label: "Languages", done: profile.languages.trim().length >= 2 },
    {
      key: "hourlyRate",
      label: "Hourly rate",
      done: profile.hourlyRate.trim().length > 0 && Number.isFinite(rate) && rate > 0,
    },
    { key: "availability", label: "Availability", done: profile.availability.trim().length > 0 },
    { key: "portfolio", label: "Portfolio / website", done: profile.portfolio.trim().length >= 4 },
    {
      key: "portfolioProjects",
      label: "Portfolio project",
      done: Array.isArray(profile.portfolioProjects) && profile.portfolioProjects.length >= 1,
    },
    { key: "introVideo", label: "Intro video", done: profile.introVideo.trim().length > 0 },
  ];
  const completed = items.filter((item) => item.done).length;
  const total = items.length;
  return { items, completed, total, percent: Math.round((completed / total) * 100) };
}

interface AuthValue {
  user: User | null;
  account: Account | null;
  profile: Profile;
  strength: ProfileStrength;
  configured: boolean;
  signOut: () => void;
  promptSignIn: () => void;
  renderGoogleButton: (element: HTMLElement) => boolean;
  setGoogleSuccessHandler: (handler: (() => void) | null) => void;
  signUpWithEmail: (input: {
    name: string;
    email: string;
    password: string;
  }) => AuthResult;
  signInWithEmail: (input: { email: string; password: string }) => AuthResult;
  changePassword: (input: { current: string; next: string }) => AuthResult;
  updateProfile: (patch: Partial<Profile>) => boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot,
  );
  const googleSuccessRef = useRef<(() => void) | null>(null);

  const account = useMemo(
    () => state.accounts.find((item) => item.id === state.sessionId) ?? null,
    [state],
  );

  const user = useMemo<User | null>(
    () =>
      account
        ? {
            sub: account.id,
            name: account.profile.fullName || account.name,
            email: account.email,
            picture: account.profile.avatar || account.picture,
          }
        : null,
    [account],
  );

  const profile = account?.profile ?? EMPTY_PROFILE;
  const strength = useMemo(() => computeProfileStrength(profile), [profile]);

  const applyState = useCallback((next: AuthState) => {
    authStore.set(next);
    persistState(next);
  }, []);

  const handleCredentialResponse = useCallback(
    (response: GoogleCredentialResponse) => {
      if (!response.credential) return;
      const claims = decodeJwt(response.credential);
      if (!claims) return;

      const email = normalizeEmail(
        (claims.email as string) || `${uid()}@google.local`,
      );
      const name =
        (claims.name as string) || (claims.given_name as string) || "Google user";
      const picture = (claims.picture as string) || "";

      const current = authStore.getSnapshot();
      const existing = current.accounts.find((item) => item.email === email);
      let nextAccount: Account;

      if (existing) {
        nextAccount = {
          ...existing,
          provider: "google",
          name: existing.name || name,
          picture: existing.picture || picture,
          profile: {
            ...existing.profile,
            fullName: existing.profile.fullName || name,
            avatar: existing.profile.avatar || picture,
          },
          updatedAt: Date.now(),
        };
      } else {
        nextAccount = makeAccount({
          name,
          email,
          provider: "google",
          picture,
          passwordHash: "",
          profile: { fullName: name, avatar: picture },
        });
      }

      const accounts = existing
        ? current.accounts.map((item) => (item.id === nextAccount.id ? nextAccount : item))
        : [...current.accounts, nextAccount];

      applyState({
        ...current,
        accounts,
        sessionId: nextAccount.id,
        updatedAt: Date.now(),
      });

      googleSuccessRef.current?.();
    },
    [applyState],
  );

  useEffect(() => {
    if (!GOOGLE_CONFIGURED) return;
    let cancelled = false;
    let attempts = 0;
    const tryInit = () => {
      if (cancelled) return;
      const google = getGoogle();
      if (google?.accounts.id) {
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });
        return;
      }
      if (attempts < 75) {
        attempts += 1;
        setTimeout(tryInit, 200);
      }
    };
    tryInit();
    return () => {
      cancelled = true;
    };
  }, [handleCredentialResponse]);

  const signOut = useCallback(() => {
    const google = getGoogle();
    if (google?.accounts.id) google.accounts.id.disableAutoSelect();
    const current = authStore.getSnapshot();
    applyState({ ...current, sessionId: null, updatedAt: Date.now() });
  }, [applyState]);

  const promptSignIn = useCallback(() => {
    const google = getGoogle();
    if (google?.accounts.id) google.accounts.id.prompt();
  }, []);

  const renderGoogleButton = useCallback((element: HTMLElement) => {
    const google = getGoogle();
    if (!google?.accounts.id) return false;
    try {
      const width = Math.max(200, Math.min(400, Math.round(element.clientWidth || 360)));
      google.accounts.id.renderButton(element, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        logo_alignment: "left",
        width,
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const setGoogleSuccessHandler = useCallback((handler: (() => void) | null) => {
    googleSuccessRef.current = handler;
  }, []);

  const signUpWithEmail = useCallback<AuthValue["signUpWithEmail"]>(
    ({ name, email, password }) => {
      const cleanEmail = normalizeEmail(email);
      const current = authStore.getSnapshot();
      if (current.accounts.some((item) => item.email === cleanEmail)) {
        return { ok: false, error: "auth.errExists" };
      }
      const nextAccount = makeAccount({
        name,
        email: cleanEmail,
        provider: "email",
        passwordHash: hashPassword(password),
        profile: { fullName: name.trim() },
      });
      applyState({
        ...current,
        accounts: [...current.accounts, nextAccount],
        sessionId: nextAccount.id,
        updatedAt: Date.now(),
      });
      return { ok: true };
    },
    [applyState],
  );

  const signInWithEmail = useCallback<AuthValue["signInWithEmail"]>(
    ({ email, password }) => {
      const cleanEmail = normalizeEmail(email);
      const current = authStore.getSnapshot();
      const existing = current.accounts.find((item) => item.email === cleanEmail);
      if (!existing) return { ok: false, error: "auth.errNoAccount" };
      if (existing.provider === "google" && !existing.passwordHash) {
        return { ok: false, error: "auth.errUseGoogle" };
      }
      if (existing.passwordHash !== hashPassword(password)) {
        return { ok: false, error: "auth.errWrongPassword" };
      }
      applyState({ ...current, sessionId: existing.id, updatedAt: Date.now() });
      return { ok: true };
    },
    [applyState],
  );

  const changePassword = useCallback<AuthValue["changePassword"]>(
    ({ current, next }) => {
      const state = authStore.getSnapshot();
      const id = state.sessionId;
      if (!id) return { ok: false, error: "auth.errNoAccount" };
      const existing = state.accounts.find((item) => item.id === id);
      if (!existing) return { ok: false, error: "auth.errNoAccount" };
      if (existing.provider === "google" && !existing.passwordHash) {
        return { ok: false, error: "auth.errUseGoogle" };
      }
      if (existing.passwordHash !== hashPassword(current)) {
        return { ok: false, error: "auth.errWrongPassword" };
      }
      const nextAccounts = state.accounts.map((item) =>
        item.id === id
          ? { ...item, passwordHash: hashPassword(next), updatedAt: Date.now() }
          : item,
      );
      const updated = { ...state, accounts: nextAccounts, updatedAt: Date.now() };
      if (!persistState(updated)) return { ok: false, error: "video.quota" };
      authStore.set(updated);
      return { ok: true };
    },
    [],
  );

  const updateProfile = useCallback<AuthValue["updateProfile"]>(
    (patch) => {
      const current = authStore.getSnapshot();
      const id = current.sessionId;
      if (!id) return false;
      const nextAccounts = current.accounts.map((item) => {
        if (item.id !== id) return item;
        const nextProfile = { ...item.profile, ...patch, updatedAt: Date.now() };
        return {
          ...item,
          name: patch.fullName !== undefined ? patch.fullName : item.name,
          profile: nextProfile,
          updatedAt: Date.now(),
        };
      });
      const next = { ...current, accounts: nextAccounts, updatedAt: Date.now() };
      authStore.set(next);
      return persistState(next);
    },
    [],
  );

  const value = useMemo<AuthValue>(
    () => ({
      user,
      account,
      profile,
      strength,
      configured: GOOGLE_CONFIGURED,
      signOut,
      promptSignIn,
      renderGoogleButton,
      setGoogleSuccessHandler,
      signUpWithEmail,
      signInWithEmail,
      changePassword,
      updateProfile,
    }),
    [
      user,
      account,
      profile,
      strength,
      signOut,
      promptSignIn,
      renderGoogleButton,
      setGoogleSuccessHandler,
      signUpWithEmail,
      signInWithEmail,
      changePassword,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

/**
 * Gate an action behind authentication: signed-out visitors are sent to the
 * signup modal, signed-in users continue straight to the action.
 */
export function useRequireAuth(): (action: () => void, mode?: "signup" | "login") => void {
  const { user } = useAuth();
  const { openAuth } = useUI();
  return useCallback(
    (action: () => void, mode: "signup" | "login" = "signup") => {
      if (!user) {
        openAuth(mode);
        return;
      }
      action();
    },
    [user, openAuth],
  );
}
