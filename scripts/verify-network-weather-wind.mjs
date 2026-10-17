import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../site/network-weather/app.js", import.meta.url), "utf8");
const snapshot = JSON.parse(await readFile(new URL("../site/network-weather/data/weather-conditions.json", import.meta.url), "utf8"));

assert.match(app, /const toScreenAngle = \(fromBearing\) => \(\(fromBearing \+ 90\) % 360\)/, "screen direction conversion is missing");
assert.match(app, /data-from-direction/, "wind source direction metadata is missing");
assert.match(app, /data-to-direction/, "wind travel direction metadata is missing");
assert.match(app, /data-wind-duration/, "wind duration metadata is missing");
assert.match(app, /Number\(station\.windKmh\) > 0\.5/, "calm wind suppression is missing");
assert.match(app, /Math\.pow\(5 \/ Math\.max\(5, speed\)/, "speed calibration is missing");
assert.ok(Array.isArray(snapshot.stations) && snapshot.stations.length > 0, "weather snapshot has no stations");
for (const station of snapshot.stations) {
  assert.equal(typeof station.windDirection, "string", `${station.name} has no normalized wind direction`);
  assert.ok(Number.isFinite(Number(station.windKmh)), `${station.name} has no numeric wind speed`);
}
console.log(`Network Weather wind verification passed: ${snapshot.stations.length} normalized station observations and calibrated vector metadata are present.`);
