import {
  ACQUISITION_CHANNELS,
  ADVERTISING_STATUSES,
  BOOKING_TYPES,
  BRIEF_STATUSES,
  CONTENT_READINESS,
  CURRENT_ASSETS,
  CUSTOMER_GUIDANCE_NEEDS,
  CUSTOMER_SCOPES,
  ESTIMATED_PRODUCT_COUNTS,
  GOOGLE_LEAD_STATUSES,
  GOOGLE_MAPS_STATUSES,
  LEAD_FOLLOWUP_STATUSES,
  PRIMARY_BUSINESS_PROBLEMS,
  PRIMARY_CONVERSION_GOALS,
  REQUIRED_SECTIONS,
  type WebsiteBriefInput,
  FORM_VERSION,
} from "./types";
import { LOCAL_SCOPES, MAX_REQUIRED_SECTIONS } from "./constants";
import {
  confirmationFieldForBranch,
  resolveConfirmationBranch,
} from "./confirmation";
import { normalizeBriefPhone, normalizeWebsiteUrl, sanitizeText } from "./normalize";

export type ValidationError = { field: string; message: string };
export type ValidationResult =
  | { ok: true; data: WebsiteBriefInput & { confirmation_branch: string | null } }
  | { ok: false; errors: ValidationError[] };

function isEnum<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function parseStringArray(value: unknown, allowed: readonly string[], maxItems: number): string[] {
  if (!Array.isArray(value)) return [];
  const unique = [...new Set(value.filter((v) => typeof v === "string"))];
  return unique.filter((v) => allowed.includes(v)).slice(0, maxItems);
}

function addError(errors: ValidationError[], field: string, message: string) {
  errors.push({ field, message });
}

export function validateWebsiteBriefBody(body: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];

  const business_name = sanitizeText(String(body.business_name ?? ""), 150);
  if (business_name.length < 2) {
    addError(errors, "business_name", "نام کسب‌وکار باید حداقل ۲ کاراکتر باشد.");
  }

  const business_summary = sanitizeText(String(body.business_summary ?? ""), 250);
  if (business_summary.length < 10) {
    addError(errors, "business_summary", "لطفاً در یک جمله فعالیت کسب‌وکار را توضیح دهید (حداقل ۱۰ کاراکتر).");
  }

  const customer_scope = body.customer_scope;
  if (!isEnum(customer_scope, CUSTOMER_SCOPES)) {
    addError(errors, "customer_scope", "لطفاً محدوده مشتریان را انتخاب کنید.");
  }

  let primary_location: string | null = null;
  if (
    isEnum(customer_scope, CUSTOMER_SCOPES) &&
    LOCAL_SCOPES.includes(customer_scope)
  ) {
    primary_location = sanitizeText(String(body.primary_location ?? ""), 150);
    if (!primary_location) {
      addError(errors, "primary_location", "لطفاً شهر یا محدوده اصلی فعالیت را وارد کنید.");
    }
  }

  const primary_conversion_goal = body.primary_conversion_goal;
  if (!isEnum(primary_conversion_goal, PRIMARY_CONVERSION_GOALS)) {
    addError(errors, "primary_conversion_goal", "لطفاً مهم‌ترین هدف سایت را انتخاب کنید.");
  }

  let required_sections = parseStringArray(body.required_sections, REQUIRED_SECTIONS, MAX_REQUIRED_SECTIONS);
  if (required_sections.includes("needs_araaye_advice")) {
    required_sections = ["needs_araaye_advice"];
  }
  if (required_sections.length === 0) {
    addError(errors, "required_sections", "لطفاً حداقل یک بخش ضروری انتخاب کنید.");
  }

  let booking_type = null;
  if (required_sections.includes("appointment_booking")) {
    if (!isEnum(body.booking_type, BOOKING_TYPES)) {
      addError(errors, "booking_type", "لطفاً نوع رزرو موردنظر را انتخاب کنید.");
    } else {
      booking_type = body.booking_type;
    }
  }

  let estimated_product_count = null;
  if (required_sections.includes("ecommerce_payment")) {
    if (!isEnum(body.estimated_product_count, ESTIMATED_PRODUCT_COUNTS)) {
      addError(errors, "estimated_product_count", "لطفاً تعداد تقریبی محصولات را انتخاب کنید.");
    } else {
      estimated_product_count = body.estimated_product_count;
    }
  }

  let required_languages: string | null = null;
  if (required_sections.includes("multilingual")) {
    required_languages = sanitizeText(String(body.required_languages ?? ""), 150);
    if (!required_languages) {
      addError(errors, "required_languages", "لطفاً زبان‌های موردنیاز سایت را وارد کنید.");
    }
  }

  let acquisition_channels = parseStringArray(body.acquisition_channels, ACQUISITION_CHANNELS, 2);
  if (acquisition_channels.includes("no_consistent_channel")) {
    acquisition_channels = ["no_consistent_channel"];
  }
  if (acquisition_channels.length === 0) {
    addError(errors, "acquisition_channels", "لطفاً حداقل یک مسیر جذب مشتری انتخاب کنید.");
  }

  let current_assets = parseStringArray(body.current_assets, CURRENT_ASSETS, CURRENT_ASSETS.length);
  if (current_assets.includes("none")) {
    current_assets = ["none"];
  }
  if (current_assets.length === 0) {
    addError(errors, "current_assets", "لطفاً وضعیت دارایی‌های فعلی را مشخص کنید.");
  }

  let current_website_url: string | null = null;
  if (current_assets.includes("active_website")) {
    const rawUrl = String(body.current_website_url ?? "").trim();
    if (rawUrl) {
      current_website_url = normalizeWebsiteUrl(rawUrl);
      if (!current_website_url) {
        addError(errors, "current_website_url", "آدرس سایت واردشده معتبر نیست.");
      }
    }
  }

  const primary_business_problem = body.primary_business_problem;
  if (!isEnum(primary_business_problem, PRIMARY_BUSINESS_PROBLEMS)) {
    addError(errors, "primary_business_problem", "لطفاً وضعیت فعلی کسب‌وکار را انتخاب کنید.");
  }

  const partialInput = {
    primary_business_problem: primary_business_problem as WebsiteBriefInput["primary_business_problem"],
    customer_scope: customer_scope as WebsiteBriefInput["customer_scope"],
    acquisition_channels: acquisition_channels as WebsiteBriefInput["acquisition_channels"],
  };

  const confirmation_branch = isEnum(primary_business_problem, PRIMARY_BUSINESS_PROBLEMS) &&
    isEnum(customer_scope, CUSTOMER_SCOPES)
    ? resolveConfirmationBranch({
        ...partialInput,
        acquisition_channels: acquisition_channels as WebsiteBriefInput["acquisition_channels"],
      })
    : null;

  let google_maps_status = null;
  let google_lead_status = null;
  let advertising_status = null;
  let customer_guidance_need = null;
  let lead_followup_status = null;

  if (confirmation_branch) {
    const field = confirmationFieldForBranch(confirmation_branch);
    if (field === "google_maps_status") {
      if (!isEnum(body.google_maps_status, GOOGLE_MAPS_STATUSES)) {
        addError(errors, "google_maps_status", "لطفاً وضعیت Google Maps را انتخاب کنید.");
      } else {
        google_maps_status = body.google_maps_status;
      }
    } else if (field === "google_lead_status") {
      if (!isEnum(body.google_lead_status, GOOGLE_LEAD_STATUSES)) {
        addError(errors, "google_lead_status", "لطفاً وضعیت ورودی از گوگل را انتخاب کنید.");
      } else {
        google_lead_status = body.google_lead_status;
      }
    } else if (field === "advertising_status") {
      if (!isEnum(body.advertising_status, ADVERTISING_STATUSES)) {
        addError(errors, "advertising_status", "لطفاً وضعیت تبلیغات را انتخاب کنید.");
      } else {
        advertising_status = body.advertising_status;
      }
    } else if (field === "customer_guidance_need") {
      if (!isEnum(body.customer_guidance_need, CUSTOMER_GUIDANCE_NEEDS)) {
        addError(errors, "customer_guidance_need", "لطفاً نوع کمکی که مشتریان نیاز دارند را انتخاب کنید.");
      } else {
        customer_guidance_need = body.customer_guidance_need;
      }
    } else if (field === "lead_followup_status") {
      if (!isEnum(body.lead_followup_status, LEAD_FOLLOWUP_STATUSES)) {
        addError(errors, "lead_followup_status", "لطفاً نحوه ثبت و پیگیری درخواست‌ها را انتخاب کنید.");
      } else {
        lead_followup_status = body.lead_followup_status;
      }
    }
  }

  const content_readiness = body.content_readiness;
  if (!isEnum(content_readiness, CONTENT_READINESS)) {
    addError(errors, "content_readiness", "لطفاً وضعیت آمادگی محتوا را انتخاب کنید.");
  }

  const contact_name = sanitizeText(String(body.contact_name ?? ""), 100);
  if (!contact_name) {
    addError(errors, "contact_name", "لطفاً نام و نام خانوادگی را وارد کنید.");
  }

  const contact_phone = normalizeBriefPhone(String(body.contact_phone ?? ""));
  if (!contact_phone) {
    addError(errors, "contact_phone", "شماره موبایل یا واتساپ معتبر وارد کنید.");
  }

  const additional_notesRaw = String(body.additional_notes ?? "").trim();
  const additional_notes = additional_notesRaw
    ? sanitizeText(additional_notesRaw, 500)
    : null;

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      business_name,
      business_summary,
      customer_scope: customer_scope as WebsiteBriefInput["customer_scope"],
      primary_location,
      primary_conversion_goal: primary_conversion_goal as WebsiteBriefInput["primary_conversion_goal"],
      required_sections: required_sections as WebsiteBriefInput["required_sections"],
      booking_type,
      estimated_product_count,
      required_languages,
      acquisition_channels: acquisition_channels as WebsiteBriefInput["acquisition_channels"],
      current_assets: current_assets as WebsiteBriefInput["current_assets"],
      current_website_url,
      primary_business_problem: primary_business_problem as WebsiteBriefInput["primary_business_problem"],
      google_maps_status,
      google_lead_status,
      advertising_status,
      customer_guidance_need,
      lead_followup_status,
      content_readiness: content_readiness as WebsiteBriefInput["content_readiness"],
      contact_name,
      contact_phone: contact_phone!,
      additional_notes,
      confirmation_branch,
    },
  };
}

export function isValidBriefStatus(status: string): boolean {
  return (BRIEF_STATUSES as readonly string[]).includes(status);
}

export function isValidFormVersion(version: string): boolean {
  return version === FORM_VERSION;
}
