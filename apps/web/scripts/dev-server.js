import { createReadStream, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = normalize(fileURLToPath(new URL("../", import.meta.url)));
const projectRoot = normalize(fileURLToPath(new URL("../../../", import.meta.url)));
const requestedPort = Number(process.env.HEX_HEAT_PORT ?? process.argv[2] ?? 4173);
const port = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 4173;
const mimeTypes = Object.freeze({
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
});

const books = readFileSync(join(projectRoot, "math/publish_files/books_base.jsonl"), "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => Object.freeze(JSON.parse(line)));
const betLevels = Object.freeze([0.5, 1, 2, 5]);
const rgs = {
  balanceMicro: 100_000_000,
  cursor: 0,
  pending: null,
  roundNumber: 0,
  history: new Map()
};

function json(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) throw new Error("Request body too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function success(payload) {
  return { status: { statusCode: "SUCCESS", statusMessage: "OK" }, ...payload };
}

async function handleRgs(request, response, url) {
  if (url.pathname === "/wallet/authenticate" && request.method === "POST") {
    const body = await readJson(request);
    if (!body.sessionID) return json(response, 400, { error: { message: "sessionID is required" } });
    return json(response, 200, success({
      balance: { amount: rgs.balanceMicro, currency: "USD" },
      round: rgs.pending,
      config: {
        betLevels,
        defaultBetLevel: 1,
        betModes: { BASE: { mode: "BASE", costMultiplier: 1, feature: false } },
        jurisdiction: {
          socialCasino: false,
          disabledFullscreen: false,
          disabledTurbo: false,
          disabledSuperTurbo: true,
          disabledAutoplay: true,
          disabledSlamstop: true,
          disabledSpacebar: false,
          disabledBuyFeature: true,
          displayNetPosition: false,
          displayRTP: false,
          displaySessionTimer: false,
          minimumRoundDuration: 0
        }
      }
    }));
  }

  if (url.pathname === "/wallet/play" && request.method === "POST") {
    const body = await readJson(request);
    if (rgs.pending) return json(response, 409, { error: { message: "ERR_BE: active round exists" } });
    if (!Number.isSafeInteger(body.amount) || body.amount <= 0) {
      return json(response, 400, { error: { message: "amount must be a positive six-decimal integer" } });
    }
    if (body.amount > rgs.balanceMicro) return json(response, 409, { error: { message: "ERR_IPB" } });

    const book = books[rgs.cursor % books.length];
    const payoutMicro = (body.amount * book.payoutMultiplier) / 100;
    if (!Number.isSafeInteger(payoutMicro)) return json(response, 500, { error: { message: "unrepresentable payout" } });
    rgs.roundNumber += 1;
    rgs.cursor += 1;
    rgs.balanceMicro -= body.amount;
    const round = Object.freeze({
      roundID: rgs.roundNumber,
      bookID: book.id,
      amount: body.amount,
      payout: payoutMicro,
      payoutMultiplier: book.payoutMultiplier / 100,
      payoutMultiplierUnits: book.payoutMultiplier,
      active: true,
      mode: body.mode ?? "BASE",
      event: "0",
      state: book.events
    });
    rgs.pending = round;
    rgs.history.set(String(round.roundID), round);
    return json(response, 200, success({
      balance: { amount: rgs.balanceMicro, currency: body.currency ?? "USD" },
      round
    }));
  }

  if (url.pathname === "/wallet/end-round" && request.method === "POST") {
    await readJson(request);
    if (!rgs.pending) return json(response, 404, { error: { message: "ERR_BNF" } });
    rgs.balanceMicro += rgs.pending.payout;
    const settled = Object.freeze({ ...rgs.pending, active: false, event: String(rgs.pending.state.length - 1) });
    rgs.history.set(String(settled.roundID), settled);
    rgs.pending = null;
    return json(response, 200, success({ balance: { amount: rgs.balanceMicro, currency: "USD" } }));
  }

  const replay = url.pathname.match(/^\/bet\/replay\/[^/]+\/[^/]+\/[^/]+\/([^/]+)$/);
  if (replay && request.method === "GET") {
    const round = rgs.history.get(decodeURIComponent(replay[1]));
    if (!round) return json(response, 404, { error: { message: "ERR_BNF" } });
    return json(response, 200, { round });
  }

  return false;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    const handled = await handleRgs(request, response, url);
    if (handled !== false) return;

    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
      return;
    }
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
