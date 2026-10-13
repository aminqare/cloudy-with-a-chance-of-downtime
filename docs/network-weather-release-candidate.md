# Network Weather MVP release candidate

Status: candidate ready for technical demo; browser/display acceptance pending when the Mac is unlocked.

- Candidate surface: `http://localhost:3000/network-weather/`
- API: `/api/network-weather` and `/api/network-weather/timeline`
- Readiness: `/health` and `/ready`
- Verification: `npm run verify:network-weather-mvp`
- Demo walkthrough: [network-weather-demo.md](network-weather-demo.md)
- Rollback point: retain the previous container image and external `data/` volume; use the existing deployment script rollback trap.

Known limitations are intentional for this presentation MVP: fixture data for NMS/OSS, no authentication, and no voice synthesis. The Iran map uses a locally served OSM-derived GeoJSON province layer with 31 province boundaries and 36 city labels; the UI includes visible OpenStreetMap attribution. IRIMO warnings are fetched server-side, parsed into normalized yellow/orange/red levels, cached for five minutes, and exposed with live/stale/fallback status; telecom impact correlations remain illustrative. Observed/forecast provenance and the 11:00→14:00 fixture gap are surfaced explicitly.

Pending acceptance evidence: exercise the latest Previous/Next controls, responsive viewports, and meeting-room display legibility in an unlocked browser session.
