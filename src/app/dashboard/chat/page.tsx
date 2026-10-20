"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

interface Conversation {
  id: string;
  client_name: string;
  client_email: string;
  status: string;
  last_message: string;
  last_message_at: string;
  created_at: string;
}

interface Msg {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_role: "client" | "team";
  content: string;
  created_at: string;
}

export default function TeamChatPage() {
  const { user } = useAuth();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const endRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadConvs = useCallback(async () => {
    try {
      const res = await fetch("/api/team-chat");
      if (!res.ok) return;
      const data = await res.json();
      setConvs(data.conversations ?? []);
    } catch { /* ignore */ }
  }, []);

  const loadMsgs = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/team-chat?conversationId=${convId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMsgs(data.messages ?? []);
    } catch { /* ignore */ }
    setLoadingMsgs(false);
  }, []);

  useEffect(() => { loadConvs(); }, [loadConvs]);

  useEffect(() => {
    const iv = setInterval(() => {
      loadConvs();
      if (activeId) loadMsgs(activeId);
    }, 5000);
    return () => clearInterval(iv);
  }, [loadConvs, loadMsgs, activeId]);

  useEffect(() => { scroll(); }, [msgs, scroll]);

  const selectConv = (id: string) => {
    setActiveId(id);
    setMobileView("chat");
    loadMsgs(id);
  };

  const reply = async () => {
    if (!input.trim() || !activeId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const temp: Msg = {
      id: `t-${Date.now()}`,
      conversation_id: activeId,
      sender_id: user?.sub ?? "",
      sender_role: "team",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMsgs((p) => [...p, temp]);
    try {
      await fetch("/api/team-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeId, content: text }),
      });
    } catch {
      setMsgs((p) => p.filter((m) => !m.id.startsWith("t-")));
      setInput(text);
    }
    setSending(false);
  };

  const closeConv = async (convId: string) => {
    await fetch("/api/team-chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: convId, status: "closed" }),
    });
    loadConvs();
    if (activeId === convId) { setActiveId(null); setMsgs([]); setMobileView("list"); }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); reply(); }
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const fmtMsgTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const active = convs.find((c) => c.id === activeId);

  if (!user) return <section className="section"><div className="wrap"><p>Please sign in to access team chat.</p></div></section>;

  return (
    <section className="section">
      <div className="wrap">
        <div className="tc-head">
          <Link href="/dashboard" className="tc-back">← Dashboard</Link>
          <h1>Team Chat Inbox</h1>
          <span className="tc-count">{convs.filter((c) => c.status === "open").length} open</span>
        </div>

        <div className="tc-layout">
          {/* Conversation list */}
          <div className={`tc-list ${mobileView === "list" ? "tc-list-show" : ""}`}>
            {convs.length === 0 ? (
              <div className="tc-empty">
                <p>No conversations yet.</p>
                <p style={{ fontSize: ".8rem", color: "var(--text-secondary)" }}>When clients message you, they will appear here.</p>
              </div>
            ) : convs.map((c) => (
              <button
                key={c.id}
                className={`tc-conv ${activeId === c.id ? "tc-conv-active" : ""} ${c.status !== "open" ? "tc-conv-closed" : ""}`}
                onClick={() => selectConv(c.id)}
              >
                <div className="tc-conv-av">{(c.client_name || "?")[0].toUpperCase()}</div>
                <div className="tc-conv-info">
                  <div className="tc-conv-top">
                    <strong>{c.client_name || "Anonymous"}</strong>
                    <time>{fmtTime(c.last_message_at)}</time>
                  </div>
                  <p className="tc-conv-email">{c.client_email}</p>
                  <p className="tc-conv-preview">{c.last_message || "New conversation"}</p>
                </div>
                {c.status !== "open" && <span className="tc-conv-badge">Closed</span>}
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div className={`tc-chat ${mobileView === "chat" ? "tc-chat-show" : ""}`}>
            {!active ? (
              <div className="tc-no-sel">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                <p>Select a conversation to start replying</p>
              </div>
            ) : (
              <>
                <div className="tc-chat-hdr">
                  <button className="tc-mob-back" onClick={() => setMobileView("list")}>←</button>
                  <div>
                    <strong>{active.client_name || "Anonymous"}</strong>
                    <span>{active.client_email}</span>
                  </div>
                  <div className="tc-chat-actions">
                    {active.status === "open" && (
                      <button className="tc-resolve" onClick={() => closeConv(active.id)}>Mark Resolved</button>
                    )}
                  </div>
                </div>

                <div className="tc-msgs">
                  {loadingMsgs && msgs.length === 0 ? (
                    <div className="tc-loading">Loading messages...</div>
                  ) : (
                    <>
                      {msgs.map((m) => (
                        <div key={m.id} className={`tc-msg ${m.sender_role === "team" ? "tc-msg-team" : "tc-msg-client"}`}>
                          <div className="tc-msg-bub">
                            <p>{m.content}</p>
                            <time>{fmtMsgTime(m.created_at)}</time>
                          </div>
                          <span className="tc-msg-label">{m.sender_role === "team" ? "You" : active.client_name || "Client"}</span>
                        </div>
                      ))}
                      <div ref={endRef} />
                    </>
                  )}
                </div>

                {active.status === "open" && (
                  <div className="tc-reply">
                    <textarea
                      className="tc-reply-inp"
                      placeholder="Type a reply..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKey}
                      rows={2}
                      maxLength={2000}
                    />
                    <button className="tc-reply-btn" onClick={reply} disabled={!input.trim() || sending}>
                      {sending ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .tc-head{display:flex;align-items:center;gap:1rem;padding:1.5rem 0;flex-wrap:wrap}
        .tc-head h1{font-size:1.4rem;font-weight:800;margin:0;flex:1}
        .tc-back{font-size:.85rem;color:var(--accent);text-decoration:none;font-weight:600}
        .tc-count{font-size:.8rem;padding:.3rem .7rem;border-radius:999px;background:var(--accent);color:#fff;font-weight:700}

        .tc-layout{display:grid;grid-template-columns:340px 1fr;height:calc(100vh - 180px);min-height:400px;border:1px solid var(--border);border-radius:1rem;overflow:hidden;background:var(--surface)}

        .tc-list{border-right:1px solid var(--border);overflow-y:auto}
        .tc-empty{padding:2rem;text-align:center;color:var(--text-secondary)}
        .tc-conv{display:flex;align-items:flex-start;gap:.7rem;width:100%;padding:.9rem 1rem;border:none;border-bottom:1px solid var(--border);background:transparent;cursor:pointer;text-align:left;font:inherit;color:inherit;transition:background .15s}
        .tc-conv:hover{background:rgba(0,102,204,.04)}
        .tc-conv-active{background:rgba(0,102,204,.08) !important}
        .tc-conv-closed{opacity:.55}
        .tc-conv-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0066cc,#0891b2);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.8rem;flex-shrink:0}
        .tc-conv-info{flex:1;min-width:0}
        .tc-conv-top{display:flex;justify-content:space-between;align-items:center}
        .tc-conv-top strong{font-size:.88rem;font-weight:700}
        .tc-conv-top time{font-size:.7rem;color:var(--text-secondary);flex-shrink:0}
        .tc-conv-email{font-size:.72rem;color:var(--text-secondary);margin:.1rem 0 .25rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .tc-conv-preview{font-size:.78rem;color:var(--text-secondary);margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .tc-conv-badge{font-size:.6rem;padding:.15rem .45rem;border-radius:999px;background:var(--border);color:var(--text-secondary);font-weight:700;text-transform:uppercase;flex-shrink:0;margin-top:.3rem}

        .tc-chat{display:flex;flex-direction:column}
        .tc-no-sel{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.7rem;color:var(--text-secondary);font-size:.9rem}
        .tc-chat-hdr{display:flex;align-items:center;gap:.8rem;padding:.8rem 1.2rem;border-bottom:1px solid var(--border);flex-shrink:0}
        .tc-chat-hdr strong{display:block;font-size:.92rem}
        .tc-chat-hdr span{font-size:.75rem;color:var(--text-secondary)}
        .tc-chat-actions{margin-left:auto}
        .tc-resolve{font-size:.75rem;padding:.35rem .8rem;border-radius:.5rem;border:1px solid var(--border);background:transparent;cursor:pointer;color:var(--text-secondary);font-weight:600;transition:all .15s}
        .tc-resolve:hover{border-color:var(--accent);color:var(--accent)}
        .tc-mob-back{display:none;background:none;border:none;font-size:1.1rem;cursor:pointer;color:var(--accent);font-weight:700;padding:0}

        .tc-msgs{flex:1;overflow-y:auto;padding:1rem 1.2rem;display:flex;flex-direction:column;gap:.6rem}
        .tc-loading{text-align:center;color:var(--text-secondary);padding:2rem;font-size:.85rem}
        .tc-msg{display:flex;flex-direction:column;max-width:75%}
        .tc-msg-client{align-self:flex-start}
        .tc-msg-team{align-self:flex-end}
        .tc-msg-bub{border-radius:.8rem;padding:.55rem .8rem;border:1px solid var(--border);background:var(--bg)}
        .tc-msg-team .tc-msg-bub{background:var(--accent,#0066cc);color:#fff;border-color:transparent}
        .tc-msg-bub p{margin:0;font-size:.84rem;line-height:1.5;white-space:pre-wrap;word-break:break-word}
        .tc-msg-bub time{display:block;font-size:.6rem;opacity:.5;margin-top:.2rem;text-align:right}
        .tc-msg-label{font-size:.62rem;color:var(--text-secondary);margin-top:.15rem;padding:0 .3rem}
        .tc-msg-team .tc-msg-label{text-align:right}

        .tc-reply{display:flex;gap:.5rem;padding:.75rem 1rem;border-top:1px solid var(--border);flex-shrink:0;align-items:flex-end}
        .tc-reply-inp{flex:1;resize:none;border:1px solid var(--border);border-radius:.7rem;padding:.55rem .75rem;font-size:.84rem;font-family:inherit;background:var(--bg);color:var(--text-primary);outline:none;max-height:100px}
        .tc-reply-inp:focus{border-color:var(--accent)}
        .tc-reply-btn{padding:.55rem 1.2rem;border-radius:.5rem;background:var(--accent,#0066cc);color:#fff;border:none;font-size:.82rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:opacity .15s}
        .tc-reply-btn:disabled{opacity:.4;cursor:not-allowed}
        .tc-reply-btn:not(:disabled):hover{opacity:.9}

        @media(max-width:768px){
          .tc-layout{grid-template-columns:1fr;height:calc(100vh - 160px)}
          .tc-list{display:none}
          .tc-list-show{display:block !important}
          .tc-chat{display:none}
          .tc-chat-show{display:flex !important}
          .tc-mob-back{display:block}
        }
      `}</style>
    </section>
  );
}
