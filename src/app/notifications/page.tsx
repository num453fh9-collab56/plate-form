"use client";

import { useEffect, useState } from "react";
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
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !user?.sub) return;
    let cancelled = false;
    void supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
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
          </div>
        </div>
        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : items.length === 0 ? (
          <div className="empty">
            <h3>No notifications yet</h3>
            <p>Order updates will appear here.</p>
          </div>
        ) : (
          <ul className="order-list">
            {items.map((n) => (
              <li key={n.id} className="order-row">
                <div className="order-title">{n.title}</div>
                {n.body ? <p className="order-note">{n.body}</p> : null}
                <div className="order-meta">
                  <span>{new Date(n.created_at).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
