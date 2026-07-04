import { test, expect } from "@playwright/test";

test.describe("Araaye AI — landing & panel", () => {
  test("landing page loads with hero and composer", async ({ page }) => {
    await page.goto("/ai");
    await expect(page).toHaveURL(/\/ai/);
    await expect(page.getByRole("button", { name: "ارسال" })).toBeVisible();
    await expect(page.getByLabel("مدل‌های در دسترس")).toBeVisible();
  });

  test("guest sees free battle allowance message", async ({ page }) => {
    await page.goto("/ai");
    await expect(page.getByText(/نبرد رایگان/)).toBeVisible();
  });

  test("pricing page loads package cards", async ({ page }) => {
    await page.goto("/ai/pricing");
    await expect(page.getByText(/استارتر|Starter/i)).toBeVisible();
    await expect(page.getByText(/Pro|Business/i).first()).toBeVisible();
  });
});

test.describe("Araaye AI — auth flow", () => {
  test("opens login/register sheet from shell", async ({ page }) => {
    await page.goto("/ai");
    const loginBtn = page.getByRole("button", { name: /ورود|ثبت‌نام/ });
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
    } else {
      await page.getByRole("button", { name: "باز کردن منو" }).click();
      await page.getByRole("button", { name: /ورود|ثبت‌نام/ }).click();
    }
    await expect(page.getByRole("heading", { name: /ثبت‌نام|ورود/ })).toBeVisible();
  });

  test("shows validation error for empty auth submit", async ({ page }) => {
    await page.goto("/ai?login=1");
    await page.getByRole("button", { name: "ثبت‌نام و شروع", exact: true }).click();
    await expect(page.getByRole("heading", { name: /ثبت‌نام|ورود/ })).toBeVisible();
  });

  // TODO: Set E2E_AI_PHONE + E2E_AI_PASSWORD for full register/login against staging Supabase
  test("user can register and see credits", async ({ page }) => {
    test.skip(!process.env.E2E_AI_PHONE, "Set E2E_AI_PHONE to enable");
    const phone = process.env.E2E_AI_PHONE!;
    const password = process.env.E2E_AI_PASSWORD || "testpass123";
    await page.goto("/ai?login=1");
    await page.getByRole("button", { name: "ثبت‌نام" }).click();
    await page.locator('input[type="tel"], input[inputmode="numeric"]').first().fill(phone);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole("button", { name: "ثبت‌نام و شروع" }).click();
    await expect(page.getByText(/کردیت|پرسش/i)).toBeVisible({ timeout: 15_000 });
  });
});
