import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase";
import {
  GROWTH_HUB_ANALYTICS_SOURCE,
  type GrowthHubEventName,
} from "@/lib/growth-hub/constants";
import type { GrowthHubMemberRole } from "@/lib/growth-hub/database.types";

// Growth Hub product-event sink. Writes to the existing first-party
// `analytics_events` table with source = 'growth_hub' (D-018). This is NOT a
// tenant table; the service-role write here is a trusted server-side audit sink
// and must ONLY be called from Server Actions after a successful mutation —
// never from /app loaders or components (D-006 keeps service role out of the
// client read path). Not coupled to PostHog.

type EventProperties = Record<string, string | number | boolean | null | undefined>;

const FORBIDDEN_KEYS = new Set([
  "token",
  "password",
  "email",
  "phone",
  "magic_link",
  "payment_url",
]);

function sanitize(properties: EventProperties): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined || value === null || value === "") continue;
    if (FORBIDDEN_KEYS.has(key)) continue; // never leak secrets / PII
    clean[key] = value;
  }
  return clean;
}

export async function trackGrowthHubEvent(params: {
  event: GrowthHubEventName;
  workspaceId: string;
  userRole?: GrowthHubMemberRole | "staff";
  path?: string;
  properties?: EventProperties;
}): Promise<void> {
  const { event, workspaceId, userRole, path, properties = {} } = params;

  const payload = {
    workspace_id: workspaceId,
    user_role: userRole ?? null,
    timestamp: new Date().toISOString(),
    ...sanitize(properties),
  };

  try {
    await getSupabaseAdmin()
      .from("analytics_events")
      .insert({
        event_name: event,
        source: GROWTH_HUB_ANALYTICS_SOURCE,
        page: path ?? null,
        payload,
      });
  } catch (error) {
    // Analytics must never break a user-facing mutation.
    console.error("[growth-hub/analytics]", event, error);
  }
}
