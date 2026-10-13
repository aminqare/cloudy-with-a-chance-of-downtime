#!/usr/bin/env bash
set -Eeuo pipefail

: "${CI_COMMIT_SHA:?CI_COMMIT_SHA is required}"
: "${APP_IMAGE:?APP_IMAGE is required}"

APP_ROOT=/home/hdt/apps/huawei-a2-engineer-day
DATA_DIR="$APP_ROOT/data"
BACKUP_DIR="$APP_ROOT/backups"
RELEASE_FILE="$APP_ROOT/release.env"
CONTAINER=huawei-a2-engineer-day
PUBLIC_PORT="${PUBLIC_PORT:-10240}"

docker image inspect "$APP_IMAGE" >/dev/null
mkdir -p "$DATA_DIR" "$BACKUP_DIR"

old_image="$(docker inspect -f '{{.Config.Image}}' "$CONTAINER" 2>/dev/null || true)"
old_port="$(docker inspect -f '{{(index (index .NetworkSettings.Ports "3000/tcp") 0).HostPort}}' "$CONTAINER" 2>/dev/null || true)"

if [[ -z "$old_image" ]] && ss -ltnH "( sport = :$PUBLIC_PORT )" | grep -q .; then
  echo "Port $PUBLIC_PORT is occupied by another service" >&2
  exit 1
fi

if [[ -n "$old_image" ]] && [[ -f "$DATA_DIR/engineer-day.sqlite" ]]; then
  docker exec "$CONTAINER" node --input-type=module -e "import { DatabaseSync } from 'node:sqlite'; const db = new DatabaseSync('/app/data/engineer-day.sqlite'); db.exec('PRAGMA wal_checkpoint(FULL)'); db.close();"
  backup_file="$BACKUP_DIR/$(date -u +%Y%m%dT%H%M%SZ)-${CI_COMMIT_SHA:0:12}.tar.gz"
  tar -czf "$backup_file" -C "$DATA_DIR" .
  test -s "$backup_file"
  sha256sum "$backup_file" > "$backup_file.sha256"
fi

rollback() {
  result=$?
  trap - ERR
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  if [[ -n "$old_image" ]]; then
    docker run -d --name "$CONTAINER" --restart unless-stopped --init \
      -p "${old_port:-10240}:3000" -v "$DATA_DIR:/app/data" "$old_image" >/dev/null || true
  fi
  exit "$result"
}
trap rollback ERR

docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER" --restart unless-stopped --init \
  -p "$PUBLIC_PORT:3000" -v "$DATA_DIR:/app/data" "$APP_IMAGE" >/dev/null

for attempt in $(seq 1 30); do
  status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$CONTAINER" 2>/dev/null || true)"
  [[ "$status" == healthy ]] && break
  if [[ "$attempt" -eq 30 ]]; then
    docker logs "$CONTAINER"
    exit 1
  fi
  sleep 2
done

curl -fsS "http://127.0.0.1:$PUBLIC_PORT/health" >/dev/null
curl -fsS "http://127.0.0.1:$PUBLIC_PORT/" >/dev/null
curl -fsS "http://127.0.0.1:$PUBLIC_PORT/api/memories" >/dev/null

printf 'RELEASE_SHA=%s\nIMAGE=%s\nPUBLIC_PORT=%s\nDEPLOYED_AT=%s\n' \
  "$CI_COMMIT_SHA" "$APP_IMAGE" "$PUBLIC_PORT" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$RELEASE_FILE"
chmod 600 "$RELEASE_FILE"
trap - ERR
echo "Cloudy with a Chance of Downtime is ready on port $PUBLIC_PORT"
