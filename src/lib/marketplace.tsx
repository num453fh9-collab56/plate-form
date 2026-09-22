"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import { createExternalStore } from "./external-store";
import { createGig, SEED_GIGS } from "./gigs";
import type { Gig, GigDraft } from "./types";

const POSTED_KEY = "wv_posted_gigs";
const EMPTY_GIGS: Gig[] = [];

function readPostedGigs(): Gig[] {
  try {
    const raw = window.localStorage.getItem(POSTED_KEY);
    if (!raw) return EMPTY_GIGS;
    const parsed = JSON.parse(raw) as Gig[];
    if (!Array.isArray(parsed)) return EMPTY_GIGS;
    return parsed.filter((gig) => gig && typeof gig.title === "string");
  } catch {
    return EMPTY_GIGS;
  }
}

const postedStore = createExternalStore<Gig[]>(readPostedGigs, EMPTY_GIGS);

function persistPosted(gigs: Gig[]): void {
  try {
    window.localStorage.setItem(POSTED_KEY, JSON.stringify(gigs));
  } catch {
    /* storage unavailable */
  }
}

interface MarketplaceValue {
  gigs: Gig[];
  query: string;
  setQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  addGig: (draft: GigDraft) => Gig;
}

const MarketplaceContext = createContext<MarketplaceValue | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const posted = useSyncExternalStore(
    postedStore.subscribe,
    postedStore.getSnapshot,
    postedStore.getServerSnapshot,
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const gigs = useMemo(() => [...posted, ...SEED_GIGS], [posted]);

  const addGig = useCallback((draft: GigDraft) => {
    const gig = createGig(draft);
    const next = [gig, ...postedStore.getSnapshot()];
    postedStore.set(next);
    persistPosted(next);
    return gig;
  }, []);

  const value = useMemo<MarketplaceValue>(
    () => ({ gigs, query, setQuery, category, setCategory, addGig }),
    [gigs, query, category, addGig],
  );

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace(): MarketplaceValue {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within MarketplaceProvider");
  }
  return context;
}
