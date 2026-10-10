"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { useUI } from "@/lib/ui";

/* Landing page for the password-reset email. Supabase reads the recovery
   token from the link and opens a temporary session; we then set the new
   password on that session. */
export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useUI();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) setReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setReady((cur) => cur ?? Boolean(data.session));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const submit = async () => {
    setError("");
    if (password.length < 8 || !/[a-z]/i.test(password) || !/\d/.test(password)) {
      setError("Use at least 8 characters with a letter and a number.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    toast("Password updated. You're signed in.");
    router.push("/");
  };

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 460 }}>
        <div className="gw-card">
          <h2>Set a new password</h2>
          {ready === false ? (
            <>
              <p className="gw-muted">This reset link is invalid or has expired. Request a new one from the sign-in screen.</p>
              <Link className="btn-primary" href="/">Back to Hirelyx</Link>
            </>
          ) : (
            <>
              <label className="gw-field">
                <strong>New password</strong>
                <input className="gw-input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              <label className="gw-field">
                <strong>Confirm password</strong>
                <input className="gw-input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </label>
              {error ? <span className="gw-error">{error}</span> : null}
              <button className="btn-primary" type="button" disabled={busy || !ready} onClick={() => void submit()}>
                {busy ? "Saving…" : ready ? "Save new password" : "Checking link…"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
