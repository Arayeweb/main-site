"use client";

import { useEffect, useRef } from "react";
import {
  trackWebsiteDesignHubView,
  trackWebsiteDesignScrollDepth,
} from "@/lib/analytics/websiteDesignTracking";
import { trackWebsiteSeoEvent } from "@/lib/analytics/websiteSeoEvents";

type Props = {
  pagePath?: string;
  mode?: "hub" | "pricing";
};

/**
 * Hub/pricing pageview + scroll-depth funnel for website-design cluster.
 */
export default function WebsiteDesignFunnelAnalytics({
  pagePath = "/website-design",
  mode = "hub",
}: Props) {
  const depthsFired = useRef(new Set<number>());

  useEffect(() => {
    if (mode === "hub") {
      trackWebsiteDesignHubView();
    }

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = Math.round((window.scrollY / max) * 100);
      for (const depth of [25, 50, 75, 100] as const) {
        if (pct >= depth && !depthsFired.current.has(depth)) {
          depthsFired.current.add(depth);
          trackWebsiteDesignScrollDepth(depth, pagePath);
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode, pagePath]);

  useEffect(() => {
    const heroCta = document.querySelector<HTMLElement>("[data-wd-cta='hero-primary']");
    if (!heroCta || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            trackWebsiteSeoEvent("website_cta_view", {
              page_path: pagePath,
              page_type: mode === "pricing" ? "pricing" : "hub",
              primary_keyword: mode === "pricing" ? "قیمت طراحی سایت" : "طراحی سایت",
              offer: "both",
              cta_position: "hero",
            });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(heroCta);
    return () => observer.disconnect();
  }, [mode, pagePath]);

  return null;
}
