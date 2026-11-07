#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3333}"

PORT_PIDS="$(lsof -ti tcp:"$PORT" 2>/dev/null || true)"
DEV_PIDS="$(pgrep -f "next dev .*--port $PORT|npm run dev" || true)"
PIDS="$(printf "%s\n%s\n" "$PORT_PIDS" "$DEV_PIDS" | sed '/^$/d' | sort -u)"

if [[ -z "$PIDS" ]]; then
  echo "No dev server process found on port $PORT."
  exit 0
fi

echo "Stopping process(es):"
echo "$PIDS"
echo "$PIDS" | xargs kill
sleep 1

REMAINING="$(echo "$PIDS" | xargs -I{} sh -c 'kill -0 {} 2>/dev/null && echo {}' || true)"
if [[ -n "$REMAINING" ]]; then
  echo "Force killing remaining process(es):"
  echo "$REMAINING"
  echo "$REMAINING" | xargs kill -9
fi

echo "Done."
