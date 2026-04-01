#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WEB_VUE_DIR="$ROOT_DIR/web-vue"
WEB_BUILD_DIR="$ROOT_DIR/web/build"

# Ensure npm/node are on PATH (homebrew on macOS)
for p in /opt/homebrew/bin /usr/local/bin; do
  [[ -d "$p" ]] && export PATH="$p:$PATH"
done

echo "[build-web-vue-release] building web-vue"
cd "$WEB_VUE_DIR"
npm ci
npm run build

echo "[build-web-vue-release] syncing dist to web/build"
rm -rf "$WEB_BUILD_DIR"
mkdir -p "$WEB_BUILD_DIR"
cp -R "$WEB_VUE_DIR/dist/." "$WEB_BUILD_DIR/"

INDEX_HTML="$WEB_BUILD_DIR/index.html"
if [[ ! -f "$INDEX_HTML" ]]; then
  echo "[build-web-vue-release] missing output: $INDEX_HTML" >&2
  exit 1
fi

if ! grep -q '/assets/index-' "$INDEX_HTML"; then
  echo "[build-web-vue-release] expected Vite assets entry not found in $INDEX_HTML" >&2
  exit 1
fi

echo "[build-web-vue-release] done"