import { pushGtmEvent } from "@/lib/gtm";

export type FastWebCtaPosition = "hero" | "sample" | "pricing" | "final" | "sticky";

export type FastWebEventName =
  | "fastweb_industry_view"
  | "fastweb_cta_click"
  | "fastweb_sample_click"
  | "fastweb_form_start"
  | "fastweb_lead_submit"
  | "fastweb_advanced_project_click";

export function trackFastWebEvent(
  eventName: FastWebEventName,
  params: {
    page_path: string;
    industry: string;
    primary_keyword: string;
    cta_position: FastWebCtaPosition;
    offer: "fastweb";
  },
) {
  pushGtmEvent(eventName, {
    page_path: params.page_path,
    industry: params.industry,
    primary_keyword: params.primary_keyword,
    cta_position: params.cta_position,
    offer: params.offer,
    timestamp: Date.now(),
  });
}
