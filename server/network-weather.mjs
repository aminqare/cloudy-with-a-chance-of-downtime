import https from "node:https";
import { readFileSync } from "node:fs";

export const networkWeatherSchemaVersion = 1;

export const irimoWarningListUrl = "https://www.irimo.ir/far/wd/592-%D9%87%D8%B4%D8%AF%D8%A7%D8%B1%D9%87%D8%A7%DB%8C-%D9%87%D9%88%D8%A7%D8%B4%D9%86%D8%A7%D8%B3%DB%8C.html";
export const irimoWarningGuideUrl = "https://www.irimo.ir/far/services/file_manager/1137027/download/1/%D8%B1%D8%A7%D9%87%D9%86%D9%85%D8%A7%DB%8C-%D9%85%D9%81%D9%87%D9%88%D9%85-%D9%87%D8%B4%D8%AF%D8%A7%D8%B1%D9%87%D8%A7.html";

export const irimoWarningLevels = {
  yellow: { fa: "هشدار زرد", label: "Awareness / prepare", severity: "warning" },
  orange: { fa: "هشدار نارنجی", label: "Urgent action", severity: "severe" },
  red: { fa: "هشدار قرمز", label: "Immediate comprehensive action", severity: "critical" },
};

let irimoWarningCache = { fetchedAt: 0, data: null };
let weatherConditionCache = { fetchedAt: 0, data: null };
const irimoCities = JSON.parse(readFileSync(new URL("../site/network-weather/data/iran-cities.json", import.meta.url), "utf8"));
const provinceNames = new Map([
  ["آذربایجان شرقی", "East Azerbaijan"], ["اذربایجان شرقی", "East Azerbaijan"], ["آذربایجان غربی", "West Azerbaijan"],
  ["اردبیل", "Ardabil"], ["اصفهان", "Isfahan"], ["البرز", "Alborz"], ["ایلام", "Ilam"], ["بوشهر", "Bushehr"], ["تهران", "Tehran"],
  ["چهارمحال و بختیاری", "Chaharmahal and Bakhtiari"], ["خراسان جنوبی", "South Khorasan"], ["خراسان رضوی", "Razavi Khorasan"], ["خراسان شمالی", "North Khorasan"],
  ["خوزستان", "Khuzestan"], ["زنجان", "Zanjan"], ["سمنان", "Semnan"], ["سیستان و بلوچستان", "Sistan and Baluchestan"], ["فارس", "Fars"],
  ["قزوین", "Qazvin"], ["قم", "Qom"], ["کردستان", "Kurdistan"], ["کرمان", "Kerman"], ["کرمانشاه", "Kermanshah"],
  ["کهکیلویه و بویراحمد", "Kohgiluyeh and Boyer-Ahmad"], ["کهگیلویه و بویراحمد", "Kohgiluyeh and Boyer-Ahmad"], ["گلستان", "Golestan"], ["گیلان", "Gilan"],
  ["لرستان", "Lorestan"], ["مازندران", "Mazandaran"], ["مرکزی", "Markazi"], ["هرمزگان", "Hormozgan"], ["همدان", "Hamadan"], ["یزد", "Yazd"],
]);

export const weatherSourceCatalog = [
  { provider: "IRIMO", role: "official Iranian warnings", access: "HTML parser + scheduled snapshot", url: irimoWarningListUrl },
  { provider: "Open-Meteo", role: "live wind, temperature, humidity, and weather code", access: "public forecast API; no key for non-commercial use", url: "https://open-meteo.com/en/docs" },
  { provider: "OpenWeatherMap", role: "production fallback and alerts", access: "API key required", url: "https://docs.openweather.co.uk/api/one-call-3" },
  { provider: "WeatherAPI.com", role: "production fallback and historical weather", access: "API key required", url: "https://www.weatherapi.com/docs/" },
];

const weatherStations = [
  { id: "tehran", name: "Tehran", lat: 35.6892, lon: 51.3890 },
  { id: "tabriz", name: "Tabriz", lat: 38.0962, lon: 46.2738 },
  { id: "mashhad", name: "Mashhad", lat: 36.2605, lon: 59.6168 },
  { id: "isfahan", name: "Isfahan", lat: 32.6546, lon: 51.6680 },
  { id: "shiraz", name: "Shiraz", lat: 29.5918, lon: 52.5837 },
  { id: "bandar-abbas", name: "Bandar Abbas", lat: 27.1832, lon: 56.2666 },
];

function windCompass(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(Number(degrees || 0) / 45) % directions.length];
}

export async function fetchWeatherConditions({ force = false } = {}) {
  const cacheAge = Date.now() - weatherConditionCache.fetchedAt;
  if (!force && weatherConditionCache.data && cacheAge < 5 * 60 * 1000) return weatherConditionCache.data;
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", weatherStations.map((station) => station.lat).join(","));
    url.searchParams.set("longitude", weatherStations.map((station) => station.lon).join(","));
    url.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m");
    url.searchParams.set("timezone", "Asia/Tehran");
    url.searchParams.set("forecast_days", "1");
    const response = await fetch(url, { headers: { "user-agent": "Network Weather MVP/1.0" }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);
    const raw = await response.json();
    const records = Array.isArray(raw) ? raw : [raw];
    const stations = weatherStations.map((station, index) => {
      const current = records[index]?.current || {};
      return { ...station, temperatureC: current.temperature_2m ?? null, humidity: current.relative_humidity_2m ?? null, weatherCode: current.weather_code ?? null, windKmh: current.wind_speed_10m ?? null, windGustKmh: current.wind_gusts_10m ?? null, windDirection: windCompass(current.wind_direction_10m), observedAt: current.time || null };
    });
    const data = { status: "live", fetchedAt: new Date().toISOString(), source: { provider: "Open-Meteo", url: "https://open-meteo.com/en/docs" }, stations };
    weatherConditionCache = { fetchedAt: Date.now(), data };
    return data;
  } catch (error) {
    if (weatherConditionCache.data) return { ...weatherConditionCache.data, status: "stale", error: "Open-Meteo refresh failed; showing the last successful fetch." };
    return { status: "fallback", fetchedAt: new Date().toISOString(), source: { provider: "Open-Meteo", url: "https://open-meteo.com/en/docs" }, stations: [], error: error.message };
  }
}

function requestIrimoHtml(targetUrl = irimoWarningListUrl) {
  return new Promise((resolve, reject) => {
    const request = https.get(targetUrl, {
      headers: { "user-agent": "Network Weather MVP/1.0 (+IRIMO warning monitor)" },
      // IRIMO's current endpoint uses a legacy DH parameter size; keep this
      // narrowly scoped to this official source rather than lowering global TLS security.
      agent: new https.Agent({ ciphers: "DEFAULT@SECLEVEL=1" }),
    }, (response) => {
      const chunks = [];
      let received = 0;
      response.on("data", (chunk) => {
        received += chunk.length;
        if (received > 2 * 1024 * 1024) {
          request.destroy(new Error("IRIMO response exceeded the 2 MB safety limit"));
          return;
        }
        chunks.push(chunk);
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`IRIMO returned ${response.statusCode}`));
          return;
        }
        resolve(Buffer.concat(chunks).toString("utf8"));
      });
    });
    request.setTimeout(8000, () => request.destroy(new Error("IRIMO request timed out")));
    request.on("error", reject);
  });
}

function stripHtml(value) {
  return decodeHtml(value).replace(/\s+/g, " ").trim();
}

export function parseIrimoLocations(html) {
  const text = stripHtml(html);
  const match = /منطقه\s*اثر\s*:\s*(.*?)(?=اثر\s*مخاطره\s*:|توصیه\s*:|$)/.exec(text);
  const affectedArea = match?.[1]?.trim() || "";
  const geographyText = affectedArea.replace(/خلیج\s+فارس/g, "");
  const provinces = [...provinceNames.entries()]
    .filter(([persian]) => geographyText.includes(persian))
    .map(([persian, english]) => ({ name: english, nameFa: persian }));
  const cities = irimoCities
    .filter((city) => city.fa && geographyText.includes(city.fa))
    .map((city) => ({ name: city.name, nameFa: city.fa, province: city.province, lat: city.lat, lon: city.lon }));
  const provinceLocations = provinces
    .filter((province) => !cities.some((city) => city.province === province.name))
    .map((province) => {
      const capital = irimoCities.find((city) => city.capital && city.province === province.name);
      return { name: province.name, nameFa: province.nameFa, province: province.name, lat: capital?.lat ?? null, lon: capital?.lon ?? null, kind: "province" };
    });
  return { affectedArea, provinces, cities, locations: [...cities.map((city) => ({ ...city, kind: "city" })), ...provinceLocations] };
}

async function enrichIrimoWarning(warning) {
  try {
    const detailUrl = new URL(warning.url);
    detailUrl.search = "";
    const detail = await requestIrimoHtml(detailUrl.href);
    return { ...warning, location: parseIrimoLocations(detail), detailFetched: true };
  } catch {
    return { ...warning, location: { affectedArea: "", provinces: [], cities: [], locations: [] }, detailFetched: false };
  }
}

async function enrichIrimoWarnings(warnings) {
  const enriched = [];
  for (let index = 0; index < warnings.length; index += 4) {
    enriched.push(...await Promise.all(warnings.slice(index, index + 4).map(enrichIrimoWarning)));
  }
  return enriched;
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&zwnj;/gi, "")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function slug(value) {
  return decodeHtml(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export function parseIrimoWarnings(html, sourceUrl = irimoWarningListUrl) {
  const warnings = [];
  const seen = new Set();
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchorPattern.exec(String(html || "")))) {
    const attributes = match[1];
    const hrefMatch = /\bhref\s*=\s*["']([^"']+)["']/i.exec(attributes);
    const titleMatch = /\btitle\s*=\s*["']([^"']*)["']/i.exec(attributes);
    const text = decodeHtml(titleMatch?.[1] || match[2]);
    if (!/هشدار/.test(text)) continue;
    const levelMatch = /سطح\s+(زرد|نارنجی|قرمز)/.exec(text);
    if (!levelMatch) continue;
    const level = { زرد: "yellow", نارنجی: "orange", قرمز: "red" }[levelMatch[1]];
    const metadata = irimoWarningLevels[level];
    const href = hrefMatch?.[1] ? new URL(hrefMatch[1], sourceUrl).href : sourceUrl;
    const date = /مورخ\s+([\d۰-۹/]+)/.exec(text)?.[1] || null;
    const key = `${href}|${text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    warnings.push({
      id: `irimo-${level}-${slug(text) || warnings.length + 1}`,
      provider: "IRIMO",
      level,
      levelFa: metadata.fa,
      severity: metadata.severity,
      title: text,
      date,
      url: href,
      sourceUrl,
      live: false,
      status: "official-bulletin",
    });
  }
  return warnings.slice(0, 24);
}

export async function fetchIrimoWarnings({ force = false } = {}) {
  const cacheAge = Date.now() - irimoWarningCache.fetchedAt;
  if (!force && irimoWarningCache.data && cacheAge < 5 * 60 * 1000) return irimoWarningCache.data;
  try {
    const warnings = parseIrimoWarnings(await requestIrimoHtml());
    const enriched = await enrichIrimoWarnings(warnings.slice(0, 4));
    const remaining = warnings.slice(4).map((warning) => ({ ...warning, location: { affectedArea: "", provinces: [], cities: [], locations: [] }, detailFetched: false }));
    const normalizedWarnings = [...enriched, ...remaining];
    if (!normalizedWarnings.length) throw new Error("IRIMO warning list contained no normalized warnings");
    const data = {
      status: "live",
      fetchedAt: new Date().toISOString(),
      source: { provider: "IRIMO", url: irimoWarningListUrl, guideUrl: irimoWarningGuideUrl, levels: irimoWarningLevels },
      warnings: normalizedWarnings,
    };
    irimoWarningCache = { fetchedAt: Date.now(), data };
    return data;
  } catch (error) {
    if (irimoWarningCache.data) return { ...irimoWarningCache.data, status: "stale", error: "IRIMO refresh failed; showing last successful fetch." };
    return {
      status: "fallback",
      fetchedAt: new Date().toISOString(),
      error: "IRIMO warning feed is temporarily unavailable.",
      source: { provider: "IRIMO", url: irimoWarningListUrl, guideUrl: irimoWarningGuideUrl, levels: irimoWarningLevels },
      warnings: [],
    };
  }
}

export const networkWeatherRegions = [
  { id: "north", name: "Northern ridge", sites: 3, technology: "4G/5G", status: "watch" },
  { id: "central", name: "Central core", sites: 3, technology: "4G/5G", status: "healthy" },
  { id: "east", name: "Eastern corridor", sites: 2, technology: "5G", status: "degraded" },
  { id: "west", name: "Western gateway", sites: 2, technology: "4G/5G", status: "healthy" },
  { id: "south", name: "Southern belt", sites: 1, technology: "4G", status: "healthy" },
  { id: "airport", name: "Airport corridor", sites: 1, technology: "4G/5G", status: "watch" },
];

export const networkWeatherFrames = [
  ["06:00", "clear", 97.9, 41, 24, 128, 0.4, 88, 1, 98],
  ["07:00", "clear", 98.1, 45, 25, 134, 0.3, 89, 1, 98],
  ["08:00", "clear", 98.2, 49, 26, 140, 0.3, 88, 1, 97],
  ["09:00", "clear", 98.5, 52, 27, 146, 0.2, 87, 0, 97],
  ["10:00", "clear", 98.7, 55, 27, 151, 0.2, 88, 0, 97],
  ["11:00", "cloud", 98.4, 59, 29, 155, 0.3, 86, 1, 96],
  ["14:00", "clear", 98.8, 63, 28, 158, 0.2, 87, 1, 96],
  ["15:00", "cloud", 98.2, 67, 32, 162, 0.4, 84, 2, 93],
  ["16:00", "cloud", 97.8, 72, 36, 166, 0.6, 82, 2, 91],
  ["18:00", "rain", 96.9, 81, 44, 151, 1.1, 78, 4, 86],
  ["21:00", "storm", 94.8, 91, 68, 118, 2.7, 69, 7, 78],
  ["23:00", "cloud", 96.4, 76, 49, 139, 1.4, 76, 3, 82],
  ["00:00", "clear", 97.5, 58, 33, 147, 0.6, 83, 1, 86],
].map(([time, state, availability, utilization, latency, throughput, loss, signal, incidents, confidence], index) => ({
  time, state, availability, utilization, latency, throughput, loss, signal, incidents, confidence,
  observed: index <= 6,
  provenance: index <= 6 ? "fixture-observation" : "fixture-forecast",
  freshness: index <= 6 ? "42 seconds" : "forecast frame",
}));

export const networkWeatherAlerts = [
  { id: "a1", severity: "warning", weatherLevel: "yellow", weatherLevelFa: "هشدار زرد", title: "North ridge congestion watch", detail: "Utilization forecast to exceed 80% at 18:00", region: "north", time: "18:00", state: "Forecast" },
  { id: "a2", severity: "severe", weatherLevel: "orange", weatherLevelFa: "هشدار نارنجی", title: "Eastern corridor interference", detail: "SINR deterioration on 5G sectors E-04 and E-05", region: "east", time: "Now", state: "Observed" },
  { id: "a3", severity: "info", title: "Planned maintenance · airport", detail: "Backhaul maintenance window may reduce redundancy", region: "airport", time: "21:00", state: "Planned" },
  { id: "a4", severity: "critical", weatherLevel: "red", weatherLevelFa: "هشدار قرمز", title: "East cluster site outage", detail: "E-05 unavailable; customer impact high in eastern corridor", region: "east", time: "21:00", state: "Forecast" },
  { id: "a5", severity: "severe", weatherLevel: "orange", weatherLevelFa: "هشدار نارنجی", title: "West backhaul interference", detail: "Microwave link quality reduced on the western gateway", region: "west", time: "18:00", state: "Forecast" },
  { id: "a6", severity: "warning", weatherLevel: "yellow", weatherLevelFa: "هشدار زرد", title: "Airport power resilience watch", detail: "Backup power test overlaps with maintenance window", region: "airport", time: "21:00", state: "Planned" },
];

export const networkWeatherScenarios = [
  { id: "traffic-peak", label: "Traffic peak", time: "18:00", state: "rain", region: "north", provenance: "fixture-forecast" },
  { id: "congestion-onset", label: "Congestion onset", time: "16:00", state: "cloud", region: "east", provenance: "fixture-forecast" },
  { id: "outage", label: "Localized outage", time: "21:00", state: "storm", region: "east", provenance: "fixture-forecast" },
  { id: "recovery", label: "Recovery", time: "00:00", state: "clear", region: "east", provenance: "fixture-forecast" },
  { id: "maintenance-impact", label: "Planned maintenance impact", time: "21:00", state: "storm", region: "airport", provenance: "fixture-planned" },
];

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function calculateNetworkHealth(frame) {
  const requiredMetrics = ["availability", "utilization", "latency", "throughput", "loss", "signal"];
  const missingMetrics = requiredMetrics.filter((metric) => !Number.isFinite(frame[metric]));
  const value = (metric) => Number.isFinite(frame[metric]) ? frame[metric] : 0;
  const score = 0.3 * value("availability")
    + 0.2 * (100 - value("utilization"))
    + 0.15 * (100 - clamp(value("latency") / 80 * 100))
    + 0.15 * clamp(value("throughput") / 2)
    + 0.1 * (100 - clamp(value("loss") / 3 * 100))
    + 0.1 * value("signal");
  const health = Math.round(clamp(score));
  const severity = health >= 80 ? "clear" : health >= 65 ? "watch" : health >= 45 ? "severe" : "critical";
  return { score: health, severity, dataQuality: missingMetrics.length ? "degraded" : "complete", missingMetrics };
}

export function getNetworkWeatherPayload({ time, regionId, technology, aggregation = "metro" } = {}) {
  const frame = networkWeatherFrames.find((candidate) => candidate.time === time) || networkWeatherFrames[6];
  const region = regionId ? networkWeatherRegions.find((candidate) => candidate.id === regionId) : null;
  return {
    schemaVersion: networkWeatherSchemaVersion,
    generatedAt: "2026-10-13T10:30:00+03:30",
    scope: region || { id: "tehran-metro", name: "Tehran metro", sites: 12 },
    filters: { technology: technology || "all", aggregation },
    frame: { ...frame, health: calculateNetworkHealth(frame) },
    regions: region ? [region] : networkWeatherRegions,
    alerts: networkWeatherAlerts,
    warningSource: {
      provider: "Iran Meteorological Organization (IRIMO)",
      url: "https://www.irimo.ir/far/wd/592-%D9%87%D8%B4%D8%AF%D8%A7%D8%B1%D9%87%D8%A7%DB%8C-%D9%87%D9%88%D8%A7%D8%B4%D9%86%D8%A7%D8%B3%DB%8C.html",
      levels: {
        yellow: "Awareness / prepare",
        orange: "Urgent action",
        red: "Immediate comprehensive action",
      },
      limitation: "Live IRIMO warnings are fetched by /api/network-weather/warnings with a cache and fallback; telecom impact correlation remains illustrative.",
    },
    scenarios: networkWeatherScenarios,
    limitations: ["Illustrative fixture data", "No live NMS/OSS connector configured"],
  };
}
