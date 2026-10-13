import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
const { server } = await import("../server/index.mjs");
const { parseIrimoLocations, parseIrimoWarnings } = await import("../server/network-weather.mjs");
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

try {
  const parsedIrimo = parseIrimoWarnings(`
    <a href="/warning-orange.html" title="هشدار هواشناسی-سطح نارنجی شماره 58 سه شنبه مورخ 1405/07/21">هشدار هواشناسی-سطح نارنجی شماره 58</a>
    <a href="/warning-yellow.html">هشدار هواشناسی-سطح زرد مورخ 1405/07/22</a>
    <a href="/warning-red.html">هشدار هواشناسی-سطح قرمز مورخ 1405/07/23</a>
  `, "https://www.irimo.ir/far/wd/592.html");
  assert.deepEqual(parsedIrimo.map((warning) => warning.level), ["orange", "yellow", "red"]);
  assert.equal(parsedIrimo[0].url, "https://www.irimo.ir/warning-orange.html");
  assert.equal(parsedIrimo[0].date, "1405/07/21");
  const parsedLocations = parseIrimoLocations("<p>منطقه اثر: آذربایجان شرقی، زنجان و کردستان</p><p>اثر مخاطره: رگبار</p>");
  assert.deepEqual(parsedLocations.provinces.map((province) => province.name), ["East Azerbaijan", "Zanjan", "Kurdistan"]);
  assert.ok(parsedLocations.locations.some((location) => location.name === "Zanjan" && location.kind === "city"));

  const conditionResponse = await fetch(`${baseUrl}/api/network-weather?time=21:00&region=east&technology=5G&aggregation=region`);
  assert.equal(conditionResponse.status, 200);
  const condition = await conditionResponse.json();
  assert.equal(condition.schemaVersion, 1);
  assert.equal(condition.scope.id, "east");
  assert.equal(condition.filters.technology, "5G");
  assert.equal(condition.frame.provenance, "fixture-forecast");
  assert.ok(condition.frame.health.score < 65);
  assert.equal(condition.frame.health.dataQuality, "complete");
  assert.equal(condition.warningSource.provider, "Iran Meteorological Organization (IRIMO)");
  assert.match(condition.warningSource.url, /irimo\.ir\/far\/wd\/592/);
  assert.deepEqual(condition.warningSource.levels, {
    yellow: "Awareness / prepare",
    orange: "Urgent action",
    red: "Immediate comprehensive action",
  });
  assert.ok(condition.alerts.some((alert) => alert.weatherLevel === "orange"));

  const warningResponse = await fetch(`${baseUrl}/api/network-weather/warnings`);
  assert.equal(warningResponse.status, 200);
  const warnings = await warningResponse.json();
  assert.equal(warnings.source.provider, "IRIMO");
  assert.ok(["live", "stale", "fallback"].includes(warnings.status));
  assert.ok(Array.isArray(warnings.warnings));
  assert.ok(warnings.warnings.every((warning) => warning.location && Array.isArray(warning.location.locations)));

  const missingHealthResponse = await fetch(`${baseUrl}/api/network-weather?time=14:00`);
  assert.equal(missingHealthResponse.status, 200);
  const missingHealth = await missingHealthResponse.json();
  const degraded = { ...missingHealth.frame, latency: undefined };
  const { calculateNetworkHealth } = await import("../server/network-weather.mjs");
  assert.equal(calculateNetworkHealth(degraded).dataQuality, "degraded");

  const timelineResponse = await fetch(`${baseUrl}/api/network-weather/timeline`);
  assert.equal(timelineResponse.status, 200);
  const timeline = await timelineResponse.json();
  assert.equal(timeline.frames.length, 13);
  assert.equal(timeline.timezone, "Asia/Tehran");
  assert.equal(timeline.boundary.observedThrough, "14:00");
  assert.equal(timeline.boundary.forecastFrom, "15:00");
  assert.deepEqual(timeline.boundary.gap, { from: "11:00", to: "14:00", reason: "fixture-only demo horizon" });
  assert.deepEqual(timeline.scenarios.map((scenario) => scenario.id), ["traffic-peak", "congestion-onset", "outage", "recovery", "maintenance-impact"]);
  assert.ok(timeline.scenarios.every((scenario) => scenario.provenance.startsWith("fixture-")));
  assert.equal(timeline.frames.filter((frame) => frame.observed).length, 7);
  assert.equal(timeline.frames.filter((frame) => !frame.observed).length, 6);
  assert.ok(timeline.frames.every((frame, index, frames) => index === 0 || frame.time !== frames[index - 1].time));

  const badTimeResponse = await fetch(`${baseUrl}/api/network-weather?time=99:99`);
  assert.equal(badTimeResponse.status, 400);
  assert.match((await badTimeResponse.json()).error, /Unknown time/);

  const badRegionResponse = await fetch(`${baseUrl}/api/network-weather?region=moon`);
  assert.equal(badRegionResponse.status, 400);
  assert.match((await badRegionResponse.json()).error, /Unknown region/);

  console.log("Network Weather API verified: condition, timeline, and invalid-filter responses passed.");
} finally {
  await new Promise((resolve) => server.close(resolve));
}
