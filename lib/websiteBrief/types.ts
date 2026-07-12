/** انواع و enumهای فرم بریف پروژه طراحی سایت */

export const FORM_VERSION = "v1";
export const DRAFT_STORAGE_KEY = "araaye_website_brief_v1";
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const BRIEF_STATUSES = [
  "new",
  "contacted",
  "proposal_preparing",
  "proposal_sent",
  "won",
  "lost",
] as const;
export type BriefStatus = (typeof BRIEF_STATUSES)[number];

export const CUSTOMER_SCOPES = [
  "local_city",
  "multiple_cities",
  "nationwide",
  "business_to_business",
  "fully_online",
  "unsure",
] as const;
export type CustomerScope = (typeof CUSTOMER_SCOPES)[number];

export const PRIMARY_CONVERSION_GOALS = [
  "phone_call",
  "whatsapp_message",
  "appointment_booking",
  "consultation_request",
  "quote_request",
  "online_purchase",
  "portfolio_project_request",
  "business_introduction",
  "needs_araaye_advice",
] as const;
export type PrimaryConversionGoal = (typeof PRIMARY_CONVERSION_GOALS)[number];

export const REQUIRED_SECTIONS = [
  "company_and_services",
  "separate_service_pages",
  "contact_consultation_form",
  "quick_call_whatsapp",
  "appointment_booking",
  "quote_request",
  "ecommerce_payment",
  "portfolio",
  "blog",
  "team",
  "multilingual",
  "needs_araaye_advice",
] as const;
export type RequiredSection = (typeof REQUIRED_SECTIONS)[number];

export const BOOKING_TYPES = [
  "request_only",
  "day_selection",
  "day_and_time",
  "time_and_deposit",
  "unknown",
] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

export const ESTIMATED_PRODUCT_COUNTS = [
  "under_20",
  "20_to_100",
  "over_100",
  "unknown",
] as const;
export type EstimatedProductCount = (typeof ESTIMATED_PRODUCT_COUNTS)[number];

export const ACQUISITION_CHANNELS = [
  "google_search",
  "google_maps",
  "instagram",
  "referrals",
  "online_advertising",
  "walk_in",
  "messengers",
  "business_partnerships",
  "no_consistent_channel",
] as const;
export type AcquisitionChannel = (typeof ACQUISITION_CHANNELS)[number];

export const CURRENT_ASSETS = [
  "active_website",
  "domain",
  "active_instagram",
  "business_whatsapp",
  "google_maps_listing",
  "local_maps_listing",
  "brand_identity",
  "website_content",
  "lead_management_system",
  "none",
  "unsure",
] as const;
export type CurrentAsset = (typeof CURRENT_ASSETS)[number];

export const PRIMARY_BUSINESS_PROBLEMS = [
  "not_visible_in_search_and_maps",
  "low_lead_volume",
  "dependent_on_instagram_and_referrals",
  "poor_advertising_conversion",
  "repetitive_questions",
  "no_after_hours_response",
  "scattered_leads",
  "forgotten_followups",
  "only_need_professional_website",
] as const;
export type PrimaryBusinessProblem = (typeof PRIMARY_BUSINESS_PROBLEMS)[number];

export const CONFIRMATION_BRANCHES = [
  "maps_presence",
  "google_leads",
  "advertising",
  "customer_guidance",
  "lead_followup",
] as const;
export type ConfirmationBranch = (typeof CONFIRMATION_BRANCHES)[number];

export const GOOGLE_MAPS_STATUSES = [
  "complete",
  "incomplete_or_outdated",
  "not_registered",
  "unknown",
] as const;
export type GoogleMapsStatus = (typeof GOOGLE_MAPS_STATUSES)[number];

export const GOOGLE_LEAD_STATUSES = [
  "regular",
  "sometimes",
  "very_low",
  "none",
  "unknown",
] as const;
export type GoogleLeadStatus = (typeof GOOGLE_LEAD_STATUSES)[number];

export const ADVERTISING_STATUSES = [
  "active",
  "starting_soon",
  "possible_in_future",
  "no_plan",
] as const;
export type AdvertisingStatus = (typeof ADVERTISING_STATUSES)[number];

export const CUSTOMER_GUIDANCE_NEEDS = [
  "faq",
  "service_selection",
  "price_and_conditions",
  "booking_guidance",
  "mixed",
] as const;
export type CustomerGuidanceNeed = (typeof CUSTOMER_GUIDANCE_NEEDS)[number];

export const LEAD_FOLLOWUP_STATUSES = [
  "centralized_system",
  "mostly_calls_and_whatsapp",
  "scattered",
  "no_process",
  "unknown",
] as const;
export type LeadFollowupStatus = (typeof LEAD_FOLLOWUP_STATUSES)[number];

export const CONTENT_READINESS = [
  "fully_ready",
  "partially_ready",
  "basic_info_and_logo",
  "not_ready",
  "need_araaye_help",
] as const;
export type ContentReadiness = (typeof CONTENT_READINESS)[number];

export const RECOMMENDED_SERVICES = [
  "lead_management",
  "adready",
  "maps",
  "chatbot",
  "seo",
  "none",
] as const;
export type RecommendedService = (typeof RECOMMENDED_SERVICES)[number];

export type WebsiteBriefInput = {
  business_name: string;
  business_summary: string;
  customer_scope: CustomerScope;
  primary_location?: string | null;
  primary_conversion_goal: PrimaryConversionGoal;
  required_sections: RequiredSection[];
  booking_type?: BookingType | null;
  estimated_product_count?: EstimatedProductCount | null;
  required_languages?: string | null;
  acquisition_channels: AcquisitionChannel[];
  current_assets: CurrentAsset[];
  current_website_url?: string | null;
  primary_business_problem: PrimaryBusinessProblem;
  google_maps_status?: GoogleMapsStatus | null;
  google_lead_status?: GoogleLeadStatus | null;
  advertising_status?: AdvertisingStatus | null;
  customer_guidance_need?: CustomerGuidanceNeed | null;
  lead_followup_status?: LeadFollowupStatus | null;
  content_readiness: ContentReadiness;
  contact_name: string;
  contact_phone: string;
  additional_notes?: string | null;
};

export type WebsiteBriefRecord = WebsiteBriefInput & {
  id: string;
  created_at: string;
  updated_at: string;
  status: BriefStatus;
  form_version: string;
  primary_service: "website_design";
  confirmation_branch: ConfirmationBranch | null;
  recommended_service: RecommendedService;
  recommendation_reason_code: string;
  recommendation_template_id: string;
  recommendation_interest: boolean | null;
  source_page: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  submission_token: string;
  internal_notes: string | null;
};

export type RecommendationResult = {
  recommendedService: RecommendedService;
  recommendationMessage: string;
  recommendationReasonCode: string;
  recommendationTemplateId: string;
  confirmationBranch: ConfirmationBranch | null;
};
