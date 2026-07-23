/**
 * Website-design marketing analytics — event names, funnel stages, and helpers.
 * Decisions these events inform: which CTA converts, FastWeb vs custom split, form drop-off.
 */

import { pushGtmEvent } from "@/lib/gtm";
import {
  trackWebsiteSeoEvent,
  type WebsiteSeoCtaPosition,
  type WebsiteSeoOffer,
  type WebsiteSeoPageType,
} from "@/lib/analytics/websiteSeoEvents";

export const WEBSITE_DESIGN_FUNNEL = [
  "hub_view",
  "pricing_view",
  "cta_click",
  "form_start",
  "lead_submit",
] as const;

export type WebsiteDesignFunnelStage = (typeof WEBSITE_DESIGN_FUNNEL)[number];

/** Canonical tracking plan for GTM/GA4 (object_action naming). */
export const WEBSITE_DESIGN_TRACKING_PLAN = [
  {
    event: "website_hub_view",
    stage: "hub_view",
    trigger: "Hub /website-design mounts",
    decisions: "Organic vs paid quality; bounce after AI SEO landing",
  },
  {
    event: "website_pricing_view",
    stage: "pricing_view",
    trigger: "/website-design/cost mounts",
    decisions: "Whether price page is a conversion bottleneck",
  },
  {
    event: "website_cta_click",
    stage: "cta_click",
    trigger: "Primary/secondary CTA click",
    decisions: "Which CTA copy/location wins",
  },
  {
    event: "website_offer_click",
    stage: "cta_click",
    trigger: "FastWeb vs custom offer CTA on cost/hub",
    decisions: "Path split FastWeb vs custom",
  },
  {
    event: "website_estimate_open",
    stage: "cta_click",
    trigger: "Pricing card estimate modal opens",
    decisions: "Which package is most considered",
  },
  {
    event: "website_form_start",
    stage: "form_start",
    trigger: "First focus on lead form field",
    decisions: "Form friction / intent quality",
  },
  {
    event: "website_lead_submit",
    stage: "lead_submit",
    trigger: "Lead form success",
    decisions: "Primary conversion rate",
  },
  {
    event: "website_scroll_depth",
    stage: "hub_view",
    trigger: "Scroll hits 25/50/75/100%",
    decisions: "Where users drop before form",
  },
] as const;

export function trackWebsiteDesignHubView() {
  trackWebsiteSeoEvent("website_hub_view", {
    page_path: "/website-design",
    page_type: "hub",
    primary_keyword: "طراحی سایت",
    offer: "both",
    cta_position: "hero",
  });
}

export function trackWebsiteDesignCtaClick(params: {
  button_text: string;
  cta_position: WebsiteSeoCtaPosition;
  offer?: WebsiteSeoOffer;
  page_path?: string;
  page_type?: WebsiteSeoPageType;
}) {
  trackWebsiteSeoEvent("website_cta_click", {
    page_path: params.page_path ?? "/website-design",
    page_type: params.page_type ?? "hub",
    primary_keyword: "طراحی سایت",
    offer: params.offer ?? "custom",
    cta_position: params.cta_position,
  });
  pushGtmEvent("website_design_cta_click", {
    button_text: params.button_text,
    cta_position: params.cta_position,
    offer: params.offer ?? "custom",
    page: params.page_path ?? "/website-design",
    timestamp: Date.now(),
  });
}

export function trackWebsiteDesignOfferClick(params: {
  offer: WebsiteSeoOffer;
  offer_id: string;
  location: string;
  page_path?: string;
}) {
  trackWebsiteSeoEvent("website_offer_click", {
    page_path: params.page_path ?? "/website-design/cost",
    page_type: "pricing",
    primary_keyword: "قیمت طراحی سایت",
    offer: params.offer,
    cta_position: "pricing",
  });
  pushGtmEvent("website_design_offer_click", {
    offer: params.offer,
    offer_id: params.offer_id,
    location: params.location,
    page: params.page_path ?? "/website-design/cost",
    timestamp: Date.now(),
  });
}

export function trackWebsiteDesignScrollDepth(depth: 25 | 50 | 75 | 100, page_path: string) {
  trackWebsiteSeoEvent("website_scroll_depth", {
    page_path,
    page_type: page_path.includes("/cost") ? "pricing" : "hub",
    primary_keyword: page_path.includes("/cost") ? "قیمت طراحی سایت" : "طراحی سایت",
    offer: "both",
    cta_position: "middle",
    depth,
  });
  pushGtmEvent("website_design_scroll_depth", {
    depth,
    page: page_path,
    timestamp: Date.now(),
  });
}
