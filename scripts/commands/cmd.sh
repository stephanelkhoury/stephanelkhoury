#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
ACTION="${1:-}"

if [[ -z "$ACTION" ]]; then
  echo "Usage: cmd <start|stop|build|vercel|local|backup|test>"
  exit 1
fi

case "$ACTION" in
  start)
    exec bash "$ROOT_DIR/scripts/commands/start.sh"
    ;;
  stop)
    exec bash "$ROOT_DIR/scripts/commands/stop.sh"
    ;;
  build)
    exec bash "$ROOT_DIR/scripts/commands/build.sh"
    ;;
  vercel)
    exec bash "$ROOT_DIR/scripts/commands/vercel.sh"
    ;;
  local)
    exec bash "$ROOT_DIR/scripts/commands/local.sh"
    ;;
  backup)
    exec bash "$ROOT_DIR/scripts/commands/backup.sh"
    ;;
  test)
    exec bash "$ROOT_DIR/scripts/commands/test.sh"
    ;;
  *)
    echo "Unknown command: $ACTION"
    echo "Usage: cmd <start|stop|build|vercel|local|backup|test>"
    exit 1
    ;;
esac
