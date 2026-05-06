const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  const normalized = path.normalize(decoded);

  if (normalized.startsWith("..") || path.isAbsolute(normalized)) {
    return null;
  }

  return normalized;
}

function resolveFile(urlPath) {
  const route = safePath(urlPath);
  if (route === null) return null;

  if (route === "" || route === ".") {
    return path.join(root, "index.html");
  }

  const direct = path.join(root, route);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) {
    return direct;
  }

  const htmlRoute = path.join(root, `${route}.html`);
  if (fs.existsSync(htmlRoute) && fs.statSync(htmlRoute).isFile()) {
    return htmlRoute;
  }

  const indexRoute = path.join(root, route, "index.html");
  if (fs.existsSync(indexRoute) && fs.statSync(indexRoute).isFile()) {
    return indexRoute;
  }

  return null;
}

const server = http.createServer((req, res) => {
  const urlPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const cleanPath = urlPath.replace(/\/+$/, "") || "/";

  if (cleanPath === "/home" || cleanPath === "/home/home") {
    send(res, 301, "", { Location: "/" });
    return;
  }

  const filePath = resolveFile(urlPath);
  if (!filePath) {
    const notFound = path.join(root, "404.html");
    if (fs.existsSync(notFound)) {
      const body = fs.readFileSync(notFound);
      send(res, 404, body, { "Content-Type": "text/html; charset=utf-8" });
      return;
    }
    send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const body = fs.readFileSync(filePath);
  send(res, 200, body, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable"
  });
});

server.listen(port, host, () => {
  console.log(`OP Productions site running on ${host}:${port}`);
});
