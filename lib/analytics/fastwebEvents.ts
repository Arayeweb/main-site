import { pushGtmEvent } from "@/lib/gtm";

export type FastWebCtaPosition = "hero" | "sample" | "pricing" | "final" | "sticky" | "related";

export type FastWebPageType =
  | "hub"
  | "industry"
  | "example"
  | "pricing"
  | "wizard"
  | "guide"
  | "decision";

export type FastWebEventName =
  | "fastweb_page_view"
  | "fastweb_industry_view"
  | "fastweb_industry_page_view"
  | "fastweb_example_view"
  | "fastweb_pricing_view"
  | "fastweb_cta_click"
  | "fastweb_primary_cta_click"
  | "fastweb_secondary_cta_click"
  | "fastweb_sample_click"
  | "fastweb_industry_select"
  | "fastweb_order_start"
  | "fastweb_form_start"
  | "fastweb_lead_submit"
  | "fastweb_qualified_lead"
  | "fastweb_advanced_project_click";

export type FastWebEventParams = {
  page_path: string;
  industry?: string;
  primary_keyword?: string;
  cta_position?: FastWebCtaPosition;
  offer?: "fastweb";
  page_type?: FastWebPageType;
  source?: string;
  example_slug?: string;
  package?: string;
};

export function trackFastWebEvent(eventName: FastWebEventName, params: FastWebEventParams) {
  pushGtmEvent(eventName, {
    page_path: params.page_path,
    industry: params.industry,
    primary_keyword: params.primary_keyword,
    cta_position: params.cta_position,
    offer: params.offer ?? "fastweb",
    page_type: params.page_type,
    source: params.source,
    example_slug: params.example_slug,
    package: params.package,
    timestamp: Date.now(),
  });
}
