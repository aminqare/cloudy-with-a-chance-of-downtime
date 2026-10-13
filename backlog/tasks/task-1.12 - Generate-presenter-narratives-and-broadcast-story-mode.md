---
id: TASK-1.12
title: Generate presenter narratives and broadcast story mode
status: Done
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.3
  - TASK-1.7
  - TASK-1.10
  - TASK-1.11
parent_task_id: TASK-1
priority: high
type: feature
ordinal: 130
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
A television-weather presentation needs concise spoken-language guidance rather than requiring the presenter to interpret every chart live. The MVP should generate trustworthy summaries from the same selected frame and provide a controlled sequence for a meeting or recorded broadcast.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The selected time and geography produce a short narrative covering current condition, key drivers, affected areas, near-term forecast, and recommended attention
- [x] #2 Narrative wording identifies uncertainty and never describes missing or predicted data as observed fact
- [x] #3 Story mode can advance through Today, Regional Forecast, Traffic Climate, Severe Conditions, Engineer Radar, and Maintenance Forecast scenes
- [x] #4 Presenter mode hides editing chrome, supports full screen, and keeps essential controls usable from a distance
- [x] #5 Narrative output is deterministic for fixtures and is generated without requiring an external AI service
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Generate deterministic presenter copy from the selected frame and expose story beats plus full-screen presenter mode.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Presenter narrative, five story beats, Next story beat, and Presenter mode are implemented. Copy is deterministic and clearly labels forecast state.

Expanded deterministic story mode to Today, Regional forecast, Traffic climate, Severe conditions, Engineer radar, and Maintenance forecast. Browser verified deterministic narrative/provenance and the full six-scene run-of-show; fullscreen control added, while display sign-off remains open.

Fullscreen affordance now calls the browser fullscreen API, while Presenter mode hides lower-priority operator chrome and keeps essential timeline controls visible. Automated and browser verification pass.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented deterministic presenter narratives and six-scene broadcast story mode with observed/forecast uncertainty, presenter mode, and fullscreen handoff. Verified with browser interaction, fixture/API checks, accessibility smoke checks, and the repeatable MVP runner.
<!-- SECTION:FINAL_SUMMARY:END -->
