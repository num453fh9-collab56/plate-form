"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "How does Hirelyx work?",
  "How do I hire a freelancer?",
  "How do sellers get paid?",
  "What are the platform fees?",
];

function GemiAvatar({ size = 36 }: { size?: number }) {
  const id = `gemi-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="80" y2="80">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <clipPath id={`${id}-clip`}><circle cx="40" cy="40" r="40" /></clipPath>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#${id}-bg)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {/* Curly hair */}
        <ellipse cx="40" cy="22" rx="20" ry="14" fill="#5C3A1E" />
        <circle cx="24" cy="24" r="7" fill="#5C3A1E" />
        <circle cx="56" cy="24" r="7" fill="#5C3A1E" />
        <circle cx="30" cy="17" r="5" fill="#6B4423" />
        <circle cx="50" cy="17" r="5" fill="#6B4423" />
        <circle cx="40" cy="14" r="6" fill="#6B4423" />
        <circle cx="34" cy="20" r="4" fill="#7A5230" />
        <circle cx="46" cy="20" r="4" fill="#7A5230" />
        {/* Face */}
        <ellipse cx="40" cy="38" rx="16" ry="17" fill="#E8B88A" />
        {/* Eyes */}
        <ellipse cx="34" cy="36" rx="2.5" ry="2.8" fill="#2D1810" />
        <ellipse cx="46" cy="36" rx="2.5" ry="2.8" fill="#2D1810" />
        <circle cx="35" cy="35" r="1" fill="#fff" />
        <circle cx="47" cy="35" r="1" fill="#fff" />
        {/* Smile */}
        <path d="M35 43c2.5 3 5.5 3 8 0" stroke="#B5744E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Cheeks */}
        <ellipse cx="30" cy="41" rx="3.5" ry="2" fill="#D4956B" opacity="0.4" />
        <ellipse cx="50" cy="41" rx="3.5" ry="2" fill="#D4956B" opacity="0.4" />
        {/* Hoodie - teal body with orange sleeves */}
        <path d="M14 62c3-10 12-16 26-16s23 6 26 16v20H14V62z" fill="#0EA5E9" />
        <path d="M14 62c3-10 8-14 14-16v18H14V62z" fill="#F59E0B" />
        <path d="M52 46c6 2 11 6 14 16v2H52V46z" fill="#F59E0B" />
        {/* Hoodie collar */}
        <path d="M34 48c3 3 9 3 12 0" stroke="#0284C7" strokeWidth="1.5" fill="none" />
        {/* Lamp icon on hoodie */}
        <ellipse cx="40" cy="60" rx="4" ry="2.5" fill="#fff" opacity="0.3" />
        <path d="M39 58c0-2 1-3 1-3s1 1 1 3" stroke="#fff" strokeWidth="0.8" opacity="0.4" fill="none" />
      </g>
    </svg>
  );
}

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setPulse(false);
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const supabase = getSupabase();
      const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: history }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      const reply = data.reply ?? data.error ?? "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please check your internet and try again." }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  return (
    <>
      <button
        type="button"
        className={`cb-fab${pulse ? " cb-pulse" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Chat with Gemi"}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ) : (
          <GemiAvatar size={44} />
        )}
      </button>

      {open ? (
        <div className="cb-window">
          <div className="cb-header">
            <GemiAvatar size={32} />
            <div>
              <strong>Gemi</strong>
              <span>Hirelyx AI Assistant</span>
            </div>
            <button type="button" className="cb-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </div>

          <div className="cb-body">
            {messages.length === 0 ? (
              <div className="cb-welcome">
                <Image
                  src="/gemi-welcome.jpg"
                  alt="Gemi — Hirelyx AI Assistant"
                  width={200}
                  height={140}
                  className="cb-welcome-img"
                  priority
                />
                <h4>Salam! I&apos;m Gemi</h4>
                <p>Your Hirelyx AI assistant. How can I help you today?</p>
                <div className="cb-quick">
                  {QUICK_QUESTIONS.map((q) => (
                    <button key={q} type="button" onClick={() => void sendMessage(q)}>{q}</button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`cb-msg ${msg.role}`}>
                    {msg.role === "assistant" ? <GemiAvatar size={24} /> : null}
                    <div className="cb-bubble">{msg.content}</div>
                  </div>
                ))}
                {loading ? (
                  <div className="cb-msg assistant">
                    <GemiAvatar size={24} />
                    <div className="cb-bubble cb-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                ) : null}
              </>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="cb-input"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Gemi anything..."
              maxLength={500}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </form>

          {user ? null : (
            <p className="cb-login-hint">Sign in to check your order status</p>
          )}
        </div>
      ) : null}
    </>
  );
}
