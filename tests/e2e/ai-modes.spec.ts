import { test, expect } from "@playwright/test";

test.describe("Araaye AI — workspace modes", () => {
  test("guest home shows mode tabs and model bar", async ({ page }) => {
    await page.goto("/ai");
    const tabs = page.getByRole("tablist", { name: "انتخاب حالت گفتگو" });
    await expect(tabs).toBeVisible();
    await expect(page.getByRole("tab", { name: "سریع" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "مقایسه" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /همفکری/ })).toBeVisible();
    await expect(page.getByRole("group", { name: "انتخاب مدل" })).toBeVisible();
  });

  test("?mode=battle selects council tab", async ({ page }) => {
    await page.goto("/ai?mode=battle");
    await expect(page.getByRole("tab", { name: /همفکری/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("?mode=direct selects fast tab", async ({ page }) => {
    await page.goto("/ai?mode=direct");
    await expect(page.getByRole("tab", { name: "سریع" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("guest compare mode opens login sheet", async ({ page }) => {
    await page.goto("/ai?mode=side_by_side");
    await page.getByRole("tab", { name: "مقایسه" }).click();
    await expect(page.getByRole("heading", { name: /ورود به آرایه AI/ })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("mode caption updates when switching tabs", async ({ page }) => {
    await page.goto("/ai?mode=direct");
    await expect(page.getByText("یک مدل، پاسخ فوری")).toBeVisible();
    await page.getByRole("tab", { name: /همفکری/ }).click();
    await expect(page.getByText(/چند مدل \+ نقد/)).toBeVisible();
  });

  test("studio chip prompts guest login", async ({ page }) => {
    await page.goto("/ai");
    await page
      .getByRole("navigation", { name: "ابزارها" })
      .getByRole("button", { name: "ساخت عکس" })
      .click();
    await expect(page.getByRole("heading", { name: /ورود به آرایه AI/ })).toBeVisible({
      timeout: 10_000,
    });
  });
});
