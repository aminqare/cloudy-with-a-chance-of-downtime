import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../site/network-weather/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../site/network-weather/styles.css", import.meta.url), "utf8");
const app = await readFile(new URL("../site/network-weather/app.js", import.meta.url), "utf8");

for (const control of ["timeline", "prev-btn", "next-btn", "play-btn", "now-btn", "plus-hour-btn", "tonight-btn", "tomorrow-btn", "speed-select", "audience-select", "fullscreen-btn", "pan-left", "pan-right", "pan-up", "pan-down", "zoom-in", "zoom-out", "zoom-reset"]) {
  assert.match(html, new RegExp(`id=\\"${control}\\"`), `missing control: ${control}`);
}
for (const layer of ["coverage", "traffic", "congestion", "latency", "incidents", "maintenance", "technology"]) {
  assert.match(html, new RegExp(`data-layer=\\"${layer}\\"`), `missing map layer: ${layer}`);
}
assert.match(html, /role="status" aria-live="polite"/);
assert.match(html, /id="narrative" aria-live="polite"/);
assert.match(html, /aria-label="Network forecast time"/);
assert.match(css, /:focus-visible/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(app, /reduced-motion/);
assert.match(app, /Stale · last known/);
assert.match(app, /Not applicable/);
assert.match(app, /acknowledgedAlerts/);
assert.match(app, /signals grouped/);
console.log("Network Weather accessibility smoke check passed: labeled controls, live regions, focus, and reduced motion present.");
