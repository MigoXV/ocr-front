#!/bin/sh
set -eu

PORT="${PORT:-4173}"
VITE_API_BASE_URL="${VITE_API_BASE_URL:-/api}"

cat >/app/dist/env.js <<EOF
window.__APP_CONFIG__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL}"
};
EOF

exec npm run preview -- --host 0.0.0.0 --port "$PORT"
