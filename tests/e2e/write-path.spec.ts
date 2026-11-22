import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/* The Grove HRMS write path, rebuilt as the profile README card (light panel, looping trace). */

const panel = (page: Page) => page.locator("[data-write-path]");

test.describe("write path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./#ethos");
    await panel(page).scrollIntoViewIfNeeded();
  });

  test("is a light paper panel with the seven steps", async ({ page }) => {
    await expect(panel(page)).toHaveCSS("background-color", "rgb(250, 246, 238)");
    await expect(panel(page)).toContainText("Grove HRMS write path");
    await expect(panel(page)).toContainText(
      "Every write in Grove HRMS takes this path, and it is traced on the server.",
    );
    const steps = panel(page).locator(".wp-step");
    await expect(steps).toHaveText([
      /01\s*Interface/i,
      /02\s*Server action/i,
      /03\s*Permission/i,
      /04\s*Zod/i,
      /05\s*Transaction/i,
      /06\s*Audit log/i,
      /07\s*Postgres/i,
    ]);
  });

  test("plays the trace by itself and commits at the end", async ({ page }) => {
    const step = (n: number) => panel(page).locator(".wp-step").nth(n);
    await expect(step(4)).toHaveAttribute("data-state", "current", { timeout: 6000 });
    await expect(step(3)).toHaveAttribute("data-state", "done");
    await expect(panel(page).locator(".wp-line[data-on]")).toContainText("Trace 05");
    await expect(panel(page).locator(".wp-line[data-on]")).toContainText("Committed", {
      timeout: 9000,
    });
  });

  test("clicking a step holds the trace there, then it carries on", async ({ page }) => {
    const zod = panel(page).getByRole("button", { name: /04\s*Zod/i });
    await zod.click();
    await expect(zod).toHaveAttribute("data-state", "current");
    await expect(zod).toHaveAttribute("aria-pressed", "true");
    await expect(panel(page).locator(".wp-step").nth(2)).toHaveAttribute("data-state", "done");
    await expect(panel(page).locator(".wp-line[data-on]")).toContainText(
      "The input is validated with Zod before anything is written.",
    );
    await expect(page.locator(".toast")).toHaveText(/Trace step 04: Zod/);
    // It is still held a moment later, and lets go after a few seconds.
    await page.waitForTimeout(1600);
    await expect(zod).toHaveAttribute("data-state", "current");
    await expect(zod).toHaveAttribute("aria-pressed", "false", { timeout: 5000 });
    await expect(panel(page).locator(".wp-step").nth(4)).toHaveAttribute("data-state", "current", {
      timeout: 3000,
    });
  });
});

test.describe("write path, reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("holds still on step 03 until a step is chosen", async ({ page }) => {
    await page.goto("./#ethos");
    const steps = panel(page).locator(".wp-step");
    await expect(steps.nth(2)).toHaveAttribute("data-state", "current");
    await page.waitForTimeout(2000);
    await expect(steps.nth(2)).toHaveAttribute("data-state", "current");
    await steps.nth(5).click();
    await expect(steps.nth(5)).toHaveAttribute("data-state", "current");
  });
});
