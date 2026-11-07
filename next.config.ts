import type { NextConfig } from "next";
import { BASE_PATH } from "./src/lib/base-path";

/*
  Static export for GitHub Pages. This repository is a project site, so Pages serves it under
  /motionfolio/ (the root belongs to rrushikeshp89.github.io). Pages serves files only: no headers,
  redirects or server, so the Content-Security-Policy ships as a <meta> tag (src/lib/csp.ts).
*/
const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    sri: { algorithm: "sha256" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
