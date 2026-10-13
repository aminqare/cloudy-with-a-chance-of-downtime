---
id: TASK-1.2
title: Define telecom weather taxonomy and health scoring
status: Done
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.1
parent_task_id: TASK-1
priority: high
type: task
ordinal: 30
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Raw telecom KPIs are difficult to interpret quickly and weather metaphors can become misleading unless their meaning is consistent. The MVP needs a documented mapping from measurable network conditions to clear weather states, severity levels, confidence, and business impact.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Clear, cloudy, rain, storm, lightning, fog, wind, and temperature visuals each map to documented telecom conditions
- [x] #2 A deterministic regional health score combines availability, utilization, latency, throughput, packet loss, signal quality, interference, and data freshness
- [x] #3 Thresholds, units, normalization, missing-data behavior, and severity precedence are documented with worked examples
- [x] #4 The taxonomy distinguishes observed, predicted, and planned-maintenance conditions
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Document the telecom-weather metaphor mapping, fixture KPI vocabulary, observed/forecast labels, and deterministic placeholder severity rules.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Initial taxonomy and condition vocabulary are implemented in docs/network-weather-mvp.md, data.js, and app.js. Threshold documentation and score extraction remain to be formalized.

Validation: taxonomy table added to docs/network-weather-mvp.md; calculateNetworkHealth implements the documented weighted score; API responses include provenance, freshness, confidence, and observed/forecast/planned labels; npm run verify:network-weather passed.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Formalized the telecom weather vocabulary and deterministic placeholder health score. Added clear/cloudy/rain/storm/lightning/fog/wind/temperature mappings, threshold bands, missing-data behavior, and a weighted score used by the placeholder API.
<!-- SECTION:FINAL_SUMMARY:END -->
