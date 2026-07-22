"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordPageview } from "@/lib/pageviewTracking";
import { trackFastWebEvent } from "@/lib/analytics/fastwebEvents";
import type { FastWebIndustry } from "@/lib/fastweb/industries";

export default function FastWebIndustryAnalytics({ industry }: { industry: FastWebIndustry }) {
  const pathname = usePathname();

  useEffect(() => {
    const page = pathname || `/fastweb/${industry.slug}`;
    recordPageview(page);
    trackFastWebEvent("fastweb_industry_view", {
      page_path: page,
      industry: industry.slug,
      primary_keyword: industry.primaryKeyword,
      cta_position: "hero",
      offer: "fastweb",
    });
  }, [pathname, industry.slug, industry.primaryKeyword]);

  return null;
}
