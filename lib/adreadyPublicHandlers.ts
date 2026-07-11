import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isCampaignEventName,
  isPlainObject,
  isReasonableJsonObject,
  LEAD_DEDUP_WINDOW_MS,
  normalizeCampaignSlug,
  readString,
  type JsonObject,
} from "@/lib/adready";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeContact } from "@/lib/validateContact";

export type UtmFields = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrer: string | null;
  pagePath: string | null;
};

export type PublishedCampaignRef = {
  id: string;
  userId: string;
  slug: string;
};

type HandlerResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

function readUtmField(body: JsonObject, camel: string, snake: string, max: number): string | null {
  return readString(body[camel], max) || readString(body[snake], max);
}

export function readUtmFromBody(
  body: JsonObject,
  fallback?: { referrer?: string | null; pagePath?: string | null; userAgent?: string | null }
): UtmFields & { userAgent: string | null } {
  const utmNested = isPlainObject(body.utm) ? body.utm : null;
  return {
    utmSource:
      readUtmField(body, "utmSource", "utm_source", 200) ||
      (utmNested ? readString(utmNested.utm_source, 200) : null),
    utmMedium:
      readUtmField(body, "utmMedium", "utm_medium", 200) ||
      (utmNested ? readString(utmNested.utm_medium, 200) : null),
    utmCampaign:
      readUtmField(body, "utmCampaign", "utm_campaign", 200) ||
      (utmNested ? readString(utmNested.utm_campaign, 200) : null),
    utmContent:
      readUtmField(body, "utmContent", "utm_content", 200) ||
      (utmNested ? readString(utmNested.utm_content, 200) : null),
    utmTerm:
      readUtmField(body, "utmTerm", "utm_term", 200) ||
      (utmNested ? readString(utmNested.utm_term, 200) : null),
    referrer: readString(body.referrer, 2000) || fallback?.referrer || null,
    pagePath: readString(body.pagePath, 500) || fallback?.pagePath || null,
    userAgent: fallback?.userAgent?.slice(0, 500) || null,
  };
}

export async function resolvePublishedCampaignBySlug(
  slugInput: string,
  supabase: SupabaseClient = getSupabaseAdmin()
): Promise<PublishedCampaignRef | null> {
  const slug = normalizeCampaignSlug(slugInput);
  if (!slug) return null;

  const { data, error } = await supabase
    .from("campaign_pages")
    .select("id, user_id, slug, expires_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  if (data.expires_at && new Date(String(data.expires_at)).getTime() <= Date.now()) {
    return null;
  }

  return {
    id: String(data.id),
    userId: String(data.user_id),
    slug: String(data.slug),
  };
}

export async function isDuplicateLeadSubmission(
  supabase: SupabaseClient,
  campaignPageId: string,
  phone: string,
  windowMs: number = LEAD_DEDUP_WINDOW_MS
): Promise<boolean> {
  const since = Date.now() - windowMs;
  const { data, error } = await supabase
    .from("campaign_leads")
    .select("id, created_at")
    .eq("campaign_page_id", campaignPageId)
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("[adready/leads] dedup check", error.message);
    return false;
  }
  const latest = data?.[0];
  if (!latest?.created_at) return false;
  return new Date(String(latest.created_at)).getTime() >= since;
}

function buildEventPayload(
  rawPayload: unknown,
  sessionId: string | null,
  userAgent: string | null
): JsonObject {
  const base = isPlainObject(rawPayload) ? { ...rawPayload } : {};
  if (sessionId && !base.sessionId) base.sessionId = sessionId;
  if (userAgent && !base.userAgent) base.userAgent = userAgent;
  return base;
}

export async function saveCampaignEvent(input: {
  slug: string;
  visitorId: string;
  sessionId?: string | null;
  eventName: string;
  payload?: unknown;
  utm: UtmFields;
  userAgent?: string | null;
  supabase?: SupabaseClient;
}): Promise<HandlerResult<{ id: string; createdAt: string }>> {
  if (!readString(input.visitorId, 200)) {
    return { ok: false, error: "invalid_event", status: 422 };
  }
  if (!isCampaignEventName(input.eventName)) {
    return { ok: false, error: "invalid_event_name", status: 422 };
  }

  const payload = buildEventPayload(
    input.payload,
    readString(input.sessionId, 200),
    input.userAgent ?? null
  );
  if (!isReasonableJsonObject(payload, 16_000)) {
    return { ok: false, error: "invalid_event", status: 422 };
  }

  const supabase = input.supabase ?? getSupabaseAdmin();
  const page = await resolvePublishedCampaignBySlug(input.slug, supabase);
  if (!page) return { ok: false, error: "not_found", status: 404 };

  const pagePath =
    input.utm.pagePath || `/campaign/${encodeURIComponent(page.slug)}`;

  const { data, error } = await supabase
    .from("campaign_events")
    .insert({
      campaign_page_id: page.id,
      visitor_id: input.visitorId,
      event_name: input.eventName,
      payload,
      utm_source: input.utm.utmSource,
      utm_medium: input.utm.utmMedium,
      utm_campaign: input.utm.utmCampaign,
      utm_content: input.utm.utmContent,
      utm_term: input.utm.utmTerm,
      referrer: input.utm.referrer,
      page_path: pagePath,
    })
    .select("id, created_at")
    .single();

  if (error || !data) {
    console.error("[adready/events] insert", error?.message);
    return { ok: false, error: "server_error", status: 500 };
  }

  return {
    ok: true,
    data: { id: String(data.id), createdAt: String(data.created_at) },
  };
}

export async function saveCampaignLead(input: {
  slug: string;
  fullName: string;
  phone: string;
  message?: string | null;
  visitorId?: string | null;
  sessionId?: string | null;
  utm: UtmFields;
  userAgent?: string | null;
  supabase?: SupabaseClient;
}): Promise<HandlerResult<{ id: string; createdAt: string }>> {
  const fullName = readString(input.fullName, 200);
  if (!fullName || fullName.length < 2) {
    return { ok: false, error: "invalid_lead", status: 422 };
  }

  const normalizedPhone = normalizeContact(input.phone);
  if (normalizedPhone.kind !== "phone") {
    return { ok: false, error: "invalid_lead", status: 422 };
  }

  const supabase = input.supabase ?? getSupabaseAdmin();
  const page = await resolvePublishedCampaignBySlug(input.slug, supabase);
  if (!page) return { ok: false, error: "not_found", status: 404 };

  const duplicate = await isDuplicateLeadSubmission(
    supabase,
    page.id,
    normalizedPhone.value
  );
  if (duplicate) {
    return { ok: false, error: "duplicate_lead", status: 429 };
  }

  const pagePath =
    input.utm.pagePath || `/campaign/${encodeURIComponent(page.slug)}`;

  const { data, error } = await supabase
    .from("campaign_leads")
    .insert({
      campaign_page_id: page.id,
      user_id: page.userId,
      full_name: fullName,
      phone: normalizedPhone.value,
      message: readString(input.message, 4000),
      utm_source: input.utm.utmSource,
      utm_medium: input.utm.utmMedium,
      utm_campaign: input.utm.utmCampaign,
      utm_content: input.utm.utmContent,
      utm_term: input.utm.utmTerm,
      referrer: input.utm.referrer,
      page_path: pagePath,
      status: "new",
    })
    .select("id, created_at")
    .single();

  if (error || !data) {
    console.error("[adready/leads] insert", error?.message);
    return { ok: false, error: "server_error", status: 500 };
  }

  const visitorId = readString(input.visitorId, 200) || "unknown";
  await saveCampaignEvent({
    slug: page.slug,
    visitorId,
    sessionId: input.sessionId,
    eventName: "campaign_lead_submit",
    payload: {
      leadId: data.id,
      phone: normalizedPhone.value,
    },
    utm: input.utm,
    userAgent: input.userAgent,
    supabase,
  });

  return {
    ok: true,
    data: { id: String(data.id), createdAt: String(data.created_at) },
  };
}
