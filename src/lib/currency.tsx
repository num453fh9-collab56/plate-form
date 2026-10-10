"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

/* Display currency. Every price in the database is USD; this only converts
   what the visitor sees. Checkout still charges USD (shown in the price card). */

export const CURRENCIES = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "PKR", label: "Pakistani Rupee", symbol: "Rs" },
  { code: "AED", label: "UAE Dirham", symbol: "AED" },
  { code: "SAR", label: "Saudi Riyal", symbol: "SAR" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

const STORAGE_KEY = "wv_currency";

interface CurrencyValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  /** Format a USD amount in the visitor's currency, e.g. "Rs 28,000". */
  format: (usd: number) => string;
  /** True when the display currency is not USD (show "charged in USD" notes). */
  converted: boolean;
}

const CurrencyContext = createContext<CurrencyValue | null>(null);

function isCode(value: string | null): value is CurrencyCode {
  return CURRENCIES.some((c) => c.code === value);
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    const timer = setTimeout(() => {
      if (isCode(saved)) setCurrencyState(saved);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currency === "USD") return;
    let cancelled = false;
    fetch("/api/rates")
      .then((r) => r.json() as Promise<{ rates?: Record<string, number> }>)
      .then((payload) => {
        if (!cancelled && payload.rates) setRates(payload.rates);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [currency]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const format = useCallback(
    (usd: number) => {
      const rate = currency === "USD" ? 1 : rates[currency];
      // Until rates arrive, keep showing dollars rather than a wrong number.
      const code = rate ? currency : "USD";
      const value = Number(usd || 0) * (rate || 1);
      const meta = CURRENCIES.find((c) => c.code === code)!;
      const big = value >= 100 || code === "PKR" || code === "INR";
      const number = value.toLocaleString("en-US", {
        maximumFractionDigits: big ? 0 : 2,
        minimumFractionDigits: 0,
      });
      return meta.symbol.length === 1 ? `${meta.symbol}${number}` : `${meta.symbol} ${number}`;
    },
    [currency, rates],
  );

  const value = useMemo<CurrencyValue>(
    () => ({ currency, setCurrency, format, converted: currency !== "USD" }),
    [currency, setCurrency, format],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyValue {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
