/**
 * SEO funnel event catalog for doctors + AI clusters.
 * Stable backlog names map onto existing GTM/PostHog event strings.
 */

export type FunnelStage =
  | "awareness"
  | "consideration"
  | "intent"
  | "conversion"
  | "activation"
  | "revenue";

export type SeoFunnelEventDef = {
  /** Stable name from SEO backlog */
  backlogName: string;
  /** Actual event string fired to GTM / analytics */
  implementedAs: string;
  trigger: string;
  properties: string[];
  urls: string[];
  funnelStage: FunnelStage;
  isConversion: boolean;
};

export const SEO_FUNNEL_EVENTS: SeoFunnelEventDef[] = [
  // Doctors
  {
    backlogName: "doctor_page_view",
    implementedAs: "doctors_page_view",
    trigger: "Mount of /doctors (and specialty pages that share DoctorsPageAnalytics)",
    properties: ["page", "utm_source", "utm_medium", "utm_campaign", "referrer"],
    urls: ["/doctors", "/doctors/dentist", "/doctors/audit"],
    funnelStage: "awareness",
    isConversion: false,
  },
  {
    backlogName: "doctor_cta_click",
    implementedAs: "doctors_hero_cta_click",
    trigger: "Primary CTA click (hero, header, sticky, exit intent, ROI)",
    properties: ["page", "source"],
    urls: ["/doctors"],
    funnelStage: "intent",
    isConversion: false,
  },
  {
    backlogName: "doctor_example_click",
    implementedAs: "doctors_example_click",
    trigger: "Click on sample/demo/live project cards",
    properties: ["page", "source", "sample_id", "kind"],
    urls: ["/doctors"],
    funnelStage: "consideration",
    isConversion: false,
  },
  {
    backlogName: "doctor_price_view",
    implementedAs: "doctors_pricing_view",
    trigger: "Pricing section enters viewport",
    properties: ["page", "source"],
    urls: ["/doctors"],
    funnelStage: "consideration",
    isConversion: false,
  },
  {
    backlogName: "doctor_whatsapp_click",
    implementedAs: "doctors_whatsapp_click",
    trigger: "WhatsApp CTA click",
    properties: ["page", "source"],
    urls: ["/doctors"],
    funnelStage: "intent",
    isConversion: false,
  },
  {
    backlogName: "doctor_call_click",
    implementedAs: "doctors_phone_click",
    trigger: "Phone link click",
    properties: ["page", "source"],
    urls: ["/doctors"],
    funnelStage: "intent",
    isConversion: false,
  },
  {
    backlogName: "doctor_form_start",
    implementedAs: "doctors_form_start",
    trigger: "Lead form first interaction / focus",
    properties: ["page", "source"],
    urls: ["/doctors"],
    funnelStage: "intent",
    isConversion: false,
  },
  {
    backlogName: "doctor_lead_submit",
    implementedAs: "doctors_form_submit",
    trigger: "Successful lead form submit (also generate_lead where applicable)",
    properties: ["page", "source", "primary_goal", "current_presence"],
    urls: ["/doctors"],
    funnelStage: "conversion",
    isConversion: true,
  },
  // AI
  {
    backlogName: "ai_page_view",
    implementedAs: "ai_landing_view",
    trigger: "AI landing / section page view",
    properties: ["page", "landing_type"],
    urls: ["/ai"],
    funnelStage: "awareness",
    isConversion: false,
  },
  {
    backlogName: "ai_start_click",
    implementedAs: "ai_landing_primary_cta",
    trigger: "Primary CTA on AI landing",
    properties: ["page", "cta"],
    urls: ["/ai"],
    funnelStage: "intent",
    isConversion: false,
  },
  {
    backlogName: "ai_signup",
    implementedAs: "sign_up",
    trigger: "Successful AI signup (also ai_signup_start for start)",
    properties: ["page", "method"],
    urls: ["/ai"],
    funnelStage: "conversion",
    isConversion: true,
  },
  {
    backlogName: "ai_first_prompt",
    implementedAs: "ai_first_message",
    trigger: "First user prompt in AI product",
    properties: ["page", "model"],
    urls: ["/ai"],
    funnelStage: "activation",
    isConversion: true,
  },
  {
    backlogName: "ai_compare_start",
    implementedAs: "ai_compare_demo_interaction",
    trigger: "First interaction with compare UI (action=start or first prompt)",
    properties: ["page", "action", "models"],
    urls: ["/ai/compare"],
    funnelStage: "consideration",
    isConversion: false,
  },
  {
    backlogName: "ai_compare_complete",
    implementedAs: "ai_compare_demo_interaction",
    trigger: "Compare run completed (action=complete)",
    properties: ["page", "action", "models"],
    urls: ["/ai/compare"],
    funnelStage: "intent",
    isConversion: false,
  },
  {
    backlogName: "ai_pricing_view",
    implementedAs: "begin_checkout",
    trigger: "Pricing / checkout start view",
    properties: ["page", "plan"],
    urls: ["/ai/pricing"],
    funnelStage: "intent",
    isConversion: false,
  },
  {
    backlogName: "ai_purchase",
    implementedAs: "purchase",
    trigger: "Successful AI credit/plan purchase",
    properties: ["page", "value", "currency", "plan"],
    urls: ["/ai/pricing"],
    funnelStage: "revenue",
    isConversion: true,
  },
  // Blog hubs
  {
    backlogName: "blog_cluster_view",
    implementedAs: "blog_cluster_view",
    trigger: "Mount of /blog/doctors or /blog/ai",
    properties: ["page", "cluster"],
    urls: ["/blog/doctors", "/blog/ai"],
    funnelStage: "awareness",
    isConversion: false,
  },
];

export function getFunnelEventByBacklogName(name: string): SeoFunnelEventDef | undefined {
  return SEO_FUNNEL_EVENTS.find((e) => e.backlogName === name);
}

export function resolveImplementedEvent(backlogName: string): string {
  return getFunnelEventByBacklogName(backlogName)?.implementedAs ?? backlogName;
}
