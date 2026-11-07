import { expect, test } from "@playwright/test";

test.describe("content comes from facts.ts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
  });

  test("names the owner and role", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Rushikesh Panchal");
    await expect(page).toHaveTitle(/Rushikesh Panchal, Software Developer/);
  });

  test("shows real experience and education, not the mock-up's", async ({ page }) => {
    const body = page.locator("body");
    await expect(body).toContainText("Oct 2025");
    await expect(body).toContainText("Jan 2026");
    await expect(body).toContainText("Garden City University");
    await expect(body).toContainText("8.53 / 10");
    for (const invented of ["Visvesvaraya", "Aug 2024", "MongoDB", "Concurrent Mock Users"]) {
      await expect(body).not.toContainText(invented);
    }
  });

  test("offers email, GitHub, LinkedIn and the résumé", async ({ page }) => {
    await expect(page.locator('a[href="mailto:rrushikeshp8@gmail.com"]').first()).toBeVisible();
    await expect(
      page.locator('a[href="https://rrushikeshp89.github.io/resume.pdf"]').first(),
    ).toBeAttached();
    await expect(page.locator('a[href="https://github.com/rrushikeshp89"]').first()).toBeAttached();
  });

  test("puts every project in the HTML, even inactive panels", async ({ page }) => {
    for (const name of ["Grove HRMS", "LeadHub CRM", "Stockroom ERP", "Explainable ML"]) {
      await expect(page.getByRole("tabpanel", { name, includeHidden: true })).toBeAttached();
    }
  });

  test("publishes Person JSON-LD without contact details", async ({ page }) => {
    const json = await page.locator('script[type="application/ld+json"]').textContent();
    const person = JSON.parse(json ?? "{}") as Record<string, unknown>;
    expect(person["@type"]).toBe("Person");
    expect(person.url).toBe("https://rrushikeshp89.github.io/motionfolio/");
    expect(JSON.stringify(person)).not.toContain("@gmail");
  });
});
