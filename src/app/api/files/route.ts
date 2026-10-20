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

const BUCKET = "project-files";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = adminSb();
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

  const prefix = `${projectId}/`;
  const { data, error } = await sb.storage.from(BUCKET).list(projectId, {
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const files = (data ?? []).map((f) => ({
    name: f.name,
    size: f.metadata?.size ?? 0,
    type: f.metadata?.mimetype ?? "",
    path: `${prefix}${f.name}`,
    created_at: f.created_at,
  }));

  return NextResponse.json({ files });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = adminSb();
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;

  if (!file || !projectId) return NextResponse.json({ error: "File and project ID required" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${projectId}/${Date.now()}_${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await sb.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("project_activity").insert({
    project_id: projectId,
    user_id: user.id,
    user_role: "client",
    type: "file",
    content: `Uploaded file: ${file.name}`,
  });

  return NextResponse.json({ ok: true, path, name: file.name });
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = adminSb();
  const { path } = await req.json();
  if (!path) return NextResponse.json({ error: "Path required" }, { status: 400 });

  const { error } = await sb.storage.from(BUCKET).remove([path]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
