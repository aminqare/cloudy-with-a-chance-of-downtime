---
id: TASK-1.8
title: Render the animated geographic network weather map
status: Done
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.4
  - TASK-1.5
parent_task_id: TASK-1
priority: high
type: feature
ordinal: 90
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The map is the center of the broadcast and must communicate conditions at a glance while retaining enough telecom detail for investigation. It needs geographic layers, smooth transitions, a consistent legend, and restrained animation that does not hide the data.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The map displays regional condition surfaces plus cell-site or cluster markers for the configured demo geography
- [x] #2 Users can toggle coverage, traffic, congestion, latency, incidents, maintenance, and technology layers
- [x] #3 Condition changes animate smoothly between timeline frames without flicker or stale overlays
- [x] #4 Weather symbols and colors follow the approved taxonomy and the legend explains every visible encoding
- [x] #5 Map navigation supports zoom, pan, reset, and selecting a region or site using mouse and keyboard
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Render an animated CSS/SVG geographic radar with region markers, layer modes, legend, and selectable site clusters using the fixture contract.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Map radar, animated routes, condition/traffic/latency/incidents layer toggles, marker selection, and reset behavior are implemented and browser-verified.

Browser verification covered all requested layer chips, technology and maintenance states, zoom/pan/reset controls, keyboard-labeled map buttons, region selection, and synchronized severe-frame marker updates. Fixture/API/MVP checks pass.

Replaced the abstract metro radar surface with a schematic Iran outline, six regional hubs, twelve sample site-cluster dots, country labeling, and broadcast legend. Browser preview verified the new Iran map framing.

Replaced the schematic fallback in the browser with a locally served Natural Earth 10m Iran MultiPolygon boundary asset at site/network-weather/data/iran-boundary.geojson. The runtime projects the real geometry into the existing SVG radar, preserves telecom site dots/routes/layers, labels the source, and falls back safely if the asset is unavailable.

Enhanced the map with 31 locally served OSM-derived province boundaries, 36 city/provincial-capital labels, province hover styling, and visible OpenStreetMap attribution. Browser verification shows province outlines and city labels; MVP, accessibility, and self-host checks pass.

Integrated official IRIMO warning detail parsing: affected-area text is normalized into province/city locations using the local Iran gazetteer, with graceful unavailable-location handling for marine or older notices. Added severity-colored warning markers, an IRIMO warnings map-layer toggle, map-to-card focus behavior, and mapped-location counts. Browser verification confirmed live IRIMO feed, marker rendering, and the active warning layer; all MVP, accessibility, API, and self-host checks pass.

Post-verification cleanup: IRIMO HTML entities are decoded in the correct order so zero-width joiner entities do not leak into warning copy; endpoint smoke confirms 20 warnings, 4 enriched warning groups, and no remaining &zwnj; tokens.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented the interactive Iran telecom network weather map with a locally served Natural Earth 10m boundary, six regional hubs, twelve sample site clusters, condition/layer controls, accessible selection, zoom, pan, reset, and broadcast overlays. Verified browser rendering shows the real Iran outline and Natural Earth source label; npm run verify:network-weather, verify:network-weather-a11y, and verify:network-weather-mvp all pass.

Added IRIMO-backed warning visualization to the geographic map. The server enriches the newest warning records from official detail pages, parses Persian province/city names, and exposes normalized locations with cache/fallback behavior. The browser renders yellow/orange/red warning markers, supports an IRIMO warnings layer toggle, dims the telecom layer for focus, and links markers to warning cards. Verified with live browser interaction and the full Network Weather verification suite.
<!-- SECTION:FINAL_SUMMARY:END -->
