"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useMessaging } from "@/lib/messaging";
import type { ChatMessage, Offer } from "@/lib/messaging";
import { useCurrency } from "@/lib/currency";
import { getSupabase } from "@/lib/supabase";
import { startCheckoutFor } from "@/lib/checkout";
import { initials } from "@/lib/format";

async function offerAction(body: Record<string, unknown>): Promise<string | null> {
  const supabase = getSupabase();
  const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
  if (!token) return "Please sign in.";
  const response = await fetch("/api/offers", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  return response.ok ? null : payload.error ?? "Something went wrong.";
}

export default function MessagesModal() {
  const { isMessagesOpen, closeMessages, openAuth, toast } = useUI();
  const { user } = useAuth();
  const { conversations, activeId, setActiveId, messages, offers, loading, send, sendCall } = useMessaging();
  const [text, setText] = useState("");
  const [composing, setComposing] = useState(false);
  const [showList, setShowList] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isMessagesOpen) return null;

  const activeConversationId = activeId ?? conversations[0]?.id ?? null;
  const active = conversations.find((item) => item.id === activeConversationId) ?? null;
  const iAmSeller = Boolean(active && user?.sub === active.sellerId);

  const startCall = async () => {
    const url = await sendCall();
    if (!url) {
      toast("Could not start the call.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="modal-overlay open"
      role="dialog"
      aria-modal="true"
      aria-label="Messages"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeMessages();
      }}
    >
      <div className="modal chat-modal">
        <div className="modal-head">
          <div>
            <h3>Messages</h3>
            <p>Chat, send custom offers and start video calls.</p>
          </div>
          <button className="modal-close" type="button" aria-label="Close" onClick={closeMessages}>
            &times;
          </button>
        </div>

        {!user ? (
          <div className="chat-empty">
            <p>Sign in to view your messages.</p>
            <button
              className="btn-primary"
              type="button"
              onClick={() => {
                closeMessages();
                openAuth("login");
              }}
            >
              Sign in
            </button>
          </div>
        ) : (
          <div className={"chat-grid" + (showList ? " list-open" : "")}>
            <aside className="chat-list">
              {conversations.length === 0 ? (
                <p className="chat-muted">{loading ? "Loading…" : "No conversations yet."}</p>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    className={"chat-list-item" + (conversation.id === activeConversationId ? " active" : "")}
                    aria-pressed={conversation.id === activeConversationId}
                    onClick={() => {
                      setActiveId(conversation.id);
                      setComposing(false);
                      setShowList(false);
                    }}
                  >
                    <span className="avatar" aria-hidden="true">
                      {initials(conversation.counterpartName)}
                    </span>
                    <span className="chat-list-text">
                      <strong>{conversation.counterpartName}</strong>
                      <small>{conversation.sellerId === user.sub ? "Buyer" : "Seller"}</small>
                    </span>
                  </button>
                ))
              )}
            </aside>

            <section className="chat-pane">
              {active ? (
                <>
                  <div className="chat-pane-head">
                    <button type="button" className="chat-back" aria-label="Back to conversations" onClick={() => setShowList(true)}>
                      ‹
                    </button>
                    <strong>{active.counterpartName}</strong>
                    <div className="chat-pane-actions">
                      <button className="btn-ghost btn-sm" type="button" onClick={() => void startCall()} title="Start a video call">
                        🎥 Video call
                      </button>
                      {iAmSeller ? (
                        <button className="btn-primary btn-sm" type="button" onClick={() => setComposing((v) => !v)}>
                          {composing ? "Close offer" : "Create offer"}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {composing ? (
                    <OfferComposer
                      conversationId={active.id}
                      onDone={() => setComposing(false)}
                    />
                  ) : (
                    <div className="chat-messages">
                      {messages.length === 0 ? (
                        <p className="chat-muted chat-center">No messages yet — say hello.</p>
                      ) : (
                        messages.map((message) => (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            mine={message.senderId === user.sub}
                            offer={message.meta.offer_id ? offers[message.meta.offer_id] : undefined}
                            userId={user.sub ?? ""}
                          />
                        ))
                      )}
                      <div ref={endRef} />
                    </div>
                  )}

                  {!composing ? (
                    <form
                      className="chat-input"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        const value = text;
                        if (!value.trim()) return;
                        setText("");
                        const ok = await send(value);
                        if (!ok) {
                          setText(value);
                          toast("Message not sent. Try again.");
                        }
                      }}
                    >
                      <input
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="Write a message…"
                        maxLength={4000}
                      />
                      <button className="btn-primary" type="submit">
                        Send
                      </button>
                    </form>
                  ) : null}
                </>
              ) : (
                <div className="chat-muted chat-center">Select a conversation to start chatting.</div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  mine,
  offer,
  userId,
}: {
  message: ChatMessage;
  mine: boolean;
  offer?: Offer;
  userId: string;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (message.kind === "offer") {
    return (
      <div className={"chat-row" + (mine ? " mine" : "")}>
        {offer ? <OfferCard offer={offer} userId={userId} /> : <div className="chat-bubble">{message.body}</div>}
      </div>
    );
  }

  if (message.kind === "call" && message.meta.url?.startsWith("https://meet.jit.si/")) {
    return (
      <div className={"chat-row" + (mine ? " mine" : "")}>
        <div className="chat-call">
          <span aria-hidden="true">🎥</span>
          <div>
            <strong>{mine ? "You started a video call" : "Video call invitation"}</strong>
            <small>{time}</small>
          </div>
          <a className="btn-primary btn-sm" href={message.meta.url} target="_blank" rel="noopener noreferrer">
            Join
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={"chat-row" + (mine ? " mine" : "")}>
      <div className="chat-bubble">
        {message.body}
        <small>{time}</small>
      </div>
    </div>
  );
}

function OfferCard({ offer, userId }: { offer: Offer; userId: string }) {
  const { format, converted } = useCurrency();
  const { toast } = useUI();
  const [busy, setBusy] = useState<string | null>(null);
  const isBuyer = offer.buyerId === userId;
  const isSeller = offer.sellerId === userId;

  const run = async (action: "decline" | "withdraw") => {
    setBusy(action);
    const error = await offerAction({ action, offerId: offer.id });
    setBusy(null);
    if (error) toast(error);
  };

  const accept = async () => {
    setBusy("accept");
    const result = await startCheckoutFor({ offerId: offer.id });
    setBusy(null);
    if (result.error) {
      toast(result.error);
      return;
    }
    if (result.url) window.location.href = result.url;
  };

  return (
    <div className={`offer-card status-${offer.status}`}>
      <div className="offer-card-head">
        <span className="offer-card-tag">Custom offer</span>
        <span className={`offer-status ${offer.status}`}>{offer.status}</span>
      </div>
      <h4>{offer.title}</h4>
      {offer.description ? <p className="offer-desc">{offer.description}</p> : null}
      <div className="offer-facts">
        <div>
          <span>Price</span>
          <strong>{format(offer.amount)}</strong>
        </div>
        <div>
          <span>Delivery</span>
          <strong>{offer.deliveryDays} days</strong>
        </div>
        <div>
          <span>Revisions</span>
          <strong>{offer.revisions}</strong>
        </div>
      </div>
      {offer.milestones.length > 0 ? (
        <ol className="offer-milestones">
          {offer.milestones.map((m, i) => (
            <li key={i}>
              <span>{m.title}</span>
              <span>
                {format(m.amount)} · {m.days}d
              </span>
            </li>
          ))}
        </ol>
      ) : null}
      {converted ? <p className="offer-note">Charged as ${offer.amount} USD.</p> : null}
      {offer.status === "pending" && offer.expiresAt ? (
        <p className="offer-note">Expires {new Date(offer.expiresAt).toLocaleDateString()}</p>
      ) : null}
      {offer.status === "pending" ? (
        <div className="offer-actions">
          {isBuyer ? (
            <>
              <button className="btn-primary btn-sm" type="button" disabled={Boolean(busy)} onClick={() => void accept()}>
                {busy === "accept" ? "Opening checkout…" : "Accept & pay"}
              </button>
              <button className="btn-ghost btn-sm" type="button" disabled={Boolean(busy)} onClick={() => void run("decline")}>
                Decline
              </button>
            </>
          ) : null}
          {isSeller ? (
            <button className="btn-ghost btn-sm" type="button" disabled={Boolean(busy)} onClick={() => void run("withdraw")}>
              {busy === "withdraw" ? "Withdrawing…" : "Withdraw offer"}
            </button>
          ) : null}
        </div>
      ) : null}
      {offer.status === "accepted" && offer.orderId ? (
        <Link className="btn-ghost btn-sm" href={`/orders/${offer.orderId}`}>
          View order
        </Link>
      ) : null}
    </div>
  );
}

interface MilestoneDraft {
  title: string;
  amount: string;
  days: string;
}

function OfferComposer({ conversationId, onDone }: { conversationId: string; onDone: () => void }) {
  const { toast } = useUI();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("3");
  const [revisions, setRevisions] = useState("1");
  const [expires, setExpires] = useState("7");
  const [useMilestones, setUseMilestones] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    { title: "", amount: "", days: "" },
    { title: "", amount: "", days: "" },
  ]);
  const [busy, setBusy] = useState(false);

  const msTotal = milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const msDays = milestones.reduce((s, m) => s + (Number(m.days) || 0), 0);

  const submit = async () => {
    setBusy(true);
    const error = await offerAction({
      action: "create",
      conversationId,
      title,
      description,
      amount: Number(amount),
      deliveryDays: Number(days),
      revisions: Number(revisions),
      expiresInDays: Number(expires),
      milestones: useMilestones
        ? milestones
            .filter((m) => m.title.trim())
            .map((m) => ({ title: m.title, amount: Number(m.amount), days: Number(m.days) }))
        : [],
    });
    setBusy(false);
    if (error) {
      toast(error);
      return;
    }
    toast("Offer sent!");
    onDone();
  };

  return (
    <div className="offer-composer">
      <label>
        <span>Offer title</span>
        <input className="gw-input" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full brand identity with 3 logo concepts" />
      </label>
      <label>
        <span>What&apos;s included</span>
        <textarea className="gw-input" rows={3} value={description} maxLength={2000} onChange={(e) => setDescription(e.target.value)} placeholder="Scope, deliverables, files…" />
      </label>

      <label className="gw-switch">
        <input type="checkbox" checked={useMilestones} onChange={(e) => setUseMilestones(e.target.checked)} />
        <span>Split into milestones (buyer approves &amp; pays out each part)</span>
      </label>

      {useMilestones ? (
        <div className="offer-ms">
          {milestones.map((m, i) => (
            <div key={i} className="offer-ms-row">
              <input className="gw-input" value={m.title} onChange={(e) => setMilestones((cur) => cur.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))} placeholder={`Milestone ${i + 1}`} />
              <input className="gw-input" type="number" min={5} value={m.amount} onChange={(e) => setMilestones((cur) => cur.map((x, idx) => (idx === i ? { ...x, amount: e.target.value } : x)))} placeholder="$" />
              <input className="gw-input" type="number" min={1} value={m.days} onChange={(e) => setMilestones((cur) => cur.map((x, idx) => (idx === i ? { ...x, days: e.target.value } : x)))} placeholder="Days" />
              <button type="button" className="gw-icon-btn" aria-label="Remove milestone" disabled={milestones.length <= 2} onClick={() => setMilestones((cur) => cur.filter((_, idx) => idx !== i))}>×</button>
            </div>
          ))}
          <div className="offer-ms-foot">
            <button type="button" className="btn-ghost btn-sm" disabled={milestones.length >= 10} onClick={() => setMilestones((cur) => [...cur, { title: "", amount: "", days: "" }])}>
              + Add milestone
            </button>
            <span>
              Total <strong>${msTotal.toFixed(2)}</strong> · {msDays} days
            </span>
          </div>
        </div>
      ) : (
        <div className="offer-grid">
          <label>
            <span>Price (USD)</span>
            <input className="gw-input" type="number" min={5} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label>
            <span>Delivery (days)</span>
            <input className="gw-input" type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} />
          </label>
        </div>
      )}

      <div className="offer-grid">
        <label>
          <span>Revisions</span>
          <input className="gw-input" type="number" min={0} value={revisions} onChange={(e) => setRevisions(e.target.value)} />
        </label>
        <label>
          <span>Offer valid for</span>
          <select className="gw-input" value={expires} onChange={(e) => setExpires(e.target.value)}>
            <option value="1">1 day</option>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
          </select>
        </label>
      </div>

      <div className="offer-composer-actions">
        <button type="button" className="btn-ghost" onClick={onDone}>
          Cancel
        </button>
        <button type="button" className="btn-primary" disabled={busy} onClick={() => void submit()}>
          {busy ? "Sending…" : "Send offer"}
        </button>
      </div>
    </div>
  );
}
