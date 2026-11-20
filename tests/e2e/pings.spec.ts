import type { Page } from "@playwright/test";
import { expect, stayOnPage, test } from "./fixtures";

const card = (page: Page) => page.locator("[data-ping-funnel]");
const count = (page: Page) => card(page).locator("[data-ping-count]");

test.describe("pings caught", () => {
  test("shows the shared count and updates live when other visitors ping", async ({
    page,
    counter,
  }) => {
    await page.goto("./#contact");
    await expect(count(page)).toHaveText("000041");
    await expect(card(page).locator('[data-ping-status="live"]')).toBeAttached();

    counter.value = 47; // six pings from elsewhere
    await expect(count(page)).toHaveText("000047");
    await expect(page.getByText("6 new pings just landed")).toBeVisible();
  });

  test("email, GitHub and LinkedIn each count once per visitor", async ({ page, counter }) => {
    await page.goto("./#contact");
    await expect(count(page)).toHaveText("000041");
    await stayOnPage(page);

    const contact = page.locator("#contact");
    await contact.getByRole("link", { name: "GitHub" }).click();
    await contact.getByRole("link", { name: "LinkedIn" }).click();
    await contact.getByRole("link", { name: "rrushikeshp8@gmail.com" }).click();

    await expect.poll(() => counter.hits).toBe(3);
    await expect(count(page)).toHaveText("000044");

    // Clicking again the same day does not run the number up.
    await contact.getByRole("link", { name: "GitHub" }).click();
    await contact.getByRole("button", { name: /Copy/ }).click(); // email already counted
    await page.waitForTimeout(400);
    expect(counter.hits).toBe(3);
    await expect(count(page)).toHaveText("000044");
  });

  test("a click before the counter has loaded is counted once, not twice", async ({
    page,
    counter,
  }) => {
    await page.goto("./");
    await stayOnPage(page);
    await page
      .locator("#top")
      .getByRole("link", { name: /Email direct/ })
      .click();
    await expect.poll(() => counter.hits).toBe(1);

    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(count(page)).toHaveText("000042");
  });

  test("project repositories are not profile pings", async ({ page, counter }) => {
    await page.goto("./#work");
    await stayOnPage(page);
    const panel = page.getByRole("tabpanel", { name: "Grove HRMS" });
    await panel.getByRole("link", { name: /Source/ }).click();
    await page.waitForTimeout(400);
    expect(counter.hits).toBe(0);
  });

  test("says so when the counter cannot be reached", async ({ page, counter }) => {
    counter.fail = true;
    await page.goto("./#contact");
    await expect(card(page).locator('[data-ping-status="offline"]')).toBeAttached();
    await expect(count(page)).toHaveText("------");
    await expect(card(page)).toContainText("Ping count unavailable");
  });
});
