import { expect, test } from "@playwright/test";

test.describe("motion is optional", () => {
  test("reduced motion shows everything at rest", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("./");
    // Without scrolling, below-the-fold reveals must already be visible.
    const opacities = await page
      .locator("[data-reveal]")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
    expect(opacities.every((value) => value === "1")).toBe(true);
    const marquee = await page
      .locator(".animate-marquee")
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(marquee).toBe("none");
    await context.close();
  });

  test("without JavaScript the content is fully visible", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("./");
    const hidden = await page
      .locator("[data-reveal]")
      .evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== "1").length);
    expect(hidden).toBe(0);
    await expect(page.getByRole("heading", { name: "How I work." })).toBeVisible();
    await expect(page.getByText("Garden City University")).toBeVisible();
    await context.close();
  });

  test("scroll reveals play when motion is allowed", async ({ page }) => {
    await page.goto("./");
    const card = page.locator("#ethos [data-reveal]").first();
    await expect(card).not.toHaveClass(/is-revealed/);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/is-revealed/);
  });

  test("counts metrics up from zero when they scroll into view", async ({ page }) => {
    await page.goto("./");
    const number = page
      .locator("#metrics-title")
      .locator("..")
      .locator("dd span[aria-hidden] span")
      .nth(1);
    await expect(number).toHaveText("0");
    await number.scrollIntoViewIfNeeded();
    await expect(number).toHaveText("130");
  });
});
