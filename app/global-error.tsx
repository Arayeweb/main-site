"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body>
        <main style={{ padding: "2rem", fontFamily: "sans-serif", textAlign: "center" }}>
          <h2>خطایی رخ داد</h2>
          <p>تیم ما از طریق Sentry مطلع شده است.</p>
          <button type="button" onClick={() => reset()}>
            تلاش دوباره
          </button>
        </main>
      </body>
    </html>
  );
}
