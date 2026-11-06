#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$repo_root"

docker compose -f local-aws/compose.yaml up -d --wait

if [ ! -x local-aws/.venv/bin/python ]; then
  python3 -m venv local-aws/.venv
fi
if ! local-aws/.venv/bin/python -c 'import boto3' >/dev/null 2>&1; then
  local-aws/.venv/bin/pip install -r local-aws/requirements.txt
fi
local-aws/.venv/bin/python local-aws/seed_releases.py

export VITE_LOCAL_MOTO=true
export VITE_RELEASE_MANIFEST_URL=http://localhost:5000/cispar-local-releases/releases.json
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
