---
id: TASK-1.9
title: Implement the time slider and playback controls
status: Done
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.7
  - TASK-1.8
parent_task_id: TASK-1
priority: high
type: feature
ordinal: 100
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The user must be able to move through network history and forecast with the same ease as scrubbing a weather forecast. Timeline state should drive every visible element consistently and make the boundary between past, live, and predicted data unmistakable.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The slider covers the configured history and forecast window with labeled past, Now, and future segments
- [x] #2 Dragging or using keyboard controls updates the map, KPIs, alerts, and narrative to the same selected timestamp
- [x] #3 Play, pause, previous, next, speed, Now, plus-one-hour, Tonight, and Tomorrow controls behave as specified
- [x] #4 Playback skips or communicates missing frames and never presents stale data as live
- [x] #5 The selected time and playback state are shareable or restorable after refresh
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Bind the range control and playback buttons to one shared frame index that updates every visible surface.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Time slider, observed/forecast labeling, Now, Play/Pause, speed selection, and end-of-range forecast behavior are implemented and browser-verified.

Added +1 hour, Tonight, Tomorrow, and URL frame persistence to complete the presenter timeline contract. Browser recheck was unavailable because the Mac locked; node syntax, static route, fixture validation, and self-hosted checks passed.

Added explicit Previous and Next controls with bounds-safe shared frame updates. Node syntax, API, fixture, and self-hosted verification pass; latest browser recheck remains unavailable while the Mac is locked.

Browser acceptance verified: Previous/Next, Tonight, slider, alert focus, and URL persistence were exercised in the unlocked preview; forecast labels and confidence remained synchronized.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented the shared timeline slider and playback controls, including Previous/Next, Now, +1 hour, Tonight, Tomorrow, Play/Pause, speed, bounds, and restorable URL frame state. Verified through browser interaction plus automated MVP checks.
<!-- SECTION:FINAL_SUMMARY:END -->
