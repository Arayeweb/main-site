"use client";

import { useEffect } from "react";
import { trackWebsiteSeoEvent } from "@/lib/analytics/websiteSeoEvents";

const PAGE_PATH = "/website-design/cost";

export default function WebsitePricingViewAnalytics() {
  useEffect(() => {
    trackWebsiteSeoEvent("website_pricing_view", {
      page_path: PAGE_PATH,
      page_type: "pricing",
      primary_keyword: "قیمت طراحی سایت",
      offer: "both",
      cta_position: "hero",
    });
  }, []);

  return null;
}
