"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import {
  getMyConversation,
  createConversation,
  sendChatMessage,
  fetchChatMessages,
  subscribeToMessages,
  type Conversation,
  type ChatMessage,
} from "@/lib/chat";

export default function ChatWidget() {
  const { user, profile } = useAuth();
  const { openAuth } = useUI();
  const [open, setOpen] = useState(false);
  const [conv, setConv] = useState<Conversation | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scroll = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    setLoading(true);
    getMyConversation()
      .then(async (c) => {
        if (cancelled) return;
        if (c) {
          setConv(c);
          const m = await fetchChatMessages(c.id);
          if (!cancelled) setMsgs(m);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, user]);

  useEffect(() => {
    if (!conv) return;
    return subscribeToMessages(conv.id, (msg) => {
      setMsgs((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      if (!open && msg.sender_role === "team") setHasNew(true);
    });
  }, [conv, open]);

  useEffect(() => { scroll(); }, [msgs, scroll]);

  useEffect(() => {
    if (open) {
      setHasNew(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const send = async () => {
    if (!input.trim() || sending || !user) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      let c = conv;
      if (!c) {
        c = await createConversation(
          user.sub ?? "",
          profile.fullName || user.name || "",
          user.email || "",
        );
        setConv(c);
      }
      const temp: ChatMessage = {
        id: `t-${Date.now()}`,
        conversation_id: c.id,
        sender_id: user.sub ?? "",
        sender_role: "client",
        content: text,
        created_at: new Date().toISOString(),
      };
      setMsgs((p) => [...p, temp]);
      await sendChatMessage(c.id, text, user.sub ?? "", "client");
    } catch {
      setMsgs((p) => p.filter((m) => !m.id.startsWith("t-")));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {!open && (
        <button className="chat-fab" onClick={() => setOpen(true)} aria-label="Open chat">
          {hasNew && <span className="chat-fab-dot" />}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {open && (
        <div className="chat-panel">
          <div className="chat-hdr">
            <div className="chat-hdr-info">
              <div className="chat-hdr-av">H</div>
              <div>
                <strong>Hirelyx Team</strong>
                <span className="chat-online"><span className="chat-online-dot" />Online</span>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="chat-body">
            {!user ? (
              <div className="chat-prompt">
                <div style={{ fontSize: "2.5rem" }}>💬</div>
                <h3>Chat with us</h3>
                <p>Sign in to start a conversation with our team.</p>
                <button className="btn-primary" onClick={() => { openAuth("login"); setOpen(false); }}>Sign In</button>
              </div>
            ) : loading ? (
              <div className="chat-dots"><span /><span /><span /></div>
            ) : (
              <>
                <div className="chat-bub chat-bub-team">
                  <div className="chat-bub-av">H</div>
                  <div className="chat-bub-c">
                    <p>Hi! Welcome to Hirelyx.</p>
                    <p>How can we help you today? Our team typically responds within a few hours.</p>
                  </div>
                </div>
                {msgs.map((m) => (
                  <div key={m.id} className={`chat-bub ${m.sender_role === "client" ? "chat-bub-me" : "chat-bub-team"}`}>
                    {m.sender_role === "team" && <div className="chat-bub-av">H</div>}
                    <div className="chat-bub-c">
                      <p>{m.content}</p>
                      <time className="chat-bub-t">{fmtTime(m.created_at)}</time>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </>
            )}
          </div>

          {user && (
            <div className="chat-foot">
              <textarea
                ref={inputRef}
                className="chat-inp"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                rows={1}
                maxLength={2000}
              />
              <button className="chat-snd" onClick={send} disabled={!input.trim() || sending} aria-label="Send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .chat-fab{position:fixed;bottom:1.5rem;right:1.5rem;width:56px;height:56px;border-radius:50%;background:var(--accent,#0066cc);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,102,204,.4);z-index:9999;transition:transform .2s,box-shadow .2s;animation:cfPulse 2s infinite}
        .chat-fab:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(0,102,204,.5)}
        @keyframes cfPulse{0%,100%{box-shadow:0 4px 20px rgba(0,102,204,.4)}50%{box-shadow:0 4px 28px rgba(0,102,204,.65)}}
        .chat-fab-dot{position:absolute;top:2px;right:2px;width:14px;height:14px;border-radius:50%;background:#ef4444;border:2px solid var(--bg);animation:cfDotPop .3s ease}
        @keyframes cfDotPop{from{transform:scale(0)}to{transform:scale(1)}}

        .chat-panel{position:fixed;bottom:1.5rem;right:1.5rem;width:380px;height:540px;background:var(--surface);border:1px solid var(--border);border-radius:1rem;display:flex;flex-direction:column;box-shadow:0 12px 48px rgba(0,0,0,.18);z-index:9999;animation:cpUp .3s ease;overflow:hidden}
        @keyframes cpUp{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}

        .chat-hdr{display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.1rem;background:linear-gradient(135deg,#0066cc,#0891b2);color:#fff;flex-shrink:0}
        .chat-hdr-info{display:flex;align-items:center;gap:.7rem}
        .chat-hdr-av{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.85rem}
        .chat-hdr-info strong{display:block;font-size:.92rem}
        .chat-online{font-size:.7rem;opacity:.9;display:flex;align-items:center;gap:.3rem}
        .chat-online-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block}
        .chat-close{background:rgba(255,255,255,.15);border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;transition:background .2s}
        .chat-close:hover{background:rgba(255,255,255,.25)}

        .chat-body{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.65rem;scroll-behavior:smooth}
        .chat-body::-webkit-scrollbar{width:4px}
        .chat-body::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}

        .chat-bub{display:flex;gap:.45rem;max-width:85%;animation:cbIn .2s ease}
        @keyframes cbIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .chat-bub-team{align-self:flex-start}
        .chat-bub-me{align-self:flex-end;flex-direction:row-reverse}
        .chat-bub-av{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#0066cc,#0891b2);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:800;flex-shrink:0;margin-top:2px}
        .chat-bub-c{border-radius:.9rem;padding:.55rem .8rem;border:1px solid var(--border);background:var(--bg)}
        .chat-bub-me .chat-bub-c{background:var(--accent,#0066cc);color:#fff;border-color:transparent;border-bottom-right-radius:.25rem}
        .chat-bub-team .chat-bub-c{border-bottom-left-radius:.25rem}
        .chat-bub-c p{margin:0;font-size:.84rem;line-height:1.5}
        .chat-bub-c p+p{margin-top:.25rem}
        .chat-bub-t{display:block;font-size:.6rem;opacity:.55;margin-top:.2rem;text-align:right}

        .chat-foot{display:flex;align-items:flex-end;gap:.4rem;padding:.65rem .9rem;border-top:1px solid var(--border);background:var(--surface);flex-shrink:0}
        .chat-inp{flex:1;resize:none;border:1px solid var(--border);border-radius:.7rem;padding:.55rem .75rem;font-size:.84rem;font-family:inherit;background:var(--bg);color:var(--text-primary);outline:none;max-height:90px;line-height:1.4}
        .chat-inp:focus{border-color:var(--accent,#0066cc)}
        .chat-snd{width:36px;height:36px;border-radius:50%;background:var(--accent,#0066cc);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .2s,transform .2s}
        .chat-snd:disabled{opacity:.35;cursor:not-allowed}
        .chat-snd:not(:disabled):hover{transform:scale(1.06)}

        .chat-prompt{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;gap:.4rem}
        .chat-prompt h3{font-size:1.1rem;font-weight:700;margin:0;color:var(--text-primary)}
        .chat-prompt p{font-size:.84rem;color:var(--text-secondary);margin:0 0 .7rem}
        .chat-dots{flex:1;display:flex;align-items:center;justify-content:center;gap:.35rem}
        .chat-dots span{width:8px;height:8px;border-radius:50%;background:var(--text-secondary);animation:cdBounce 1.4s infinite ease-in-out both}
        .chat-dots span:nth-child(1){animation-delay:-.32s}
        .chat-dots span:nth-child(2){animation-delay:-.16s}
        @keyframes cdBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}

        @media(max-width:500px){.chat-panel{width:calc(100vw - 1.5rem);height:calc(100dvh - 5rem);bottom:.75rem;right:.75rem}.chat-fab{bottom:1rem;right:1rem}}
      `}</style>
    </>
  );
}
