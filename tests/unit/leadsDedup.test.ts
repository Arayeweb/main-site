import { describe, expect, it } from "vitest";
import {
  hasRecentTeachersLead,
  isTeachersCampaignLead,
  TEACHERS_LEAD_CHANNEL,
  TEACHERS_LEAD_GOAL,
} from "@/lib/leadsDedup";

describe("leadsDedup", () => {
  const now = new Date("2026-07-15T12:00:00.000Z").getTime();

  it("identifies teachers campaign leads", () => {
    expect(isTeachersCampaignLead(TEACHERS_LEAD_CHANNEL, TEACHERS_LEAD_GOAL)).toBe(true);
    expect(isTeachersCampaignLead("doctors_landing", "clinic_audit")).toBe(false);
  });

  it("detects recent duplicate teachers leads by phone", () => {
    const rows = [
      {
        contact: "09123456789",
        channel: TEACHERS_LEAD_CHANNEL,
        goal: TEACHERS_LEAD_GOAL,
        created_at: new Date(now - 5 * 60 * 1000).toISOString(),
      },
    ];

    expect(hasRecentTeachersLead(rows, "09123456789", now)).toBe(true);
    expect(hasRecentTeachersLead(rows, "09999999999", now)).toBe(false);
  });

  it("ignores older teachers leads outside the dedup window", () => {
    const rows = [
      {
        contact: "09123456789",
        channel: TEACHERS_LEAD_CHANNEL,
        goal: TEACHERS_LEAD_GOAL,
        created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    expect(hasRecentTeachersLead(rows, "09123456789", now)).toBe(false);
  });
});
