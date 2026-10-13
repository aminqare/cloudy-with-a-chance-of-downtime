---
id: TASK-1.11
title: Implement severe network weather alerts and ticker
status: Done
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.2
  - TASK-1.6
  - TASK-1.7
  - TASK-1.8
parent_task_id: TASK-1
priority: high
type: feature
ordinal: 120
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Operators need immediate visibility into actionable conditions such as outages, high congestion, interference, backhaul instability, power failures, and risky maintenance. Alerts should behave like severe-weather warnings and remain tied to evidence and affected areas.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Rules generate informational, warning, severe, and critical alerts from condition and incident data
- [x] #2 The alert ticker shows severity, affected area, start time, likely cause, customer impact, confidence, and current status
- [x] #3 Selecting an alert focuses the map and timeline on the relevant geography and time
- [x] #4 Duplicate alerts are grouped and acknowledged alerts remain visually distinct without being deleted
- [x] #5 The demo includes congestion, site outage, interference, backhaul, power, and planned-maintenance alert examples
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Add severe-condition alert rows, severity styling, active count, and map focus behavior using placeholder alert rules.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Warning, severe, and planned-maintenance examples are visible; selecting an alert focuses the corresponding region detail.

Expanded deterministic alert fixtures to include congestion, interference, outage, backhaul, power, and planned maintenance. Browser verified severity/impact/confidence ticker content and alert selection moving the timeline to 18:00 while focusing the region. Grouping/acknowledgement remains open.

Ticker now includes severity, geography, state/time, impact/cause, and confidence; alert selection moves the shared timeline and focuses the selected region. Duplicate grouping and acknowledgement remain open.

Added deterministic threshold rules for utilization, latency, and incident counts. Browser verified generated warning/severe/critical alerts at 21:00, grouped airport maintenance signals, and acknowledgement/restore behavior that preserves acknowledged alerts visually.

Integrated IRIMO warning semantics into the alert surface: yellow = awareness/prepare, orange = urgent action, red = immediate comprehensive action. Added official IRIMO warning-list link, warning-level scale, API warningSource metadata, and fixture alert mappings; live IRIMO ingestion remains intentionally disabled for this MVP.

Added server-side IRIMO warning-list parser and /api/network-weather/warnings with a five-minute cache, live/stale/fallback status, normalized yellow/orange/red levels, source URLs, and client live-warning cards. Parser fixture and endpoint checks pass; telecom correlation remains illustrative.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented rule-generated severe network weather alerts, grouped duplicate signals, acknowledgement/restore state, alert focus, and ticker evidence; browser and MVP verification checks pass.
<!-- SECTION:FINAL_SUMMARY:END -->
