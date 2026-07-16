"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordPageview } from "@/lib/pageviewTracking";
import { trackSeoEvent } from "@/lib/seoAnalytics";

export default function SeoPageAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    recordPageview(pathname || "/seo");
    trackSeoEvent("seo_page_view");
  }, [pathname]);

  return null;
}
