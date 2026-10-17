---
id: TASK-5.1
title: Keep calibrated wind visible in customer experience mode
status: In Progress
assignee:
  - Codex
created_date: '2026-10-17 07:32'
updated_date: '2026-10-17 07:32'
labels:
  - network-weather
  - wind
  - customer-experience
dependencies: []
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
- [ ] #1 Provider-backed wind vectors remain visibly legible when the map is in Customer Experience mode.
- [ ] #2 Customer experience markers and map readability remain intact.
- [ ] #3 The published GitHub Pages URL shows the wind layer after reload with no horizontal overflow.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Inspect the customer experience overlay styles and confirm it is suppressing the calibrated provider-backed wind layer.
2. Increase wind-layer visibility only for Customer Experience mode while preserving marker hierarchy and non-interactive overlay behavior.
3. Cache-bust the stylesheet, run MVP verification, and QA the local and public pages for visible wind metadata and zero horizontal overflow.
4. Commit and push the focused fix without staging unrelated worktree changes, then finalize this subtask.
<!-- SECTION:PLAN:END -->
