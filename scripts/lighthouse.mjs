// Lighthouse gate, mobile preset with simulated throttling (plan: every category at least 90).
// Starts the production server, audits each route RUNS times in Playwright's Chromium, takes the
// median run, writes HTML reports to .lighthouseci/, and fails when any threshold is missed.
// Lighthouse's own chrome-launcher is bypassed because it cannot spawn Chrome on every platform.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";

const PORT = 4320;
const DEBUG_PORT = 9333;
const RUNS = 3;
const BASE_PATH = process.env.MOTIONFOLIO_BASE_PATH ?? "/motionfolio";
const ROUTES = ["/"];
const OUT_DIR = ".lighthouseci";

const CATEGORY_MINIMUMS = { performance: 0.9, accessibility: 1, "best-practices": 0.95, seo: 0.95 };
// Lab gates (LCP < 2.5 s, CLS < 0.02). TBT is reported, not gated: it measures
// framework hydration on a 4x-throttled CPU and is already weighted inside the performance score.
const AUDIT_MAXIMUMS = {
  "largest-contentful-paint": 2500,
  "cumulative-layout-shift": 0.02,
};

function startServer() {
  const server = spawn(`node scripts/serve-static.mjs out ${PORT}`, {
    shell: true,
    stdio: "pipe",
    detached: process.platform !== "win32",
  });
  let errors = "";
  server.stderr.on("data", (chunk) => (errors += String(chunk)));
  return new Promise((resolve, reject) => {
    server.stdout.on("data", (chunk) => {
      if (String(chunk).includes("Ready")) resolve(server);
    });
    server.on("exit", (code) =>
      reject(
        new Error(`Server exited with code ${code}:
${errors}`),
      ),
    );
  });
}

function stopServer(server) {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"]);
  else process.kill(-server.pid, "SIGTERM"); // the whole group: shell, pnpm and next
}

function median(results) {
  const sorted = results.toSorted(
    (a, b) => a.lhr.categories.performance.score - b.lhr.categories.performance.score,
  );
  return sorted[Math.floor(sorted.length / 2)];
}

function failuresFor(lhr) {
  const failures = [];
  for (const [id, minimum] of Object.entries(CATEGORY_MINIMUMS)) {
    const score = lhr.categories[id]?.score ?? 0;
    if (score < minimum) failures.push(`${id} ${Math.round(score * 100)} < ${minimum * 100}`);
  }
  for (const [id, maximum] of Object.entries(AUDIT_MAXIMUMS)) {
    const value = lhr.audits[id]?.numericValue ?? Number.POSITIVE_INFINITY;
    if (value > maximum) failures.push(`${id} ${value.toFixed(3)} > ${maximum}`);
  }
  return failures;
}

function summarise(route, lhr) {
  const scores = Object.keys(CATEGORY_MINIMUMS)
    .map((id) => `${id} ${Math.round((lhr.categories[id]?.score ?? 0) * 100)}`)
    .join(", ");
  const lcp = (lhr.audits["largest-contentful-paint"].numericValue / 1000).toFixed(2);
  const cls = lhr.audits["cumulative-layout-shift"].numericValue.toFixed(3);
  const tbt = Math.round(lhr.audits["total-blocking-time"].numericValue);
  return `${route}: ${scores} | LCP ${lcp} s, CLS ${cls}, TBT ${tbt} ms`;
}

const server = await startServer();
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const browser = await chromium.launch({
  args: [`--remote-debugging-port=${DEBUG_PORT}`],
  ...(executablePath ? { executablePath } : {}),
});
let failed = false;

try {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const route of ROUTES) {
    const runs = [];
    for (let run = 0; run < RUNS; run += 1) {
      runs.push(
        await lighthouse(`http://localhost:${PORT}${BASE_PATH}${route}`, {
          port: DEBUG_PORT,
          output: "html",
          logLevel: "error",
        }),
      );
    }
    const { lhr, report } = median(runs);
    const name = route === "/" ? "home" : route.replaceAll("/", "-").replace(/^-/, "");
    writeFileSync(`${OUT_DIR}/${name}.html`, report);

    const failures = failuresFor(lhr);
    failed ||= failures.length > 0;
    console.log(`${failures.length ? "FAIL" : "ok  "} ${summarise(route, lhr)}`);
    for (const failure of failures) console.log(`     ${failure}`);
    for (const ref of lhr.categories.accessibility?.auditRefs ?? []) {
      const audit = lhr.audits[ref.id];
      if (ref.weight > 0 && audit && audit.score !== null && audit.score < 1) {
        console.log(`     accessibility audit failed: ${audit.id} (${audit.title})`);
        for (const item of audit.details?.items ?? []) {
          console.log(
            `       ${item.node?.selector ?? ""} ${item.node?.explanation?.split("\n")[1] ?? ""}`,
          );
        }
      }
    }
  }
} finally {
  await browser.close();
  stopServer(server);
}

process.exit(failed ? 1 : 0);
