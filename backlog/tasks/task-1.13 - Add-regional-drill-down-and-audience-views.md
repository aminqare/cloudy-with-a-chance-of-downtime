---
id: TASK-1.13
title: Add regional drill-down and audience views
status: Done
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.3
  - TASK-1.8
  - TASK-1.10
  - TASK-1.11
parent_task_id: TASK-1
priority: medium
type: feature
ordinal: 140
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Executives and engineering teams need different density while staying on the same source of truth. The MVP should let a presenter move from national or city-level conditions into region and site details, then switch the emphasis for key audiences without becoming separate products.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Users can move from the overview into a region and then a site or cluster detail and return without losing the selected time
- [x] #2 Executive view emphasizes health, customer impact, major risks, and forecast
- [x] #3 NOC view emphasizes incidents, alarms, freshness, severity, and operational status
- [x] #4 Engineering view exposes radio and transport details including RSRP, RSRQ, SINR, interference, handovers, backhaul state, and latency when available
- [x] #5 Audience switching changes presentation density but not the underlying condition calculation
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Add regional drill-down and executive, NOC, and engineering emphasis views without changing the shared selected frame.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Region marker and alert selection drive drill-down; audience select changes the detail panel between executive, NOC, and engineering summaries.

Browser verified Executive, NOC, and Engineering audience switching; Engineering view now includes RSRP/RSRQ proxy, interference, handovers, backhaul, and latency while preserving the selected frame. Site-level detail remains open.

Engineering audience browser verification now shows RSRP/RSRQ proxy, interference, handovers, backhaul, and latency details. Overview-to-site detail remains open.

Browser verified selecting Eastern corridor opens region detail with EAST-01/EAST-02 cluster buttons while preserving the 18:00 frame; cluster selection is keyboard-accessible.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented region and site-cluster drill-down with executive, NOC, and Engineering audience views that preserve the selected condition and timeline. Verified region/cluster navigation in the browser and the full MVP verification suite.
<!-- SECTION:FINAL_SUMMARY:END -->
