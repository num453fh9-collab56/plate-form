"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export default function PresenceTracker() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.sub) return;

    const ping = async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      void fetch("/api/presence", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    };

    void ping();
    const iv = setInterval(ping, 3 * 60 * 1000);
    return () => clearInterval(iv);
  }, [user?.sub]);

  return null;
}
