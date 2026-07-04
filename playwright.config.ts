import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

/** Use installed Google Chrome locally — avoids `playwright install` (~500MB). Set PLAYWRIGHT_USE_BUNDLED=1 in CI. */
const useSystemChrome = !process.env.PLAYWRIGHT_USE_BUNDLED;
const chromeLaunch = useSystemChrome
  ? { ...devices["Desktop Chrome"], channel: "chrome" as const }
  : { ...devices["Desktop Chrome"] };

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    locale: "fa-IR",
  },
  projects: [
    { name: "chromium", use: chromeLaunch },
    {
      name: "mobile",
      use: {
        ...chromeLaunch,
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
