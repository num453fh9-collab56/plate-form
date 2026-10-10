"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

/* Replaces the root layout when it crashes, so it cannot rely on globals.css. */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    void reportError(error, { digest: error.digest, kind: "global-error" });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 16,
          background: "#f5f5f7",
          color: "#111111",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <title>Something went wrong · Hirelyx</title>
        <div
          style={{
            maxWidth: 440,
            textAlign: "center",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 32,
          }}
        >
          <h1 style={{ fontSize: "1.4rem", margin: "0 0 8px" }}>Something went wrong</h1>
          <p style={{ color: "#4b5563", margin: "0 0 20px" }}>
            The site failed to load. Please try again — our team has been notified.
          </p>
          {error.digest ? (
            <p style={{ color: "#6b7280", fontSize: "0.8rem", margin: "0 0 16px" }}>
              Error ID: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => retry()}
            style={{
              border: 0,
              borderRadius: 10,
              padding: "12px 24px",
              background: "#0066cc",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
