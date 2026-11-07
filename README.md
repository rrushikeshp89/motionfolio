# Motion Portfolio

The animated portfolio of **Rushikesh Panchal**, built from the Stitch "Warm Editorial
Neo-Brutalism" desktop and mobile designs, with every fact taken from the main portfolio
([rrushikeshp89.github.io](https://rrushikeshp89.github.io)).

**Live:** https://rrushikeshp89.github.io/motionfolio/ (deployed by CI from `main`)

## Stack

Next.js 16 (static export) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Zod ·
Motion (WAAPI `animate`, `motion/mini`) · Vitest · Playwright + axe · Lighthouse.

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3000/motionfolio/
pnpm check        # typecheck, lint, unit tests, build
pnpm test:e2e     # Playwright on desktop (1280px) and phone (375px) viewports; run `pnpm build` first
pnpm check:bundle # fails if / ships more than 150 kB of gzipped JavaScript
pnpm lhci         # Lighthouse mobile gate, reports in .lighthouseci/
```

Set `PLAYWRIGHT_CHROMIUM_PATH` to use an already-installed Chromium for e2e and Lighthouse.

## How it is organised

| Path                                | What lives there                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/content/facts.ts`, `schema.ts` | The single source of truth, copied from the main portfolio and Zod-validated at build.        |
| `src/content/portfolio.ts`          | View models for this page (ticker, inspector, pipeline, big numbers), all derived from facts. |
| `src/styles/tokens.css`             | The palette from Stitch's `DESIGN.md`, contrast-checked by `tests/unit/tokens.test.ts`.       |
| `src/app/globals.css`               | Tailwind theme, hard ink shadows, the "keystroke" press, keyframes and scroll reveals.        |
| `src/motion/`                       | The animation layer: reveal script, count-up, marquee, hooks and timing tokens.               |
| `src/components/sections/`          | One file per section; interactive pieces are small client components.                         |

## Content rule

Nothing on the page is typed by hand into a component. Numbers and claims come from
`facts.ts`; when the main portfolio's facts change, copy `src/content/facts.ts` and
`schema.ts` across. Claims in the Stitch mock-ups that the facts do not support were dropped;
see [DECISIONS.md](DECISIONS.md).

## Deploying

GitHub Pages must use **GitHub Actions** as its source (Settings → Pages → Build and deployment).
Every push to `main` that passes CI is published. The site is served under `/motionfolio/`; to
serve it from a custom domain or the root, set `MOTIONFOLIO_BASE_PATH=""` (see
`src/lib/base-path.ts`).
