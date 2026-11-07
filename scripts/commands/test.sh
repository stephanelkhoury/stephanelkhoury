#!/usr/bin/env bash
# Lint, type-check and run every operations test against a separate disposable database and server,
# so the working local database never receives test data.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
PORT="${TEST_PORT:-3334}"
TEST_DB="${TEST_DB:-multigraphic_ai_validation_local}"
DB_USER="${LOCAL_DB_USER:-$(whoami)}"
ADMIN="postgresql://${DB_USER}@127.0.0.1:5432/postgres"
DB_URL="postgresql://${DB_USER}@127.0.0.1:5432/${TEST_DB}?schema=public"
TOKEN="$(openssl rand -hex 16)"
LOG="${TMPDIR:-/tmp}/multigraphic-test-server.log"
PSQL="$(command -v psql || echo /opt/homebrew/opt/libpq/bin/psql)"

cd "$ROOT_DIR"
SERVER_PID=""
cleanup() {
  [[ -n "$SERVER_PID" ]] && kill "$SERVER_PID" 2>/dev/null || true
  sed -i '' '/\.next-test/d' tsconfig.json 2>/dev/null || true
}
trap cleanup EXIT

if lsof -ti tcp:"$PORT" >/dev/null 2>&1; then echo "Port $PORT is busy. Set TEST_PORT to a free port."; exit 1; fi
[[ -z "$("$PSQL" "$ADMIN" -Atc "select 1 from pg_database where datname='${TEST_DB}'")" ]] && "$PSQL" "$ADMIN" -qc "create database \"${TEST_DB}\""

export DATABASE_URL="$DB_URL" MULTIGRAPHIC_OWNER_EMAIL=validation-owner@example.test MULTIGRAPHIC_OWNER_NAME="Validation Owner" MULTIGRAPHIC_WORKSPACE_NAME="Multigraphic AI"
echo "Preparing test database..."
npx prisma migrate deploy >/dev/null
node prisma/seed-operations.mjs >/dev/null

echo "Lint (admin, operations, auth, lib)..."; npx eslint src/app/admin src/app/api/admin src/components/operations src/components/auth src/lib src/proxy.ts
echo "Type check..."; npx tsc --noEmit

echo "Starting test server on port ${PORT}..."
ADMIN_DASHBOARD_TOKEN="$TOKEN" MULTIGRAPHIC_DEFAULT_MODEL_PROVIDER=ollama OLLAMA_BASE_URL=http://127.0.0.1:11434 OLLAMA_MODEL="${OLLAMA_MODEL:-llama3.1:8b}" MULTIGRAPHIC_LOCAL_WORKER=1 NEXT_DIST_DIR=.next-test \
  npx next dev --webpack --port "$PORT" >"$LOG" 2>&1 &
SERVER_PID=$!
for _ in $(seq 1 90); do curl -fs -o /dev/null "http://localhost:${PORT}/admin/sign-in" && break; sleep 1; done
curl -fs -o /dev/null "http://localhost:${PORT}/admin/sign-in" || { echo "Test server did not start. See $LOG"; exit 1; }

BASE_URL="http://localhost:${PORT}" ADMIN_TOKEN="$TOKEN" node scripts/enable-agents.mjs --apply >/dev/null

echo "Operations tests..."
OPERATIONS_TEST_DATABASE_URL="$DB_URL" OPERATIONS_TEST_BASE_URL="http://localhost:${PORT}" OPERATIONS_TEST_ADMIN_TOKEN="$TOKEN" npm run test:operations
