import { defineConfig, devices } from "@playwright/test";

const PORT = 4310;
const isCI = Boolean(process.env.CI);
/** Optional: run against a pre-installed Chromium instead of Playwright's download. */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    // The site lives under its GitHub Pages base path; specs navigate relative to it ("./").
    baseURL: `http://localhost:${PORT}/motionfolio/`,
    trace: "retain-on-failure",
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  // Tests run against the static export, served like GitHub Pages: run `pnpm build` first.
  webServer: {
    command: `node scripts/serve-static.mjs out ${PORT}`,
    url: `http://localhost:${PORT}/motionfolio/`,
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
});
