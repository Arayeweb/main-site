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
    const keyword = industry.searchTerms[0] ?? industry.slug;
    trackFastWebEvent("fastweb_industry_view", {
      page_path: page,
      industry: industry.slug,
      primary_keyword: keyword,
      cta_position: "hero",
      offer: "fastweb",
      page_type: "industry",
    });
    trackFastWebEvent("fastweb_industry_page_view", {
      page_path: page,
      industry: industry.slug,
      primary_keyword: keyword,
      offer: "fastweb",
      page_type: "industry",
    });
  }, [pathname, industry.slug, industry.searchTerms]);

  return null;
}
