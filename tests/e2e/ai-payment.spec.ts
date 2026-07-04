import { test, expect } from "@playwright/test";

test.describe("Araaye AI — payment redirects", () => {
  test("verify callback without trackId redirects to pricing error", async ({ request }) => {
    const res = await request.get("/api/ai/verify", { maxRedirects: 0 });
    expect(res.status()).toBeGreaterThanOrEqual(300);
    expect(res.status()).toBeLessThan(400);
    const location = res.headers()["location"] || "";
    expect(location).toContain("payment=error");
  });

  test("pricing page shows payment status query params", async ({ page }) => {
    await page.goto("/ai/pricing?payment=failed");
    await expect(page.getByText(/ناموفق|failed|خطا/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});

// TODO: Full payment E2E with Zibal sandbox requires E2E_ZIBAL_SANDBOX=1 and test merchant credentials
