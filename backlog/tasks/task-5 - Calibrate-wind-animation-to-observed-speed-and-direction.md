---
id: TASK-5
title: Calibrate wind animation to observed speed and direction
status: Done
assignee:
  - Codex
created_date: '2026-10-17 07:28'
updated_date: '2026-10-17 07:30'
labels:
  - network-weather
  - wind
  - operator-desk
dependencies: []
modified_files:
  - site/network-weather/app.js
  - site/network-weather/index.html
  - site/network-weather/styles.css
  - scripts/verify-network-weather-wind.mjs
  - scripts/verify-network-weather-mvp.mjs
  - package.json
  - >-
    backlog/tasks/task-5 -
    Calibrate-wind-animation-to-observed-speed-and-direction.md
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
- [x] #1 Each animated station vector moves toward the opposite of the observed wind-from compass direction, with the displayed direction and tooltip remaining clear.
- [x] #2 Animation cadence and vector travel scale consistently with the station's observed wind speed, while preserving readable motion for light winds.
- [x] #3 Calm, missing, or invalid wind observations do not render animated station motion.
- [x] #4 The map wind layer exposes enough metadata for QA to verify source speed, from-direction, to-direction, and animation duration.
- [x] #5 The existing responsive operator weather desk remains free of horizontal overflow and passes the project's network weather verification checks.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Confirm the weather adapter semantics: provider wind bearings are compass directions the wind comes from, and all sources are normalized to km/h plus compass text.
2. Replace the map motion math with a shared from-bearing to to-bearing conversion, calibrated speed-to-duration/travel mapping, explicit arrowheads, and calm/invalid suppression in site/network-weather/app.js.
3. Expose source speed, from/to direction, duration, and vector length as DOM metadata for QA; avoid duplicate wind HUD nodes.
4. Add focused static/data verification for wind calibration and run the existing MVP verification suite.
5. QA the local browser at desktop and mobile widths, then commit and publish the GitHub Pages build without staging unrelated worktree changes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Confirmed the server adapters normalize Open-Meteo, OpenWeatherMap, and WeatherAPI wind directions as compass bearings from which the wind arrives; the renderer now reverses that bearing for on-screen travel.

Local browser QA after cache-busting verified six station vectors with explicit speed, from/to direction, duration, and vector-length metadata, plus arrowheads and zero horizontal overflow.

Published commit 741dacb to origin/main. Existing unrelated changes in task-1.14 and task-2 were left unstaged.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented and published calibrated wind animation for the operator weather desk. Station vectors now treat provider bearings as wind-from directions and travel toward the opposite bearing, with clear arrowheads, explicit source/tooltips, and data attributes for speed, from/to direction, duration, and vector length. Animation timing and vector length scale with observed km/h; calm, missing, and invalid readings are excluded from motion, and duplicate wind HUD creation is avoided. Added focused wind verification and wired it into the MVP suite. Verified with npm run verify:network-weather-mvp, git diff --check, local browser DOM QA for six live station vectors, and responsive overflow QA. Published as commit 741dacb on main / GitHub Pages. Follow-up risk: the visual cadence is intentionally screen-calibrated for readability, so absolute physical distance per second remains a presentation scale rather than a geospatial simulation.
<!-- SECTION:FINAL_SUMMARY:END -->
