"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportError } from "@/lib/report-error";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    void reportError(error, { digest: error.digest, kind: "error-boundary" });
  }, [error]);

  return (
    <section className="section">
      <div className="wrap">
        <div className="empty status-page">
          <div className="status-page-icon" aria-hidden="true">!</div>
          <h3>Something went wrong</h3>
          <p>
            We hit an unexpected problem loading this page. Our team has been notified.
          </p>
          {error.digest ? <p className="status-page-code">Error ID: {error.digest}</p> : null}
          <div className="status-page-actions">
            <button className="btn-primary" type="button" onClick={() => retry()}>
              Try again
            </button>
            <Link className="btn-ghost" href="/">
              Go home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
