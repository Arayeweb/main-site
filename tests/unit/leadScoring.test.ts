import { describe, expect, it } from "vitest";
import {
  AUTO_QUALIFIED_THRESHOLD,
  crmStatusTimestamps,
  isConfirmedQualifiedStatus,
  scoreLeadFromPayload,
} from "@/lib/leadScoring";

describe("leadScoring", () => {
  it("scores hot leads with plan and contact", () => {
    const { score, isAutoQualified } = scoreLeadFromPayload({
      name: "علی",
      contact: "09121234567",
      plan: "pro",
      source: "fastweb_wizard",
    });
    expect(score).toBeGreaterThanOrEqual(AUTO_QUALIFIED_THRESHOLD);
    expect(isAutoQualified).toBe(true);
  });

  it("does not auto-qualify minimal leads", () => {
    const { isAutoQualified } = scoreLeadFromPayload({
      contact: "09121234567",
      source: "hero_form",
    });
    expect(isAutoQualified).toBe(false);
  });

  it("boosts free-tool report leads toward qualification", () => {
    const { score, isAutoQualified } = scoreLeadFromPayload({
      contact: "09121234567",
      plan: "seo_roi",
      source: "free-tool-seo_roi",
      goal: "free_tool_report",
      intent: "doctor",
      detail: "roi=120 | breakEvenLeads=8 | monthlyLeads=20 | seoCost=15000000",
    });
    expect(score).toBeGreaterThanOrEqual(AUTO_QUALIFIED_THRESHOLD);
    expect(isAutoQualified).toBe(true);
  });

  it("confirms qualified CRM statuses", () => {
    expect(isConfirmedQualifiedStatus("qualified")).toBe(true);
    expect(isConfirmedQualifiedStatus("new")).toBe(false);
  });

  it("sets qualified_at and won_at on status transitions", () => {
    const q = crmStatusTimestamps("qualified");
    expect(q.qualified_at).toBeTruthy();

    const w = crmStatusTimestamps("won");
    expect(w.qualified_at).toBeTruthy();
    expect(w.won_at).toBeTruthy();
  });
});
