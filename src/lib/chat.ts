import { getSupabase } from "./supabase";

export interface Conversation {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  status: string;
  last_message: string;
  last_message_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_role: "client" | "team";
  content: string;
  created_at: string;
}

export async function getMyConversation(): Promise<Conversation | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("chat_conversations")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function createConversation(
  userId: string,
  name: string,
  email: string,
): Promise<Conversation> {
  const sb = getSupabase();
  if (!sb) throw new Error("No supabase client");
  const { data, error } = await sb
    .from("chat_conversations")
    .insert({ client_id: userId, client_name: name, client_email: email })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function sendChatMessage(
  conversationId: string,
  content: string,
  senderId: string,
  senderRole: "client" | "team" = "client",
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("chat_messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    sender_role: senderRole,
    content,
  });
  if (error) throw error;
  await sb
    .from("chat_conversations")
    .update({ last_message: content.slice(0, 120), last_message_at: new Date().toISOString() })
    .eq("id", conversationId);
}

export async function fetchChatMessages(conversationId: string): Promise<ChatMessage[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export function subscribeToMessages(
  conversationId: string,
  onMessage: (msg: ChatMessage) => void,
): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};
  const channel = sb
    .channel(`chat:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onMessage(payload.new as ChatMessage),
    )
    .subscribe();
  return () => {
    sb.removeChannel(channel);
  };
}
