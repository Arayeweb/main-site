"use client";

import { useEffect } from "react";
import GoogleReviewLinkTool from "./GoogleReviewLinkTool";
import LocalSeoReadinessTool from "./LocalSeoReadinessTool";
import SeoRoiCalculatorTool from "./SeoRoiCalculatorTool";
import {
  trackGrowthToolEvent,
  type GrowthToolName,
} from "@/lib/analytics/growthToolsEvents";
import type { ToolHub } from "@/lib/tools/toolRegistry";

function analyticsName(hub: ToolHub): GrowthToolName | null {
  if (hub === "review-link") return "review_link";
  if (hub === "local-seo-check") return "local_seo_check";
  if (hub === "seo-roi-calculator") return "seo_roi";
  return null;
}

export default function GrowthToolEmbed({
  hub,
  industry = "doctor",
}: {
  hub: ToolHub;
  industry?: string;
}) {
  const tool = analyticsName(hub);
  useEffect(() => {
    if (tool) trackGrowthToolEvent("view", tool, industry);
  }, [industry, tool]);

  if (hub === "review-link") return <GoogleReviewLinkTool industry={industry} />;
  if (hub === "local-seo-check") return <LocalSeoReadinessTool industry={industry} />;
  if (hub === "seo-roi-calculator") return <SeoRoiCalculatorTool industry={industry} />;
  return null;
}
