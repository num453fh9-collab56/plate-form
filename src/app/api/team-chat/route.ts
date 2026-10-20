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
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = adminSb();
  const convId = req.nextUrl.searchParams.get("conversationId");

  if (convId) {
    const { data } = await sb
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    return NextResponse.json({ messages: data ?? [] });
  }

  const { data } = await sb
    .from("chat_conversations")
    .select("*")
    .order("last_message_at", { ascending: false });
  return NextResponse.json({ conversations: data ?? [] });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { conversationId, content } = body;
  if (!conversationId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const sb = adminSb();
  const { error } = await sb.from("chat_messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    sender_role: "team",
    content: content.trim(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb
    .from("chat_conversations")
    .update({ last_message: content.trim().slice(0, 120), last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { conversationId, status } = body;
  if (!conversationId || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const sb = adminSb();
  await sb.from("chat_conversations").update({ status }).eq("id", conversationId);
  return NextResponse.json({ ok: true });
}
