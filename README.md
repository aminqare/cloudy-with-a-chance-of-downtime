# Cloudy with a Chance of Downtime

A broadcast-style telecom weather dashboard for Iran. It combines province-level network telemetry, animated weather fronts, timeline playback, operational KPIs, and parsed IRIMO weather warnings in a presenter-friendly interface.

The dashboard is available at `/network-weather/`. The original Engineer Day landing experience remains available at `/`.

## Local verification

Node.js 22 or newer is required.

```bash
npm run verify:selfhost
```

## Container

```bash
docker build --build-arg BASE_IMAGE=node:22-bookworm-slim -t cloudy-with-a-chance-of-downtime:local .
docker run --rm -p 3000:3000 -v "$PWD/data:/app/data" cloudy-with-a-chance-of-downtime:local
```

## CI/CD

GitLab merge-request pipelines build the production image and run isolated checks against the page, memory API, and landing-video streaming. Protected `main` commits can deploy to a configured self-hosted runner while preserving the SQLite data directory and writing a timestamped backup before replacement.

See [SELF-HOSTING.md](SELF-HOSTING.md) for manual deployment and backup instructions.
