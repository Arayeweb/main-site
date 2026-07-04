type GtmPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: GtmPayload[];
  }
}

export function pushGtmEvent(event: string, payload: GtmPayload = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });

  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, ...payload }),
    keepalive: true,
  }).catch(() => {});
}
