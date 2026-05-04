#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="$APP_DIR/assets/app_web"

DEFAULT_ROOT_A="$APP_DIR/../aramabul"
DEFAULT_ROOT_B="$APP_DIR/../aramabul-istanbul-web"

if [[ -n "${WEB_REPO_ROOT:-}" ]]; then
  ROOT_DIR="$WEB_REPO_ROOT"
elif [[ -d "$DEFAULT_ROOT_B" ]]; then
  ROOT_DIR="$DEFAULT_ROOT_B"
else
  ROOT_DIR="$DEFAULT_ROOT_A"
fi

if [[ ! -d "$ROOT_DIR" ]]; then
  echo "Error: source web repo not found at $ROOT_DIR"
  exit 1
fi

echo "Source web repo: $ROOT_DIR"
echo "Sync web files to: $TARGET_DIR"
mkdir -p "$TARGET_DIR"

cp -f "$ROOT_DIR"/*.html "$TARGET_DIR"/
cp -f "$ROOT_DIR"/*.js "$TARGET_DIR"/
cp -f "$ROOT_DIR"/*.css "$TARGET_DIR"/

if [[ -d "$ROOT_DIR/assets" ]]; then
  rsync -a --delete "$ROOT_DIR/assets/" "$TARGET_DIR/assets/"
fi

# Clean up large unnecessary files from the snapshot
find "$TARGET_DIR" -type f \( -name "*.backup.json" -o -name "*.xls" -o -name "*.csv" -o -name "*.log" -o -name "*.sql" \) -delete

echo "Sync done."
