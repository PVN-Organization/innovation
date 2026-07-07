#!/usr/bin/env bash
# Build Docker images on a machine WITH internet, then export for air-gapped servers.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PLATFORM="${PLATFORM:-linux/amd64}"
BUNDLE_DIR="${BUNDLE_DIR:-offline-bundle}"
API_URL="${NEXT_PUBLIC_API_URL:-}"
BYPASS_AUTH="${NEXT_PUBLIC_BYPASS_AUTH_TEMP:-true}"

mkdir -p "$BUNDLE_DIR"

echo "==> Building images for platform: $PLATFORM"

docker build \
  --platform "$PLATFORM" \
  -t innovation-backend:on-premise \
  ./backend

docker build \
  --platform "$PLATFORM" \
  --build-arg "NEXT_PUBLIC_API_URL=$API_URL" \
  --build-arg "NEXT_PUBLIC_BYPASS_AUTH_TEMP=$BYPASS_AUTH" \
  -t innovation-frontend:on-premise \
  ./frontend

echo "==> Pulling dependency images (postgres, minio)"
docker pull --platform "$PLATFORM" postgres:16-alpine
docker pull --platform "$PLATFORM" minio/minio

echo "==> Saving images to $BUNDLE_DIR/innovation-images.tar"
docker save \
  innovation-backend:on-premise \
  innovation-frontend:on-premise \
  postgres:16-alpine \
  minio/minio \
  -o "$BUNDLE_DIR/innovation-images.tar"

cp docker-compose.offline.yml "$BUNDLE_DIR/"
cp env.production.example "$BUNDLE_DIR/"

cat > "$BUNDLE_DIR/README.txt" <<'EOF'
Offline bundle for Innovation Portal (on-premise)

On the air-gapped server:
  1. Copy this folder to ~/innovation/offline-bundle/
  2. cd ~/innovation
  3. cp env.production.example .env   # edit secrets
  4. ./scripts/load-offline-bundle.sh
  5. docker compose -f docker-compose.offline.yml up -d

Do NOT run "docker compose up --build" on the server — it requires internet.
EOF

echo "==> Done. Transfer '$BUNDLE_DIR/' to the server, then run load-offline-bundle.sh"
