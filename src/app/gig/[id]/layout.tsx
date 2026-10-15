import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

interface Props { params: Promise<{ id: string }> }

interface GigData {
  title: string;
  description: string;
  price: number;
  images: string[] | null;
  seller_id: string;
  category: string | null;
  rating: number | null;
  reviews: number | null;
}

async function getGig(id: string): Promise<GigData | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("gigs")
    .select("title, description, price, images, seller_id, category, rating, reviews")
    .eq("id", id)
    .maybeSingle();
  return data as GigData | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const gig = await getGig(id);
  if (!gig) return { title: "Lyx Not Found — Hirelyx" };

  const title = `${gig.title} — Hirelyx`;
  const description = (gig.description ?? "").slice(0, 160) || `Starting at $${gig.price} on Hirelyx`;
  const image = gig.images?.[0] ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: `/gig/${id}` },
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

export default async function GigLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gig = await getGig(id);

  return (
    <>
      {gig && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              name: gig.title,
              description: (gig.description ?? "").slice(0, 300),
              provider: {
                "@type": "Organization",
                name: "Hirelyx",
                url: "https://www.hirelyx.com",
              },
              offers: {
                "@type": "Offer",
                price: gig.price,
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
              ...(gig.category ? { category: gig.category } : {}),
              ...(gig.rating && gig.reviews
                ? {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: gig.rating,
                      reviewCount: gig.reviews,
                      bestRating: 5,
                    },
                  }
                : {}),
              ...(gig.images?.[0] ? { image: gig.images[0] } : {}),
            }),
          }}
        />
      )}
      {children}
    </>
  );
}
