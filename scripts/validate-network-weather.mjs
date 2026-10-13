import assert from "node:assert/strict";
import { calculateNetworkHealth, networkWeatherFrames, networkWeatherRegions, networkWeatherSchemaVersion } from "../server/network-weather.mjs";

assert.equal(networkWeatherSchemaVersion, 1);
assert.ok(networkWeatherRegions.length >= 6);
assert.equal(networkWeatherFrames.length, 13);
assert.equal(networkWeatherFrames.filter((frame) => frame.observed).length, 7);
assert.equal(networkWeatherFrames.filter((frame) => !frame.observed).length, 6);

for (const frame of networkWeatherFrames) {
  assert.match(frame.time, /^\d{2}:\d{2}$/);
  assert.ok(frame.availability >= 0 && frame.availability <= 100);
  assert.ok(frame.utilization >= 0 && frame.utilization <= 100);
  assert.ok(frame.latency >= 0 && frame.throughput >= 0);
  assert.ok(frame.loss >= 0 && frame.signal >= 0 && frame.signal <= 100);
  const health = calculateNetworkHealth(frame);
  assert.ok(health.score >= 0 && health.score <= 100);
  assert.ok(["clear", "watch", "severe", "critical"].includes(health.severity));
}

console.log(`Network Weather fixtures valid: schema v${networkWeatherSchemaVersion}, ${networkWeatherFrames.length} frames, ${networkWeatherRegions.length} regions.`);
