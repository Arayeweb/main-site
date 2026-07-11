import type { CampaignLead, CampaignPlan } from "@/lib/adready";
import { isAdReadyPlanExportAllowed } from "@/lib/adready";

export function canExportLeads(plan: CampaignPlan | string): boolean {
  return isAdReadyPlanExportAllowed(plan);
}

export function escapeCsvCell(value: string): string {
  const normalized = value.replace(/\r?\n/g, " ").trim();
  const escaped =
    normalized.includes(",") || normalized.includes('"')
      ? `"${normalized.replace(/"/g, '""')}"`
      : normalized;
  if (/^[=+\-@]/.test(escaped)) {
    return `'${escaped}`;
  }
  return escaped;
}

export function buildLeadsCsv(leads: CampaignLead[]): string {
  const headers = [
    "fullName",
    "phone",
    "message",
    "status",
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "utmContent",
    "utmTerm",
    "createdAt",
  ];

  const rows = leads.map((lead) =>
    [
      lead.fullName,
      lead.phone,
      lead.message || "",
      lead.status,
      lead.utmSource || "",
      lead.utmMedium || "",
      lead.utmCampaign || "",
      lead.utmContent || "",
      lead.utmTerm || "",
      lead.createdAt,
    ]
      .map(escapeCsvCell)
      .join(",")
  );

  return `\uFEFF${headers.join(",")}\n${rows.join("\n")}`;
}
