import { mkdir, writeFile } from "node:fs/promises";
import { fetchIrimoWarnings } from "../server/network-weather.mjs";

const output = new URL("../site/network-weather/data/irimo-warnings.json", import.meta.url);
const payload = await fetchIrimoWarnings({ force: true });
await mkdir(new URL(".", output), { recursive: true });
await writeFile(output, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`IRIMO snapshot: ${payload.status} · ${(payload.warnings || []).length} bulletins · ${payload.fetchedAt}`);
