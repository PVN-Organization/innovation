#!/usr/bin/env bash
# Run ON app host 10.1.8.168 as pvndev after code is pulled.
# Requires: docker, docker compose, .env filled from env.production.example
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "Missing .env — copy env.production.example and edit secrets first."
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env
set +a

if [[ -z "${POSTGRES_ASYNC_URL:-}" ]]; then
  echo "POSTGRES_ASYNC_URL must be set in .env"
  exit 1
fi

echo "==> Building frontend + backend"
docker compose build frontend backend

echo "==> Starting with temp MinIO profile"
docker compose --profile temp-minio up -d

echo "==> Status"
docker compose --profile temp-minio ps

echo "==> Health"
curl -sf "http://127.0.0.1:${BACKEND_HOST_PORT:-10004}/health" && echo
curl -sf -o /dev/null -w "frontend /sang-kien: %{http_code}\n" "http://127.0.0.1:${FRONTEND_HOST_PORT:-10003}/sang-kien" || true

echo "==> Next: merge docs/haproxy-sang-kien.snippet.cfg into HAProxy and reload"
