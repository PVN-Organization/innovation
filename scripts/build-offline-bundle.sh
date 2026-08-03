#!/usr/bin/env bash
# Build Docker images on a machine WITH internet, then export for air-gapped servers.
# External PostgreSQL required. Temp MinIO image included for --profile temp-minio.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PLATFORM="${PLATFORM:-linux/amd64}"
BUNDLE_DIR="${BUNDLE_DIR:-offline-bundle}"
API_URL="${NEXT_PUBLIC_API_URL:-}"
BASE_PATH="${NEXT_PUBLIC_BASE_PATH:-/sang-kien}"
BYPASS_AUTH="${NEXT_PUBLIC_BYPASS_AUTH_TEMP:-false}"

mkdir -p "$BUNDLE_DIR"

echo "==> Building images for platform: $PLATFORM"

docker build \
  --platform "$PLATFORM" \
  -t innovation-backend:on-premise \
  ./backend

docker build \
  --platform "$PLATFORM" \
  --build-arg "NEXT_PUBLIC_API_URL=$API_URL" \
  --build-arg "NEXT_PUBLIC_BASE_PATH=$BASE_PATH" \
  --build-arg "NEXT_PUBLIC_BYPASS_AUTH_TEMP=$BYPASS_AUTH" \
  -t innovation-frontend:on-premise \
  ./frontend

echo "==> Pulling temp MinIO image (optional profile)"
docker pull --platform "$PLATFORM" minio/minio

echo "==> Saving images to $BUNDLE_DIR/innovation-images.tar"
docker save \
  innovation-backend:on-premise \
  innovation-frontend:on-premise \
  minio/minio \
  -o "$BUNDLE_DIR/innovation-images.tar"

cp docker-compose.offline.yml "$BUNDLE_DIR/"
cp env.production.example "$BUNDLE_DIR/"
cp docs/haproxy-sang-kien.snippet.cfg "$BUNDLE_DIR/" 2>/dev/null || true

cat > "$BUNDLE_DIR/README.txt" <<'EOF'
Offline bundle for Innovation Portal (on-premise / portal.pvn.vn/sang-kien)

Requires external PostgreSQL (e.g. 10.1.8.101).

On the app server:
  1. Copy this folder to ~/innovation/offline-bundle/
  2. cd ~/innovation
  3. cp env.production.example .env   # edit secrets + POSTGRES_ASYNC_URL
  4. ./scripts/load-offline-bundle.sh
  5. docker compose -f docker-compose.offline.yml --profile temp-minio up -d
  6. Merge docs/haproxy-sang-kien.snippet.cfg into HAProxy and reload

Do NOT run "docker compose up --build" on an air-gapped server.
EOF

echo "==> Done. Transfer '$BUNDLE_DIR/' to the server, then run load-offline-bundle.sh"
