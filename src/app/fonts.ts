import localFont from "next/font/local";

/*
  Self-hosted static cuts from @fontsource, so the page makes no third-party requests and the CSP
  stays font-src 'self'. Only the weights the design uses are shipped.
*/
// next/font needs literal options, so each weight is spelled out.
export const display = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/outfit/files/outfit-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/outfit/files/outfit-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/outfit/files/outfit-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/outfit/files/outfit-latin-800-normal.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/outfit/files/outfit-latin-900-normal.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-outfit",
  fallback: ["system-ui", "sans-serif"],
});

export const mono = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/space-mono/files/space-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/space-mono/files/space-mono-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-space-mono",
  fallback: ["ui-monospace", "monospace"],
});
