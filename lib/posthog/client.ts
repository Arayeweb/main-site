import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let initialized = false;

export function initPostHog() {
  if (typeof window === "undefined" || !key || initialized) return;
  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
  });
  initialized = true;
}

export function captureAiEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === "undefined" || !key) return;
  try {
    initPostHog();
    posthog.capture(event, properties);
  } catch {
    /* analytics must not break UX */
  }
}

export function identifyAiUser(
  userId: string,
  traits?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === "undefined" || !key) return;
  try {
    initPostHog();
    posthog.identify(userId, traits);
  } catch {
    /* analytics must not break UX */
  }
}

export function resetAiUser() {
  if (typeof window === "undefined" || !key) return;
  try {
    posthog.reset();
  } catch {
    /* analytics must not break UX */
  }
}

export { posthog };
