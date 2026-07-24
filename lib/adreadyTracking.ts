import { getUtmParams } from "@/lib/utm";
import { pushGtmEvent } from "@/lib/gtm";
import type { CampaignEventName } from "@/lib/adready";

const VISITOR_KEY = "ary_adready_vid";
const SESSION_KEY = "ary_adready_sid";

let memoryVisitorId: string | null = null;
let memorySessionId: string | null = null;

type DataLayerPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: DataLayerPayload[];
  }
}

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `vid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getCampaignVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const stored = localStorage.getItem(VISITOR_KEY);
    if (stored) return stored;
    const id = randomId();
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    if (!memoryVisitorId) memoryVisitorId = randomId();
    return memoryVisitorId;
  }
}

export function getCampaignSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) return stored;
    const id = randomId();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    if (!memorySessionId) memorySessionId = randomId();
    return memorySessionId;
  }
}

export function pageViewDedupKey(slug: string): string {
  return `__ar_pv_${slug}`;
}

export function formStartDedupKey(slug: string): string {
  return `__ar_fs_${slug}`;
}

export function shouldFireOncePerSession(storageKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(storageKey)) return false;
    sessionStorage.setItem(storageKey, "1");
    return true;
  } catch {
    return true;
  }
}

export function getCampaignTrackingContext() {
  const utm = getUtmParams();
  return {
    visitorId: getCampaignVisitorId(),
    sessionId: getCampaignSessionId(),
    utmSource: utm.utm_source || "",
    utmMedium: utm.utm_medium || "",
    utmCampaign: utm.utm_campaign || "",
    utmContent: utm.utm_content || "",
    utmTerm: utm.utm_term || "",
    referrer: typeof document !== "undefined" ? document.referrer || "" : "",
    pagePath: typeof window !== "undefined" ? window.location.pathname : "",
  };
}

export function trackCampaignEvent(
  eventName: CampaignEventName | string,
  payload: DataLayerPayload = {}
) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...payload });
}

export async function sendCampaignEvent(
  slug: string,
  eventName: CampaignEventName,
  extra: {
    campaignPageId?: string;
    payload?: Record<string, unknown>;
  } = {}
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const ctx = getCampaignTrackingContext();
  const body = {
    slug,
    eventName,
    visitorId: ctx.visitorId,
    sessionId: ctx.sessionId,
    payload: {
      sessionId: ctx.sessionId,
      ...(extra.payload || {}),
    },
    utmSource: ctx.utmSource,
    utmMedium: ctx.utmMedium,
    utmCampaign: ctx.utmCampaign,
    utmContent: ctx.utmContent,
    utmTerm: ctx.utmTerm,
    referrer: ctx.referrer,
    pagePath: ctx.pagePath,
  };

  pushGtmEvent(eventName, {
    campaignPageId: extra.campaignPageId,
    slug,
    visitorId: ctx.visitorId,
    sessionId: ctx.sessionId,
    utm_source: ctx.utmSource,
    utm_medium: ctx.utmMedium,
    utm_campaign: ctx.utmCampaign,
    utm_content: ctx.utmContent,
    utm_term: ctx.utmTerm,
    page_path: ctx.pagePath,
    referrer: ctx.referrer,
    ...(extra.payload || {}),
  });

  try {
    const response = await fetch("/api/adready/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
    return response.ok;
  } catch {
    return false;
  }
}

export type CampaignTrackingCallbacks = {
  onCtaClick: (location: string) => void;
  onWhatsappClick: () => void;
  onTelegramClick: () => void;
  onCallClick: () => void;
  onFormStart: () => void;
};
