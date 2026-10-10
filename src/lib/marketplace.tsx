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
import { fetchSellerStats } from "./seller-levels";
import type { SellerStats } from "./seller-levels";

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
  /** Level, rating and delivery stats keyed by seller id. */
  sellerStats: Record<string, SellerStats>;
  addGig: (draft: GigDraft) => Promise<Gig | null>;
  saveGig: (draft: GigDraft, id?: string) => Promise<Gig | null>;
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
  const [sellerStats, setSellerStats] = useState<Record<string, SellerStats>>({});

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

  /* Apply realtime changes in place instead of re-downloading every gig. */
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel("gigs-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gigs" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const removedId = (payload.old as { id?: string }).id;
            if (removedId) {
              setGigs((current) => current.filter((item) => item.id !== removedId));
            }
            return;
          }
          const gig = rowToGig(payload.new as GigRow);
          setGigs((current) => {
            const index = current.findIndex((item) => item.id === gig.id);
            if (index === -1) return [gig, ...current];
            const next = current.slice();
            next[index] = gig;
            return next;
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  /* One RPC for every seller on screen; refetched only when the set changes. */
  const sellerKey = useMemo(
    () => [...new Set(gigs.map((gig) => gig.sellerId).filter(Boolean) as string[])].sort().join(","),
    [gigs],
  );
  useEffect(() => {
    if (!sellerKey) return;
    let cancelled = false;
    void fetchSellerStats(sellerKey.split(",")).then((stats) => {
      if (!cancelled) setSellerStats(stats);
    });
    return () => {
      cancelled = true;
    };
  }, [sellerKey]);

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

  /** Insert (no id) or update (id) a gig in one round trip. */
  const saveGig = useCallback(async (draft: GigDraft, id?: string): Promise<Gig | null> => {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Backend not configured");
      return null;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setError("Sign in to publish a gig");
      return null;
    }
    const category = isAllowedCategory(draft.category)
      ? draft.category
      : CATEGORY_OPTIONS[0];
    const row = {
      title: draft.title,
      description: draft.description,
      category,
      skills: normalizeSkills(draft.skills, category),
      price: draft.price,
      delivery_days: draft.deliveryDays,
      seller_name: draft.seller,
      video: draft.video?.trim() || null,
      video_name: draft.videoName?.trim() || null,
      images: (draft.images ?? []).filter((u) => u.trim()),
      packages: draft.packages ?? null,
      extras: draft.extras ?? [],
      faq: draft.faq ?? [],
      requirements: draft.requirements?.trim() || null,
      requirement_questions: draft.requirementQuestions ?? [],
      tags: draft.tags ?? [],
      status: draft.status ?? "published",
    };
    const request = id
      ? supabase.from("gigs").update(row).eq("id", id).eq("seller_id", user.id)
      : supabase.from("gigs").insert({ ...row, seller_id: user.id });
    const { data, error: saveError } = await request.select("*").single();
    if (saveError || !data) {
      setError(saveError?.message ?? "Could not save gig");
      return null;
    }
    const gig = rowToGig(data as GigRow);
    setGigs((current) => [gig, ...current.filter((item) => item.id !== gig.id)]);
    return gig;
  }, []);

  const addGig = useCallback((draft: GigDraft) => saveGig(draft), [saveGig]);

  /* Drafts and paused gigs come back for their owner (RLS) but never belong in
     the public marketplace lists. */
  const publicGigs = useMemo(
    () => gigs.filter((gig) => gig.status === "published"),
    [gigs],
  );

  const value = useMemo<MarketplaceValue>(
    () => ({
      gigs: publicGigs,
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
      sellerStats,
      addGig,
      saveGig,
      refresh,
    }),
    [publicGigs, loading, error, query, category, selectedSkills, sellerStats, toggleSkill, clearFilters, addGig, saveGig, refresh],
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
