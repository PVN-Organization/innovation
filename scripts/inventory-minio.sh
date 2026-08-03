#!/usr/bin/env bash
# Inventory only — run ON 10.1.8.101. Does NOT install or configure MinIO.
set -euo pipefail

echo "==> MinIO inventory on $(hostname)"
echo "--- listening ports 9000/9001 ---"
ss -tlnp 2>/dev/null | grep -E ':9000|:9001' || netstat -tlnp 2>/dev/null | grep -E ':9000|:9001' || echo "(none)"

echo "--- docker containers matching minio ---"
docker ps -a 2>/dev/null | grep -i minio || echo "(no docker minio / docker unavailable)"

echo "--- systemd units matching minio ---"
systemctl list-units --all 2>/dev/null | grep -i minio || echo "(none)"

echo "--- binary ---"
command -v minio || ls /usr/local/bin/minio /opt/minio/minio 2>/dev/null || echo "(minio binary not found)"

echo "==> Inventory complete (no changes made)."
