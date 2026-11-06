#!/usr/bin/env bash
# Backs up the database in DATABASE_URL_UNPOOLED (default: .env.local) to backups/.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

if [[ -z "${DATABASE_URL_UNPOOLED:-}" && -f .env.local ]]; then
  set -a; . ./.env.local; set +a
fi
URL="${DATABASE_URL_UNPOOLED:-${DATABASE_URL:-}}"
[[ -z "$URL" ]] && { echo "No DATABASE_URL_UNPOOLED or DATABASE_URL found."; exit 1; }

PG_DUMP="$(command -v pg_dump || true)"
# Homebrew libpq ships a newer pg_dump than postgresql@14, which Neon (Postgres 17) rejects.
[[ -x /opt/homebrew/opt/libpq/bin/pg_dump ]] && PG_DUMP=/opt/homebrew/opt/libpq/bin/pg_dump
[[ -z "$PG_DUMP" ]] && { echo "pg_dump not found."; exit 1; }

mkdir -p backups
OUT="backups/db-$(date +%Y%m%d-%H%M%S).dump"
"$PG_DUMP" "$URL" -Fc -f "$OUT"
echo "Backup written: $OUT ($(du -h "$OUT" | cut -f1))"
