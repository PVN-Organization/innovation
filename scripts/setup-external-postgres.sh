#!/usr/bin/env bash
# Run ON 10.1.8.101 as vpsadmin (or sudo). Creates dedicated DB without touching others.
# Usage: sudo bash scripts/setup-external-postgres.sh

set -euo pipefail

DB_NAME="${DB_NAME:-innovation_db}"
DB_USER="${DB_USER:-innovation}"
DB_PASS="${DB_PASS:-}"

if [[ -z "$DB_PASS" ]]; then
  echo "Set DB_PASS env var (password for role $DB_USER)"
  exit 1
fi

echo "==> Checking PostgreSQL"
if command -v psql >/dev/null 2>&1; then
  sudo -u postgres psql -c "SELECT version();" || psql -c "SELECT version();"
else
  echo "psql not found — install/check PostgreSQL first"
  exit 1
fi

echo "==> Creating role/database if missing"
sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

echo "==> Reminder: allow 10.1.8.168 in pg_hba.conf, e.g.:"
echo "    host  ${DB_NAME}  ${DB_USER}  10.1.8.168/32  scram-sha-256"
echo "    Then: sudo systemctl reload postgresql"
echo "==> Done."
