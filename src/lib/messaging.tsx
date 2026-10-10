"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "./auth";
import { getSupabase } from "./supabase";

export interface Conversation {
  id: string;
  gigId: string | null;
  buyerId: string;
  sellerId: string;
  updatedAt: string;
  counterpartId: string;
  counterpartName: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  /** "text" | "offer" | "call" */
  kind: string;
  meta: { offer_id?: string; url?: string };
}

export interface Offer {
  id: string;
  conversationId: string;
  sellerId: string;
  buyerId: string;
  title: string;
  description: string;
  amount: number;
  deliveryDays: number;
  revisions: number;
  milestones: { title: string; amount: number; days: number }[];
  status: "pending" | "accepted" | "declined" | "withdrawn" | "expired";
  expiresAt: string | null;
  orderId: string | null;
}

interface ConversationRow {
  id: string;
  gig_id: string | null;
  buyer_id: string;
  seller_id: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  kind?: string | null;
  meta?: { offer_id?: string; url?: string } | null;
}

interface OfferRow {
  id: string;
  conversation_id: string;
  seller_id: string;
  buyer_id: string;
  title: string;
  description: string;
  amount: number;
  delivery_days: number;
  revisions: number;
  milestones: { title: string; amount: number; days: number }[] | null;
  status: Offer["status"];
  expires_at: string | null;
  order_id: string | null;
}

function rowToMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
    kind: row.kind ?? "text",
    meta: row.meta ?? {},
  };
}

function rowToOffer(row: OfferRow): Offer {
  const expired = row.status === "pending" && row.expires_at && new Date(row.expires_at).getTime() < Date.now();
  return {
    id: row.id,
    conversationId: row.conversation_id,
    sellerId: row.seller_id,
    buyerId: row.buyer_id,
    title: row.title,
    description: row.description,
    amount: Number(row.amount),
    deliveryDays: row.delivery_days,
    revisions: row.revisions,
    milestones: Array.isArray(row.milestones) ? row.milestones : [],
    status: expired ? "expired" : row.status,
    expiresAt: row.expires_at,
    orderId: row.order_id,
  };
}

interface MessagingValue {
  conversations: Conversation[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  messages: ChatMessage[];
  /** Custom offers in the active conversation, keyed by id. */
  offers: Record<string, Offer>;
  loading: boolean;
  starting: boolean;
  send: (body: string) => Promise<boolean>;
  /** Posts a video-call link into the active conversation. */
  sendCall: () => Promise<string | null>;
  startConversation: (input: {
    gigId?: string;
    sellerId: string;
    sellerName?: string;
  }) => Promise<string | null>;
  refresh: () => Promise<void>;
}

async function loadConversations(userId: string): Promise<Conversation[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("conversations")
    .select("*")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("updated_at", { ascending: false });
  const rows = (data ?? []) as ConversationRow[];
  const counterpartIds = rows.map((row) =>
    row.buyer_id === userId ? row.seller_id : row.buyer_id,
  );
  let names: Record<string, string> = {};
  if (counterpartIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", counterpartIds);
    names = Object.fromEntries(
      (profiles ?? []).map((p: { user_id: string; full_name: string | null }) => [
        p.user_id,
        p.full_name ?? "User",
      ]),
    );
  }
  return rows.map((row) => {
    const counterpartId = row.buyer_id === userId ? row.seller_id : row.buyer_id;
    return {
      id: row.id,
      gigId: row.gig_id,
      buyerId: row.buyer_id,
      sellerId: row.seller_id,
      updatedAt: row.updated_at,
      counterpartId,
      counterpartName: names[counterpartId] ?? "User",
    };
  });
}

const MessagingContext = createContext<MessagingValue | null>(null);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { account } = useAuth();
  const userId = account?.id ?? null;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [offers, setOffers] = useState<Record<string, Offer>>({});
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setConversations([]);
      return;
    }
    setLoading(true);
    const list = await loadConversations(userId);
    setConversations(list);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void loadConversations(userId).then((list) => {
      if (!cancelled) setConversations(list);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  /* load messages + offers whenever the active conversation changes */
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !activeId) return;
    let cancelled = false;
    void Promise.all([
      supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: true }),
      supabase.from("offers").select("*").eq("conversation_id", activeId),
    ]).then(([{ data }, { data: offerRows }]) => {
      if (cancelled) return;
      setMessages(((data ?? []) as MessageRow[]).map(rowToMessage));
      setOffers(
        Object.fromEntries(((offerRows ?? []) as OfferRow[]).map((row) => [row.id, rowToOffer(row)])),
      );
    });

    const channel = supabase
      .channel(`messages-${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload) => {
          const message = rowToMessage(payload.new as MessageRow);
          setMessages((current) =>
            current.some((m) => m.id === message.id) ? current : [...current, message],
          );
          if (message.kind === "offer" && message.meta.offer_id) {
            void supabase
              .from("offers")
              .select("*")
              .eq("id", message.meta.offer_id)
              .maybeSingle()
              .then(({ data: row }) => {
                if (row) setOffers((cur) => ({ ...cur, [row.id]: rowToOffer(row as OfferRow) }));
              });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "offers",
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload) => {
          const offer = rowToOffer(payload.new as OfferRow);
          setOffers((cur) => ({ ...cur, [offer.id]: offer }));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [activeId]);

  /* keep the conversation list fresh */
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userId) return;
    const channel = supabase
      .channel("conversations-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          void refresh();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const send = useCallback(
    async (body: string): Promise<boolean> => {
      const supabase = getSupabase();
      const text = body.trim();
      if (!supabase || !userId || !activeId || !text) return false;
      const { error } = await supabase
        .from("messages")
        .insert({ conversation_id: activeId, sender_id: userId, body: text });
      if (error) return false;
      void supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeId);
      return true;
    },
    [userId, activeId],
  );

  const sendCall = useCallback(async (): Promise<string | null> => {
    const supabase = getSupabase();
    if (!supabase || !userId || !activeId) return null;
    // Jitsi Meet: free, no account needed; the random room name is the secret.
    const room = `Hirelyx-${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
    const url = `https://meet.jit.si/${room}`;
    const { error } = await supabase.from("messages").insert({
      conversation_id: activeId,
      sender_id: userId,
      body: "Started a video call",
      kind: "call",
      meta: { url },
    });
    if (error) return null;
    void supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", activeId);
    return url;
  }, [userId, activeId]);

  const startConversation = useCallback(
    async ({
      gigId,
      sellerId,
      sellerName,
    }: {
      gigId?: string;
      sellerId: string;
      sellerName?: string;
    }): Promise<string | null> => {
      const supabase = getSupabase();
      if (!supabase || !userId || userId === sellerId) return null;
      setStarting(true);
      try {
        let query = supabase
          .from("conversations")
          .select("id")
          .eq("buyer_id", userId)
          .eq("seller_id", sellerId);
        if (gigId) query = query.eq("gig_id", gigId);
        const { data: existing } = await query.maybeSingle();
        if (existing?.id) {
          setActiveId(existing.id);
          return existing.id;
        }
        const { data, error } = await supabase
          .from("conversations")
          .insert({ buyer_id: userId, seller_id: sellerId, gig_id: gigId ?? null })
          .select("id")
          .single();
        if (error || !data) return null;
        setActiveId((data as { id: string }).id);
        void refresh();
        void sellerName;
        return (data as { id: string }).id;
      } finally {
        setStarting(false);
      }
    },
    [userId, refresh],
  );

  const value = useMemo<MessagingValue>(
    () => ({
      conversations,
      activeId,
      setActiveId,
      messages,
      offers,
      loading,
      starting,
      send,
      sendCall,
      startConversation,
      refresh,
    }),
    [conversations, activeId, messages, offers, loading, starting, send, sendCall, startConversation, refresh],
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}

export function useMessaging(): MessagingValue {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessaging must be used within MessagingProvider");
  }
  return context;
}
