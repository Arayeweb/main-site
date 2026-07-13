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

    await openSideNav(page);
    const videoItem = page
      .locator(".ar-side-nav-item--disabled", { hasText: "ساخت ویدیو" })
      .last();
    await expect(videoItem).toBeVisible();
    await expect(videoItem.locator(".ar-side-soon")).toHaveText("به‌زودی");

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
    const cta = page.getByRole("link", { name: "رایگان امتحان کنید" }).first();
    await expect(cta).toHaveAttribute("href", "/ai");
    await page.goto((await cta.getAttribute("href"))!);
    await expect(page).toHaveURL(/\/ai\/?$/);
    await expect(page.getByRole("button", { name: "ارسال" })).toBeVisible();
  });

  test("persona gallery opens chat for first persona", async ({ page }) => {
    await page.goto("/ai/personas");
    const persona = page.locator("a.ar-persona-card").first();
    const href = await persona.getAttribute("href");
    expect(href).toMatch(/^\/ai\/personas\/[^/]+$/);
    await page.goto(href!);
    await expect(page).toHaveURL(/\/ai\/personas\/[^/]+/);
    await expect(page.locator("textarea").first()).toBeVisible();
  });

  test("skip link targets main content", async ({ page }) => {
    await openSideNav(page);
    const skip = page.getByRole("link", { name: "رفتن به محتوای اصلی" });
    await expect(skip).toHaveAttribute("href", "#ar-main-content");
  });
});
