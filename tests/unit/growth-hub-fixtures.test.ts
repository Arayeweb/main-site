import { afterEach, describe, expect, it, vi } from "vitest";
import GrowthHubDevPreview from "@/app/dev/growth-hub/page";
import {
  growthHubHomeFixtures,
  growthHubScenarioOptions,
} from "@/lib/growth-hub/fixtures/home";

describe("Growth Hub Sprint 1A fixtures", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defines all ten approved scenarios", () => {
    expect(growthHubScenarioOptions).toHaveLength(10);
    expect(Object.keys(growthHubHomeFixtures)).toEqual(
      expect.arrayContaining([
        "healthy",
        "action-required",
        "website-in-progress",
        "website-completed",
        "seo-insufficient-data",
        "new-customer",
        "overdue-invoice",
        "growth-opportunity",
        "loading",
        "error",
      ]),
    );
  });

  it("provides three or four complete KPIs for normal populated state", () => {
    const metrics = growthHubHomeFixtures.healthy.metrics;
    expect(metrics.length).toBeGreaterThanOrEqual(3);
    expect(metrics.length).toBeLessThanOrEqual(4);

    for (const metric of metrics) {
      expect(metric.label).toBeTruthy();
      expect(metric.value).toBeTruthy();
      expect(metric.context).toBeTruthy();
      expect(metric.interpretation).toBeTruthy();
      expect(metric.source).toBeTruthy();
    }
  });

  it("uses partial metrics without inventing values for no-data states", () => {
    expect(
      growthHubHomeFixtures["seo-insufficient-data"].metrics,
    ).toHaveLength(2);
    expect(growthHubHomeFixtures["new-customer"].metrics).toHaveLength(0);
    expect(
      growthHubHomeFixtures["new-customer"].metricsEmptyMessage,
    ).toBeTruthy();
  });

  it("returns not found when the preview is evaluated in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(() =>
      GrowthHubDevPreview({ searchParams: { scenario: "healthy" } }),
    ).toThrowError(/NEXT_NOT_FOUND/);
  });
});
