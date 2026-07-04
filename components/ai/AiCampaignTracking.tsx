"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureCampaignParams, recordAiPageview } from "@/lib/aiTracking";

/** UTM capture + pageview برای همه مسیرهای /ai به‌جز content-sales */
export default function AiCampaignTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/ai/content-sales")) return;
    captureCampaignParams();
    recordAiPageview(pathname);
  }, [pathname]);

  return null;
}
