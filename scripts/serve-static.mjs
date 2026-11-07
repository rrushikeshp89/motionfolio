// Serves the static export (out/) the way GitHub Pages does, so e2e and Lighthouse test what
// ships: no custom headers, gzip for text, directory paths resolve to index.html, a directory
// requested without its trailing slash gets a 301, and anything missing gets 404.html with 404.
// The site is mounted under its GitHub Pages base path (/motionfolio by default, override with
// MOTIONFOLIO_BASE_PATH), and "/" redirects there, like visiting the project site's URL.
// Usage: node scripts/serve-static.mjs [dir=out] [port=4310]
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { createGzip } from "node:zlib";

const root = resolve(process.argv[2] ?? "out");
const port = Number(process.argv[3] ?? 4310);
const basePath = process.env.MOTIONFOLIO_BASE_PATH ?? "/motionfolio";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".pdf": "application/pdf",
};

const COMPRESSIBLE_TYPE = /^(text\/|application\/(json|xml)|image\/svg)/;
const ACCEPTS_GZIP = /\bgzip\b/;

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

function send(request, response, status, file) {
  const type = TYPES[extname(file)] ?? "application/octet-stream";
  const gzip =
    COMPRESSIBLE_TYPE.test(type) && ACCEPTS_GZIP.test(request.headers["accept-encoding"] ?? "");
  response.writeHead(status, {
    "Content-Type": type,
    ...(gzip ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" } : {}),
  });
  const stream = createReadStream(file);
  (gzip ? stream.pipe(createGzip()) : stream).pipe(response);
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let pathname = decodeURIComponent(url.pathname);
  if (basePath) {
    if (pathname === "/" || pathname === basePath) {
      response.writeHead(301, { Location: `${basePath}/` }).end();
      return;
    }
    if (!pathname.startsWith(`${basePath}/`)) {
      send(request, response, 404, join(root, "404.html"));
      return;
    }
    pathname = pathname.slice(basePath.length);
  }
  const target = normalize(join(root, pathname));
  if (!target.startsWith(root)) {
    response.writeHead(400).end();
    return;
  }

  if (isFile(target)) return send(request, response, 200, target);

  const index = join(target, "index.html");
  if (isFile(index)) {
    if (!pathname.endsWith("/")) {
      response.writeHead(301, { Location: `${basePath}${pathname}/${url.search}` }).end();
      return;
    }
    return send(request, response, 200, index);
  }

  if (isFile(`${target}.html`)) return send(request, response, 200, `${target}.html`);
  send(request, response, 404, join(root, "404.html"));
});

server.listen(port, () =>
  console.log(`Ready: serving ${root} on http://localhost:${port}${basePath}/`),
);
