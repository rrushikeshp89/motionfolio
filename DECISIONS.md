# Decisions

Architecture and content decisions for the Motion Portfolio, with the measurements behind them.

## Architecture

- **ADR-001 Same stack as the main portfolio.** Next.js 16 static export, React 19, Tailwind v4,
  Zod-validated facts, Vitest, Playwright + axe, Lighthouse. Content, tests, scripts and CI carry
  over from `rrushikeshp89.github.io` instead of being reinvented.
- **ADR-002 Served under `/motionfolio/`.** This repository is a GitHub Pages project site; the
  root belongs to the main portfolio. `basePath` comes from `src/lib/base-path.ts`, so moving to a
  custom domain or the root is one variable. `scripts/serve-static.mjs` mounts the export under the
  same path so e2e and Lighthouse test what Pages serves.
- **ADR-003 One responsive page, two Stitch layouts.** The desktop export drives ≥1024px (work list
  plus sticky inspector, top navigation); the mobile export drives phones (project tab strip, bottom
  tab bar, horizontally scrolling pipeline). Sections are shared components; breakpoints switch
  the layout.
- **ADR-004 No third-party requests.** Tailwind compiles at build time instead of the Play CDN;
  Outfit and Space Mono are self-hosted from `@fontsource` through `next/font/local`; the Material
  Symbols glyphs are ~15 inline SVG paths (`src/components/ui/Icon.tsx`). The CSP stays
  `default-src 'self'`.
- **ADR-005 Facts never reach the client bundle.** Client components receive plain props; the nav
  is a server wrapper around `SiteNavClient`. Importing `facts.ts` in a client component pulled
  44 kB of Zod into the page.

## Motion

- **ADR-006 CSS first, Motion's WAAPI `animate` for the rest.** The first build used Motion's React
  components (`LazyMotion`, `m.*`, `layoutId`, `AnimatePresence`, `useScroll`): 194.3 kB of gzipped
  JavaScript on `/`, over the 150 kB budget the plan set. Layout projection was most of it. Now:
  - CSS keyframes and transitions for the hero letter rise, panel and row entrances, cell flips,
    sliding indicators (translate by index), hover lifts and the "keystroke" press.
  - A CSS scroll-driven animation for the header's reading-progress line (0 kB of JavaScript;
    browsers without `animation-timeline` simply don't show it).
  - `motion/mini` (`animate`, `useAnimate`) for the ping flights and the funnel's "gulp".
  - Plain `requestAnimationFrame` for count-ups.
    Result: **147.6 kB**, under budget, with every animation the design calls for.
- **ADR-007 Content is visible without JavaScript or motion.** Server HTML holds every section and
  every project panel (inactive ones `hidden`). Scroll reveals apply only when an inline head
  script has set `html.js` and motion is allowed; the same script reveals elements through
  IntersectionObserver, independently of React. Under `prefers-reduced-motion` nothing moves and
  nothing starts hidden. Both cases are covered by `tests/e2e/motion.spec.ts`.
- **ADR-008 No reveal fallback timer.** An early version revealed everything after 2.5 s "just in
  case". Lighthouse then measured elements mid-fade and failed colour contrast (97). The script is
  inline and does not depend on the bundle, so the timer guarded nothing; it was removed.

## Design tokens

- **ADR-009 One palette, resolved for contrast.** The two Stitch exports used different palettes
  (desktop `#E05A36` on `#FAF6EE`, mobile a Material palette around `#A83211`). The desktop palette,
  which matches `DESIGN.md`, is kept. Measured against WCAG AA:
  - `#E05A36` is 3.4:1 on the page and 3.7:1 under white text, so it is used for display type,
    decoration and fills that carry **ink** text (4.7:1). Small text and white-on-terracotta use
    `accent-strong` `#B23F1C` (5.4:1 / 5.8:1).
  - `ink-light` darkened from `#78716C` (4.45:1) to `#6B635E` (5.45:1).
  - `success` darkened to `#0B6B4A` after the contrast test failed it on the contact background.
  - Step numbers on the dark pipeline nodes use tangerine, not terracotta (axe failure).
    `tests/unit/tokens.test.ts` asserts every pair in use.

## Content: what changed from the Stitch mock-ups

`facts.ts` wins everywhere. Removed or corrected:

| Stitch said                                                                    | Facts say / what the page shows                                      |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Zetpeak, Aug–Oct 2024 (mobile)                                                 | Oct 2025 – Jan 2026, Bengaluru, on-site                              |
| Maincrafts, Jun–Jul 2024 (mobile)                                              | Jan 2026 – Apr 2026, remote                                          |
| Visvesvaraya Technological University, 2021–2025 (mobile)                      | Garden City University, graduating Jul 2026                          |
| "100+ concurrent mock users" (mobile)                                          | 100 seeded demo employees                                            |
| "Multi-tenant HRMS" (mobile)                                                   | Not claimed; one company of ~100 people                              |
| "Load profiling with Vitest" (mobile)                                          | Not claimed                                                          |
| MongoDB / Redis caching (mobile stack)                                         | Not in the skills list; removed                                      |
| Role titles "Technical Architect", "Founder & Engineer", "Full-stack Engineer" | Not claimed                                                          |
| Project years and "Release 2026.04"                                            | Not in facts; removed                                                |
| LeadHub "100% containerized", "1 domain layer" stats                           | LeadHub has no measured metrics; the panel shows its bullets instead |
| Skill descriptions ("Core daily language · Strict types")                      | Plain skill names from facts                                         |
| "000042 swallowed" ping counter                                                | A counter of the visitor's own pings this visit, starting at 0       |
| Stitch stock images (`aida-public`, Unsplash)                                  | Removed; temporary links and not the owner's work                    |

Kept as decoration, not claims: "2026 edition", principle tags (Explainability, Server-side
enforcement, Stated limits). The write-path step descriptions are condensed from Grove's case study.

## Measurements (local, this build)

- JavaScript on `/`: **147.6 kB** gzipped (budget 150 kB; `noModule` polyfills excluded).
- Lighthouse mobile (median of 3): **Performance 98, Accessibility 100, Best Practices 100,
  SEO 100**; LCP 0.91 s, CLS 0.000, TBT ~155 ms.
- Tests: 61 unit (schema, contrast, view models, permissions demo); 37 e2e on 1280px and 375px
  (axe on home and 404, content, inspector keyboard, RBAC simulator, write path, copy email,
  funnel, navigation, reduced motion, no JavaScript, reveals, count-up).

## Open items

- GitHub Pages source must be set to "GitHub Actions" in the repository settings (owner action).
- `facts.ts` is a copy of the main portfolio's; keep the two in sync when facts change.
