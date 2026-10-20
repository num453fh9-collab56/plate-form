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

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { path } = await req.json();
  if (!path) return NextResponse.json({ error: "Path required" }, { status: 400 });

  const sb = adminSb();
  const { data, error } = await sb.storage.from("project-files").createSignedUrl(path, 300);

  if (error || !data?.signedUrl) return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl });
}
