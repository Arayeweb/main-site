"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import { industryOrganicSource } from "@/lib/seo/programmaticPages";
import type { IndustrySlug } from "@/lib/seo/industries";
import type { ServiceType } from "@/lib/seo/pageContent";

export default function IndustryPageAnalytics({
  serviceType,
  slug,
}: {
  serviceType: ServiceType;
  slug: IndustrySlug;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const page = `/${serviceType}/${slug}`;
    if (pathname !== page) return;

    pushGtmEvent("page_view", {
      page,
      landingPage: page,
      product: serviceType,
      industry: slug,
      source: industryOrganicSource(serviceType, slug),
      ...getUtmParams(),
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    });
  }, [pathname, serviceType, slug]);

  return null;
}
