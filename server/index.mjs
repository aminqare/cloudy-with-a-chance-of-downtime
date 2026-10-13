import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchIrimoWarnings, getNetworkWeatherPayload, networkWeatherFrames, networkWeatherRegions, networkWeatherSchemaVersion, networkWeatherScenarios } from "./network-weather.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "..");
const siteRoot = resolve(projectRoot, "site");
const port = Number.parseInt(process.env.PORT || "3000", 10);
const host = process.env.HOST || "0.0.0.0";
const dataDir = resolve(process.env.DATA_DIR || join(projectRoot, "data"));
const dbPath = join(dataDir, "engineer-day.sqlite");

mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    theme TEXT NOT NULL DEFAULT 'red',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const listMemories = db.prepare(
  "SELECT id, name, message, theme, created_at AS createdAt FROM memories ORDER BY id DESC LIMIT 60",
);
const addMemory = db.prepare(
  "INSERT INTO memories (name, message, theme) VALUES (?, ?, ?) RETURNING id, name, message, theme, created_at AS createdAt",
);

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
  [".mp4", "video/mp4"],
]);

const allowedThemes = new Set(["red", "gold", "jade", "azure"]);
const postWindows = new Map();
const maxBodyBytes = 16 * 1024;

function clean(value, max) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

function securityHeaders(contentType) {
  return {
    "content-type": contentType,
    "x-content-type-options": "nosniff",
    "x-frame-options": "SAMEORIGIN",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' data:; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
  };
}

function sendJson(response, body, status = 200) {
  response.writeHead(status, {
    ...securityHeaders("application/json; charset=utf-8"),
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolveBody, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        reject(Object.assign(new Error("Request body too large"), { statusCode: 413 }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(Object.assign(new Error("Invalid JSON"), { statusCode: 400 }));
      }
    });
    request.on("error", reject);
  });
}

function clientAddress(request) {
  return request.socket.remoteAddress || "unknown";
}

function isRateLimited(request) {
  const key = clientAddress(request);
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const recent = (postWindows.get(key) || []).filter((time) => now - time < windowMs);
  if (recent.length >= 8) return true;
  recent.push(now);
  postWindows.set(key, recent);
  return false;
}

function serveFile(request, response, requestedPath) {
  const relativePath = requestedPath.slice(1);
  const relative = requestedPath === "/"
    ? "index.html"
    : relativePath.endsWith("/")
      ? `${relativePath}index.html`
      : relativePath;
  let decoded;
  try {
    decoded = decodeURIComponent(relative);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }
  const filePath = resolve(siteRoot, decoded);
  if (!filePath.startsWith(`${siteRoot}${sep}`) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, securityHeaders("text/plain; charset=utf-8"));
    response.end("Not found");
    return;
  }

  const fileSize = statSync(filePath).size;
  const type = mimeTypes.get(extname(filePath).toLowerCase()) || "application/octet-stream";
  const cacheControl = filePath.endsWith("index.html") ? "no-cache" : "public, max-age=3600";
  const range = request.headers.range;

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      response.writeHead(416, { "content-range": `bytes */${fileSize}` });
      response.end();
      return;
    }
    const start = match[1] ? Number.parseInt(match[1], 10) : 0;
    const end = match[2] ? Number.parseInt(match[2], 10) : fileSize - 1;
    if (start > end || end >= fileSize) {
      response.writeHead(416, { "content-range": `bytes */${fileSize}` });
      response.end();
      return;
    }
    response.writeHead(206, {
      ...securityHeaders(type),
      "accept-ranges": "bytes",
      "cache-control": cacheControl,
      "content-length": end - start + 1,
      "content-range": `bytes ${start}-${end}/${fileSize}`,
    });
    if (request.method === "HEAD") return response.end();
    createReadStream(filePath, { start, end }).pipe(response);
    return;
  }

  response.writeHead(200, {
    ...securityHeaders(type),
    "accept-ranges": "bytes",
    "cache-control": cacheControl,
    "content-length": fileSize,
  });
  if (request.method === "HEAD") return response.end();
  createReadStream(filePath).pipe(response);
}

export const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    if (url.pathname === "/health" && request.method === "GET") {
      sendJson(response, { status: "ok", service: "engineer-day", networkWeather: { schemaVersion: networkWeatherSchemaVersion, fixtureFrames: networkWeatherFrames.length } });
      return;
    }

    if (url.pathname === "/ready" && request.method === "GET") {
      sendJson(response, { status: "ready", checks: { staticAssets: existsSync(siteRoot), networkWeatherFixtures: networkWeatherFrames.length > 0, schemaVersion: networkWeatherSchemaVersion } });
      return;
    }

    if (url.pathname === "/api/network-weather" && request.method === "GET") {
      const requestedTime = url.searchParams.get("time");
      const requestedRegion = url.searchParams.get("region");
      const requestedTechnology = url.searchParams.get("technology");
      const aggregation = url.searchParams.get("aggregation");
      if (requestedTime && !networkWeatherFrames.some((frame) => frame.time === requestedTime)) {
        sendJson(response, { error: "Unknown time frame", validTimes: networkWeatherFrames.map((frame) => frame.time) }, 400);
        return;
      }
      if (requestedRegion && !networkWeatherRegions.some((region) => region.id === requestedRegion)) {
        sendJson(response, { error: "Unknown region", validRegions: networkWeatherRegions.map((region) => region.id) }, 400);
        return;
      }
      if (aggregation && !["metro", "region"].includes(aggregation)) {
        sendJson(response, { error: "Unsupported aggregation", validAggregations: ["metro", "region"] }, 400);
        return;
      }
      if (requestedTechnology && !["4G", "5G", "4G/5G"].includes(requestedTechnology)) {
        sendJson(response, { error: "Unsupported technology", validTechnologies: ["4G", "5G", "4G/5G"] }, 400);
        return;
      }
      const payload = getNetworkWeatherPayload({
        time: requestedTime || undefined,
        regionId: requestedRegion || undefined,
        technology: requestedTechnology || undefined,
        aggregation: aggregation || undefined,
      });
      sendJson(response, payload);
      return;
    }

    if (url.pathname === "/api/network-weather/warnings" && request.method === "GET") {
      const payload = await fetchIrimoWarnings({ force: url.searchParams.get("refresh") === "1" });
      sendJson(response, payload);
      return;
    }

    if (url.pathname === "/api/network-weather/timeline" && request.method === "GET") {
      sendJson(response, {
        schemaVersion: networkWeatherSchemaVersion,
        timezone: "Asia/Tehran",
        frames: networkWeatherFrames,
        boundary: { observedThrough: "14:00", forecastFrom: "15:00", gap: { from: "11:00", to: "14:00", reason: "fixture-only demo horizon" } },
        scenarios: networkWeatherScenarios,
      });
      return;
    }

    if (url.pathname === "/api/memories" && request.method === "GET") {
      sendJson(response, { memories: listMemories.all() });
      return;
    }

    if (url.pathname === "/api/memories" && request.method === "POST") {
      if (!(request.headers["content-type"] || "").includes("application/json")) {
        sendJson(response, { error: "Invalid request." }, 415);
        return;
      }
      if (isRateLimited(request)) {
        sendJson(response, { error: "Please wait a little before adding another memory." }, 429);
        return;
      }

      const payload = await readJson(request);
      const name = clean(payload.name, 40);
      const message = clean(payload.message, 280);
      const theme = allowedThemes.has(payload.theme) ? payload.theme : "red";
      if (!name || name.length < 2) return sendJson(response, { error: "Please add your name." }, 400);
      if (!message || message.length < 3) return sendJson(response, { error: "Please write a slightly longer memory." }, 400);
      if (payload.website) return sendJson(response, { error: "Unable to post this message." }, 400);

      const row = addMemory.get(name, message, theme);
      sendJson(response, { memory: row }, 201);
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { allow: "GET, HEAD, POST" });
      response.end();
      return;
    }

    serveFile(request, response, url.pathname);
  } catch (error) {
    console.error("request-failed", error);
    if (!response.headersSent) {
      sendJson(response, { error: "The site is temporarily unavailable. Please try again." }, error.statusCode || 500);
    } else {
      response.end();
    }
  }
});

if (process.env.NODE_ENV !== "test") {
  server.listen(port, host, () => {
    console.log(`Huawei A2 Engineer Day is running on http://${host}:${port}`);
    console.log(`Memory wall database: ${dbPath}`);
  });
}

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
