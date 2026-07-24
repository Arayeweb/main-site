import {
  ANALYTICS_SCHEMA_VERSION,
  canonicalEventName,
  funnelStageForEvent,
  productAreaFromPath,
} from "@/lib/analytics/core";
import { captureAiEvent } from "@/lib/posthog/client";
import { getVisitorId } from "@/lib/pageviewTracking";
import { getUtmAttribution } from "@/lib/utm";

type GtmValue = string | number | boolean | undefined;
type GtmPayload = Record<string, GtmValue>;

const SESSION_ID_KEY = "__ary_session_id";
const recentEvents = new Map<string, number>();

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const value = (Math.random() * 16) | 0;
    return (char === "x" ? value : (value & 0x3) | 0x8).toString(16);
  });
}

export function getAnalyticsSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = randomId();
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function trackingDisabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return (
      localStorage.getItem("araaye_analytics_opt_out") === "1" ||
      navigator.doNotTrack === "1"
    );
  } catch {
    return navigator.doNotTrack === "1";
  }
}

function duplicateFingerprint(event: string, page: string, payload: GtmPayload): string {
  const stablePayload = Object.entries(payload)
    .filter(([key, value]) =>
      value !== undefined &&
      !["timestamp", "client_timestamp", "event_id"].includes(key)
    )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join("|");
  return `${event}|${page}|${stablePayload}`;
}

function isDuplicateEvent(fingerprint: string): boolean {
  const now = Date.now();
  const last = recentEvents.get(fingerprint) || 0;
  recentEvents.set(fingerprint, now);
  if (recentEvents.size > 200) {
    for (const [key, at] of recentEvents) {
      if (now - at > 10_000) recentEvents.delete(key);
    }
  }
  return now - last < 1_000;
}

declare global {
  interface Window {
    dataLayer?: GtmPayload[];
  }
}

export function pushGtmEvent(event: string, payload: GtmPayload = {}) {
  if (trackingDisabled()) return;
  const page = window.location.pathname;
  const fingerprint = duplicateFingerprint(event, page, payload);
  if (isDuplicateEvent(fingerprint)) return;
  const canonical = canonicalEventName(event);
  const context: GtmPayload = {
    event_id: randomId(),
    canonical_event_name: canonical,
    schema_version: ANALYTICS_SCHEMA_VERSION,
    visitor_id: getVisitorId() || undefined,
    session_id: getAnalyticsSessionId() || undefined,
    page,
    product_area: productAreaFromPath(page),
    funnel_stage: funnelStageForEvent(canonical),
    client_timestamp: new Date().toISOString(),
    referrer: document.referrer || undefined,
    ...getUtmAttribution(),
  };
  const enriched = { ...context, ...payload };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...enriched });

  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, ...enriched }),
    keepalive: true,
  }).catch(() => {});

  captureAiEvent(canonical, {
    ...enriched,
    original_event_name: event === canonical ? undefined : event,
  });
}
