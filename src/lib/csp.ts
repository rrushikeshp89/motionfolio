/*
  Delivered as <meta http-equiv="Content-Security-Policy"> because GitHub Pages cannot send
  response headers. A meta policy cannot carry frame-ancestors, report-uri or sandbox, so those
  protections are not available on this host (DECISIONS.md, ADR-029).

  script-src needs 'unsafe-inline': a statically generated App Router page carries inline RSC
  payload scripts that cannot be nonced or hashed ahead of the build. External scripts are still
  pinned with SRI (experimental.sri). See ADR-005.
*/
const isDev = process.env.NODE_ENV === "development";

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");
