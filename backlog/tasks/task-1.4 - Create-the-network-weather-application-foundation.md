---
id: TASK-1.4
title: Create the network weather application foundation
status: In Progress
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.1
  - TASK-1.3
parent_task_id: TASK-1
priority: high
type: feature
ordinal: 50
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The existing application is a small self-hosted Node service with a largely monolithic static page. The MVP needs a maintainable application shell and asset structure that can support map animation, stateful controls, APIs, and automated verification without breaking the existing deployment contract.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The chosen product boundary from the MVP brief is implemented without unintentionally removing the existing application
- [ ] #2 The client has clear modules for data access, timeline state, map rendering, panels, and shared visual tokens
- [ ] #3 Development and production start commands work on Node.js 22 or newer
- [ ] #4 A smoke check confirms the application shell, health endpoint, static assets, and client initialization load without errors
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Add an additive network-weather route and static asset structure while preserving the existing Engineer Day root route and self-hosted server.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added site/network-weather/index.html, styles.css, data.js, app.js, and directory-index routing in server/index.mjs. Existing self-hosted verification passes.
<!-- SECTION:NOTES:END -->
