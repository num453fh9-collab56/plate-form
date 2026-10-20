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

export async function GET(req: NextRequest) {
  const sb = adminSb();
  const mode = req.nextUrl.searchParams.get("mode");

  if (mode === "all") {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await sb.from("reviews").select("*").order("created_at", { ascending: false });
    return NextResponse.json({ reviews: data ?? [] });
  }

  if (mode === "my") {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await sb.from("reviews").select("*").eq("client_id", user.id).order("created_at", { ascending: false });
    return NextResponse.json({ reviews: data ?? [] });
  }

  const { data } = await sb
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });
  return NextResponse.json({ reviews: data ?? [] });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;
  const sb = adminSb();

  if (action === "submit") {
    const { client_name, client_email, project_id, service, rating, title, content } = body;
    if (!content?.trim()) return NextResponse.json({ error: "Review content required" }, { status: 400 });

    const { data, error } = await sb.from("reviews").insert({
      client_id: user.id,
      client_name: client_name?.trim() ?? "",
      client_email: client_email?.trim() ?? "",
      project_id: project_id || null,
      service: service ?? "",
      rating: Math.min(5, Math.max(1, rating ?? 5)),
      title: title?.trim() ?? "",
      content: content.trim(),
      is_approved: false,
      is_featured: false,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ review: data });
  }

  if (action === "approve") {
    const { id } = body;
    await sb.from("reviews").update({ is_approved: true }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  if (action === "feature") {
    const { id, featured } = body;
    await sb.from("reviews").update({ is_featured: !!featured }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    const { id } = body;
    await sb.from("reviews").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
