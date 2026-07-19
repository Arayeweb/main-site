import { pushGtmEvent } from "@/lib/gtm";

export type WebsiteSeoPageType = "hub" | "pricing" | "fastweb" | "industry" | "blog";
export type WebsiteSeoOffer = "fastweb" | "custom" | "both";
export type WebsiteSeoCtaPosition = "hero" | "middle" | "pricing" | "final" | "sticky";

export type WebsiteSeoEventName =
  | "website_cta_view"
  | "website_cta_click"
  | "website_form_start"
  | "website_lead_submit"
  | "website_phone_click"
  | "website_whatsapp_click"
  | "website_sample_click"
  | "website_pricing_view";

export function trackWebsiteSeoEvent(
  eventName: WebsiteSeoEventName,
  params: {
    page_path: string;
    page_type: WebsiteSeoPageType;
    industry?: string;
    primary_keyword: string;
    offer: WebsiteSeoOffer;
    cta_position: WebsiteSeoCtaPosition;
  },
) {
  pushGtmEvent(eventName, {
    page_path: params.page_path,
    page_type: params.page_type,
    primary_keyword: params.primary_keyword,
    offer: params.offer,
    cta_position: params.cta_position,
    ...(params.industry ? { industry: params.industry } : {}),
    timestamp: Date.now(),
  });
}
