"use client";

import { pushGtmEvent } from "@/lib/gtm";

export type GrowthToolName = "review_link" | "local_seo_check" | "seo_roi";

export function trackGrowthToolEvent(
  action: "view" | "start" | "complete" | "lead_submit" | "cta_click",
  tool: GrowthToolName,
  industry: string,
  extra: Record<string, string | number | boolean> = {},
) {
  pushGtmEvent(`growth_tool_${action}`, {
    tool,
    industry,
    page: typeof window !== "undefined" ? window.location.pathname : "",
    ...extra,
  });
}
