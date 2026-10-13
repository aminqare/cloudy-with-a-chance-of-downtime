---
id: TASK-1.10
title: 'Add synchronized KPI cards, trends, and legends'
status: Done
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.2
  - TASK-1.6
  - TASK-1.8
parent_task_id: TASK-1
priority: high
type: feature
ordinal: 110
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Weather metaphors need numerical evidence so engineers can trust them and executives can understand impact. A concise set of synchronized KPI cards and micro-trends should explain why each map region has its displayed condition.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The main view shows availability, utilization, latency, throughput, packet loss, signal quality, and active incident count for the selected scope and time
- [x] #2 Each KPI presents value, unit, trend, threshold state, and data freshness
- [x] #3 Selecting a KPI updates the map legend or emphasis without changing the underlying timestamp
- [x] #4 Missing, stale, and not-applicable values are visually distinct from healthy values
- [x] #5 Displayed values match API responses for representative fixture frames
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Add synchronized KPI cards and trends driven from the selected fixture frame.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Seven KPI cards update from the selected frame with threshold state, trend wording, and observed/forecast freshness context.

KPI cards now expose all seven required values with units, threshold/trend status, freshness, and clickable layer emphasis while preserving the selected frame. Browser verified at the severe forecast frame; missing/stale/N/A visual treatment remains open.

Browser verified clicking Utilization changes the map emphasis to Traffic without changing frame 21:00; cards expose freshness and threshold states. Missing/stale/N/A visual treatment remains open.

Browser verified the 11:00 stale throughput state, 21:00 stale signal state, and 00:00 not-applicable incident state. Each remains visible, labeled, and distinct without changing source fixture values.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented seven synchronized KPI cards with threshold, freshness, and data-quality states; verified healthy, stale, and not-applicable frames in the browser and passed the Network Weather verification suite.
<!-- SECTION:FINAL_SUMMARY:END -->
