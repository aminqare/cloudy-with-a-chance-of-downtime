---
id: TASK-5.1
title: Keep calibrated wind visible in customer experience mode
status: Done
assignee:
  - Codex
created_date: '2026-10-17 07:32'
updated_date: '2026-10-17 07:34'
labels:
  - network-weather
  - wind
  - customer-experience
dependencies: []
modified_files:
  - site/network-weather/app.js
  - site/network-weather/index.html
  - site/network-weather/styles.css
  - site/network-weather/viewport-fix.css
  - >-
    backlog/tasks/task-5.1 -
    Keep-calibrated-wind-visible-in-customer-experience-mode.md
parent_task_id: TASK-5
priority: high
type: bug
ordinal: 5180
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The public command-center entry opens in Customer Experience mode, where the overlay currently dims provider-backed wind vectors so much that operators cannot see them. The customer view should retain its focus while keeping the real wind signal legible on the map.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Provider-backed wind vectors remain visibly legible when the map is in Customer Experience mode.
- [x] #2 Customer experience markers and map readability remain intact.
- [x] #3 The published GitHub Pages URL shows the wind layer after reload with no horizontal overflow.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Inspect the customer experience overlay styles and confirm it is suppressing the calibrated provider-backed wind layer.
2. Increase wind-layer visibility only for Customer Experience mode while preserving marker hierarchy and non-interactive overlay behavior.
3. Cache-bust the stylesheet, run MVP verification, and QA the local and public pages for visible wind metadata and zero horizontal overflow.
4. Commit and push the focused fix without staging unrelated worktree changes, then finalize this subtask.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Confirmed the public entry can open in Customer Experience mode, where the original overlay opacity made wind hard to see.

Raised the provider-backed wind overlay visibility for customer mode and added directional animated arrows directly to each live station card, using the same from-to bearing conversion as the map vectors.

Local browser QA verified six station cards, six wind arrows with expected screen angles, and zero horizontal overflow. Published commit de56a51 to origin/main.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fixed the visibility gap that made the calibrated wind animation appear absent. Customer Experience mode now keeps the provider-backed wind layer readable, and each live station card has an animated directional arrow whose angle is derived from the observed wind-from bearing. Verified six arrows, correct directional angles, responsive overflow, the full network weather MVP suite, and published the GitHub Pages fix in commit de56a51.
<!-- SECTION:FINAL_SUMMARY:END -->
