import type {
  RecommendedService,
  WebsiteBriefInput,
  RecommendationResult,
} from "./types";
import {
  CONVERSION_GOALS_FOR_LEAD_CAPTURE,
  CONVERSION_GOALS_FOR_MAPS,
  LEAD_CAPTURE_SECTIONS,
  LOCAL_SCOPES,
} from "./constants";
import { resolveConfirmationBranch } from "./confirmation";

type Candidate = {
  service: RecommendedService;
  reasonCode: string;
  templateId: string;
  message: string;
};

const MESSAGES: Record<Exclude<RecommendedService, "none">, string> = {
  lead_management:
    "با توجه به اینکه درخواست‌های مشتریان در چند مسیر پراکنده می‌شوند، اتصال سایت به سیستم پیگیری آرایه کمک می‌کند هیچ فرصت فروش یا همکاری فراموش نشود.",
  adready:
    "با توجه به اینکه برای تبلیغات هزینه می‌کنید، طراحی یک صفحه AdReady اختصاصی می‌تواند بازدیدکنندگان تبلیغ را مستقیم‌تر به تماس، خرید یا درخواست مشتری تبدیل کند.",
  maps:
    "با توجه به اینکه مشتریان شما در یک محدوده مشخص جست‌وجو می‌کنند اما حضورتان در نقشه‌های آنلاین کامل نیست، ثبت و بهینه‌سازی Google Maps، نشان و بلد می‌تواند سایت جدیدتان را سریع‌تر به تماس و مراجعه تبدیل کند.",
  chatbot:
    "با توجه به حجم سؤال‌های تکراری و نیاز مشتریان به راهنمایی سریع، چت‌بات آرایه می‌تواند در تمام ساعات آن‌ها را پاسخ دهد و به تماس، رزرو یا ثبت درخواست هدایت کند.",
  seo:
    "با توجه به اینکه هدفتان جذب مشتری است اما فعلاً ورودی منظمی از گوگل ندارید، سئوی آرایه می‌تواند سایت جدیدتان را به یک مسیر پایدار برای دریافت تماس و درخواست تبدیل کند.",
};

const NONE_MESSAGE =
  "اطلاعات شما ثبت شد؛ در بررسی اولیه نیاز فوری به خدمت مکملی دیده نشد و پیشنهاد آرایه روی طراحی سایت متناسب با اهداف شما متمرکز خواهد بود.";

function hasLeadCaptureSection(sections: WebsiteBriefInput["required_sections"]): boolean {
  return sections.some((s) => LEAD_CAPTURE_SECTIONS.includes(s));
}

function evaluateLeadManagement(input: WebsiteBriefInput): Candidate | null {
  const problemMatch =
    input.primary_business_problem === "scattered_leads" ||
    input.primary_business_problem === "forgotten_followups";
  const followupMatch =
    input.lead_followup_status === "scattered" || input.lead_followup_status === "no_process";

  if (!problemMatch && !followupMatch) return null;
  if (!hasLeadCaptureSection(input.required_sections)) return null;

  const reasonCode = input.primary_business_problem === "forgotten_followups"
    ? "FORGOTTEN_FOLLOWUPS"
    : input.lead_followup_status === "no_process"
      ? "NO_FOLLOWUP_PROCESS"
      : "SCATTERED_LEADS";

  return {
    service: "lead_management",
    reasonCode,
    templateId: "lead_management",
    message: MESSAGES.lead_management,
  };
}

function evaluateAdready(input: WebsiteBriefInput): Candidate | null {
  const advertisingPath =
    input.primary_business_problem === "poor_advertising_conversion" ||
    input.acquisition_channels.includes("online_advertising");

  if (!advertisingPath) return null;
  if (input.advertising_status !== "active" && input.advertising_status !== "starting_soon") {
    return null;
  }
  if (!CONVERSION_GOALS_FOR_LEAD_CAPTURE.includes(input.primary_conversion_goal)) {
    return null;
  }

  const reasonCode =
    input.primary_business_problem === "poor_advertising_conversion"
      ? "LOW_AD_CONVERSION"
      : input.advertising_status === "starting_soon"
        ? "ADVERTISING_STARTING_SOON"
        : "ACTIVE_ADVERTISING";

  return {
    service: "adready",
    reasonCode,
    templateId: "adready",
    message: MESSAGES.adready,
  };
}

function evaluateMaps(input: WebsiteBriefInput): Candidate | null {
  if (!LOCAL_SCOPES.includes(input.customer_scope)) return null;
  if (!CONVERSION_GOALS_FOR_MAPS.includes(input.primary_conversion_goal)) return null;

  const noMapsAsset = !input.current_assets.includes("google_maps_listing");
  const mapsStatusMatch =
    input.google_maps_status === "not_registered" ||
    input.google_maps_status === "incomplete_or_outdated" ||
    input.google_maps_status === "unknown";

  if (!noMapsAsset && !mapsStatusMatch) return null;

  const reasonCode = input.google_maps_status === "incomplete_or_outdated"
    ? "MAPS_INFORMATION_INCOMPLETE"
    : input.google_maps_status === "unknown"
      ? "MAPS_STATUS_UNKNOWN"
      : "LOCAL_BUSINESS_NOT_ON_MAPS";

  return {
    service: "maps",
    reasonCode,
    templateId: "maps",
    message: MESSAGES.maps,
  };
}

function evaluateChatbot(input: WebsiteBriefInput): Candidate | null {
  const problemMatch =
    input.primary_business_problem === "repetitive_questions" ||
    input.primary_business_problem === "no_after_hours_response";

  if (!problemMatch) return null;
  if (!input.customer_guidance_need) return null;

  const reasonCode =
    input.primary_business_problem === "no_after_hours_response"
      ? "NO_AFTER_HOURS_RESPONSE"
      : "REPETITIVE_CUSTOMER_QUESTIONS";

  return {
    service: "chatbot",
    reasonCode,
    templateId: "chatbot",
    message: MESSAGES.chatbot,
  };
}

function evaluateSeo(input: WebsiteBriefInput): Candidate | null {
  const problemMatch =
    input.primary_business_problem === "low_lead_volume" ||
    input.primary_business_problem === "dependent_on_instagram_and_referrals";
  const channelMatch = input.acquisition_channels.includes("no_consistent_channel");

  if (!problemMatch && !channelMatch) return null;

  const googleStatus = input.google_lead_status;
  if (googleStatus !== "very_low" && googleStatus !== "none" && googleStatus !== "unknown") {
    return null;
  }

  const reasonCode =
    googleStatus === "none"
      ? "NO_GOOGLE_LEADS"
      : input.primary_business_problem === "dependent_on_instagram_and_referrals"
        ? "DEPENDENT_ON_SOCIAL_AND_REFERRALS"
        : channelMatch && !problemMatch
          ? "NO_CONSISTENT_ACQUISITION_CHANNEL"
          : "LOW_GOOGLE_LEADS";

  return {
    service: "seo",
    reasonCode,
    templateId: "seo",
    message: MESSAGES.seo,
  };
}

const PRIORITY = [
  "lead_management",
  "adready",
  "maps",
  "chatbot",
  "seo",
] as const satisfies readonly Exclude<RecommendedService, "none">[];

/** سرویس Rule-Based پیشنهاد خدمت مکمل */
export class WebsiteBriefRecommendationService {
  static recommend(input: WebsiteBriefInput): RecommendationResult {
    const confirmationBranch = resolveConfirmationBranch(input);

    const evaluators: Record<Exclude<RecommendedService, "none">, (i: WebsiteBriefInput) => Candidate | null> = {
      lead_management: evaluateLeadManagement,
      adready: evaluateAdready,
      maps: evaluateMaps,
      chatbot: evaluateChatbot,
      seo: evaluateSeo,
    };

    for (const service of PRIORITY) {
      const candidate = evaluators[service](input);
      if (candidate) {
        return {
          recommendedService: candidate.service,
          recommendationMessage: candidate.message,
          recommendationReasonCode: candidate.reasonCode,
          recommendationTemplateId: candidate.templateId,
          confirmationBranch,
        };
      }
    }

    return {
      recommendedService: "none",
      recommendationMessage: NONE_MESSAGE,
      recommendationReasonCode: "NO_CLEAR_COMPLEMENTARY_NEED",
      recommendationTemplateId: "none",
      confirmationBranch,
    };
  }
}

export { evaluateLeadManagement, evaluateAdready, evaluateMaps, evaluateChatbot, evaluateSeo };
