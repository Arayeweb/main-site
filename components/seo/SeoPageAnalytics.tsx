"use client";

import { useEffect } from "react";
import { trackSeoEvent } from "@/lib/seoAnalytics";

export default function SeoPageAnalytics() {
  useEffect(() => {
    trackSeoEvent("seo_page_view");
  }, []);

  return null;
}
