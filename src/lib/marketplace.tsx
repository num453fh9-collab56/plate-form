"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { CATEGORY_OPTIONS } from "./gigs";
import { isAllowedCategory, normalizeSkills } from "./taxonomy";
import { getSupabase } from "./supabase";
import { rowToGig } from "./gig-model";
import type { GigRow } from "./gig-model";
import type { Gig, GigDraft } from "./types";

interface MarketplaceValue {
  gigs: Gig[];
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  selectedSkills: string[];
  toggleSkill: (skill: string) => void;
  setSkills: (skills: string[]) => void;
  clearFilters: () => void;
  addGig: (draft: GigDraft) => Promise<Gig | null>;
  refresh: () => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceValue | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(() => Boolean(getSupabase()));
  const [error, setError] = useState<string | null>(() =>
    getSupabase() ? null : "Backend not configured",
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setGigs([]);
      setError("Backend not configured");
      setLoading(false);
      return;
    }
    const { data, error: fetchError } = await supabase
      .from("gigs")
      .select("*")
      .order("created_at", { ascending: false });
    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }
    setGigs((data ?? []).map((row) => rowToGig(row as GigRow)));
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("gigs")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }
        setGigs((data ?? []).map((row) => rowToGig(row as GigRow)));
        setError(null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel("gigs-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gigs" },
        () => {
          void refresh();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const toggleSkill = useCallback((skill: string) => {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setCategory("All");
    setSelectedSkills([]);
  }, []);

  const addGig = useCallback(async (draft: GigDraft): Promise<Gig | null> => {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Backend not configured");
      return null;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sign in to publish a gig");
      return null;
    }
    const category = isAllowedCategory(draft.category)
      ? draft.category
      : CATEGORY_OPTIONS[0];
    const { data, error: insertError } = await supabase
      .from("gigs")
      .insert({
        seller_id: user.id,
        title: draft.title,
        description: draft.description,
        category,
        skills: normalizeSkills(draft.skills, category),
        price: draft.price,
        delivery_days: draft.deliveryDays,
        seller_name: draft.seller,
        video: draft.video?.trim() || null,
        video_name: draft.videoName?.trim() || null,
      })
      .select("*")
      .single();
    if (insertError || !data) {
      setError(insertError?.message ?? "Could not publish gig");
      return null;
    }
    const gig = rowToGig(data as GigRow);
    setGigs((current) => [gig, ...current.filter((item) => item.id !== gig.id)]);
    return gig;
  }, []);

  const value = useMemo<MarketplaceValue>(
    () => ({
      gigs,
      loading,
      error,
      query,
      setQuery,
      category,
      setCategory,
      selectedSkills,
      toggleSkill,
      setSkills: setSelectedSkills,
      clearFilters,
      addGig,
      refresh,
    }),
    [gigs, loading, error, query, category, selectedSkills, toggleSkill, clearFilters, addGig, refresh],
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
