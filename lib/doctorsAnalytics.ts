import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";

export type DoctorsAnalyticsPayload = {
  source?: string;
  current_presence?: string;
  primary_goal?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  [key: string]: string | undefined | null;
};

export function trackDoctorsEvent(event: string, payload: DoctorsAnalyticsPayload = {}) {
  const utm = typeof window !== "undefined" ? getUtmParams() : {};
  const page =
    typeof window !== "undefined" ? window.location.pathname.replace(/^\//, "") || "doctors" : "doctors";
  pushGtmEvent(event, {
    page,
    referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    ...utm,
    ...payload,
  });
}
