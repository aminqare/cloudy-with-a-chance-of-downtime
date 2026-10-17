import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fetchWeatherConditions } from "../server/network-weather.mjs";

const outputPath = new URL("../site/network-weather/data/weather-conditions.json", import.meta.url);
const payload = await fetchWeatherConditions({ force: true, includeIrimo: false });
if (!payload.stations?.length) throw new Error("Weather providers returned no station data");

const stable = (value) => JSON.stringify({
  ...value,
  fetchedAt: null,
  stations: value.stations.map((station) => ({ ...station, observedAt: null })),
});
let previous = null;
try { previous = JSON.parse(await readFile(outputPath, "utf8")); } catch { /* first snapshot */ }
if (previous && stable(previous) === stable(payload)) process.exit(0);

await mkdir(new URL(".", outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Weather snapshot updated: ${payload.source.provider}`);
