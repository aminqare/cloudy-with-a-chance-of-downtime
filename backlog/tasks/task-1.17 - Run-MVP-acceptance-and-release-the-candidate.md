---
id: TASK-1.17
title: Run MVP acceptance and release the candidate
status: In Progress
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.16
parent_task_id: TASK-1
priority: high
type: task
ordinal: 180
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Completion should mean the product communicates a credible network story end to end, not merely that individual components exist. A final acceptance pass must use the representative scenarios, capture evidence, resolve release-blocking defects, and produce a clearly identified candidate.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The product owner completes the agreed five-minute broadcast walkthrough using the deployed candidate
- [x] #2 An engineer validates displayed KPI values, health states, alerts, and forecast labels against source fixtures
- [ ] #3 A presenter validates legibility and control use on the target meeting-room display
- [ ] #4 No open critical or high-severity defects remain and lower-severity limitations are documented
- [x] #5 The release candidate version, deployment location, verification evidence, and rollback point are recorded
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 MVP milestone is ready to close only after all child tasks meet their acceptance criteria
<!-- DOD:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Run the complete MVP verification suite and review the release surface for required routes, controls, API responses, and operations documentation.\n2. Capture a release-candidate checklist with known limitations and pending browser-only visual checks.\n3. Finalize only the acceptance criteria supported by objective evidence; leave visual acceptance pending until the browser can be exercised.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created docs/network-weather-release-candidate.md with candidate routes, verification, rollback, limitations, and pending browser/display evidence. Current local /ready and full MVP verification pass.

Unlocked-browser acceptance verified Next/Previous, Tonight, URL frame persistence, synchronized KPI/narrative/forecast state, alert-to-region drill-down, and Presenter mode. Meeting-room display and product-owner walkthrough remain human sign-off items.

Engineer validation matched the 18:00 browser frame to fixture values and forecast provenance. Candidate routes, verification command, deployment location, rollback guidance, and known limitations are recorded.

Release candidate now presents Iran network context, a broadcast summary crawl, schematic country map, regional hubs, and sample site clusters. Docker/human display sign-off remains environment-dependent.
<!-- SECTION:NOTES:END -->
