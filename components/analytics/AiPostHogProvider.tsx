"use client";

import { useEffect } from "react";
import { PostHogProvider } from "posthog-js/react";
import { initPostHog, posthog } from "@/lib/posthog/client";

/** PostHog فقط برای مسیرهای /ai — init در layout.ai */
export default function AiPostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initPostHog();
  }, []);

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
