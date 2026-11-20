import { test as base, expect, type Page } from "@playwright/test";

/*
  Every e2e test gets a fake ping counter in place of the real Abacus API (src/motion/pings.ts),
  so test runs never touch the live count and clicking a contact link in a test never inflates it.
  Specs import { test, expect } from here instead of @playwright/test.
*/

const PING_API = "https://abacus.jasoncameron.dev";

export interface FakeCounter {
  /** The shared count the fake server reports. Change it to simulate other visitors. */
  value: number;
  /** How many /hit requests (counted pings) the page sent. */
  hits: number;
  /** When true, every counter request fails, as if the service were down. */
  fail: boolean;
}

export const test = base.extend<{ counter: FakeCounter }>({
  counter: [
    async ({ page }, use) => {
      const counter: FakeCounter = { value: 41, hits: 0, fail: false };
      const cors = { "access-control-allow-origin": "*" };
      await page.route(`${PING_API}/**`, async (route) => {
        if (counter.fail) return route.fulfill({ status: 503, headers: cors, body: "" });
        const path = new URL(route.request().url()).pathname;
        if (path.startsWith("/hit/")) {
          counter.value += 1;
          counter.hits += 1;
        }
        if (path.startsWith("/stream/")) {
          // One event per connection; a short retry makes EventSource reconnect and pick up changes.
          return route.fulfill({
            status: 200,
            headers: { ...cors, "content-type": "text/event-stream", "cache-control": "no-cache" },
            body: `retry: 250\ndata: {"value": ${counter.value}}\n\n`,
          });
        }
        return route.fulfill({
          status: 200,
          headers: cors,
          contentType: "application/json",
          body: JSON.stringify({ value: counter.value }),
        });
      });
      await use(counter);
    },
    { auto: true },
  ],
});

/** Keeps the visitor on the page when a test clicks an outbound or mailto: link. */
export async function stayOnPage(page: Page) {
  await page.evaluate(() =>
    window.addEventListener(
      "click",
      (event) => {
        if ((event.target as Element).closest("a")) event.preventDefault();
      },
      true,
    ),
  );
}

export { expect };
