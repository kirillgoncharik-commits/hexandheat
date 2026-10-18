import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = normalize(fileURLToPath(new URL("../", import.meta.url)));
const requestedPort = Number(process.env.HEX_HEAT_PORT ?? process.argv[2] ?? 4173);
const port = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 4173;
const mimeTypes = Object.freeze({
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
});

const server = createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }

  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    const relativePath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const filePath = normalize(join(root, relativePath));
    if (!filePath.startsWith(root) || !statSync(filePath).isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Hex & Heat prototype: http://127.0.0.1:${port}`);
});
