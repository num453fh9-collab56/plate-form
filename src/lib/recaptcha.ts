"use client";

const SITE_KEY = (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "").trim();

export const RECAPTCHA_CONFIGURED = SITE_KEY.length > 0;

let loadPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (!RECAPTCHA_CONFIGURED) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (document.querySelector(`script[src*="recaptcha/api.js"]`)) {
      return resolve();
    }
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
    document.head.appendChild(script);
  });
  return loadPromise;
}

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

export async function getRecaptchaToken(action: string): Promise<string | null> {
  if (!RECAPTCHA_CONFIGURED) return null;
  try {
    await loadScript();
    return await new Promise<string>((resolve, reject) => {
      window.grecaptcha!.ready(() => {
        window.grecaptcha!.execute(SITE_KEY, { action }).then(resolve, reject);
      });
    });
  } catch {
    return null;
  }
}
