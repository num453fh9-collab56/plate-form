import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

interface Props { params: Promise<{ id: string }> }

async function getGig(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("gigs")
    .select("title, description, price, images, seller_id")
    .eq("id", id)
    .maybeSingle();
  return data as { title: string; description: string; price: number; images: string[] | null; seller_id: string } | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const gig = await getGig(id);
  if (!gig) return { title: "Gig Not Found — Hirelyx" };

  const title = `${gig.title} — Hirelyx`;
  const description = (gig.description ?? "").slice(0, 160) || `Starting at $${gig.price} on Hirelyx`;
  const image = gig.images?.[0] ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default function GigLayout({ children }: { children: React.ReactNode }) {
  return children;
}
