import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const dataDir = await mkdtemp(join(tmpdir(), "engineer-day-"));
const port = 43117;
const child = spawn(process.execPath, ["server/index.mjs"], {
  cwd: new URL("..", import.meta.url),
  env: { ...process.env, PORT: String(port), HOST: "127.0.0.1", DATA_DIR: dataDir },
  stdio: ["ignore", "pipe", "pipe"],
});

let stderr = "";
child.stderr.on("data", (chunk) => { stderr += chunk; });

async function waitUntilReady() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not become ready. ${stderr}`);
}

try {
  await waitUntilReady();

  const readiness = await fetch(`http://127.0.0.1:${port}/ready`);
  const readinessBody = await readiness.json();
  if (!readiness.ok || readinessBody.status !== "ready" || readinessBody.checks.schemaVersion !== 1) throw new Error("Readiness verification failed.");

  const page = await fetch(`http://127.0.0.1:${port}/`);
  if (!page.ok || !(await page.text()).includes("Huawei A2")) throw new Error("Home page verification failed.");
  if (page.headers.get("x-content-type-options") !== "nosniff" || page.headers.get("content-security-policy") === null) {
    throw new Error("Security header verification failed.");
  }

  const invalidWeather = await fetch(`http://127.0.0.1:${port}/api/network-weather?time=99:99`);
  if (invalidWeather.status !== 400) throw new Error("Network Weather input validation failed.");

  const video = await fetch(`http://127.0.0.1:${port}/landing-dance.mp4`, {
    headers: { range: "bytes=0-1023" },
  });
  if (video.status !== 206 || Number(video.headers.get("content-length")) !== 1024) {
    throw new Error("Landing video range delivery failed.");
  }

  const created = await fetch(`http://127.0.0.1:${port}/api/memories`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Deployment check", message: "Memory wall is ready.", theme: "jade" }),
  });
  if (created.status !== 201) throw new Error(`Memory creation failed with ${created.status}.`);

  for (let attempt = 0; attempt < 7; attempt += 1) {
    await fetch(`http://127.0.0.1:${port}/api/memories`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Deployment check", message: `Rate limit setup ${attempt}.`, theme: "jade" }),
    });
  }
  const throttled = await fetch(`http://127.0.0.1:${port}/api/memories`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Deployment check", message: "Ninth message should be throttled.", theme: "jade" }),
  });
  if (throttled.status !== 429) throw new Error("Rate-limit verification failed.");

  const listing = await fetch(`http://127.0.0.1:${port}/api/memories`);
  const body = await listing.json();
  if (!listing.ok || !body.memories?.some((memory) => memory.message === "Memory wall is ready.")) {
    throw new Error("Memory persistence verification failed.");
  }

  console.log("Self-hosted server, static assets, API, and SQLite persistence verified.");
} finally {
  child.kill("SIGTERM");
  await new Promise((resolve) => child.once("exit", resolve));
  await rm(dataDir, { recursive: true, force: true });
}
