"use client";

import type { ReactNode, RefObject } from "react";
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
import type { User } from "./types";

const USER_KEY = "wv_user";
const CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();
export const GOOGLE_CONFIGURED =
  CLIENT_ID.length > 0 && /\.apps\.googleusercontent\.com$/.test(CLIENT_ID);

function readStoredUser(): User | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function persistUser(user: User | null): void {
  try {
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_KEY);
  } catch {
    /* storage unavailable */
  }
}

const userStore = createExternalStore<User | null>(readStoredUser, null);

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

interface AuthValue {
  user: User | null;
  configured: boolean;
  googleHostRef: RefObject<HTMLSpanElement | null>;
  signOut: () => void;
  promptSignIn: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(
    userStore.subscribe,
    userStore.getSnapshot,
    userStore.getServerSnapshot,
  );
  const googleHostRef = useRef<HTMLSpanElement | null>(null);

  const handleCredentialResponse = useCallback(
    (response: GoogleCredentialResponse) => {
      if (!response.credential) return;
      const claims = decodeJwt(response.credential);
      if (!claims) return;
      const nextUser: User = {
        sub: typeof claims.sub === "string" ? claims.sub : undefined,
        name:
          (claims.name as string) || (claims.given_name as string) || "Google user",
        email: (claims.email as string) || "",
        picture: (claims.picture as string) || "",
      };
      userStore.set(nextUser);
      persistUser(nextUser);
    },
    [],
  );

  useEffect(() => {
    if (!GOOGLE_CONFIGURED || user) return;
    let cancelled = false;
    let attempts = 0;

    const tryInit = () => {
      if (cancelled) return;
      const google = getGoogle();
      if (google?.accounts.id && googleHostRef.current) {
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });
        google.accounts.id.renderButton(googleHostRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "signin_with",
          logo_alignment: "left",
          width: 160,
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
  }, [user, handleCredentialResponse]);

  const signOut = useCallback(() => {
    const google = getGoogle();
    if (google?.accounts.id) google.accounts.id.disableAutoSelect();
    userStore.set(null);
    persistUser(null);
  }, []);

  const promptSignIn = useCallback(() => {
    const google = getGoogle();
    if (google?.accounts.id) google.accounts.id.prompt();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      configured: GOOGLE_CONFIGURED,
      googleHostRef,
      signOut,
      promptSignIn,
    }),
    [user, signOut, promptSignIn],
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
