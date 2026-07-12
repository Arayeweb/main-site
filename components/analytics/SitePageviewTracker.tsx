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
      pathname.startsWith("/ai") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/campaign/") ||
      pathname.startsWith("/adready") ||
      pathname.startsWith("/fastweb") ||
      pathname.startsWith("/s/") ||
      pathname.startsWith("/b/") ||
      pathname.startsWith("/seo") ||
      pathname.startsWith("/website") ||
      pathname.startsWith("/doctors") ||
      pathname.startsWith("/demo") ||
      pathname.startsWith("/showcase") ||
      pathname.startsWith("/free-seo-audit")
    ) {
      return;
    }
    captureCampaignParams();
    recordPageview(pathname);
  }, [pathname]);

  return null;
}
