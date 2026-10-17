---
id: TASK-5
title: Calibrate wind animation to observed speed and direction
status: In Progress
assignee:
  - Codex
created_date: '2026-10-17 07:28'
updated_date: '2026-10-17 07:28'
labels:
  - network-weather
  - wind
  - operator-desk
dependencies: []
modified_files:
  - site/network-weather/app.js
  - site/network-weather/styles.css
  - scripts/verify-network-weather-wind.mjs
  - scripts/verify-network-weather-mvp.mjs
  - package.json
priority: high
type: enhancement
ordinal: 4180
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Operators need the map’s wind layer to communicate the measured weather signal faithfully. The current motion is visually ambiguous: the direction is not clearly tied to the provider’s wind bearing, speed differences are compressed, and calm or missing observations can still imply motion. The map should make the source observation legible at a glance without inventing wind.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Each animated station vector moves toward the opposite of the observed wind-from compass direction, with the displayed direction and tooltip remaining clear.
- [ ] #2 Animation cadence and vector travel scale consistently with the station's observed wind speed, while preserving readable motion for light winds.
- [ ] #3 Calm, missing, or invalid wind observations do not render animated station motion.
- [ ] #4 The map wind layer exposes enough metadata for QA to verify source speed, from-direction, to-direction, and animation duration.
- [ ] #5 The existing responsive operator weather desk remains free of horizontal overflow and passes the project's network weather verification checks.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Confirm the weather adapter semantics: provider wind bearings are compass directions the wind comes from, and all sources are normalized to km/h plus compass text.
2. Replace the map motion math with a shared from-bearing to to-bearing conversion, calibrated speed-to-duration/travel mapping, explicit arrowheads, and calm/invalid suppression in site/network-weather/app.js.
3. Expose source speed, from/to direction, duration, and vector length as DOM metadata for QA; avoid duplicate wind HUD nodes.
4. Add focused static/data verification for wind calibration and run the existing MVP verification suite.
5. QA the local browser at desktop and mobile widths, then commit and publish the GitHub Pages build without staging unrelated worktree changes.
<!-- SECTION:PLAN:END -->
