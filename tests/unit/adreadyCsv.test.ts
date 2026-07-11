import { describe, expect, it } from "vitest";
import {
  buildLeadsCsv,
  canExportLeads,
  escapeCsvCell,
} from "@/lib/adreadyCsv";
import type { CampaignLead } from "@/lib/adready";

describe("adreadyCsv", () => {
  it("escapes formula injection prefixes", () => {
    expect(escapeCsvCell("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(escapeCsvCell("+123")).toBe("'+123");
    expect(escapeCsvCell("-formula")).toBe("'-formula");
    expect(escapeCsvCell("@cmd")).toBe("'@cmd");
  });

  it("quotes cells with commas", () => {
    expect(escapeCsvCell("hello, world")).toBe('"hello, world"');
  });

  it("gates export by plan", () => {
    expect(canExportLeads("free")).toBe(false);
    expect(canExportLeads("starter")).toBe(false);
    expect(canExportLeads("pro")).toBe(true);
    expect(canExportLeads("business")).toBe(true);
  });

  it("builds UTF-8 CSV with BOM", () => {
    const lead: CampaignLead = {
      id: "lead-1",
      campaignPageId: "page-1",
      userId: "user-1",
      fullName: "علی",
      phone: "09123456789",
      email: null,
      message: "سلام",
      utmSource: "instagram",
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      referrer: null,
      pagePath: "/campaign/demo",
      status: "new",
      createdAt: "2026-07-09T12:00:00.000Z",
      updatedAt: "2026-07-09T12:00:00.000Z",
    };
    const csv = buildLeadsCsv([lead]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("09123456789");
    expect(csv).toContain("instagram");
  });
});
