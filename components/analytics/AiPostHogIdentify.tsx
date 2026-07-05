"use client";

import { useEffect } from "react";
import { useArenaAuth } from "@/app/ai/ArenaAuthContext";
import { identifyAiUser, resetAiUser } from "@/lib/posthog/client";

/** شناسایی کاربر لاگین‌شده در PostHog (فقط /ai) */
export default function AiPostHogIdentify() {
  const { authed, plan, credits } = useArenaAuth();

  useEffect(() => {
    if (authed === null) return;
    if (!authed) {
      resetAiUser();
      return;
    }

    fetch("/api/ai/auth", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.id) {
          identifyAiUser(String(d.user.id), { plan, credits: credits ?? 0 });
        }
      })
      .catch(() => {
        /* analytics must not break UX */
      });
  }, [authed, plan, credits]);

  return null;
}
