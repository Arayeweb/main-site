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
  | "website_pricing_view"
  | "website_hub_view"
  | "website_offer_click"
  | "website_estimate_open"
  | "website_scroll_depth";

export function trackWebsiteSeoEvent(
  eventName: WebsiteSeoEventName,
  params: {
    page_path: string;
    page_type: WebsiteSeoPageType;
    industry?: string;
    primary_keyword: string;
    offer: WebsiteSeoOffer;
    cta_position: WebsiteSeoCtaPosition;
    depth?: number;
    offer_id?: string;
    button_text?: string;
  },
) {
  pushGtmEvent(eventName, {
    page_path: params.page_path,
    page_type: params.page_type,
    primary_keyword: params.primary_keyword,
    offer: params.offer,
    cta_position: params.cta_position,
    ...(params.industry ? { industry: params.industry } : {}),
    ...(typeof params.depth === "number" ? { depth: params.depth } : {}),
    ...(params.offer_id ? { offer_id: params.offer_id } : {}),
    ...(params.button_text ? { button_text: params.button_text } : {}),
    timestamp: Date.now(),
  });
}
