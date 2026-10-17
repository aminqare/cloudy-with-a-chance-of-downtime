---
id: TASK-6
title: Enable OpenWeather in the server-side weather consensus
status: Done
assignee:
  - Codex
created_date: '2026-10-17 08:32'
updated_date: '2026-10-17 08:33'
labels:
  - network-weather
  - openweather
  - weather-consensus
dependencies: []
modified_files:
  - package.json
  - README.md
  - >-
    backlog/tasks/task-6 -
    Enable-OpenWeather-in-the-server-side-weather-consensus.md
priority: high
type: feature
ordinal: 6180
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The operator dashboard needs the supplied OpenWeather credential to contribute a second provider signal alongside Open-Meteo and IRIMO. The credential must remain server-side, and the system must continue operating when OpenWeather One Call is not subscribed by using the supported current-weather fallback.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The server loads the OpenWeather credential from an ignored local/server environment file or deployment environment, never from browser assets.
- [x] #2 OpenWeather current conditions are fetched and included in the existing weather aggregation when the credential is present.
- [x] #3 If OpenWeather One Call 3.0 is unavailable, the provider uses the current-weather endpoint fallback and reports that state without breaking the dashboard.
- [x] #4 The aggregated station payload exposes provider agreement/dissent for wind and conditions.
- [x] #5 Verification confirms the OpenWeather-enabled server path and the existing MVP suite still pass.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Configure npm start and the local runtime to load an ignored .env file when present; keep .env.example as the documented template and never expose the credential to static assets.
2. Put the supplied OpenWeather key in the local ignored .env file and restart the self-hosted server with it.
3. Verify the existing OpenWeather One Call-to-current-weather fallback and aggregated provider votes through the server API/module.
4. Run the full network weather MVP verification, update README operational setup if needed, and commit only safe configuration/docs/code plus the backlog record.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Configured the ignored local .env with the user-provided OpenWeather credential; the file remains untracked and was not committed.

Updated npm start/dev:selfhost to load .env via Node 22 --env-file-if-exists and restarted the local server.

Live local API response reports OpenWeatherMap live with current-weather fallback after One Call 3.0 returned 401 subscription-required; aggregation exposes supporting/dissenting wind providers.

MVP verification passed and safe changes were published in commit 762f500.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Enabled the supplied OpenWeather credential in the server-side weather consensus without exposing it to browser assets or GitHub Pages. Node 22 start scripts now load an ignored .env file automatically; the local server calls OpenWeather, falls back from unavailable One Call 3.0 to the standard current-weather endpoint, and exposes provider agreement/dissent in the aggregated station payload. Verified the live local API response and the complete network weather MVP suite. Published safe code/docs/backlog changes as commit 762f500. The ignored local .env must be configured separately on any other deployment host.
<!-- SECTION:FINAL_SUMMARY:END -->
