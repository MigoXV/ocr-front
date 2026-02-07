#!/bin/sh
set -eu

PORT="${PORT:-4173}"

exec npm run preview -- --host 0.0.0.0 --port "$PORT"
