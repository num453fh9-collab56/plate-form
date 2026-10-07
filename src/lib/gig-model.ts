import { CATEGORY_OPTIONS, glyphFor } from "./gigs";
import { categoryColors, isAllowedCategory } from "./taxonomy";
import type { Gig } from "./types";

export interface GigRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  skills: string[] | null;
  price: number | null;
  delivery_days: number | null;
  seller_name: string | null;
  seller_id: string | null;
  video: string | null;
  video_name: string | null;
  created_at: string;
}

export function rowToGig(row: GigRow): Gig {
  const category =
    row.category && isAllowedCategory(row.category) ? row.category : CATEGORY_OPTIONS[0];
  const days = row.delivery_days ?? 1;
  return {
    id: row.id,
    sellerId: row.seller_id ?? undefined,
    title: row.title,
    description: row.description ?? "",
    seller: row.seller_name ?? "Independent Professional",
    role: "New Seller",
    verified: false,
    rating: 0,
    reviews: 0,
    price: Number(row.price ?? 0),
    delivery: `${days} ${days === 1 ? "day" : "days"}`,
    category,
    skills: Array.isArray(row.skills) ? row.skills : [],
    badge: "New",
    colors: categoryColors(category),
    glyph: glyphFor(category),
    video: row.video ?? undefined,
    videoName: row.video_name ?? undefined,
    isNew: false,
  };
}
