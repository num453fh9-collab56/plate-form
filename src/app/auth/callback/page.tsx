"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      router.replace("/");
      return;
    }

    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));
    const accessToken = hashParams.get("access_token");

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error: err }) => {
          if (err) {
            setError(err.message);
            setTimeout(() => router.replace("/"), 3000);
            return;
          }
          router.replace("/dashboard");
        });
    } else if (accessToken) {
      supabase.auth.getSession().then(() => {
        router.replace("/dashboard");
      });
    } else {
      router.replace("/");
    }
  }, [router]);

  if (error) {
    return (
      <section className="section">
        <div className="wrap" style={{ textAlign: "center", paddingTop: 80 }}>
          <h2>Verification Failed</h2>
          <p style={{ color: "var(--muted)" }}>{error}</p>
          <p style={{ color: "var(--muted)" }}>Redirecting to home...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap" style={{ textAlign: "center", paddingTop: 80 }}>
        <h2>Verifying your account...</h2>
        <p style={{ color: "var(--muted)" }}>Please wait a moment.</p>
      </div>
    </section>
  );
}
