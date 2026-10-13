---
id: TASK-1.15
title: Add automated MVP verification and demo scenarios
status: In Progress
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.6
  - TASK-1.7
  - TASK-1.8
  - TASK-1.9
  - TASK-1.10
  - TASK-1.11
  - TASK-1.12
  - TASK-1.13
  - TASK-1.14
parent_task_id: TASK-1
priority: high
type: task
ordinal: 160
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The MVP combines time, map, scoring, and multiple synchronized surfaces, so regressions can easily produce a convincing but incorrect story. Automated checks and scripted demo scenarios are needed to prove that all components represent the same frame and condition.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Unit tests cover scoring, alert rules, time calculations, narrative generation, and data validation
- [x] #2 API tests cover condition, timeline, drill-down, error, and health endpoints
- [ ] #3 End-to-end tests verify initial load, layer toggles, timeline scrubbing, playback, alert focus, audience switching, and presenter mode
- [ ] #4 Fixture-based visual checks cover healthy, congestion, outage, maintenance, stale-data, and reduced-motion states
- [x] #5 A repeatable five-minute demo script exercises every top-level MVP concept without manual data editing
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add a deterministic MVP verification runner covering fixtures, API filters, timeline transitions, accessibility smoke checks, and static/self-hosted serving.\n2. Add a short presenter demo runbook mapping the required weather-style story beats to deterministic controls and frames.\n3. Run the complete verification suite and record release-candidate evidence.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added scripts/verify-network-weather-mvp.mjs and docs/network-weather-demo.md. Full MVP runner passes fixtures, API, accessibility, self-hosted persistence, and top-level UI concept checks. Browser interaction/visual checks remain pending while the Mac is locked.

API and health/readiness coverage now includes condition, timeline, drill-down filters, invalid inputs, schema, and persistence. The five-minute deterministic demo runbook is documented and verified against the live preview.

Browser evidence now covers expanded layers, KPI emphasis, alert timeline focus, six story scenes, fullscreen affordance, and region-to-cluster drill-down. Automated MVP runner remains green; formal automated browser harness is still open.

Expanded automated smoke coverage to assert the real Iran boundary asset, source attribution, stale/not-applicable KPI states, grouped alerts, and acknowledgement logic. Browser verification exercised timeline state changes and acknowledgement restore.
<!-- SECTION:NOTES:END -->
