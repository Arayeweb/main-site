import { expect, type Page } from "@playwright/test";

/** Open the mobile drawer when the hamburger is visible; no-op on desktop sidebar layout. */
export async function openSideNav(page: Page) {
  const menuBtn = page.getByRole("button", { name: "باز کردن منو" });
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    await expect(page.getByRole("dialog", { name: "منوی ناوبری" })).toBeVisible();
  }
}

/** Navigate via shell sidebar / drawer link text. */
export async function navTo(page: Page, linkName: string | RegExp) {
  await openSideNav(page);
  const shell = page.locator(".ar-sidebar, .ar-drawer");
  const link = shell.getByRole("link", { name: linkName });
  await expect(link).toBeVisible();
  await link.click();
  await page.waitForLoadState("domcontentloaded");
}

export async function expectStudioReady(
  page: Page,
  opts: { title: string | RegExp; generateLabel: string | RegExp }
) {
  await expect(page.getByRole("heading", { name: opts.title })).toBeVisible();
  const generateBtn = page.getByRole("button", { name: opts.generateLabel });
  await expect(generateBtn).toBeVisible();
  await expect(generateBtn).toBeDisabled();
}

export type AiRouteCase = {
  path: string;
  /** Visible text or heading matcher proving the page rendered */
  expect: string | RegExp;
  kind?: "heading" | "text";
};

export const AI_PUBLIC_ROUTES: AiRouteCase[] = [
  { path: "/ai", expect: /یک سؤال/, kind: "heading" },
  { path: "/ai/pricing", expect: /Starter|استارتر/ },
  { path: "/ai/features", expect: /چند مدل AI/, kind: "heading" },
  { path: "/ai/personas", expect: /چهره‌های بزرگ/, kind: "heading" },
  { path: "/ai/personas/elon-musk", expect: /ایلان ماسک/, kind: "heading" },
  { path: "/ai/image", expect: "استودیو تصویر", kind: "heading" },
  { path: "/ai/video", expect: /استودیو ویدیو به‌زودی/, kind: "heading" },
  { path: "/ai/music", expect: "استودیو موزیک", kind: "heading" },
  { path: "/ai/audio", expect: "استودیو صوت", kind: "heading" },
  { path: "/ai/code", expect: "استودیو کد", kind: "heading" },
  { path: "/ai/leaderboard", expect: /لیدربورد مدل/, kind: "heading" },
  { path: "/ai/support", expect: "پشتیبانی", kind: "heading" },
  { path: "/ai/learn/chatgpt", expect: /جایگزین ChatGPT/, kind: "heading" },
  { path: "/ai/learn/image", expect: /ساخت عکس/, kind: "heading" },
  { path: "/ai/learn/video", expect: /ساخت ویدیو/, kind: "heading" },
  { path: "/ai/content-sales", expect: /محتوا و فروش/, kind: "heading" },
];
