import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("accessibility", () => {
  test("home page has no axe violations", async ({ page }) => {
    await page.goto("./");
    // Let reveals finish so axe measures final colours, not mid-fade ones.
    await page.evaluate(() =>
      document
        .querySelectorAll("[data-reveal]")
        .forEach((el) => el.setAttribute("data-revealed", "")),
    );
    await page.waitForTimeout(1200);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test("the 404 page has no axe violations", async ({ page }) => {
    const response = await page.goto("./no-such-page/");
    expect(response?.status()).toBe(404);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  test("a skip link moves focus to the content", async ({ page }) => {
    await page.goto("./");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });
});
