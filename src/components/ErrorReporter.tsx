"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

/* Catches errors that escape React (event handlers, async code, promises). */
export default function ErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      // Ignore noise from browser extensions and cross-origin scripts.
      if (!event.error && event.message === "Script error.") return;
      void reportError(event.error ?? event.message, { kind: "window.error" });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      void reportError(event.reason, { kind: "unhandledrejection" });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
