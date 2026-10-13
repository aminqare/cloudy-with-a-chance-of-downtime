# 🌩️ Cloudy with a Chance of Downtime

> **Tonight’s forecast:** 91% utilization, scattered packet loss, and a strong chance someone asks, “Is it the network?”

**Cloudy with a Chance of Downtime** turns telecom operations into a live TV weather broadcast. Instead of temperatures and rain clouds, it forecasts congestion, latency, outages, maintenance windows, and customer impact across Iran.

The result is a presenter-friendly dashboard that lets a NOC team explain network conditions like a weather anchor explains an approaching storm.

```text
  CURRENT CONDITIONS        TONIGHT                  OUTLOOK
  Mostly connected          Heavy congestion        Packets clearing
  Latency: comfortable      Outage cells forming    Engineers caffeinated
```

## What’s on the radar?

- 🗺️ **Iran operations map** with all 31 provinces and major cities
- 🌦️ **Broadcast weather graphics** with animated fronts, radar cells, wind vectors, and provincial conditions
- 📡 **Telecom layers** for traffic, congestion, latency, coverage, incidents, maintenance, and technology
- ⚠️ **IRIMO warning integration** that parses official warnings and maps affected provinces
- ⏱️ **Time machine** for observed history, forecasts, playback, and severe-condition scenarios
- 📊 **Synchronized KPIs** covering availability, utilization, throughput, packet loss, and signal quality
- 🎙️ **Presenter mode** with story beats, headlines, ticker updates, and an operational briefing
- 🧑‍💻 **Audience views** for executives, NOC operators, and engineers
- ♿ **Accessible controls** with keyboard navigation, visible focus, and reduced-motion support

## See the storm

Start the app and open:

**[http://localhost:3000/network-weather/](http://localhost:3000/network-weather/)**

```bash
npm install
npm start
```

Node.js 22 or newer is required.

For maximum drama, select **Tonight**, switch to **Conditions**, and turn on **Presenter mode**. No green screen required.

## How it works

```mermaid
flowchart LR
    A[Demo telecom telemetry] --> D[Network Weather API]
    B[IRIMO warning parser] --> D
    C[Province and city GeoJSON] --> E[Broadcast map]
    D --> E
    D --> F[KPIs and alerts]
    D --> G[Timeline and story mode]
    E --> H[Operations forecast]
    F --> H
    G --> H
```

The MVP uses deterministic telecom fixture data so every presentation tells the same story. IRIMO weather warnings are fetched and parsed separately, then associated with provinces and cities when location names are available.

No production NMS/OSS connector or customer telemetry is included.

## Map layers

| Layer | What it answers |
| --- | --- |
| Conditions | What does the network “weather” look like? |
| IRIMO warnings | Which provinces have official weather warnings? |
| Coverage | Where is population coverage weaker? |
| Traffic | Where are the busiest network corridors? |
| Congestion | Which provinces are approaching capacity? |
| Latency | Where is response time deteriorating? |
| Incidents | Where are active operational problems concentrated? |
| Maintenance | What planned work is active or approaching? |
| Technology | Where are 4G, 5G, and 5G+ represented? |

## Verification

Run the complete MVP check:

```bash
npm run verify:network-weather-mvp
```

Individual checks are also available:

```bash
npm run verify:selfhost
npm run verify:network-weather
npm run verify:network-weather-api
npm run verify:network-weather-a11y
```

## Docker

```bash
docker build --build-arg BASE_IMAGE=node:22-bookworm-slim \
  -t cloudy-with-a-chance-of-downtime:local .

docker run --rm -p 3000:3000 \
  -v "$PWD/data:/app/data" \
  cloudy-with-a-chance-of-downtime:local
```

See [SELF-HOSTING.md](SELF-HOSTING.md) for deployment, persistence, backup, and reverse-proxy guidance.

## Presenter cheat sheet

The five-minute demo flow is documented in [docs/network-weather-demo.md](docs/network-weather-demo.md). It covers the calm opening, rising evening load, severe 21:00 forecast, maintenance impact, and overnight recovery.

## Data disclaimer

Telecom measurements in this repository are illustrative dummy data created for an MVP presentation. Observed and forecast states are explicitly labeled, and timestamps use `Asia/Tehran`.

---

Built for the moments when the network is not *down*—it is merely experiencing **severe atmospheric packet conditions**.
