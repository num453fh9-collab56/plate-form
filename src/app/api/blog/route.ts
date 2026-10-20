import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/stripe-server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function adminSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export async function GET(req: NextRequest) {
  const sb = adminSb();
  const mode = req.nextUrl.searchParams.get("mode");
  const slug = req.nextUrl.searchParams.get("slug");
  const category = req.nextUrl.searchParams.get("category");

  if (slug) {
    const { data } = await sb.from("blog_posts").select("*").eq("slug", slug).single();
    if (data && data.status === "published") {
      await sb.from("blog_posts").update({ views: (data.views || 0) + 1 }).eq("id", data.id);
    }
    return NextResponse.json({ post: data });
  }

  if (mode === "all") {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await sb.from("blog_posts").select("*").order("created_at", { ascending: false });
    return NextResponse.json({ posts: data ?? [] });
  }

  let q = sb.from("blog_posts").select("*").eq("status", "published");
  if (category) q = q.eq("category", category);
  const { data } = await q.order("published_at", { ascending: false });
  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;
  const sb = adminSb();

  if (action === "create") {
    const { title, excerpt, content, cover_image, author_name, category, tags, read_time } = body;
    if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

    let slug = slugify(title);
    const { data: existing } = await sb.from("blog_posts").select("id").eq("slug", slug);
    if (existing && existing.length > 0) slug = `${slug}-${Date.now().toString(36)}`;

    const { data, error } = await sb.from("blog_posts").insert({
      slug,
      title: title.trim(),
      excerpt: excerpt?.trim() ?? "",
      content: content?.trim() ?? "",
      cover_image: cover_image?.trim() ?? "",
      author_name: author_name?.trim() || "Hirelyx Team",
      category: category || "general",
      tags: Array.isArray(tags) ? tags : [],
      read_time: read_time || 3,
      status: "draft",
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ post: data });
  }

  if (action === "update") {
    const { id, title, excerpt, content, cover_image, author_name, category, tags, read_time } = body;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title.trim();
    if (excerpt !== undefined) updates.excerpt = excerpt.trim();
    if (content !== undefined) updates.content = content.trim();
    if (cover_image !== undefined) updates.cover_image = cover_image.trim();
    if (author_name !== undefined) updates.author_name = author_name.trim();
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (read_time !== undefined) updates.read_time = read_time;

    await sb.from("blog_posts").update(updates).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  if (action === "publish") {
    const { id } = body;
    await sb.from("blog_posts").update({
      status: "published",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  if (action === "unpublish") {
    const { id } = body;
    await sb.from("blog_posts").update({ status: "draft", updated_at: new Date().toISOString() }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  if (action === "feature") {
    const { id, featured } = body;
    await sb.from("blog_posts").update({ is_featured: !!featured }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    const { id } = body;
    await sb.from("blog_posts").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
