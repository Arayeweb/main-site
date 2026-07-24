export const ANALYTICS_SCHEMA_VERSION = 1;

const EVENT_ALIASES: Record<string, string> = {
  cta_click: "cta_clicked",
  lead_submit: "lead_submitted",
  generate_lead: "lead_submitted",
  sign_up: "signup_completed",
  ai_signup_start: "signup_started",
  begin_checkout: "checkout_started",
  purchase: "purchase_completed",
  pkg_selected: "plan_selected",
  phone_click: "phone_clicked",
  whatsapp_click: "whatsapp_clicked",
  ai_first_message: "first_key_action_completed",
  ai_first_prompt: "first_key_action_completed",
  fastweb_wizard_preview: "first_key_action_completed",
  workspace_activated: "first_key_action_completed",
};

export type FunnelStage =
  | "awareness"
  | "engagement"
  | "intent"
  | "lead"
  | "activation"
  | "revenue"
  | "retention";

export function canonicalEventName(eventName: string): string {
  const normalized = eventName.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  if (EVENT_ALIASES[normalized]) return EVENT_ALIASES[normalized];
  if (normalized.endsWith("_cta_click")) return "cta_clicked";
  if (normalized.endsWith("_lead_submit") || normalized.endsWith("_form_submit")) {
    return "lead_submitted";
  }
  if (normalized.endsWith("_form_start")) return "form_started";
  if (normalized.endsWith("_pricing_view")) return "pricing_viewed";
  if (normalized.endsWith("_phone_click")) return "phone_clicked";
  if (normalized.endsWith("_whatsapp_click")) return "whatsapp_clicked";
  return normalized.slice(0, 120);
}

export function funnelStageForEvent(eventName: string): FunnelStage {
  const event = canonicalEventName(eventName);
  if (
    event.includes("purchase") ||
    event.includes("payment_success") ||
    event.includes("subscription")
  ) {
    return "revenue";
  }
  if (event.includes("lead") || event.includes("demo_requested") || event.includes("contact_submitted")) {
    return "lead";
  }
  if (
    event.includes("checkout") ||
    event.includes("plan_selected") ||
    event.includes("pricing") ||
    event.includes("form_started")
  ) {
    return "intent";
  }
  if (
    event.includes("signup_completed") ||
    event.includes("onboarding_completed") ||
    event.includes("first_") ||
    event.includes("activation")
  ) {
    return "activation";
  }
  if (
    event.includes("renew") ||
    event.includes("repeat") ||
    event.includes("referral") ||
    event.includes("invite")
  ) {
    return "retention";
  }
  if (
    event.includes("click") ||
    event.includes("scroll") ||
    event.includes("form") ||
    event.includes("tool_") ||
    event.includes("feature")
  ) {
    return "engagement";
  }
  return "awareness";
}

export function productAreaFromPath(pathname: string): string {
  const path = pathname.toLowerCase();
  if (path.startsWith("/ai")) return "ai";
  if (path.startsWith("/app/") || path === "/app") return "growth_hub";
  if (path.startsWith("/fastweb") || path.startsWith("/s/")) return "fastweb";
  if (path.startsWith("/adready") || path.startsWith("/campaign/")) return "adready";
  if (path.startsWith("/website")) return "website_design";
  if (path.startsWith("/seo") || path.startsWith("/free-seo-audit")) return "seo";
  if (path.startsWith("/doctors") || path.startsWith("/clinic") || path.startsWith("/demo")) {
    return "healthcare";
  }
  if (path.startsWith("/googlesabt") || path.startsWith("/local-seo-check")) return "local_seo";
  if (
    path.startsWith("/bizcard") ||
    path.startsWith("/b/") ||
    path.startsWith("/qr") ||
    path.startsWith("/shortener") ||
    path.startsWith("/review-link")
  ) {
    return "free_tools";
  }
  if (path.startsWith("/blog") || path.startsWith("/prompts")) return "content";
  if (path.startsWith("/modares")) return "education";
  if (path.startsWith("/dashboard")) return "customer_portal";
  return "marketing_site";
}

export function shouldTrackPath(pathname: string): boolean {
  return !(
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dev") ||
    pathname.startsWith("/sentry-test")
  );
}

export function safeElementText(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const text = value.replace(/\s+/g, " ").trim();
  return text ? text.slice(0, 100) : undefined;
}
