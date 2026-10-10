import { CATEGORY_OPTIONS, glyphFor } from "./gigs";
import { categoryColors, isAllowedCategory } from "./taxonomy";
import type { Gig, GigExtra, GigPackage, GigStatus, PackageKey, RequirementQuestion } from "./types";

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
  images: string[] | null;
  packages: Partial<Record<PackageKey, GigPackage>> | null;
  extras: GigExtra[] | null;
  faq: { question: string; answer: string }[] | null;
  requirements: string | null;
  requirement_questions?: RequirementQuestion[] | null;
  tags?: string[] | null;
  status?: string | null;
  views?: number | null;
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
    images: Array.isArray(row.images) ? row.images : [],
    packages: row.packages ?? undefined,
    extras: Array.isArray(row.extras) ? row.extras : undefined,
    faq: Array.isArray(row.faq) ? row.faq : undefined,
    requirementsText: row.requirements ?? undefined,
    requirementQuestions: Array.isArray(row.requirement_questions)
      ? row.requirement_questions
      : undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: toStatus(row.status),
    views: Number(row.views ?? 0),
    createdAt: row.created_at,
    isNew: false,
  };
}

function toStatus(value: string | null | undefined): GigStatus {
  return value === "draft" || value === "paused" ? value : "published";
}

export const PACKAGE_KEYS: PackageKey[] = ["basic", "standard", "premium"];

/** Packages that actually have a price, in tier order. */
export function offeredPackages(gig: Pick<Gig, "packages">): [PackageKey, GigPackage][] {
  if (!gig.packages) return [];
  return PACKAGE_KEYS.flatMap((key) => {
    const pkg = gig.packages?.[key];
    return pkg && Number(pkg.price) > 0 ? [[key, pkg] as [PackageKey, GigPackage]] : [];
  });
}

/** Price + delivery for a package choice and extras (same math as checkout). */
export function quoteOrder(
  gig: Pick<Gig, "price" | "packages" | "extras" | "delivery">,
  packageKey: PackageKey | null,
  extraLabels: string[],
): { total: number; days: number } {
  const pkg = packageKey ? gig.packages?.[packageKey] : undefined;
  let total = pkg && Number(pkg.price) > 0 ? Number(pkg.price) : Number(gig.price);
  let days = pkg ? Number(pkg.delivery) || 1 : parseInt(gig.delivery, 10) || 1;
  for (const extra of gig.extras ?? []) {
    if (!extraLabels.includes(extra.label)) continue;
    total += Number(extra.price) || 0;
    days += Number(extra.days) || 0;
  }
  return { total: Math.round(total * 100) / 100, days: Math.max(1, days) };
}
