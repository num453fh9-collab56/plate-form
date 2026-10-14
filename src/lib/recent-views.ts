"use client";

const KEY = "hirelyx_recent";
const MAX = 12;

export interface RecentGig {
  id: string;
  title: string;
  image: string | null;
  price: number;
  seller: string;
  viewedAt: number;
}

function load(): RecentGig[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentGig[]) : [];
  } catch {
    return [];
  }
}

function save(items: RecentGig[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  } catch { /* ignore */ }
}

export function addRecentView(gig: { id: string; title: string; image?: string | null; price: number; seller: string }) {
  const items = load().filter((g) => g.id !== gig.id);
  items.unshift({ ...gig, image: gig.image ?? null, viewedAt: Date.now() });
  save(items);
}

export function getRecentViews(): RecentGig[] {
  return load();
}

export function clearRecentViews() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
