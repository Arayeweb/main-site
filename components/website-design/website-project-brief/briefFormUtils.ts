"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import { DRAFT_STORAGE_KEY, DRAFT_TTL_MS, FORM_VERSION } from "@/lib/websiteBrief/types";
import type {
  AcquisitionChannel,
  AdvertisingStatus,
  BookingType,
  ContentReadiness,
  CurrentAsset,
  CustomerGuidanceNeed,
  CustomerScope,
  EstimatedProductCount,
  GoogleLeadStatus,
  GoogleMapsStatus,
  LeadFollowupStatus,
  PrimaryBusinessProblem,
  PrimaryConversionGoal,
  RequiredSection,
} from "@/lib/websiteBrief/types";
import { resolveConfirmationBranch, confirmationFieldForBranch } from "@/lib/websiteBrief/confirmation";
import { LOCAL_SCOPES } from "@/lib/websiteBrief/constants";
import { recommendedServiceLabels } from "@/lib/websiteBrief/constants";
import { normalizeBriefPhone } from "@/lib/websiteBrief/normalize";
import {
  acquisitionChannelOptions,
  advertisingStatusOptions,
  bookingTypeOptions,
  contentReadinessOptions,
  currentAssetOptions,
  customerGuidanceNeedOptions,
  customerScopeOptions,
  estimatedProductCountOptions,
  googleLeadStatusOptions,
  googleMapsStatusOptions,
  leadFollowupStatusOptions,
  primaryBusinessProblemOptions,
  primaryConversionGoalOptions,
  requiredSectionOptions,
} from "@/lib/websiteBrief/constants";

export type BriefStep = 1 | 2 | 3 | 4 | 5;

export type BriefFormValues = {
  business_name: string;
  business_summary: string;
  customer_scope: CustomerScope | "";
  primary_location: string;
  primary_conversion_goal: PrimaryConversionGoal | "";
  required_sections: RequiredSection[];
  booking_type: BookingType | "";
  estimated_product_count: EstimatedProductCount | "";
  required_languages: string;
  acquisition_channels: AcquisitionChannel[];
  current_assets: CurrentAsset[];
  current_website_url: string;
  primary_business_problem: PrimaryBusinessProblem | "";
  google_maps_status: GoogleMapsStatus | "";
  google_lead_status: GoogleLeadStatus | "";
  advertising_status: AdvertisingStatus | "";
  customer_guidance_need: CustomerGuidanceNeed | "";
  lead_followup_status: LeadFollowupStatus | "";
  content_readiness: ContentReadiness | "";
  contact_name: string;
  contact_phone: string;
  additional_notes: string;
};

export const emptyBriefFormValues = (): BriefFormValues => ({
  business_name: "",
  business_summary: "",
  customer_scope: "",
  primary_location: "",
  primary_conversion_goal: "",
  required_sections: [],
  booking_type: "",
  estimated_product_count: "",
  required_languages: "",
  acquisition_channels: [],
  current_assets: [],
  current_website_url: "",
  primary_business_problem: "",
  google_maps_status: "",
  google_lead_status: "",
  advertising_status: "",
  customer_guidance_need: "",
  lead_followup_status: "",
  content_readiness: "",
  contact_name: "",
  contact_phone: "",
  additional_notes: "",
});

type DraftPayload = {
  version: string;
  savedAt: number;
  step: BriefStep;
  submissionToken: string;
  values: BriefFormValues;
};

function createSubmissionToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `brief-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function loadBriefDraft(): DraftPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftPayload;
    if (parsed.version !== FORM_VERSION) return null;
    if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveBriefDraft(payload: DraftPayload) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function clearBriefDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function useBriefDraft(initialStep: BriefStep = 1) {
  const [step, setStep] = useState<BriefStep>(initialStep);
  const [values, setValues] = useState<BriefFormValues>(emptyBriefFormValues);
  const [submissionToken, setSubmissionToken] = useState(createSubmissionToken);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const draft = loadBriefDraft();
    if (draft) {
      setValues(draft.values);
      setStep(draft.step);
      setSubmissionToken(draft.submissionToken);
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveBriefDraft({
      version: FORM_VERSION,
      savedAt: Date.now(),
      step,
      submissionToken,
      values,
    });
  }, [step, submissionToken, values]);

  const patchValues = useCallback((patch: Partial<BriefFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
  }, []);

  return { step, setStep, values, setValues, patchValues, submissionToken };
}

export const inputClassName =
  "w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-teal-400 focus:bg-white disabled:opacity-60";

export const cardOptionClass = (selected: boolean) =>
  `w-full text-right rounded-xl border px-4 py-3.5 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
    selected
      ? "border-teal-500 bg-teal-50/80 text-navy-900 font-medium shadow-sm"
      : "border-navy-100 bg-white text-navy-700 hover:border-navy-200"
  }`;

export function getConfirmationBranch(values: BriefFormValues) {
  if (!values.primary_business_problem || !values.customer_scope) return null;
  return resolveConfirmationBranch({
    primary_business_problem: values.primary_business_problem,
    customer_scope: values.customer_scope,
    acquisition_channels: values.acquisition_channels,
  });
}

export function validateStep(step: BriefStep, values: BriefFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  const trim = (s: string) => s.trim();

  if (step === 1) {
    if (trim(values.business_name).length < 2) errors.business_name = "نام کسب‌وکار باید حداقل ۲ کاراکتر باشد.";
    if (trim(values.business_summary).length < 10) {
      errors.business_summary = "لطفاً فعالیت کسب‌وکار را در یک جمله توضیح دهید.";
    }
    if (!values.customer_scope) errors.customer_scope = "لطفاً محدوده مشتریان را انتخاب کنید.";
    if (
      values.customer_scope &&
      LOCAL_SCOPES.includes(values.customer_scope as CustomerScope) &&
      !trim(values.primary_location)
    ) {
      errors.primary_location = "لطفاً شهر یا محدوده اصلی فعالیت را وارد کنید.";
    }
  }

  if (step === 2) {
    if (!values.primary_conversion_goal) {
      errors.primary_conversion_goal = "لطفاً مهم‌ترین هدف سایت را انتخاب کنید.";
    }
    if (values.required_sections.length === 0) {
      errors.required_sections = "لطفاً حداقل یک بخش ضروری انتخاب کنید.";
    }
    if (values.required_sections.includes("appointment_booking") && !values.booking_type) {
      errors.booking_type = "لطفاً نوع رزرو را انتخاب کنید.";
    }
    if (values.required_sections.includes("ecommerce_payment") && !values.estimated_product_count) {
      errors.estimated_product_count = "لطفاً تعداد تقریبی محصولات را انتخاب کنید.";
    }
    if (values.required_sections.includes("multilingual") && !trim(values.required_languages)) {
      errors.required_languages = "لطفاً زبان‌های موردنیاز را وارد کنید.";
    }
  }

  if (step === 3) {
    if (values.acquisition_channels.length === 0) {
      errors.acquisition_channels = "لطفاً حداقل یک مسیر جذب مشتری انتخاب کنید.";
    }
    if (values.current_assets.length === 0) {
      errors.current_assets = "لطفاً وضعیت دارایی‌های فعلی را مشخص کنید.";
    }
  }

  if (step === 4) {
    if (!values.primary_business_problem) {
      errors.primary_business_problem = "لطفاً وضعیت فعلی کسب‌وکار را انتخاب کنید.";
    }
    const branch = getConfirmationBranch(values);
    const field = confirmationFieldForBranch(branch);
    if (field === "google_maps_status" && !values.google_maps_status) {
      errors.google_maps_status = "لطفاً وضعیت Google Maps را انتخاب کنید.";
    }
    if (field === "google_lead_status" && !values.google_lead_status) {
      errors.google_lead_status = "لطفاً وضعیت ورودی از گوگل را انتخاب کنید.";
    }
    if (field === "advertising_status" && !values.advertising_status) {
      errors.advertising_status = "لطفاً وضعیت تبلیغات را انتخاب کنید.";
    }
    if (field === "customer_guidance_need" && !values.customer_guidance_need) {
      errors.customer_guidance_need = "لطفاً نوع کمک موردنیاز مشتریان را انتخاب کنید.";
    }
    if (field === "lead_followup_status" && !values.lead_followup_status) {
      errors.lead_followup_status = "لطفاً نحوه پیگیری درخواست‌ها را انتخاب کنید.";
    }
  }

  if (step === 5) {
    if (!values.content_readiness) errors.content_readiness = "لطفاً وضعیت آمادگی محتوا را انتخاب کنید.";
    if (!trim(values.contact_name)) errors.contact_name = "لطفاً نام و نام خانوادگی را وارد کنید.";
    if (!normalizeBriefPhone(values.contact_phone)) {
      errors.contact_phone = "شماره موبایل یا واتساپ معتبر وارد کنید.";
    }
  }

  return errors;
}

export function buildSubmitPayload(values: BriefFormValues, submissionToken: string) {
  return {
    ...values,
    business_name: values.business_name.trim(),
    business_summary: values.business_summary.trim(),
    primary_location: values.primary_location.trim() || null,
    booking_type: values.booking_type || null,
    estimated_product_count: values.estimated_product_count || null,
    required_languages: values.required_languages.trim() || null,
    current_website_url: values.current_website_url.trim() || null,
    google_maps_status: values.google_maps_status || null,
    google_lead_status: values.google_lead_status || null,
    advertising_status: values.advertising_status || null,
    customer_guidance_need: values.customer_guidance_need || null,
    lead_followup_status: values.lead_followup_status || null,
    additional_notes: values.additional_notes.trim() || null,
    submission_token: submissionToken,
    source_page: "/website-design/brief",
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
    company: "",
    ...getUtmParams(),
  };
}

export type SubmitResult = {
  submissionId: string;
  recommendedService: string;
  recommendationMessage: string;
  recommendationReasonCode: string;
  serviceLabel: string;
};

export {
  acquisitionChannelOptions,
  advertisingStatusOptions,
  bookingTypeOptions,
  contentReadinessOptions,
  currentAssetOptions,
  customerGuidanceNeedOptions,
  customerScopeOptions,
  estimatedProductCountOptions,
  googleLeadStatusOptions,
  googleMapsStatusOptions,
  leadFollowupStatusOptions,
  primaryBusinessProblemOptions,
  primaryConversionGoalOptions,
  recommendedServiceLabels,
  requiredSectionOptions,
};
