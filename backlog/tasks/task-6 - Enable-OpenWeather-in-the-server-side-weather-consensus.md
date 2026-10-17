---
id: TASK-6
title: Enable OpenWeather in the server-side weather consensus
status: In Progress
assignee:
  - Codex
created_date: '2026-10-17 08:32'
updated_date: '2026-10-17 08:32'
labels:
  - network-weather
  - openweather
  - weather-consensus
dependencies: []
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
- [ ] #1 The server loads the OpenWeather credential from an ignored local/server environment file or deployment environment, never from browser assets.
- [ ] #2 OpenWeather current conditions are fetched and included in the existing weather aggregation when the credential is present.
- [ ] #3 If OpenWeather One Call 3.0 is unavailable, the provider uses the current-weather endpoint fallback and reports that state without breaking the dashboard.
- [ ] #4 The aggregated station payload exposes provider agreement/dissent for wind and conditions.
- [ ] #5 Verification confirms the OpenWeather-enabled server path and the existing MVP suite still pass.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Configure npm start and the local runtime to load an ignored .env file when present; keep .env.example as the documented template and never expose the credential to static assets.
2. Put the supplied OpenWeather key in the local ignored .env file and restart the self-hosted server with it.
3. Verify the existing OpenWeather One Call-to-current-weather fallback and aggregated provider votes through the server API/module.
4. Run the full network weather MVP verification, update README operational setup if needed, and commit only safe configuration/docs/code plus the backlog record.
<!-- SECTION:PLAN:END -->
