import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);
const rootPath = fileURLToPath(root);
const run = (script) => execFileSync(process.execPath, [fileURLToPath(new URL(`scripts/${script}`, root))], { cwd: rootPath, stdio: "inherit" });

run("validate-network-weather.mjs");
run("verify-network-weather-api.mjs");
run("verify-network-weather-a11y.mjs");
run("verify-selfhost.mjs");

const html = await readFile(new URL("site/network-weather/index.html", root), "utf8");
const boundary = await readFile(new URL("site/network-weather/data/iran-provinces.geojson", root), "utf8");
assert.match(boundary, /"MultiPolygon"/);
assert.match(html, /31 provinces/);
assert.match(html, /OSM-derived GeoJSON/);
for (const concept of ["Network weather radar", "Time machine", "Warnings", "Regional drill-down", "Broadcast run of show", "Presenter mode"]) {
  assert.match(html, new RegExp(concept.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "i"), `missing MVP concept: ${concept}`);
}
console.log("Network Weather MVP verification passed: fixtures, API, accessibility, self-hosting, and top-level UI concepts are covered.");
