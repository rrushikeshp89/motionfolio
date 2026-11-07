import { facts } from "@/content/facts";
import { BASE_PATH } from "./base-path";

/** Where this site is published. Canonical, Open Graph and JSON-LD URLs derive from it. */
export const siteUrl = new URL(`https://rrushikeshp89.github.io${BASE_PATH}/`);

/** The main portfolio, which hosts the case studies and the résumé PDF. */
export const mainSiteUrl = new URL(`${facts.site.url}/`);

/** Absolute URL on the main portfolio, e.g. mainSite("/work/grove-hrms/"). */
export function mainSite(path: string): string {
  return new URL(path.replace(/^\//, ""), mainSiteUrl).href;
}

/** Prefixes a public/ asset with the base path; next/link does this itself, plain <a> and <img> do not. */
export function asset(path: string): string {
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

/** The résumé PDF is built and hosted by the main portfolio. */
export const resumeUrl = mainSite(
  facts.identity.resume === "TODO(confirm)" ? "/resume/" : facts.identity.resume,
);
