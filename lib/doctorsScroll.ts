export const DOCTORS_AUDIT_PREFILL_EVENT = "araaye:doctors-audit-prefill";

export function scrollToDoctorsAuditForm() {
  if (typeof window === "undefined") return;
  document.getElementById("audit")?.scrollIntoView({ behavior: "smooth", block: "center" });
}
