export const SEO_PLAN_SELECT_EVENT = "araaye:seo-select-plan";
export const SEO_AUDIT_PREFILL_EVENT = "araaye:seo-audit-prefill";

export function selectSeoPlan(plan: string, source?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SEO_PLAN_SELECT_EVENT, { detail: { plan, source } })
  );
}

export function scrollToSeoLeadForm() {
  if (typeof window === "undefined") return;
  document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function scrollToSeoAuditForm() {
  if (typeof window === "undefined") return;
  document.getElementById("audit-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
}
