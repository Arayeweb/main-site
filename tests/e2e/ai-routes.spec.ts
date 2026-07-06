import { test, expect } from "@playwright/test";
import { AI_PUBLIC_ROUTES, expectStudioReady } from "./helpers/aiPage";

test.describe("Araaye AI — public routes", () => {
  for (const route of AI_PUBLIC_ROUTES) {
    test(`loads ${route.path}`, async ({ page }) => {
      const started = Date.now();
      await page.goto(route.path);
      await expect(page).toHaveURL(new RegExp(route.path.replace(/\//g, "\\/")));
      if (route.kind === "heading") {
        await expect(page.getByRole("heading", { name: route.expect })).toBeVisible({
          timeout: 15_000,
        });
      } else {
        await expect(page.getByText(route.expect).first()).toBeVisible({ timeout: 15_000 });
      }
      await expect(page.locator("body")).toBeVisible();
      expect(Date.now() - started).toBeLessThan(12_000);
      await expect(page.getByText(/ConnectTimeoutError|fetch failed|TypeError/i)).toHaveCount(0);
    });
  }
});

test.describe("Araaye AI — leaderboard resilience", () => {
  test("leaderboard shows empty fallback without Supabase errors", async ({ page }) => {
    await page.goto("/ai/leaderboard");
    await expect(page.getByRole("heading", { name: /لیدربورد مدل/ })).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText(/هنوز داده‌ای برای رتبه‌بندی وجود ندارد/)
    ).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/ConnectTimeoutError|fetch failed|TypeError/i)).toHaveCount(0);
  });

  test("leaderboard API returns quickly in E2E mode", async ({ request }) => {
    const started = Date.now();
    const res = await request.get("/api/ai/leaderboard");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.entries)).toBe(true);
    expect(Date.now() - started).toBeLessThan(3000);
  });
});

test.describe("Araaye AI — studio composers", () => {
  test("image studio disables generate until prompt", async ({ page }) => {
    await page.goto("/ai/image");
    await expectStudioReady(page, {
      title: "استودیو تصویر",
      generateLabel: "تولید تصویر",
    });
    const composer = page.locator("textarea").first();
    await composer.fill("یک گربه روی مبل");
    await expect(page.getByRole("button", { name: "تولید تصویر" })).toBeEnabled();
  });

  test("video studio disables generate until prompt", async ({ page }) => {
    await page.goto("/ai/video");
    await expectStudioReady(page, {
      title: "استودیو ویدیو",
      generateLabel: "ساخت ویدیو",
    });
  });

  test("music studio disables generate until prompt", async ({ page }) => {
    await page.goto("/ai/music");
    await expectStudioReady(page, {
      title: "استودیو موزیک",
      generateLabel: "ساخت موزیک",
    });
  });

  test("audio studio shows TTS and transcribe tabs", async ({ page }) => {
    await page.goto("/ai/audio");
    await expect(page.getByRole("heading", { name: "استودیو صوت" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "ساخت صدا" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "رونویسی" })).toBeVisible();
  });
});

test.describe("Araaye AI — protected / error routes", () => {
  test("unknown run id redirects guest to home", async ({ page }) => {
    await page.goto("/ai/runs/00000000-0000-0000-0000-000000000000");
    await page.waitForURL(/\/ai\/?$/, { timeout: 15_000 });
    await expect(page.getByRole("button", { name: "ارسال" })).toBeVisible();
  });

  test("unknown share slug shows not-found state", async ({ page }) => {
    await page.goto("/ai/share/nonexistent-slug-e2e");
    await expect(page.getByRole("heading", { name: /نبرد پیدا نشد/ })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("support ticket detail loads for guest without crash", async ({ page }) => {
    await page.goto("/ai/support/00000000-0000-0000-0000-000000000000");
    await expect(page.getByRole("heading", { name: "جزئیات تیکت" })).toBeVisible();
    await expect(page.getByRole("link", { name: /بازگشت به لیست تیکت/ })).toBeVisible();
  });
});

test.describe("Araaye AI — learn CTAs", () => {
  test("chatgpt learn page links to chat home", async ({ page }) => {
    await page.goto("/ai/learn/chatgpt");
    await page.getByRole("link", { name: "شروع رایگان" }).click();
    await expect(page).toHaveURL(/\/ai\/?$/);
  });

  test("image learn page links to image studio", async ({ page }) => {
    await page.goto("/ai/learn/image");
    await page.getByRole("link", { name: "رفتن به استودیو تصویر" }).click();
    await expect(page).toHaveURL(/\/ai\/image/);
    await expect(page.getByRole("heading", { name: "استودیو تصویر" })).toBeVisible();
  });
});
