"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
}

const ICONS: Record<string, string> = {
  order: "📦",
  review: "⭐",
  message: "💬",
  dispute: "⚠️",
  payout: "💰",
  proposal: "📝",
  offer: "🎁",
  system: "🔔",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifs = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !user) return;
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as { notifications: Notif[]; unread: number };
      setNotifs(data.notifications);
      setUnread(data.unread);
      setLoaded(true);
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    if (user) void fetchNotifs();
  }, [user, fetchNotifs]);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel("notifs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.sub}` },
        (payload) => {
          const n = payload.new as Notif;
          setNotifs((prev) => [n, ...prev].slice(0, 30));
          setUnread((prev) => prev + 1);
        },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const markRead = useCallback(async (id?: string) => {
    const supabase = getSupabase();
    if (!supabase || !user) return;
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : { all: true }),
    });
    if (id) {
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnread((prev) => Math.max(0, prev - 1));
    } else {
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="notif-wrap" ref={ref}>
      <button
        type="button"
        className="notif-bell"
        onClick={() => { setOpen((v) => !v); if (!loaded) void fetchNotifs(); }}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && <span className="notif-badge">{unread > 99 ? "99+" : unread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" className="notif-mark-all" onClick={() => void markRead()}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notif-list">
            {notifs.length === 0 && (
              <p className="notif-empty">No notifications yet</p>
            )}
            {notifs.map((n) => (
              <Link
                key={n.id}
                href={n.link || "/orders"}
                className={`notif-item${n.read ? "" : " unread"}`}
                onClick={() => { setOpen(false); if (!n.read) void markRead(n.id); }}
              >
                <span className="notif-icon">{ICONS[n.type] ?? ICONS.system}</span>
                <div className="notif-content">
                  <strong>{n.title}</strong>
                  {n.body && <p>{n.body}</p>}
                  <time>{timeAgo(n.created_at)}</time>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
