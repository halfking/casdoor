#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"
COOKIE="${COOKIE:-}"

if [[ -z "$COOKIE" ]]; then
  echo "Usage: COOKIE='username=...; ...' BASE_URL=http://127.0.0.1:8000 bash scripts/authz-bff-smoke.sh"
  exit 1
fi

echo "[1/3] resolve-permissions"
curl -sS "$BASE_URL/api/bff/resolve-permissions" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -X POST \
  -d '{
    "tenant": "built-in",
    "subject": "built-in/admin",
    "checks": ["/management/users", "/management/roles"]
  }' | jq .

echo "[2/3] check-data-scope"
curl -sS "$BASE_URL/api/bff/check-data-scope" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -X POST \
  -d '{
    "tenant": "built-in",
    "subject": "built-in/admin",
    "resourceType": "user",
    "operation": "read",
    "recordContext": {}
  }' | jq .

echo "[3/3] tenant-tree"
curl -sS "$BASE_URL/api/bff/tenant-tree?owner=built-in" \
  -H "Cookie: $COOKIE" | jq .

echo "Done"
