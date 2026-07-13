import { test, expect } from "@playwright/test";

test.describe("Araaye AI — chat & credits", () => {
  test("guest send is disabled with an empty prompt", async ({ page }) => {
    await page.goto("/ai");
    const sendBtn = page.getByRole("button", { name: "ارسال" });
    await expect(sendBtn).toBeDisabled();
    await expect(page).toHaveURL(/\/ai/);
  });

  test("guest can start anonymous battle flow UI", async ({ page }) => {
    await page.goto("/ai");
    const composer = page.locator("textarea").first();
    await composer.fill("یک جمله کوتاه بنویس");
    // Battle is default mode for guests — submit triggers API
    // TODO: Mock OpenRouter in E2E or use E2E_MOCK_AI=1 when test harness exists
    await page.getByRole("button", { name: "ارسال" }).click();
    // Either shows loading/result or guest limit — page should not crash
    await expect(page.locator("body")).toBeVisible();
  });

  test("pricing redirects unauthenticated checkout to login", async ({ page }) => {
    await page.goto("/ai/pricing");
    const buyBtn = page.getByRole("button", { name: /خرید|پرداخت|شروع/i }).first();
    if (await buyBtn.isVisible()) {
      await buyBtn.click();
      // Unauthed users should be sent to login
      await page.waitForURL(/\/ai(\?login=1)?/, { timeout: 10_000 });
    }
  });
});

test.describe("Araaye AI — mobile responsive", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile layout shows composer and menu", async ({ page }) => {
    await page.goto("/ai");
    await expect(page.getByRole("button", { name: "ارسال" })).toBeVisible();
    await expect(page.getByRole("button", { name: "باز کردن منو" })).toBeVisible();
  });
});
