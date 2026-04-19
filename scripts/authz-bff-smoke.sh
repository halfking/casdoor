#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"
COOKIE="${COOKIE:-}"

if [[ -z "$COOKIE" ]]; then
  echo "Usage: COOKIE='username=...; ...' BASE_URL=http://127.0.0.1:8000 bash scripts/authz-bff-smoke.sh"
  exit 1
fi

PASS=0
FAIL=0

check() {
  local label="$1" status="$2"
  if [[ "$status" == "ok" ]]; then
    PASS=$((PASS + 1))
    echo "  ✅ $label"
  else
    FAIL=$((FAIL + 1))
    echo "  ❌ $label (status=$status)"
  fi
}

APP="${APP:-agent-control-center}"

echo "=== BFF Smoke Test ==="

echo "[1/4] app-menus"
RESP=$(curl -sS "$BASE_URL/api/bff/app-menus?application=$APP" \
  -H "Cookie: $COOKIE")
STATUS=$(echo "$RESP" | jq -r '.status // "error"')
check "GET /api/bff/app-menus?application=$APP" "$STATUS"
echo "$RESP" | jq .

echo "[2/4] resolve-permissions"
RESP=$(curl -sS "$BASE_URL/api/bff/resolve-permissions" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -X POST \
  -d '{
    "tenant": "built-in",
    "subject": "built-in/admin",
    "checks": ["/management/users", "/management/roles"]
  }')
STATUS=$(echo "$RESP" | jq -r '.status // "error"')
check "POST /api/bff/resolve-permissions" "$STATUS"
echo "$RESP" | jq .

echo "[3/4] check-data-scope"
RESP=$(curl -sS "$BASE_URL/api/bff/check-data-scope" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -X POST \
  -d '{
    "tenant": "built-in",
    "subject": "built-in/admin",
    "resourceType": "user",
    "operation": "read",
    "recordContext": {}
  }')
STATUS=$(echo "$RESP" | jq -r '.status // "error"')
check "POST /api/bff/check-data-scope" "$STATUS"
echo "$RESP" | jq .

echo "[4/4] tenant-tree"
RESP=$(curl -sS "$BASE_URL/api/bff/tenant-tree?owner=built-in" \
  -H "Cookie: $COOKIE")
STATUS=$(echo "$RESP" | jq -r '.status // "error"')
check "GET /api/bff/tenant-tree" "$STATUS"
echo "$RESP" | jq .

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
if [[ $FAIL -gt 0 ]]; then
  exit 1
fi
