import { test, expect } from "@playwright/test";

test.describe("Admin AI Ops panel", () => {
  test("redirects unauthenticated users to the internal access gate", async ({ page }) => {
    await page.goto("/admin/ai-ops/users");
    await page.waitForURL(/\/admin\/gate\?next=/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "دسترسی داخلی" })).toBeVisible();
  });

  // TODO: Set E2E_ADMIN_PASSWORD for full admin E2E against staging DB
  test("admin can view users page", async ({ page }) => {
    test.skip(!process.env.E2E_ADMIN_PASSWORD, "Set E2E_ADMIN_PASSWORD to enable");
    await page.goto("/admin/login");
    await page.locator('input[type="email"], input[name="email"]').fill(
      process.env.E2E_ADMIN_EMAIL || "admin@araaye.com"
    );
    await page.locator('input[type="password"]').fill(process.env.E2E_ADMIN_PASSWORD!);
    await page.getByRole("button", { name: /ورود|login/i }).click();
    await page.goto("/admin/ai-ops/users");
    await expect(page.getByText(/کاربر|users/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
