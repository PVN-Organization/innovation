#!/usr/bin/env bash
# Load pre-built images on an air-gapped server (no apt/npm during deploy).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TAR="${1:-offline-bundle/innovation-images.tar}"

if [[ ! -f "$TAR" ]]; then
  echo "ERROR: Bundle not found: $TAR"
  echo "Run build-offline-bundle.sh on a machine with internet, copy offline-bundle/ here."
  exit 1
fi

echo "==> Loading images from $TAR"
docker load -i "$TAR"

echo "==> Images loaded:"
docker images | grep -E 'innovation-|postgres.*16-alpine|minio/minio' || true

echo "==> Start with: docker compose -f docker-compose.offline.yml up -d"
