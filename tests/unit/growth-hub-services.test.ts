import { describe, expect, it } from "vitest";
import {
  canTransitionService,
  isTerminalServiceStatus,
  SERVICE_STATUS_LABELS_FA,
  MILESTONE_STATUS_LABELS_FA,
} from "@/lib/growth-hub/services/status";
import { calculateServiceProgress } from "@/lib/growth-hub/services/progress";
import {
  assertServiceTransition,
  createServiceFromTemplateSchema,
  updateMilestoneSchema,
  updateServiceSchema,
} from "@/lib/growth-hub/services/validation";

describe("Growth Hub services — status transitions", () => {
  it("allows documented transitions and rejects others", () => {
    expect(canTransitionService("starting", "active")).toBe(true);
    expect(canTransitionService("active", "waiting_on_client")).toBe(true);
    expect(canTransitionService("waiting_on_client", "in_progress")).toBe(true);
    expect(canTransitionService("completed", "active")).toBe(false);
    expect(canTransitionService("cancelled", "in_progress")).toBe(false);
    expect(assertServiceTransition("paused", "completed")).toBeTruthy();
    expect(assertServiceTransition("paused", "active")).toBeNull();
  });

  it("marks completed and cancelled as terminal", () => {
    expect(isTerminalServiceStatus("completed")).toBe(true);
    expect(isTerminalServiceStatus("cancelled")).toBe(true);
    expect(isTerminalServiceStatus("active")).toBe(false);
  });

  it("exposes stable Persian labels", () => {
    expect(SERVICE_STATUS_LABELS_FA.waiting_on_client).toBe("در انتظار شما");
    expect(SERVICE_STATUS_LABELS_FA.completed).toBe("تکمیل‌شده");
    expect(MILESTONE_STATUS_LABELS_FA.blocked).toBe("مسدود");
    expect(MILESTONE_STATUS_LABELS_FA.completed).toBe("انجام‌شده");
  });
});

describe("Growth Hub services — progress", () => {
  it("calculates floor(completed/total*100)", () => {
    expect(calculateServiceProgress([])).toBe(0);
    expect(
      calculateServiceProgress([
        { status: "completed" },
        { status: "pending" },
      ]),
    ).toBe(50);
    expect(
      calculateServiceProgress([
        { status: "completed" },
        { status: "completed" },
        { status: "pending" },
      ]),
    ).toBe(66);
    expect(
      calculateServiceProgress([
        { status: "completed" },
        { status: "completed" },
      ]),
    ).toBe(100);
  });
});

describe("Growth Hub services — validation schemas", () => {
  it("requires waiting_reason and next_action for waiting_on_client", () => {
    const bad = updateServiceSchema.safeParse({
      service_id: "00000000-0000-4000-8000-000000000001",
      expected_updated_at: "2026-01-01T00:00:00.000Z",
      status: "waiting_on_client",
      next_action: "",
      waiting_reason: "",
    });
    expect(bad.success).toBe(false);

    const good = updateServiceSchema.safeParse({
      service_id: "00000000-0000-4000-8000-000000000001",
      expected_updated_at: "2026-01-01T00:00:00.000Z",
      status: "waiting_on_client",
      next_action: "ارسال لوگو",
      waiting_reason: "منتظر فایل مشتری",
    });
    expect(good.success).toBe(true);
  });

  it("rejects completed services that still require a next action", () => {
    const bad = updateServiceSchema.safeParse({
      service_id: "00000000-0000-4000-8000-000000000001",
      expected_updated_at: "2026-01-01T00:00:00.000Z",
      status: "completed",
      next_action: "هنوز کاری هست",
    });
    expect(bad.success).toBe(false);
  });

  it("rejects due_date before start_date", () => {
    const bad = createServiceFromTemplateSchema.safeParse({
      workspace_id: "00000000-0000-4000-8000-000000000001",
      template_id: "00000000-0000-4000-8000-000000000002",
      title: "SEO ماهانه",
      start_date: "2026-05-10",
      due_date: "2026-05-01",
    });
    expect(bad.success).toBe(false);
  });

  it("validates milestone status updates", () => {
    expect(
      updateMilestoneSchema.safeParse({
        milestone_id: "00000000-0000-4000-8000-000000000003",
        service_id: "00000000-0000-4000-8000-000000000001",
        status: "completed",
      }).success,
    ).toBe(true);
    expect(
      updateMilestoneSchema.safeParse({
        milestone_id: "00000000-0000-4000-8000-000000000003",
        service_id: "00000000-0000-4000-8000-000000000001",
        status: "nope",
      }).success,
    ).toBe(false);
  });
});
