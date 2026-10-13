---
id: TASK-1.5
title: Define telemetry contracts and representative demo data
status: Done
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.1
  - TASK-1.2
parent_task_id: TASK-1
priority: high
type: feature
ordinal: 60
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
UI and analytics work need the same understanding of sites, sectors, regions, KPI samples, incidents, maintenance windows, and forecast confidence. A versioned contract plus realistic fixtures will let the MVP operate before live OSS or NMS integration is available.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A versioned schema defines regions, cell sites, sectors, coordinates, technologies, KPI observations, incidents, maintenance windows, forecasts, and data-quality metadata
- [x] #2 Fixtures cover healthy, congested, degraded, outage, interference, stale-data, and recovery scenarios across multiple regions and times
- [x] #3 Sample data includes enough history and future points to demonstrate the complete time slider
- [x] #4 Invalid records are rejected with useful diagnostics and fixture validation is automated
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Create a versioned browser fixture contract for regions, site clusters, KPI frames, alerts, forecasts, and maintenance examples.

Expand the browser fixture into deterministic province-level demo telemetry. Each province will expose synchronized weather, coverage, traffic, congestion, latency, incident, maintenance, and technology values; map cards and legends will change with the selected layer while preserving timeline behavior and IRIMO warning overlays.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added deterministic Tehran fixture data with schemaVersion 1, observed and forecast frames, regional clusters, and representative severe-condition alerts. Live telemetry validation is intentionally deferred behind the placeholder adapter.

Validation: server/network-weather.mjs exposes schemaVersion 1, six regions, thirteen observed/forecast frames, provenance and freshness metadata, alerts including planned maintenance, and fixture validation passes with npm run verify:network-weather.

Expanded demo telemetry to all 31 provinces with deterministic time-aware values for traffic, coverage, congestion, latency, incidents, maintenance, radio technology, subscribers, handover success, packet loss, energy load, temperature, and weather state. Map cards and legends now switch meaning per selected layer; a national summary strip aggregates traffic, coverage, congested provinces, and active incidents. Calibrated severe-frame rollups to credible demo values (2.23 Tbps, 95.6% average coverage, 18 congested provinces, 20 incidents). Browser verification exercised Traffic and Technology layers; syntax, accessibility, API, self-host, and full MVP checks pass.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added the versioned placeholder telemetry contract and representative fixture dataset for Tehran metro. The fixture adapter covers observed history, forecast frames, regional scope, KPI metadata, incidents, interference, congestion, recovery, and planned maintenance.

Added a complete deterministic province-level demonstration dataset and connected it to every map layer. Province cards now display layer-specific traffic, coverage, congestion, latency, incident, maintenance, technology, warning, or weather values while retaining IRIMO severity overlays. Added dynamic legends and national rollups, and verified the experience through live browser interaction plus the full Network Weather MVP suite.
<!-- SECTION:FINAL_SUMMARY:END -->
