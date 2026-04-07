#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/photomagic/backend"
LOG_DIR="$APP_DIR/logs"
PID_FILE="$APP_DIR/backend.pid"

if [[ ! -d "$APP_DIR" ]]; then
  echo "[ERROR] Backend directory not found: $APP_DIR" >&2
  exit 1
fi

mkdir -p "$LOG_DIR"
cd "$APP_DIR"

if [[ ! -f .env ]]; then
  if [[ -f .env.example ]]; then
    echo "[WARN] .env not found, copying from .env.example"
    cp .env.example .env
  else
    echo "[ERROR] .env not found and .env.example missing" >&2
    exit 1
  fi
fi

if [[ ! -d node_modules ]]; then
  echo "[INFO] Installing dependencies..."
  npm install
fi

if [[ ! -f dist/app.js ]]; then
  echo "[INFO] Building backend..."
  npm run build
fi

if [[ -f "$PID_FILE" ]]; then
  OLD_PID="$(cat "$PID_FILE" || true)"
  if [[ -n "${OLD_PID:-}" ]] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "[INFO] Stopping existing backend process: $OLD_PID"
    kill "$OLD_PID"
    sleep 2
  fi
  rm -f "$PID_FILE"
fi

export NODE_ENV="${NODE_ENV:-production}"
export HOST="${HOST:-0.0.0.0}"

echo "[INFO] Starting backend in $APP_DIR"
nohup npm start > "$LOG_DIR/backend.out.log" 2> "$LOG_DIR/backend.err.log" < /dev/null &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"

sleep 3
if kill -0 "$NEW_PID" 2>/dev/null; then
  echo "[OK] Backend started. PID=$NEW_PID"
  echo "[INFO] stdout: $LOG_DIR/backend.out.log"
  echo "[INFO] stderr: $LOG_DIR/backend.err.log"
  echo "[INFO] health: http://127.0.0.1:3001/api/v1/health"
else
  echo "[ERROR] Backend failed to start. Check logs:" >&2
  echo "  tail -n 100 $LOG_DIR/backend.err.log" >&2
  exit 1
fi
