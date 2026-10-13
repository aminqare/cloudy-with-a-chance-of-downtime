# Self-hosting Huawei A2 Engineer Day

The site is ready to run on any Linux server with Docker. The landing video, lion artwork, 1024 logo, AT messages, animations, and memory wall are included in the repository. Memories are stored in a persistent SQLite database under `data/`.

## Fast deployment with Docker

1. Copy this project directory to your server.
2. Install Docker Engine and the Docker Compose plugin.
3. From the project directory, run:

   ```bash
   cp .env.example .env
   docker compose up -d --build
   ```

4. Check the service:

   ```bash
   docker compose ps
   curl http://127.0.0.1:3000/health
   ```

The site listens on `127.0.0.1:3000` by default, which is appropriate when Nginx, Caddy, or another HTTPS reverse proxy runs on the same server.

## Connect a domain with Nginx

1. Copy `deploy/nginx.conf.example` to your Nginx sites directory.
2. Replace `engineer-day.example.com` with your real domain.
3. Enable the configuration and reload Nginx.
4. Use Certbot or your existing certificate system to enable HTTPS.

The reverse proxy must forward `/api/memories` to the same service; the supplied configuration already does this.

## Direct LAN or port access

To expose port 3000 directly, set this in `.env`:

```dotenv
BIND_ADDRESS=0.0.0.0
PUBLIC_PORT=3000
```

Then restart with `docker compose up -d`. Use a firewall and HTTPS reverse proxy before exposing the service to the public internet.

## Data and backups

Memory-wall messages are stored in:

```text
data/engineer-day.sqlite
```

Back up the entire `data/` directory. To restore it, stop the container, replace the directory with the backup, and start the container again.

## Updating the site

After copying updated files to the server, run:

```bash
docker compose up -d --build
```

The `data/` directory is mounted outside the container, so rebuilding does not remove messages.

## Running without Docker

Node.js 22 or newer is required:

```bash
npm start
```

Optional environment variables:

- `HOST` — listening interface, default `0.0.0.0`
- `PORT` — listening port, default `3000`
- `DATA_DIR` — persistent data directory, default `./data`

For production use without Docker, run the process with systemd, PM2, or another process supervisor and place it behind HTTPS.

## Network Weather MVP

The telecom presentation is available at `/network-weather/`; its deterministic fixture API is available at `/api/network-weather` and `/api/network-weather/timeline`. It is additive and does not change the Engineer Day landing page or memory API.

Run the local presentation:

```bash
npm start
curl -fsS http://127.0.0.1:3000/health
curl -fsS http://127.0.0.1:3000/ready
npm run verify:network-weather-mvp
```

`/health` confirms the process and reports the Network Weather schema/frame count. `/ready` confirms static assets, fixture availability, and schema compatibility. The deployment image runs as the unprivileged `node` user, sends security headers, validates query filters, and uses no live credentials or telemetry secrets.

Operational limitations for this MVP:

- Data is illustrative fixture data in `server/network-weather.mjs`; no NMS/OSS connector is enabled.
- The timeline is Tehran time (`Asia/Tehran`) and explicitly labels observed versus forecast frames.
- The SQLite persistence volume belongs to the existing Engineer Day memory wall; back it up before replacement deployments.
- To roll back, restore the previous image/container using the existing deployment script and keep the external `data/` volume unchanged.
