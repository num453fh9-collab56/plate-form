import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

interface Props { params: Promise<{ id: string }> }

async function getProfile(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("profiles")
    .select("display_name, title, bio, avatar_url")
    .eq("id", id)
    .maybeSingle();
  return data as { display_name: string; title: string | null; bio: string | null; avatar_url: string | null } | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) return { title: "Freelancer — Hirelyx" };

  const name = profile.display_name || "Freelancer";
  const title = `${name}${profile.title ? ` — ${profile.title}` : ""} | Hirelyx`;
  const description = (profile.bio ?? "").slice(0, 160) || `Hire ${name} on Hirelyx`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      ...(profile.avatar_url ? { images: [{ url: profile.avatar_url }] } : {}),
    },
    twitter: { card: "summary", title, description },
  };
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return children;
}
