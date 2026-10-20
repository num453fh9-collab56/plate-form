"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";

interface NotificationRow {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
  type?: string | null;
}

type NFilter = "all" | "unread";

function notifIcon(type?: string | null) {
  if (type === "order") return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h3l3 3v5a2 2 0 0 1-2 2H6"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
  if (type === "message") return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
  if (type === "review") return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  if (type === "payout") return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}

function iconColor(type?: string | null) {
  if (type === "order") return "var(--accent)";
  if (type === "message") return "var(--emerald-deep)";
  if (type === "review") return "#f59e0b";
  if (type === "payout") return "var(--emerald-deep)";
  return "var(--muted)";
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function groupByDate(items: NotificationRow[]) {
  const groups: { label: string; items: NotificationRow[] }[] = [];
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const item of items) {
    const d = new Date(item.created_at).toDateString();
    const label = d === today ? "Today" : d === yesterday ? "Yesterday" : new Date(item.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { openAuth, toast } = useUI();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NFilter>("all");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !user?.sub) return;
    let cancelled = false;
    void supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(async ({ data }) => {
        if (cancelled) return;
        setItems((data ?? []) as NotificationRow[]);
        setLoading(false);
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("read", false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);
  const filtered = useMemo(() => filter === "unread" ? items.filter((n) => !n.read) : items, [items, filter]);
  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const markAllRead = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast("All notifications marked as read");
  };

  if (!user) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Sign in to see notifications</h3>
            <button className="btn-primary" type="button" onClick={() => openAuth("login")}>
              Sign in
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">Notifications</div>
            <h2>Latest updates</h2>
            {!loading && <p className="sub">{items.length} notification{items.length !== 1 ? "s" : ""}{unreadCount > 0 ? ` · ${unreadCount} unread` : ""}</p>}
          </div>
        </div>

        {!loading && items.length > 0 && (
          <div className="ntf-toolbar">
            <div className="ntf-tabs">
              <button type="button" className={`ord-tab${filter === "all" ? " on" : ""}`} onClick={() => setFilter("all")}>
                All
              </button>
              <button type="button" className={`ord-tab${filter === "unread" ? " on" : ""}`} onClick={() => setFilter("unread")}>
                Unread
                {unreadCount > 0 && <span className="ord-tab-count">{unreadCount}</span>}
              </button>
            </div>
            {unreadCount > 0 && (
              <button type="button" className="sf-clear-all" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="empty">
            <div className="sf-spinner" />
            <p style={{ color: "var(--muted)" }}>Loading…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <h3>No notifications yet</h3>
            <p>Project updates, messages and booking confirmations will appear here.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <h3>No unread notifications</h3>
            <p>You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="ntf-list">
            {groups.map((group) => (
              <div key={group.label} className="ntf-group">
                <div className="ntf-group-label">{group.label}</div>
                {group.items.map((n) => {
                  const inner = (
                    <div className={`ntf-item${!n.read ? " ntf-unread" : ""}`}>
                      <div className="ntf-icon" style={{ color: iconColor(n.type) }}>
                        {notifIcon(n.type)}
                      </div>
                      <div className="ntf-content">
                        <div className="ntf-title">{n.title}</div>
                        {n.body && <p className="ntf-body">{n.body}</p>}
                      </div>
                      <span className="ntf-time">{timeAgo(n.created_at)}</span>
                      {!n.read && <span className="ntf-dot" />}
                    </div>
                  );
                  return n.link ? (
                    <Link key={n.id} href={n.link} className="ntf-link">{inner}</Link>
                  ) : (
                    <div key={n.id}>{inner}</div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
