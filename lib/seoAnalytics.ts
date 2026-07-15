import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";

export type SeoAnalyticsPayload = {
  selected_plan?: string;
  business_type?: string;
  goal?: string;
  current_status?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  [key: string]: string | undefined | null;
};

export function trackSeoEvent(event: string, payload: SeoAnalyticsPayload = {}) {
  const utm = typeof window !== "undefined" ? getUtmParams() : {};
  pushGtmEvent(event, {
    page: "seo",
    referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    ...utm,
    ...payload,
  });
}
