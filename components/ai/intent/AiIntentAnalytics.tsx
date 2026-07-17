"use client";

import { useEffect } from "react";
import {
  storeAiLandingType,
  trackAiLandingView,
  trackAiSignupStart,
} from "@/lib/aiTracking";

const LANDING_STORAGE_KEY = "ai_landing_type";

export default function AiIntentAnalytics({ landingType }: { landingType: string }) {
  useEffect(() => {
    storeAiLandingType(landingType);
    trackAiLandingView({ landing_type: landingType });

    const onAuthOpen = () => {
      const stored =
        typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem(LANDING_STORAGE_KEY)
          : null;
      if (stored) {
        trackAiSignupStart({ landing_type: stored });
      }
    };
    window.addEventListener("araaye:ai-auth-open", onAuthOpen);
    return () => window.removeEventListener("araaye:ai-auth-open", onAuthOpen);
  }, [landingType]);

  return null;
}
