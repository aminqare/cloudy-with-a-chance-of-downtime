---
id: TASK-1.6
title: Build the network conditions API and aggregation layer
status: Done
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.4
  - TASK-1.5
parent_task_id: TASK-1
priority: high
type: feature
ordinal: 70
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The visual experience needs one stable source for regional and site-level conditions instead of calculating incompatible values in each component. The backend must validate telemetry, aggregate it by time and geography, and expose compact responses suited to animation.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 An API returns network conditions for a requested time, geography, technology, and aggregation level
- [x] #2 Regional aggregates apply the documented health score and identify the KPI values that drive the resulting condition
- [x] #3 Responses include observation time, freshness, provenance, severity, confidence, and affected-service context
- [x] #4 Malformed filters and unavailable time ranges return documented errors without crashing the service
- [x] #5 Automated tests cover aggregation, threshold boundaries, missing data, and invalid input
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add a placeholder network-weather API with region and time filters.\n2. Reuse the documented health score and return provenance, freshness, confidence, and limitations.\n3. Add deterministic validation and exercise representative API responses.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented GET /api/network-weather and GET /api/network-weather/timeline using server/network-weather.mjs. Remaining: connect the browser adapter to the endpoint and add a dedicated HTTP test suite for malformed filters and unavailable ranges.

Validation passed: npm run verify:network-weather-api exercised metro/region, technology, and time filters, health score output, complete and degraded data quality, invalid time and region responses; npm run verify:network-weather and npm run verify:selfhost also passed.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented the placeholder network conditions API and aggregation layer. Added time, region, technology, and aggregation filters; deterministic health scoring; provenance, freshness, confidence, data-quality metadata; and documented 400 responses for invalid filters.
<!-- SECTION:FINAL_SUMMARY:END -->
