import { notFound } from "next/navigation";
import { SentryTestClient } from "./SentryTestClient";

export default function SentryTestPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const dsnConfigured = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Sentry test (development only)</h1>
      <p>
        Use the buttons below to send intentional errors to Sentry. This page
        returns 404 in production.
      </p>
      {!dsnConfigured ? (
        <p style={{ color: "#b45309" }}>
          <strong>NEXT_PUBLIC_SENTRY_DSN</strong> is not set — errors will not
          reach Sentry until you add your DSN to <code>.env.local</code>.
        </p>
      ) : (
        <p style={{ color: "#15803d" }}>
          DSN is configured. After triggering an error, check Sentry → Issues
          for org <strong>araaye</strong>, project{" "}
          <strong>javascript-nextjs</strong>.
        </p>
      )}
      <SentryTestClient />
    </main>
  );
}
