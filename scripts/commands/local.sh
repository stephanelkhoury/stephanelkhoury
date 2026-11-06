#!/usr/bin/env bash
# Runs Multigraphic AI fully on this machine: local Postgres + Ollama + in-process worker.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
PORT="${PORT:-3333}"
LOCAL_DB="${LOCAL_DB:-multigraphic_ai_local}"
LOCAL_DB_USER="${LOCAL_DB_USER:-$(whoami)}"
DB_URL="postgresql://${LOCAL_DB_USER}@127.0.0.1:5432/${LOCAL_DB}?schema=public"
OLLAMA_MODEL="${OLLAMA_MODEL:-llama3.1:8b}"
ADMIN_TOKEN="${ADMIN_DASHBOARD_TOKEN:-local-operations-test-token}"

PSQL="$(command -v psql || true)"
[[ -z "$PSQL" && -x /opt/homebrew/opt/libpq/bin/psql ]] && PSQL=/opt/homebrew/opt/libpq/bin/psql
[[ -z "$PSQL" ]] && { echo "psql not found. Install PostgreSQL first."; exit 1; }

if ! "$PSQL" "postgresql://${LOCAL_DB_USER}@127.0.0.1:5432/postgres" -Atc "select 1" >/dev/null 2>&1; then
  echo "Local PostgreSQL is not reachable on 127.0.0.1:5432. Start it first."
  exit 1
fi

if [[ -z "$("$PSQL" "postgresql://${LOCAL_DB_USER}@127.0.0.1:5432/postgres" -Atc "select 1 from pg_database where datname='${LOCAL_DB}'")" ]]; then
  echo "Creating local database ${LOCAL_DB}..."
  "$PSQL" "postgresql://${LOCAL_DB_USER}@127.0.0.1:5432/postgres" -qc "create database \"${LOCAL_DB}\""
fi

cd "$ROOT_DIR"
export DATABASE_URL="$DB_URL"
echo "Applying migrations and seed to local database..."
npx prisma migrate deploy >/dev/null
MULTIGRAPHIC_OWNER_EMAIL="${MULTIGRAPHIC_OWNER_EMAIL:-info@stephanelkhoury.com}" node prisma/seed-operations.mjs

if command -v ollama >/dev/null 2>&1; then
  if ! curl -fs http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
    echo "Starting Ollama..."
    (nohup ollama serve >/tmp/ollama-multigraphic.log 2>&1 &)
    sleep 3
  fi
  ollama list | grep -q "^${OLLAMA_MODEL}" || { echo "Pulling ${OLLAMA_MODEL}..."; ollama pull "$OLLAMA_MODEL"; }
else
  echo "Ollama is not installed; agents will not be able to run locally."
fi

if lsof -ti tcp:"$PORT" >/dev/null 2>&1; then
  echo "Port $PORT is already in use. Run: npm run cmd stop"
  exit 1
fi

echo "Local stack ready: http://localhost:${PORT}/admin/multigraphic-ai  (password: ${ADMIN_TOKEN})"
export ADMIN_DASHBOARD_TOKEN="$ADMIN_TOKEN"
export MULTIGRAPHIC_DEFAULT_MODEL_PROVIDER=ollama
export OLLAMA_BASE_URL=http://127.0.0.1:11434
export OLLAMA_MODEL
export MULTIGRAPHIC_LOCAL_WORKER=1
exec npx next dev --webpack --port "$PORT"
