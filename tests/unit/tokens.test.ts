import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "src/styles/tokens.css"), "utf8");
const palette: Record<string, string> = Object.fromEntries(
  [...css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, hex]) => [name, hex]),
);

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string): number {
  const [lighter = 0, darker = 0] = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

const SURFACES = ["surface", "surface-alt", "card", "canvas-warm"] as const;

/** [foreground, background, minimum]. 4.5 = body text; 3 = large text and UI parts. */
const PAIRS: readonly [string, string, number][] = [
  ...SURFACES.flatMap((bg): [string, string, number][] => [
    ["ink", bg, 4.5],
    ["ink-muted", bg, 4.5],
    ["ink-light", bg, 4.5],
    ["accent-strong", bg, 4.5],
    ["sage-strong", bg, 4.5],
    ["success", bg, 4.5],
    // The terracotta accent is display-size only (headline name, big "+"): large-text minimum.
    ["accent", bg, 3],
  ]),
  ["ink", "sand", 4.5],
  ["ink", "accent", 4.5],
  ["ink", "tangerine", 4.5],
  ["on-accent-strong", "accent-strong", 4.5],
  ["accent-strong", "accent-soft", 4.5],
  ["sage-strong", "sage-soft", 4.5],
  ["on-ink", "ink", 4.5],
  ["on-ink-muted", "ink", 4.5],
  ["accent", "ink", 4.5],
  ["tangerine", "ink-raised", 4.5],
  ["on-ink", "ink-raised", 4.5],
];

describe("design tokens", () => {
  it.each(PAIRS)("%s on %s meets %s:1", (foreground, background, minimum) => {
    const fg = palette[foreground];
    const bg = palette[background];
    expect(fg, `missing --${foreground}`).toBeDefined();
    expect(bg, `missing --${background}`).toBeDefined();
    expect(contrast(fg ?? "", bg ?? "")).toBeGreaterThanOrEqual(minimum);
  });
});
