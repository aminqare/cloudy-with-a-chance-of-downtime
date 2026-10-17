---
id: TASK-4
title: Turn Network Weather into an operator weather desk
status: Done
assignee:
  - Codex
created_date: '2026-10-17 07:21'
updated_date: '2026-10-17 07:25'
labels:
  - network-weather
  - operator-experience
  - LDP
dependencies: []
references:
  - 'https://aminqare.github.io/cloudy-with-a-chance-of-downtime/'
modified_files:
  - site/network-weather/index.html
  - site/network-weather/customer-experience.css
  - site/network-weather/customer-experience-data.js
  - site/network-weather/customer-experience.js
  - scripts/verify-network-weather-mvp.mjs
  - README.md
priority: high
type: enhancement
ordinal: 3180
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The customer-facing forecast is clean, but an operator still has to infer priority, ownership, and next actions from several disconnected cards. The same weather-plus-LDP scope should support fast shift decisions without returning to the previous overloaded multi-domain command center.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The first screen shows shift status, freshness, open priority count, and customer impact at a glance.
- [x] #2 A prioritized operator queue ranks regions by service impact and provides a clear recommended action, owner, and acknowledgement state.
- [x] #3 Selecting a queue row or map marker synchronizes the selected regional detail and focuses the operator on the same area.
- [x] #4 Weather, customer experience, RRC-derived demand, and TRP-derived speed remain the only primary operational domains.
- [x] #5 Operational controls remain understandable to non-engineers and explicitly label mock network values versus provider-backed weather.
- [x] #6 Desktop and mobile views fit without horizontal overflow and all existing verification checks pass.
- [x] #7 The updated experience is published to the existing GitHub Pages site.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Reframe the header and first viewport as an operator shift desk with a compact status bar for freshness, customer impact, and open priorities.
2. Add a ranked weather-plus-LDP action queue with owner, recommended action, SLA, and local acknowledgement state.
3. Synchronize queue rows, regional cards, and map markers so a selected region is consistent across the page, while preserving the four primary map modes.
4. Refine responsive styling and verification/docs, then run automated and browser QA before publishing to GitHub Pages.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added a five-signal shift status bar and a ranked operator queue with customer impact, owning RAN team, response target, recommended action, filters, and locally persisted acknowledgement state.

Queue selections switch the map into customer-experience mode and synchronize the selected queue row, map marker, and regional detail. Added shift-handover actions for highest-risk map focus and progressive network detail.

Browser QA proved acknowledgement count changes, Shiraz queue/map/detail synchronization, 8 map markers, 5 shift cards, zero desktop/mobile overflow, and no console warnings or errors.

Validation passed: JavaScript syntax checks, npm run verify:network-weather-mvp, and git diff --check.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Upgraded Network Weather into a focused operator weather desk while preserving the weather-plus-LDP product boundary. The first screen now exposes shift health, source freshness, open priority count, potential customer impact, and explicit live-versus-mock provenance. A ranked action queue adds regional impact, owner, response target, recommended action, filters, and persistent local acknowledgement state. Queue selections, customer-experience map markers, and regional detail remain synchronized; the handover card focuses the highest-risk region and provides direct access to network detail.

Kept weather, customer experience, RRC-derived demand, and TRP-derived speed as the only primary domains. Updated responsive styling, README content, and the MVP verification contract.

Verification passed with JavaScript syntax checks, the complete network-weather MVP suite, git diff checks, desktop and 375px mobile browser QA, functional acknowledgement and Shiraz selection synchronization, zero horizontal overflow, and no browser console warnings or errors. The public GitHub Pages build was verified with 5 shift cards, 6 queue rows, 8 map markers, 6 provider-backed stations, and 20 IRIMO snapshot bulletins.

Published from commit 3c6c9af.
<!-- SECTION:FINAL_SUMMARY:END -->
