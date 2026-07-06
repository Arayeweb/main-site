import { test, expect } from "@playwright/test";
import { navTo, openSideNav } from "./helpers/aiPage";

test.describe("Araaye AI — shell navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ai");
  });

  test("sidebar links reach studios and personas", async ({ page }) => {
    await navTo(page, "ساخت عکس");
    await expect(page).toHaveURL(/\/ai\/image/);
    await expect(page.getByRole("heading", { name: "استودیو تصویر" })).toBeVisible();

    await page.goto("/ai");
    await navTo(page, /ساخت ویدیو/);
    await expect(page).toHaveURL(/\/ai\/video/);

    await page.goto("/ai");
    await navTo(page, "موزیک");
    await expect(page).toHaveURL(/\/ai\/music/);

    await page.goto("/ai");
    await navTo(page, "شخصیت‌ها");
    await expect(page).toHaveURL(/\/ai\/personas/);

    await page.goto("/ai");
    await navTo(page, "لیدربورد مدل‌ها");
    await expect(page).toHaveURL(/\/ai\/leaderboard/);
  });

  test("features page CTA returns to chat", async ({ page }) => {
    await page.goto("/ai/features");
    await page.getByRole("link", { name: "شروع چت" }).click();
    await expect(page).toHaveURL(/\/ai\/?$/);
    await expect(page.getByRole("button", { name: "ارسال" })).toBeVisible();
  });

  test("persona gallery opens chat for first persona", async ({ page }) => {
    await page.goto("/ai/personas");
    await page.locator("a.ar-persona-card").first().click();
    await expect(page).toHaveURL(/\/ai\/personas\/[^/]+/);
    await expect(page.locator("textarea").first()).toBeVisible();
  });

  test("skip link targets main content", async ({ page }) => {
    await openSideNav(page);
    const skip = page.getByRole("link", { name: "رفتن به محتوای اصلی" });
    await expect(skip).toHaveAttribute("href", "#ar-main-content");
  });
});
