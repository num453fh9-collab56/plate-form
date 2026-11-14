import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/* The article page is server-rendered and cached, so the view counter can no
   longer ride along with the page fetch. This is that counter and nothing
   else — it never returns post data. */
export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: false });

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await sb
    .from("blog_posts")
    .select("id, views")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (data) {
    await sb
      .from("blog_posts")
      .update({ views: (data.views || 0) + 1 })
      .eq("id", data.id);
  }

  return NextResponse.json({ ok: true });
}
