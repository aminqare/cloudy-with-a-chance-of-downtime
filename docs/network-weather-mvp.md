# Network Weather MVP

## Product boundary

The telecom network weather experience lives at `/network-weather/` and is additive. The existing Engineer Day experience at `/` remains unchanged.

The primary user is a telecom operations presenter or NOC lead who needs to explain the network state in a short broadcast-style walkthrough. Secondary views support executives, radio engineers, transport engineers, field teams, and customer care.

## Demo assumptions

- Demo geography: Tehran metro, represented by six illustrative regions and twelve illustrative site clusters.
- Time horizon: the previous six hours, the current frame, and the next six hours.
- Data source: deterministic fixture data in `site/network-weather/data.js`. The fixture API has the same shape intended for a future NMS/OSS adapter.
- Time zone: `Asia/Tehran` for labels; timestamps remain ISO values internally.
- Product state: observed, current, forecast, planned maintenance, and illustrative confidence are always labeled.
- Weather warning taxonomy: the dashboard parses the official Iran Meteorological Organization (IRIMO) warning list through `/api/network-weather/warnings`. Yellow means awareness/preparation, orange means urgent action, and red means immediate comprehensive action. The endpoint exposes live/stale/fallback state, normalized levels, source links, and a five-minute cache; telecom impact annotations remain illustrative fixture correlations.

## In scope

- Current network weather summary with clear, cloudy, rain, storm, lightning, wind, fog, and temperature metaphors.
- Animated regional map with site-cluster markers and layer toggles.
- KPI cards for availability, utilization, latency, throughput, packet loss, signal quality, and active alerts.
- A synchronized time slider with playback, jump controls, historical frames, forecast frames, and a visible observed/forecast boundary.
- Severe-condition alerts and a scrolling warning ticker.
- Presenter narrative, full-screen mode, story scenes, regional drill-down, and audience emphasis modes.
- Empty, stale-data, reduced-motion, and representative error states.

## Deferred after MVP

- Live NMS/OSS connectors and credentials.
- ML forecasting and model training pipelines.
- Authentication, per-user saved views, and audit history.
- Geospatial vector-tile scale-out for nationwide production data.
- Voice synthesis and automated broadcast recording.

## Five-minute demo

1. Open the Network Weather route and explain the current Tehran condition.
2. Scrub backward to show a clear period, then play forward into the evening congestion forecast.
3. Select the congestion alert to focus the map and explain the affected regions.
4. Switch to NOC or engineering emphasis and open a regional detail card.
5. Enter presenter mode and walk through Today, Regional Forecast, Severe Conditions, Engineer Radar, and Maintenance Forecast.

## Success criteria

The demo audience can identify the current condition, the reason for it, what is expected next, where action is needed, and whether the displayed information is observed or predicted—all without reading raw telemetry first.

## Placeholder health score

Until the live scoring service is connected, the API uses a deterministic 0–100 score:

`0.30 availability + 0.20 inverse utilization + 0.15 inverse latency + 0.15 throughput + 0.10 inverse packet loss + 0.10 signal quality`

The score is clamped to 0–100. Scores of 80+ are clear, 65–79 are watch, 45–64 are severe, and below 45 are critical. The response includes `schemaVersion`, provenance, freshness, confidence, and an explicit fixture limitation so the demo cannot be mistaken for live telemetry.

## Weather vocabulary

| Visual | Telecom meaning | Default severity |
| --- | --- | --- |
| Clear / sun | Healthy availability, stable latency, and capacity headroom | Informational |
| Cloudy | Early utilization rise, mild degradation, or localized watch condition | Watch |
| Rain | Congestion or quality deterioration spreading across a corridor | Warning |
| Storm | Multiple severe KPIs or an incident with material customer impact | Severe |
| Lightning | Sudden outage, transport break, power event, or sharp telemetry anomaly | Critical |
| Fog | Stale, incomplete, or conflicting telemetry; confidence is reduced | Data quality |
| Wind | Mobility, handover, or traffic-flow direction across regions | Context |
| Temperature | Aggregate load intensity shown as a continuous color scale | Context |

Missing KPI values never contribute as healthy values. The API reports missingness and lowers confidence; a stale or conflicting frame is labeled fog/data quality even when the last known score was healthy.
## Presentation update

The MVP now uses a schematic Iran network map with six regional hubs and twelve illustrative site clusters. The map is intentionally not GIS-accurate; it is a broadcast visual that keeps the country context, condition layers, site dots, and presenter controls legible. Replace the inline SVG and fixture hub coordinates with a GIS/provider layer when live geography is introduced.
