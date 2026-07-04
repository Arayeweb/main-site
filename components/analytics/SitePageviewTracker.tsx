"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureCampaignParams } from "@/lib/aiTracking";
import { recordPageview } from "@/lib/pageviewTracking";

/** UTM capture + pageview برای صفحات Next.js (غیر admin و غیر /ai) */
export default function SitePageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/ai")
    ) {
      return;
    }
    captureCampaignParams();
    recordPageview(pathname);
  }, [pathname]);

  return null;
}
