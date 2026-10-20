import type { Gig, PackageKey, GigPackage, GigExtra } from "./types";

/* Stub — marketplace gig model kept for API/Stripe compatibility. */

export type GigRow = Record<string, unknown>;

export const PACKAGE_KEYS: PackageKey[] = ["basic", "standard", "premium"];

export function rowToGig(row: GigRow): Gig {
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    seller: String(row.seller_name ?? ""),
    role: String(row.role ?? ""),
    verified: Boolean(row.verified),
    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews ?? 0),
    price: Number(row.price ?? 0),
    delivery: String(row.delivery ?? ""),
    category: String(row.category ?? ""),
    skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
    badge: String(row.badge ?? ""),
    colors: ["#0066cc", "#0891b2"],
    glyph: String(row.glyph ?? ""),
  };
}

interface GigLike {
  price: number;
  packages?: Partial<Record<PackageKey, GigPackage>>;
  extras?: GigExtra[];
  delivery?: string;
}

export function quoteOrder(
  gig: GigLike,
  packageKey?: PackageKey | null,
  extraLabels?: string[],
): { subtotal: number; total: number; fee: number; days: number } {
  const pkg = packageKey && gig.packages?.[packageKey];
  const basePrice = pkg ? pkg.price : gig.price;
  const baseDays = pkg ? (pkg.delivery ?? 1) : Number(gig.delivery ?? 1);
  const selectedExtras = (gig.extras ?? []).filter((e) =>
    extraLabels?.includes(e.label),
  );
  const extrasPrice = selectedExtras.reduce((s, e) => s + e.price, 0);
  const extrasDays = selectedExtras.reduce((s, e) => s + (e.days ?? 0), 0);
  const subtotal = basePrice + extrasPrice;
  const fee = Math.round(subtotal * 0.1 * 100) / 100;
  return { subtotal, total: subtotal, fee, days: baseDays + extrasDays };
}
