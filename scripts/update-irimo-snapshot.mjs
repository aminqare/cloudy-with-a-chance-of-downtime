import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fetchIrimoWarnings } from "../server/network-weather.mjs";

const output = new URL("../site/network-weather/data/irimo-warnings.json", import.meta.url);
const payload = await fetchIrimoWarnings({ force: true });

// Never replace a known-good public snapshot with a transient IRIMO outage.
// The Pages build consumes this file when the live server API is unavailable.
if (payload.status === "fallback" || !Array.isArray(payload.warnings) || payload.warnings.length === 0) {
  throw new Error(`IRIMO did not return a usable warning payload (${payload.status || "unknown"}); preserving the previous snapshot`);
}

await mkdir(new URL(".", output), { recursive: true });
try {
  const previous = JSON.parse(await readFile(output, "utf8"));
  const stable = ({ fetchedAt, ...value }) => JSON.stringify(value);
  if (stable(previous) === stable(payload)) {
    console.log(`IRIMO snapshot unchanged: ${payload.status} · ${(payload.warnings || []).length} bulletins`);
    process.exit(0);
  }
} catch {
  // First run or an invalid prior snapshot: publish a fresh copy.
}
await writeFile(output, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`IRIMO snapshot: ${payload.status} · ${(payload.warnings || []).length} bulletins · ${payload.fetchedAt}`);
