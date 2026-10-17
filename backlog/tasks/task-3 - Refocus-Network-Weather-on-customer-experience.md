---
id: TASK-3
title: Refocus Network Weather on customer experience
status: In Progress
assignee:
  - Codex
created_date: '2026-10-17 06:37'
updated_date: '2026-10-17 06:44'
labels:
  - network-weather
  - customer-experience
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
ordinal: 2180
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current national command-center presentation exposes internal transport, core, EHS, and site-operation detail, making the product too dense and not suitable for a customer-facing audience. The experience should return to a clear weather-plus-radio-demand story that helps people understand expected service quality by place and time.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The primary navigation and map present live weather and customer experience as the main product story.
- [ ] #2 LDP-derived RRC and TRP mock data is translated into understandable demand, speed, and service-quality language while retaining an optional technical detail view.
- [ ] #3 TX topology, core, EHS, exact site identifiers, and internal command-center workflows are absent from the customer-facing journey.
- [ ] #4 Provider-backed weather, observed wind stations, IRIMO warnings, and snapshot fallback behavior continue to work.
- [ ] #5 The page is responsive at desktop and mobile widths and introduces no horizontal overflow.
- [ ] #6 The README and automated verifier describe and validate the customer-facing scope.
- [ ] #7 The updated static site is published to the existing GitHub Pages deployment.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Replace the command-center framing with a compact customer-experience header, summary, and regional outlook while preserving the existing weather map, timeline, and warning pipeline.
2. Introduce a small LDP-inspired mock dataset for regional service quality, demand (RRC), and speed/traffic (TRP), rendered as four clear map modes and a friendly region detail panel.
3. Remove command-center integrations and internal identifiers from the loaded experience, then update responsive styling, documentation, and verifier expectations.
4. Validate syntax, automated checks, desktop/mobile layout, and live weather fallbacks; commit, push, and verify the GitHub Pages deployment.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented the customer-facing hierarchy: weather and customer experience are primary; LDP-inspired demand/speed detail is progressive disclosure.

Replaced the loaded cross-domain command-center assets with customer-experience data, map markers, regional outlook cards, and responsive styling. Exact site IDs, TX topology, core, and EHS are no longer present in the primary journey.

Preserved the live weather pipeline. Browser QA observed 6 provider-backed wind stations and 20 live IRIMO bulletins.

Validation passed: JavaScript syntax checks, npm run verify:network-weather-mvp, git diff --check, desktop visual QA, 375px mobile visual QA, and zero horizontal overflow. Browser console contained no warnings or errors.
<!-- SECTION:NOTES:END -->
