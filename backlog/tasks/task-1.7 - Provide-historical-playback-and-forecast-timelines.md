---
id: TASK-1.7
title: Provide historical playback and forecast timelines
status: Done
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.6
parent_task_id: TASK-1
priority: high
type: feature
ordinal: 80
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
A weather experience becomes useful when users can see how conditions arrived and what will happen next. The MVP needs a continuous timeline joining observed history, current state, forecast points, and planned maintenance while making uncertainty explicit.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The API exposes ordered historical, current, predicted, and planned-maintenance frames over the MVP time horizon
- [x] #2 Forecast frames include confidence and clearly distinguish predictions from observations
- [x] #3 The MVP can demonstrate traffic peaks, congestion onset, outage, recovery, and a maintenance impact scenario
- [x] #4 A deterministic fallback forecast works with fixtures and the interface allows a future forecasting provider to replace it
- [x] #5 Tests cover time-zone handling, daylight boundaries, gaps, and transition from observed to forecast data
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Expose ordered observed and forecast frames from the placeholder timeline endpoint.\n2. Mark the observed/forecast boundary and confidence in every frame.\n3. Bind the UI time machine to the shared frame index and share selected frames through the URL.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Timeline endpoint and browser playback are implemented with 13 frames, a 14:00/15:00 observed-to-forecast boundary, confidence, Now, +1 hour, Tonight, Tomorrow, Play, speed, and URL frame persistence. Remaining: dedicated time-zone and gap tests.

Added timeline timezone, gap, observed/forecast transition, and scenario assertions. Added deterministic traffic peak, congestion onset, outage, recovery, and planned-maintenance scenario metadata. API and fixture validation pass.

Browser acceptance verified in the unlocked preview: timeline scrubbing/shortcuts update the condition badge, map, KPI cards, alerts, narrative, provenance, confidence, and URL frame state. Automated API tests cover Tehran timezone, observed/forecast boundary, intentional gap, and deterministic scenarios.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented deterministic historical/forecast playback with explicit observed-versus-forecast provenance, confidence, gap metadata, and representative traffic/congestion/outage/recovery/maintenance scenarios. Verified with browser interaction and the fixture, API, accessibility, and self-hosted test suite.
<!-- SECTION:FINAL_SUMMARY:END -->
