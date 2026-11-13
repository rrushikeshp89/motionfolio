import { expect, test, type Page } from "@playwright/test";
import { isMobile } from "./helpers";

/** Coverage for the Stitch desktop/mobile interactions (cursor, kinetic type, magnet, tilt, …). */

const transformOf = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => getComputedStyle(el).transform);

test.describe("pointer interactions (desktop)", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 768, "fine-pointer effects");

  test("a custom cursor follows the mouse and grows over links", async ({ page }) => {
    await page.goto("./");
    await page.mouse.move(400, 300);
    await expect(page.locator("html")).toHaveClass(/has-cursor/);
    await expect(page.locator(".cursor-dot")).toBeVisible();
    await page.getByRole("link", { name: "Explore work" }).hover();
    await expect(page.locator("html")).toHaveClass(/cursor-hover/);
    await expect
      .poll(() => page.locator(".cursor-ring").evaluate((el) => el.getBoundingClientRect().width))
      .toBeGreaterThan(50);
  });

  test("hero letters spring up and turn terracotta on hover", async ({ page }) => {
    await page.goto("./");
    await page.waitForTimeout(1800); // let the rise finish
    const letter = page.locator(".char-kinetic").first();
    await letter.hover();
    await expect
      .poll(() => letter.evaluate((el) => getComputedStyle(el).color))
      .toBe("rgb(224, 90, 54)");
    expect(await transformOf(page, ".char-kinetic:hover")).not.toBe("none");
  });

  test("buttons are magnetic", async ({ page }) => {
    await page.goto("./");
    await page.mouse.move(10, 10);
    await expect(page.locator("html")).toHaveClass(/has-cursor/); // effects are live
    const button = page.getByRole("link", { name: "Explore work" });
    const box = await button.boundingBox();
    if (!box) throw new Error("no button box");
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, { steps: 4 });
    await expect
      .poll(() => button.evaluate((el) => (el as HTMLElement).style.translate))
      .not.toBe("");
  });

  test("ethos cards tilt toward the pointer", async ({ page }) => {
    await page.goto("./#ethos");
    const card = page.locator("[data-tilt]").first();
    await card.scrollIntoViewIfNeeded();
    const box = await card.boundingBox();
    if (!box) throw new Error("no card box");
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.move(box.x + 30, box.y + 30);
    await expect
      .poll(() => card.evaluate((el) => (el as HTMLElement).style.transform))
      .toContain("perspective(800px)");
  });

  test("tech tags show which projects use them", async ({ page }) => {
    await page.goto("./#experience");
    const tag = page.locator(".tech-tag", { hasText: "Prisma ORM" });
    await tag.scrollIntoViewIfNeeded();
    await tag.hover();
    const tooltip = tag.locator(".tech-tooltip");
    await expect(tooltip).toHaveText(/Used in Grove HRMS/);
    await expect.poll(() => tooltip.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });
});

test.describe("feedback", () => {
  test("role switches toast and the sound switch remembers its state", async ({ page }) => {
    await page.goto("./#work");
    await page.getByText("Manager", { exact: true }).first().click();
    await expect(page.locator(".toast")).toHaveText(/Directory as Manager/);
    await expect(page.locator(".toast")).toHaveClass(/toast-show/);

    const sound = page.getByRole("button", { name: "Tactile sound effects" });
    await expect(sound).toHaveAttribute("aria-pressed", "true");
    await sound.click();
    await expect(sound).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".toast")).toHaveText(/muted/);
    await page.reload();
    await expect(page.getByRole("button", { name: "Tactile sound effects" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("the layout-shift figure counts up from 0.000", async ({ page }) => {
    await page.goto("./");
    const live = (text: RegExp) =>
      page
        .locator("#metrics-title")
        .locator("..")
        .locator("span:not(.invisible)", { hasText: text });
    await expect(live(/^0\.000$/)).toBeAttached();
    await live(/^0\.000$/).scrollIntoViewIfNeeded();
    await expect(live(/^0\.004$/)).toBeVisible();
  });

  test("the write path has a sweeping beam and grows the active step", async ({ page }) => {
    await page.goto("./#ethos");
    await expect(page.locator(".pipeline-beam")).toBeAttached();
    const step = page.getByRole("button", { name: /Transaction/ });
    await step.click();
    await expect(step).toHaveClass(/scale-105/);
    await expect(page.locator(".toast")).toHaveText(/Trace step 05: Transaction/);
  });

  test("tapping the hire badge plays the tactile squeeze", async ({ page }) => {
    test.skip(isMobile(page) || (page.viewportSize()?.width ?? 0) < 1280, "badge shows on xl");
    await page.goto("./");
    const badge = page.locator("[data-tactile]", { hasText: "Available for hire" });
    await badge.click();
    await expect(badge).toHaveClass(/ripple/);
  });
});

test.describe("layout", () => {
  test("nothing widens the page sideways (tooltips, toasts, cursor)", async ({ page }) => {
    await page.goto("./");
    await page.evaluate(() =>
      document
        .querySelectorAll("[data-reveal]")
        .forEach((el) => el.setAttribute("data-revealed", "")),
    );
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("the phone tab bar sits flush with the bottom of the screen", async ({ page }) => {
    test.skip(!isMobile(page), "phones only");
    await page.goto("./");
    const bar = page.getByRole("navigation", { name: "Sections" });
    const box = await bar.boundingBox();
    const height = page.viewportSize()?.height ?? 0;
    expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(height);
  });
});

test.describe("re-renders keep revealed content", () => {
  test("switching projects never hides the work list again", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, "the list shows on wide screens");
    await page.goto("./#work");
    const list = page.getByRole("tablist", { name: "Selected work" }).filter({ visible: true });
    await list.getByRole("tab", { name: /LeadHub CRM/ }).click();
    await list.getByRole("tab", { name: /Stockroom ERP/ }).click();
    for (const tab of await list.getByRole("tab").all()) {
      await expect.poll(() => tab.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    }
  });
});

test.describe("motion off", () => {
  test("no custom cursor and no tilt under reduced motion", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("./");
    await page.mouse.move(400, 300);
    await expect(page.locator("html")).not.toHaveClass(/has-cursor/);
    await expect(page.locator(".cursor-dot")).toBeHidden();
    await context.close();
  });
});

test.describe("email links", () => {
  const GMAIL = "https://mail.google.com/mail/?view=cm&fs=1&to=rrushikeshp8%40gmail.com";

  /** Records window.open calls instead of opening real tabs. */
  async function captureOpens(page: Page) {
    await page.addInitScript(() => {
      const opened: unknown[][] = [];
      Object.assign(window, { __opened: opened });
      window.open = (...args: unknown[]) => {
        opened.push(args);
        return null;
      };
    });
  }
  const opened = (page: Page) =>
    page.evaluate(() => (window as unknown as { __opened: unknown[][] }).__opened);

  test("on desktop, Email direct opens Gmail compose addressed to Rushikesh", async ({ page }) => {
    test.skip(isMobile(page), "phones keep mailto:");
    await captureOpens(page);
    await page.goto("./");
    await page.getByRole("link", { name: "Email direct" }).click();
    expect(await opened(page)).toEqual([[GMAIL, "_blank", "noopener,noreferrer"]]);
    await expect(page.locator(".toast")).toHaveText(/Opening Gmail/);
    await expect(page).toHaveURL(/\/motionfolio\/$/);
  });

  test("on desktop, the address in the contact section opens Gmail compose too", async ({
    page,
  }) => {
    test.skip(isMobile(page), "phones keep mailto:");
    await captureOpens(page);
    await page.goto("./#contact");
    await page.getByRole("link", { name: "rrushikeshp8@gmail.com" }).click();
    expect(await opened(page)).toEqual([[GMAIL, "_blank", "noopener,noreferrer"]]);
  });

  test("on phones, email links stay mailto: for the mail app", async ({ page }) => {
    test.skip(!isMobile(page), "phones only");
    await page.goto("./");
    for (const name of ["Email direct", "rrushikeshp8@gmail.com"]) {
      await expect(page.getByRole("link", { name })).toHaveAttribute(
        "href",
        "mailto:rrushikeshp8@gmail.com",
      );
    }
  });
});
