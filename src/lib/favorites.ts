"use client";

import { getSupabase } from "./supabase";
import { rowToGig } from "./gig-model";
import type { GigRow } from "./gig-model";
import type { Gig } from "./types";

export async function fetchFavoriteIds(): Promise<Set<string>> {
  const supabase = getSupabase();
  if (!supabase) return new Set();
  const { data, error } = await supabase.from("favorites").select("gig_id");
  if (error || !data) return new Set();
  return new Set((data as { gig_id: string }[]).map((r) => r.gig_id));
}

export async function toggleFavorite(gigId: string, currentlySaved: boolean): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return currentlySaved;
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return currentlySaved;

  if (currentlySaved) {
    await supabase.from("favorites").delete().eq("user_id", uid).eq("gig_id", gigId);
    return false;
  }
  await supabase.from("favorites").insert({ user_id: uid, gig_id: gigId });
  return true;
}

export async function fetchFavoriteGigs(): Promise<Gig[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data: favs, error } = await supabase
    .from("favorites")
    .select("gig_id")
    .order("created_at", { ascending: false });
  if (error || !favs || favs.length === 0) return [];
  const ids = (favs as { gig_id: string }[]).map((f) => f.gig_id);
  const { data: gigs } = await supabase.from("gigs").select("*").in("id", ids);
  return ((gigs ?? []) as GigRow[]).map(rowToGig);
}
