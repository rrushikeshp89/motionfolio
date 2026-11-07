import { expect, test } from "@playwright/test";
import { isDesktopWide, isMobile } from "./helpers";

test.describe("project inspector", () => {
  test("switches panels by click and arrow keys", async ({ page }) => {
    await page.goto("./#work");
    const tabs = page.getByRole("tablist", { name: "Selected work" }).filter({ visible: true });
    await expect(page.getByRole("tabpanel", { name: "Grove HRMS" })).toBeVisible();

    await tabs.getByRole("tab", { name: /CRM/ }).click();
    const leadhub = page.getByRole("tabpanel", { name: "LeadHub CRM" });
    await expect(leadhub).toBeVisible();
    await expect(page.getByRole("tabpanel", { name: "Grove HRMS" })).toBeHidden();
    await expect(leadhub.getByRole("link", { name: /Live demo/ })).toHaveAttribute(
      "href",
      "https://crm.fluentopsai.com/inquiry",
    );

    await tabs
      .getByRole("tab", { selected: true })
      .press(isDesktopWide(page) ? "ArrowDown" : "ArrowRight");
    await expect(page.getByRole("tabpanel", { name: "Stockroom ERP" })).toBeVisible();
    await expect(tabs.getByRole("tab", { selected: true })).toBeFocused();
    await page.keyboard.press("End");
    await expect(page.getByRole("tabpanel", { name: "Explainable ML" })).toBeVisible();
    await page.keyboard.press("Home");
    await expect(page.getByRole("tabpanel", { name: "Grove HRMS" })).toBeVisible();
  });
});

test.describe("RBAC simulator", () => {
  test("restricts fields by role and reveals offboarded records to HR", async ({ page }) => {
    await page.goto("./#work");
    const status = page.getByRole("status").filter({ hasText: /people shown/ });
    await expect(status).toHaveText(/As Employee: 4 of 5 people shown, 9 fields restricted/);
    await expect(page.getByText("Rohan Das")).toHaveCount(0);

    await page.getByText("HR Admin", { exact: true }).click();
    await expect(status).toHaveText(/As HR Admin: 5 of 5 people shown, nothing restricted/);
    await expect(page.getByRole("rowheader", { name: /Rohan Das/ })).toBeVisible();
  });
});

test.describe("write path", () => {
  test("selecting a step pins the trace and describes it", async ({ page }) => {
    await page.goto("./#ethos");
    await page.getByRole("button", { name: /Zod validation/ }).click();
    await expect(page.getByText(/Trace 04 Zod validation:/)).toBeVisible();
    await expect(page.getByText("Pinned: select any step")).toBeVisible();
  });
});

test.describe("contact", () => {
  test("copies the email address", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only here");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("./#contact");
    await page.getByRole("button", { name: /Copy/ }).click();
    await expect(page.getByRole("button", { name: /Copied/ })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "rrushikeshp8@gmail.com",
    );
  });

  test("the funnel catches pings", async ({ page }) => {
    test.skip(isMobile(page), "the funnel card is hidden on phones");
    await page.goto("./#contact");
    const funnel = page.getByRole("button", { name: /000000 Pings caught/ });
    await expect(funnel).toBeVisible();
    await page.getByRole("heading", { name: "Everything ends up here." }).click();
    await expect(page.getByRole("button", { name: /000001 Pings caught/ })).toBeVisible();
  });
});

test.describe("navigation", () => {
  test("marks the section in view", async ({ page }) => {
    await page.goto("./");
    const nav = page.getByRole("navigation", { name: isMobile(page) ? "Sections" : "Primary" });
    await nav.getByRole("link", { name: "Ethos" }).click();
    await expect(page).toHaveURL(/#ethos$/);
    await expect(nav.getByRole("link", { name: "Ethos" })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  test("shows the bottom tab bar only on phones", async ({ page }) => {
    await page.goto("./");
    const tabs = page.getByRole("navigation", { name: "Sections" });
    if (isMobile(page)) await expect(tabs).toBeVisible();
    else await expect(tabs).toBeHidden();
  });
});
