"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useMessaging } from "@/lib/messaging";
import { initials } from "@/lib/format";

export default function MessagesModal() {
  const { isMessagesOpen, closeMessages, openAuth } = useUI();
  const { user } = useAuth();
  const { conversations, activeId, setActiveId, messages, loading, send } = useMessaging();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isMessagesOpen) return null;

  const activeConversationId = activeId ?? conversations[0]?.id ?? null;
  const active = conversations.find((item) => item.id === activeConversationId) ?? null;

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
      <div
        className="modal"
        style={{ maxWidth: 880, width: "100%", padding: 0, overflow: "hidden" }}
      >
        <div className="modal-head">
          <div>
            <h3>Messages</h3>
            <p>Chat directly with buyers and sellers.</p>
          </div>
          <button className="modal-close" type="button" aria-label="Close" onClick={closeMessages}>
            &times;
          </button>
        </div>

        {!user ? (
          <div style={{ padding: 32, textAlign: "center" }}>
            <p style={{ color: "var(--muted)", marginBottom: 16 }}>
              Sign in to view your messages.
            </p>
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "260px 1fr",
              minHeight: 420,
              maxHeight: "68vh",
            }}
          >
            <aside
              style={{
                borderRight: "1px solid var(--line)",
                overflowY: "auto",
                background: "var(--bg-2)",
              }}
            >
              {conversations.length === 0 ? (
                <p style={{ padding: 16, color: "var(--muted)", fontSize: ".86rem" }}>
                  {loading ? "Loading…" : "No conversations yet."}
                </p>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    className="dash-item"
                    aria-pressed={conversation.id === activeConversationId}
                    onClick={() => setActiveId(conversation.id)}
                    style={
                      conversation.id === activeConversationId
                        ? { background: "#ffffff", color: "var(--text)" }
                        : undefined
                    }
                  >
                    <span className="avatar" aria-hidden="true">
                      {initials(conversation.counterpartName)}
                    </span>
                    <span className="dash-text">{conversation.counterpartName}</span>
                  </button>
                ))
              )}
            </aside>

            <section style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              {active ? (
                <>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--line)",
                      fontWeight: 700,
                    }}
                  >
                    {active.counterpartName}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {messages.length === 0 ? (
                      <p style={{ margin: "auto", color: "var(--muted)", fontSize: ".86rem" }}>
                        No messages yet — say hello.
                      </p>
                    ) : (
                      messages.map((message) => {
                        const mine = message.senderId === user.sub;
                        return (
                          <div
                            key={message.id}
                            style={{
                              alignSelf: mine ? "flex-end" : "flex-start",
                              maxWidth: "78%",
                              background: mine ? "var(--accent)" : "var(--bg-2)",
                              color: mine ? "#ffffff" : "var(--text)",
                              padding: "8px 12px",
                              borderRadius: 12,
                              fontSize: ".9rem",
                              lineHeight: 1.45,
                              whiteSpace: "pre-wrap",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {message.body}
                          </div>
                        );
                      })
                    )}
                    <div ref={endRef} />
                  </div>
                  <form
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const value = text;
                      if (!value.trim()) return;
                      setText("");
                      await send(value);
                    }}
                    style={{
                      display: "flex",
                      gap: 8,
                      padding: 12,
                      borderTop: "1px solid var(--line)",
                    }}
                  >
                    <input
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      placeholder="Write a message…"
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        border: "1px solid var(--line)",
                        borderRadius: 10,
                        background: "var(--bg-2)",
                        color: "var(--text)",
                        outline: "none",
                      }}
                    />
                    <button className="btn-primary" type="submit">
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ margin: "auto", color: "var(--muted)", fontSize: ".9rem" }}>
                  Select a conversation to start chatting.
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
