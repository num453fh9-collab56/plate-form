"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";

interface Factor {
  id: string;
  friendlyName: string | null;
  status: string;
}

interface EnrollData {
  qrUri: string;
  secret: string;
  factorId: string;
}

export default function TwoFactorSetup() {
  const { user, enrollMfa, unenrollMfa, mfaFactors } = useAuth();
  const { toast } = useUI();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<EnrollData | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const list = await mfaFactors();
    setFactors(list);
    setLoading(false);
  }, [mfaFactors]);

  useEffect(() => { void load(); }, [load]);

  if (!user) return null;

  const verified = factors.find((f) => f.status === "verified");

  const startEnroll = async () => {
    setError("");
    setBusy(true);
    const data = await enrollMfa();
    setBusy(false);
    if (!data) {
      setError("Could not start 2FA setup. Please try again.");
      return;
    }
    setEnrolling(data);
  };

  const confirmEnroll = async () => {
    if (!enrolling || code.length !== 6) return;
    setError("");
    setBusy(true);
    const supabase = getSupabase();
    if (!supabase) { setBusy(false); return; }
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({
      factorId: enrolling.factorId,
    });
    if (cErr || !challenge) {
      setError("Challenge failed. Please try again.");
      setBusy(false);
      return;
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId: enrolling.factorId,
      challengeId: challenge.id,
      code: code.trim(),
    });
    setBusy(false);
    if (vErr) {
      setError("Invalid code. Please check and try again.");
      return;
    }
    toast("Two-factor authentication enabled!");
    setEnrolling(null);
    setCode("");
    void load();
  };

  const disable = async (id: string) => {
    if (!window.confirm("Disable two-factor authentication?")) return;
    setBusy(true);
    const ok = await unenrollMfa(id);
    setBusy(false);
    if (ok) {
      toast("Two-factor authentication disabled.");
      void load();
    } else {
      setError("Could not disable 2FA. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="tfa-card">
        <p style={{ color: "var(--muted)" }}>Loading security settings...</p>
      </div>
    );
  }

  return (
    <div className="tfa-card">
      <div className="tfa-header">
        <div className="tfa-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <h3 className="tfa-title">Two-Factor Authentication</h3>
          <p className="tfa-sub">
            {verified
              ? "Your account is protected with an authenticator app."
              : "Add an extra layer of security to your account."}
          </p>
        </div>
      </div>

      {verified && !enrolling && (
        <div className="tfa-status">
          <span className="tfa-badge tfa-on">Enabled</span>
          <button
            type="button"
            className="btn-outline tfa-disable-btn"
            onClick={() => void disable(verified.id)}
            disabled={busy}
          >
            Disable 2FA
          </button>
        </div>
      )}

      {!verified && !enrolling && (
        <button
          type="button"
          className="btn-primary tfa-enable-btn"
          onClick={() => void startEnroll()}
          disabled={busy}
        >
          {busy ? "Setting up..." : "Enable 2FA"}
        </button>
      )}

      {enrolling && (
        <div className="tfa-enroll">
          <p className="tfa-step">1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enrolling.qrUri}
            alt="Scan this QR code with your authenticator app"
            className="tfa-qr"
            width={200}
            height={200}
          />
          <details className="tfa-secret-details">
            <summary>Can&apos;t scan? Enter this key manually</summary>
            <code className="tfa-secret">{enrolling.secret}</code>
          </details>
          <p className="tfa-step" style={{ marginTop: 16 }}>2. Enter the 6-digit code from the app:</p>
          <div className="tfa-verify-row">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="tfa-code-input"
            />
            <button
              type="button"
              className="btn-primary"
              onClick={() => void confirmEnroll()}
              disabled={code.length !== 6 || busy}
            >
              {busy ? "Verifying..." : "Verify & Enable"}
            </button>
          </div>
          {error && <p className="tfa-error">{error}</p>}
          <button
            type="button"
            className="auth-forgot"
            style={{ marginTop: 8 }}
            onClick={() => { setEnrolling(null); setCode(""); setError(""); }}
          >
            Cancel
          </button>
        </div>
      )}

      {!enrolling && error && <p className="tfa-error">{error}</p>}
    </div>
  );
}
