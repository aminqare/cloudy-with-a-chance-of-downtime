---
id: TASK-1.1
title: Define MVP product brief and repository boundary
status: Done
assignee: []
created_date: '2026-10-13 07:37'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies: []
parent_task_id: TASK-1
priority: high
type: task
ordinal: 20
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current repository hosts an Engineer Day experience, while the requested product is a telecom operations application. The team needs an explicit product boundary, audience priority, terminology, demo geography, and decision on whether the new experience replaces the existing root page or lives beside it so later work does not make conflicting assumptions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The brief identifies the primary MVP user and the secondary executive, NOC, radio, transport, field, and customer-care audiences
- [x] #2 The brief defines the demo geography, supported time horizon, MVP data source, and whether the existing Engineer Day experience is preserved or replaced
- [x] #3 The brief lists in-scope features, deferred capabilities, measurable success criteria, and a five-minute demo scenario
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Confirm the product boundary for this repository and preserve the existing Engineer Day experience.
2. Document the MVP audience, demo geography, time horizon, fixture-data assumption, scope, and five-minute walkthrough.
3. Add the first presentable route at /network-weather/ so the next implementation tasks have a concrete surface.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Documented the additive /network-weather/ boundary, Tehran demo geography, six-hour observed plus six-hour forecast horizon, deterministic fixture API assumption, audiences, deferred scope, success criteria, and five-minute presenter walkthrough. Browser verification confirmed the route loads from the self-hosted server.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Defined the Network Weather MVP contract and preserved the existing Engineer Day route. Added the product brief at docs/network-weather-mvp.md and established the /network-weather/ presentation route as the implementation boundary. Verified with browser route loading and npm run verify:selfhost.
<!-- SECTION:FINAL_SUMMARY:END -->
