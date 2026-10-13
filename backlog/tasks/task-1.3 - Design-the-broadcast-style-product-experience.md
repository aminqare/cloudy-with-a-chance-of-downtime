---
id: TASK-1.3
title: Design the broadcast-style product experience
status: In Progress
assignee: []
created_date: '2026-10-13 07:38'
updated_date: '2026-10-13 19:13'
labels: []
milestone: m-0
dependencies:
  - TASK-1.1
  - TASK-1.2
parent_task_id: TASK-1
priority: high
type: feature
ordinal: 40
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The defining value of the product is not another dense operations dashboard; it is a television-weather-style explanation that remains useful to engineers. The UX needs a coherent visual hierarchy for a presenter, an operator, and an executive watching the same data.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Approved wireframes cover the main broadcast view, full-screen presenter mode, alert state, regional drill-down, and loading or no-data state
- [ ] #2 The main view includes an animated map, current-condition summary, KPI rail, alert ticker, presenter narrative, legend, and bottom time slider
- [ ] #3 Interaction specifications define play, pause, scrub, speed, Now, plus-one-hour, Tonight, and Tomorrow behaviors
- [ ] #4 The visual system remains legible when viewed on a laptop and on a large meeting-room display
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Turn the broadcast brief into a working presenter surface with map, KPI rail, warning panel, narrative, timeline, story beats, and audience emphasis.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
The first visual pass is live at /network-weather/ and has been browser-verified at desktop size. Wireframe documentation and a final large-display pass remain.

Updated the broadcast presentation to frame the experience as Iran network weather with a dedicated NOW/NEXT/WATCH/FEED crawl and a schematic Iran country map.
<!-- SECTION:NOTES:END -->
