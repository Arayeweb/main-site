export const AUTO_QUALIFIED_THRESHOLD = 70;

export type LeadScoreInput = {
  name?: string | null;
  contact?: string | null;
  budget?: string | null;
  plan?: string | null;
  source?: string | null;
  goal?: string | null;
  intent?: string | null;
  detail?: string | null;
  channel?: string | null;
};

/** امتیاز لید برای اولویت‌بندی فروش (North Star = crm_status تأییدشده). */
export function scoreLeadFromPayload(input: LeadScoreInput): {
  score: number;
  isAutoQualified: boolean;
} {
  let score = 0;
  const source = (input.source || "").toLowerCase();

  if (input.name?.trim() && input.contact?.trim()) score += 20;
  if (input.budget?.trim() || input.plan?.trim()) score += 30;

  if (
    source.includes("checkout") ||
    source.includes("payment") ||
    source.includes("begin_checkout")
  ) {
    score += 40;
  }
  if (source.startsWith("fastweb")) score += 50;
  if (
    source.includes("doctors_audit") ||
    source.includes("doctors_direct_sale") ||
    source.includes("seo_audit") ||
    source.includes("free_seo_audit")
  ) {
    score += 35;
  }
  if ((input.goal || "").toLowerCase() === "medical_website_quote") score += 20;
  if (input.goal?.trim() && input.intent?.trim()) score += 15;
  if (input.detail && input.detail.length > 80) score += 10;

  return {
    score,
    isAutoQualified: score >= AUTO_QUALIFIED_THRESHOLD,
  };
}

export function isConfirmedQualifiedStatus(status: string | null | undefined): boolean {
  return status === "qualified" || status === "proposal" || status === "won";
}

export function crmStatusTimestamps(
  status: string,
  existing?: { qualified_at?: string | null; won_at?: string | null }
): { qualified_at?: string; won_at?: string } {
  const now = new Date().toISOString();
  const patch: { qualified_at?: string; won_at?: string } = {};

  if (status === "qualified" && !existing?.qualified_at) {
    patch.qualified_at = now;
  }
  if (status === "proposal" && !existing?.qualified_at) {
    patch.qualified_at = now;
  }
  if (status === "won") {
    if (!existing?.qualified_at) patch.qualified_at = now;
    if (!existing?.won_at) patch.won_at = now;
  }

  return patch;
}
