#!/usr/bin/env bash
# Runs lint, type check and the operations test suite against the local stack.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
PORT="${PORT:-3333}"
LOCAL_DB="${LOCAL_DB:-multigraphic_ai_local}"
LOCAL_DB_USER="${LOCAL_DB_USER:-$(whoami)}"
cd "$ROOT_DIR"

echo "Lint..."; npm run lint --silent
echo "Type check..."; npx tsc --noEmit
echo "Operations tests..."
OPERATIONS_TEST_DATABASE_URL="postgresql://${LOCAL_DB_USER}@127.0.0.1:5432/${LOCAL_DB}?schema=public" \
OPERATIONS_TEST_BASE_URL="http://localhost:${PORT}" \
OPERATIONS_TEST_ADMIN_TOKEN="${ADMIN_DASHBOARD_TOKEN:-local-operations-test-token}" \
  npm run test:operations
