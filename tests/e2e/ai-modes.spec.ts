import { test, expect } from "@playwright/test";
import { navTo } from "./helpers/aiPage";

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

  test("guest can preview compare mode before sending", async ({ page }) => {
    await page.goto("/ai?mode=side_by_side");
    await expect(page.getByRole("tab", { name: "مقایسه" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(page.getByRole("button", { name: /DeepSeek Chat V3\.1/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Grok 4\.3/ })).toBeVisible();
  });

  test("locked council mode asks a guest to sign in", async ({ page }) => {
    await page.goto("/ai?mode=direct");
    const council = page.getByRole("tab", { name: /همفکری/ });
    await council.click();
    await expect(council).toHaveAttribute("aria-selected", "false");
    await expect(page.getByRole("heading", { name: /ورود به آرایه AI/ })).toBeVisible();
  });

  test("studio navigation opens the image studio", async ({ page }) => {
    await page.goto("/ai");
    await navTo(page, "ساخت عکس");
    await expect(page).toHaveURL(/\/ai\/image/);
    await expect(page.getByRole("heading", { name: "استودیو تصویر" })).toBeVisible();
  });
});
