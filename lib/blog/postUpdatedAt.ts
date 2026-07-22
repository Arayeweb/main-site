import { getFastWebIndustryUpdatedAt } from "@/lib/fastweb/industries";

/** ISO date (YYYY-MM-DD) for sitemap lastmod — only when content change date is known. */
export const BLOG_POST_UPDATED_AT: Record<string, string> = {
  "seo-checklist-business-site": "2026-06-15",
  "conversion-rate-optimization": "2026-06-08",
  "website-chatbot-customer-support": "2026-05-31",
  "google-my-business-local-seo": "2026-06-21",
  "website-speed-core-web-vitals": "2026-06-28",
  "online-booking-system-for-clinics": "2026-07-19",
  "doctor-website-seo-mistakes": "2026-07-08",
  "clinic-seo-checklist": "2026-07-08",
  "local-seo-for-doctors": "2026-07-08",
  "clinic-website-features": "2026-07-08",
  "jozb-shagerd-khososi": "2026-07-15",
  "jozb-shagerd-zaban": "2026-07-15",
  "matn-tablig-tadris-khososi": "2026-07-15",
  "website-design-order-checklist": "2026-07-19",
  "instagram-page-to-website": "2026-07-19",
};

/** Blog index lastmod = most recent article update. */
export function getBlogIndexLastMod(): string {
  const dates = Object.values(BLOG_POST_UPDATED_AT);
  return dates.sort().at(-1) ?? "2026-07-15";
}

export function getBlogPostLastMod(slug: string): string | undefined {
  return BLOG_POST_UPDATED_AT[slug];
}

export function getSitemapLastMod(path: string): string | undefined {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/blog") return getBlogIndexLastMod();
  if (normalized === "/blog/doctors" || normalized === "/blog/ai") {
    return getBlogIndexLastMod();
  }
  if (normalized === "/website-design/cost") {
    return "2026-07-19";
  }

  const fastwebMatch = normalized.match(/^\/fastweb\/([^/]+)$/);
  if (fastwebMatch) return getFastWebIndustryUpdatedAt(fastwebMatch[1]);

  const blogMatch = normalized.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) return getBlogPostLastMod(blogMatch[1]);

  return undefined;
}
