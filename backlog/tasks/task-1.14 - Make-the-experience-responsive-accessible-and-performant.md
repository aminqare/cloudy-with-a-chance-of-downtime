---
id: TASK-1.14
title: 'Make the experience responsive, accessible, and performant'
status: In Progress
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.9
  - TASK-1.12
  - TASK-1.13
modified_files:
  - site/network-weather/app.js
  - site/network-weather/styles.css
  - site/network-weather/index.html
parent_task_id: TASK-1
priority: high
type: enhancement
ordinal: 150
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The application will be used both interactively and as a large-screen broadcast. It must remain legible, keyboard-operable, motion-safe, and responsive while animating a meaningful number of network entities.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Core flows work at supported laptop, desktop, and large-display viewport sizes without clipped controls
- [x] #2 Map, timeline, alerts, audience switching, and drill-down are operable by keyboard with visible focus
- [ ] #3 Text and status encodings meet WCAG AA contrast and do not rely on color alone
- [x] #4 Reduced-motion mode removes nonessential animation while preserving state changes
- [ ] #5 The agreed representative dataset plays smoothly and meets documented load and interaction performance budgets
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add semantic labels, live-region announcements, visible keyboard focus, and reduced-motion handling to the broadcast dashboard.\n2. Add a deterministic static accessibility smoke check for required controls and labels.\n3. Run syntax, fixture, API, self-hosted, and accessibility checks and document any browser-only validation limits.

Visual enhancement pass: improve map readability with a live radar HUD, make mobile/medium layouts avoid clipped controls, strengthen panel hierarchy and focus states, then validate at the open browser viewport and rerun MVP/accessibility checks.

Reference-driven weather radar pass: layer translucent city forecast cards, precipitation/radar texture, and wind/rain motion over the Iran map while preserving telecom sites and IRIMO warning markers above the weather layer. Validate the browser rendering and existing MVP checks.

Professional province layout revision: compute each province centroid from GeoJSON, render a single compact forecast card per selected province, attach IRIMO severity to the same card and province outline, remove overlapping city/warning labels, and tune the radar styling for restrained broadcast clarity.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added live regions for ticker and presenter narrative, explicit playback control labels, visible focus styling, and prefers-reduced-motion support. Added scripts/verify-network-weather-a11y.mjs; smoke, API, and self-hosted checks pass.

Browser and static verification support keyboard-operable controls/drill-down and reduced-motion behavior. Responsive multi-viewport, contrast audit, and performance-budget evidence remain open.

Added accessible pan/zoom controls, fullscreen control, expanded map-layer controls, interactive KPI emphasis, and cluster detail controls; browser verification covered these flows. Multi-viewport performance and missing/stale visual audit remain open.

Added visually distinct KPI data-quality states for stale and not-applicable fixture scenarios, with accessible labels and reduced-motion-safe styling. Browser checks covered 11:00, 21:00, and 00:00 frames; full MVP verification passes. Responsive/contrast/performance evidence remains a separate display audit.

Inspected the live browser viewport and applied a visual pass: added an on-map live radar HUD with current frame/layer/IRIMO count, improved warning-layer emphasis, and added medium/mobile wrapping for map controls, map footer, header actions, and timeline controls. Browser screenshot confirms the updated map presentation; syntax, fixture, accessibility, and MVP checks pass. Remaining acceptance evidence: full multi-viewport audit, formal contrast audit, and performance-budget measurement.

Matched the attached weather-map reference with a radar-style visual layer: translucent city temperature/weather cards are projected from the Iran city dataset, layered precipitation gradients and rain streaks simulate weather movement, and warning/site markers remain above the weather surface. Browser preview confirms the map now reads as a weather broadcast while retaining telecom context.

Reworked the reference-style map after visual review: replaced independent city/weather and warning labels with collision-managed province-centroid forecast nodes; merged each province's highest IRIMO severity into the same node; outlined affected province polygons by yellow/orange/red severity; removed legacy city-label clutter; subdued telecom sites and radar motion in weather mode. Browser verification at the live desktop viewport shows a clean province-aligned layout. Accessibility and full MVP verification pass.

Operational map cleanup: removed animated full-canvas rain/wind streaks and route decoration; aligned the weather overlay to the same inset/viewBox as the Iran province SVG; added centroid leader anchors and a deterministic collision grid; replaced Unicode weather glyphs with a consistent inline SVG icon system; reduced site and radar noise; and restricted warning badges to the dedicated IRIMO layer while preserving severity outlines. Browser review confirms the Conditions view is materially cleaner and province cards remain traceable to their geographic centroid.

TV broadcast weather restoration: added an SVG weather layer clipped to the Iran silhouette with pulsing radar precipitation cells, an animated frontal boundary, directional wind vectors, and a timeline-aware wind readout. Weather intensity follows clear/cloud/rain/storm frames; the layer dims automatically for telecom metric and IRIMO views. Province cards and collision leaders remain above the weather graphics. Full MVP and accessibility verification pass, and the storm frame was visually reviewed in the browser.
<!-- SECTION:NOTES:END -->
