"use client";

import { useState } from "react";

export function SentryTestClient() {
  const [serverResult, setServerResult] = useState<string | null>(null);

  const triggerClientError = () => {
    // Sentry Next.js setup verification snippet (intentional ReferenceError).
    new Function("myUndefinedFunction()")();
  };

  const triggerServerError = async () => {
    setServerResult("Sending…");
    try {
      const res = await fetch("/api/sentry-test");
      if (res.status === 503) {
        const body = (await res.json()) as { message?: string };
        setServerResult(body.message ?? "NEXT_PUBLIC_SENTRY_DSN is not set.");
        return;
      }
      if (!res.ok) {
        setServerResult(
          `Server returned ${res.status} — check Sentry Issues (expected when DSN is set).`,
        );
        return;
      }
      setServerResult("Unexpected success — no error was thrown.");
    } catch {
      setServerResult("Network error — see browser console.");
    }
  };

  return (
    <div style={{ display: "grid", gap: "1rem", maxWidth: "32rem" }}>
      <button type="button" onClick={triggerClientError}>
        Trigger client error (myUndefinedFunction)
      </button>
      <button type="button" onClick={triggerServerError}>
        Trigger server error via /api/sentry-test
      </button>
      {serverResult ? <p>{serverResult}</p> : null}
    </div>
  );
}
