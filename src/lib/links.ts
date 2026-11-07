/** Links that leave the site (or open a mail client) skip next/link and get rel attributes. */
export function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:)/.test(href);
}
