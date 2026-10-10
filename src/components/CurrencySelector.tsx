"use client";

import { CURRENCIES, useCurrency } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/currency";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  return (
    <label className="currency-select" title="Display currency">
      <span className="sr-only">Currency</span>
      <select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)}>
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code}
          </option>
        ))}
      </select>
    </label>
  );
}
