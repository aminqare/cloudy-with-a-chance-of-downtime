---
id: TASK-1.16
title: Prepare secure self-hosted deployment and operations guide
status: In Progress
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.15
parent_task_id: TASK-1
priority: high
type: chore
ordinal: 170
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The repository already has a self-hosted Node and container deployment path. The network weather MVP needs to fit that operational model with clear configuration, health checks, data handling, and rollback guidance so a successful local demo can become a dependable deployment.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The production build runs in the existing container and self-hosted deployment model with documented environment configuration
- [x] #2 Health and readiness checks verify the web application, API, data source, and schema compatibility
- [x] #3 Security headers, input validation, log redaction, rate limits, and least-privilege data access are verified
- [x] #4 The operations guide covers startup, configuration, telemetry refresh, backup, rollback, troubleshooting, and known MVP limitations
- [x] #5 The deployment verification command fails clearly when any required service or asset is unavailable
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Document local/self-hosted startup, configuration, fixture limitations, health checks, and safe future API replacement points.\n2. Verify deployment assets and commands against the current server and package scripts.\n3. Record operational handoff notes and run the MVP verification suite.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added /ready readiness endpoint, enriched /health with Network Weather schema/frame metadata, extended self-hosted verification, and documented Network Weather startup, security boundaries, backups, rollback, and fixture limitations in SELF-HOSTING.md. verify:selfhost and verify:network-weather-mvp pass.

Extended self-hosted verification to assert security headers, Network Weather input validation, and the existing memory API rate limit. verify:selfhost and full MVP verification pass.

Attempted Docker image build, but the Docker daemon is unavailable in this environment (Cannot connect to /var/run/docker.sock). Local server/readiness and deployment verification remain green; container build is pending an environment with Docker running.

Readiness, security headers, input validation, rate limits, least-privilege container user, operations guide, and fail-fast verification are covered. Docker image build remains open because the local Docker daemon is unavailable.
<!-- SECTION:NOTES:END -->
