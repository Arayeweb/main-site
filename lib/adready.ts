import type { NextRequest } from "next/server";

export const CAMPAIGN_PAGE_STATUSES = [
  "draft",
  "preview",
  "published",
  "archived",
] as const;
export const CAMPAIGN_PLANS = [
  "free",
  "starter",
  "pro",
  "business",
  "done_for_you",
] as const;
export const CAMPAIGN_LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
] as const;

export type CampaignPageStatus = (typeof CAMPAIGN_PAGE_STATUSES)[number];
export type CampaignPlan = (typeof CAMPAIGN_PLANS)[number];
export type CampaignLeadStatus = (typeof CAMPAIGN_LEAD_STATUSES)[number];
export type JsonObject = Record<string, unknown>;

export interface CampaignPage {
  id: string;
  userId: string;
  title: string;
  slug: string;
  status: CampaignPageStatus;
  plan: CampaignPlan;
  goal: string | null;
  businessName: string | null;
  businessType: string | null;
  city: string | null;
  websiteOrInstagram: string | null;
  contactPhone: string | null;
  whatsappNumber: string | null;
  telegramUsername: string | null;
  productOrServiceName: string | null;
  shortDescription: string | null;
  priceRange: string | null;
  mainBenefit: string | null;
  targetAudience: string | null;
  campaignChannel: string | null;
  campaignTone: string | null;
  templateKey: string | null;
  themeKey: string | null;
  generatedContent: JsonObject;
  customContent: JsonObject;
  seoVisibility: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignLead {
  id: string;
  campaignPageId: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrer: string | null;
  pagePath: string | null;
  status: CampaignLeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignEvent {
  id: string;
  campaignPageId: string;
  visitorId: string;
  eventName: string;
  payload: JsonObject;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrer: string | null;
  pagePath: string | null;
  createdAt: string;
}

type DbRow = Record<string, unknown>;

export const CAMPAIGN_PAGE_COLUMNS =
  "id, user_id, title, slug, status, plan, goal, business_name, business_type, city, website_or_instagram, contact_phone, whatsapp_number, telegram_username, product_or_service_name, short_description, price_range, main_benefit, target_audience, campaign_channel, campaign_tone, template_key, theme_key, generated_content, custom_content, seo_visibility, published_at, expires_at, created_at, updated_at" as const;

export const CAMPAIGN_LEAD_COLUMNS =
  "id, campaign_page_id, user_id, full_name, phone, email, message, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer, page_path, status, created_at, updated_at" as const;

export const CAMPAIGN_EVENT_COLUMNS =
  "id, campaign_page_id, visitor_id, event_name, payload, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer, page_path, created_at" as const;

export const CAMPAIGN_EVENT_NAMES = [
  "campaign_page_view",
  "campaign_cta_click",
  "campaign_form_start",
  "campaign_lead_submit",
  "campaign_whatsapp_click",
  "campaign_telegram_click",
  "campaign_call_click",
] as const;

export type CampaignEventName = (typeof CAMPAIGN_EVENT_NAMES)[number];

export const LEAD_DEDUP_WINDOW_MS = 5 * 60 * 1000;

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function jsonObject(value: unknown): JsonObject {
  return isPlainObject(value) ? value : {};
}

export function mapCampaignPage(row: DbRow): CampaignPage {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    slug: String(row.slug),
    status: row.status as CampaignPageStatus,
    plan: row.plan as CampaignPlan,
    goal: nullableString(row.goal),
    businessName: nullableString(row.business_name),
    businessType: nullableString(row.business_type),
    city: nullableString(row.city),
    websiteOrInstagram: nullableString(row.website_or_instagram),
    contactPhone: nullableString(row.contact_phone),
    whatsappNumber: nullableString(row.whatsapp_number),
    telegramUsername: nullableString(row.telegram_username),
    productOrServiceName: nullableString(row.product_or_service_name),
    shortDescription: nullableString(row.short_description),
    priceRange: nullableString(row.price_range),
    mainBenefit: nullableString(row.main_benefit),
    targetAudience: nullableString(row.target_audience),
    campaignChannel: nullableString(row.campaign_channel),
    campaignTone: nullableString(row.campaign_tone),
    templateKey: nullableString(row.template_key),
    themeKey: nullableString(row.theme_key),
    generatedContent: jsonObject(row.generated_content),
    customContent: jsonObject(row.custom_content),
    seoVisibility: row.seo_visibility === true,
    publishedAt: nullableString(row.published_at),
    expiresAt: nullableString(row.expires_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapCampaignEvent(row: DbRow): CampaignEvent {
  return {
    id: String(row.id),
    campaignPageId: String(row.campaign_page_id),
    visitorId: String(row.visitor_id),
    eventName: String(row.event_name),
    payload: jsonObject(row.payload),
    utmSource: nullableString(row.utm_source),
    utmMedium: nullableString(row.utm_medium),
    utmCampaign: nullableString(row.utm_campaign),
    utmContent: nullableString(row.utm_content),
    utmTerm: nullableString(row.utm_term),
    referrer: nullableString(row.referrer),
    pagePath: nullableString(row.page_path),
    createdAt: String(row.created_at),
  };
}

export function isCampaignEventName(value: string): value is CampaignEventName {
  return (CAMPAIGN_EVENT_NAMES as readonly string[]).includes(value);
}

export function isAdReadyPlanExportAllowed(plan: string): boolean {
  return plan === "pro" || plan === "business";
}

export function mapCampaignLead(row: DbRow): CampaignLead {
  return {
    id: String(row.id),
    campaignPageId: String(row.campaign_page_id),
    userId: String(row.user_id),
    fullName: String(row.full_name),
    phone: String(row.phone),
    email: nullableString(row.email),
    message: nullableString(row.message),
    utmSource: nullableString(row.utm_source),
    utmMedium: nullableString(row.utm_medium),
    utmCampaign: nullableString(row.utm_campaign),
    utmContent: nullableString(row.utm_content),
    utmTerm: nullableString(row.utm_term),
    referrer: nullableString(row.referrer),
    pagePath: nullableString(row.page_path),
    status: row.status as CampaignLeadStatus,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function readString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, max) : null;
}

export function isPlainObject(value: unknown): value is JsonObject {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

export function isReasonableJsonObject(value: unknown, maxBytes = 100_000): value is JsonObject {
  if (!isPlainObject(value)) return false;
  try {
    return Buffer.byteLength(JSON.stringify(value), "utf8") <= maxBytes;
  } catch {
    return false;
  }
}

export function normalizeCampaignSlug(value: unknown): string | null {
  const raw = readString(value, 80);
  if (!raw) return null;
  const slug = raw
    .toLocaleLowerCase("fa")
    .normalize("NFKC")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}_-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 64);
  return slug.length >= 3 ? slug : null;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

const TEXT_FIELDS: Array<[string, string, number]> = [
  ["goal", "goal", 500],
  ["businessName", "business_name", 200],
  ["businessType", "business_type", 120],
  ["city", "city", 120],
  ["websiteOrInstagram", "website_or_instagram", 500],
  ["contactPhone", "contact_phone", 40],
  ["whatsappNumber", "whatsapp_number", 40],
  ["telegramUsername", "telegram_username", 120],
  ["productOrServiceName", "product_or_service_name", 200],
  ["shortDescription", "short_description", 2000],
  ["priceRange", "price_range", 200],
  ["mainBenefit", "main_benefit", 1000],
  ["targetAudience", "target_audience", 1000],
  ["campaignChannel", "campaign_channel", 120],
  ["campaignTone", "campaign_tone", 120],
  ["templateKey", "template_key", 120],
  ["themeKey", "theme_key", 120],
];

export type CampaignPageInputResult =
  | { ok: true; row: DbRow }
  | { ok: false; error: string };

export function parseCampaignPageInput(
  body: JsonObject,
  options: { create: boolean; allowGeneratedContent?: boolean }
): CampaignPageInputResult {
  const row: DbRow = {};

  if (options.create || "title" in body) {
    const title = readString(body.title, 200);
    if (!title) return { ok: false, error: "invalid_title" };
    row.title = title;
  }

  if ("slug" in body) {
    const slug = normalizeCampaignSlug(body.slug);
    if (!slug) return { ok: false, error: "invalid_slug" };
    row.slug = slug;
  }

  for (const [apiKey, dbKey, max] of TEXT_FIELDS) {
    if (apiKey in body) {
      row[dbKey] = readString(body[apiKey], max);
    }
  }

  if ("generatedContent" in body) {
    if (!options.allowGeneratedContent) {
      return { ok: false, error: "generatedContent_server_managed" };
    }
    if (!isReasonableJsonObject(body.generatedContent)) {
      return { ok: false, error: "invalid_generatedContent" };
    }
    row.generated_content = body.generatedContent;
  }

  if ("customContent" in body) {
    if (!isReasonableJsonObject(body.customContent)) {
      return { ok: false, error: "invalid_customContent" };
    }
    row.custom_content = body.customContent;
  }

  if ("seoVisibility" in body) {
    if (typeof body.seoVisibility !== "boolean") {
      return { ok: false, error: "invalid_seoVisibility" };
    }
    row.seo_visibility = body.seoVisibility;
  }

  if ("expiresAt" in body) {
    if (body.expiresAt === null || body.expiresAt === "") {
      row.expires_at = null;
    } else {
      const date = new Date(String(body.expiresAt));
      if (Number.isNaN(date.getTime())) {
        return { ok: false, error: "invalid_expiresAt" };
      }
      row.expires_at = date.toISOString();
    }
  }

  if (!options.create && "status" in body) {
    if (
      typeof body.status !== "string" ||
      !CAMPAIGN_PAGE_STATUSES.includes(body.status as CampaignPageStatus)
    ) {
      return { ok: false, error: "invalid_status" };
    }
    row.status = body.status;
  }

  return { ok: true, row };
}

const rateLimitHits = new Map<string, number[]>();

export function isAdReadyRateLimited(
  req: NextRequest,
  scope: "lead" | "event",
  maxPerMinute: number
): boolean {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const recent = (rateLimitHits.get(key) || []).filter((time) => now - time < 60_000);
  recent.push(now);
  rateLimitHits.set(key, recent);
  return recent.length > maxPerMinute;
}
