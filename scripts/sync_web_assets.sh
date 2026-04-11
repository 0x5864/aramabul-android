#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="$APP_DIR/assets/web"

DEFAULT_ROOT_A="$APP_DIR/../aramabul"
DEFAULT_ROOT_B="$APP_DIR/../aramabul-istanbul-web"

if [[ -n "${WEB_REPO_ROOT:-}" ]]; then
  ROOT_DIR="$WEB_REPO_ROOT"
elif [[ -d "$DEFAULT_ROOT_B" ]]; then
  ROOT_DIR="$DEFAULT_ROOT_B"
else
  ROOT_DIR="$DEFAULT_ROOT_A"
fi

echo "Source web repo: $ROOT_DIR"
echo "Sync web files to: $TARGET_DIR"
mkdir -p "$TARGET_DIR"

cp -f "$ROOT_DIR"/*.html "$TARGET_DIR"/
cp -f "$ROOT_DIR"/*.js "$TARGET_DIR"/
cp -f "$ROOT_DIR"/*.css "$TARGET_DIR"/
rsync -a --delete "$ROOT_DIR/assets/" "$TARGET_DIR/assets/"

find "$TARGET_DATA_DIR" -type f \( -name "*.backup.json" -o -name "*.xls" -o -name "*.csv" \) -delete

echo "Sync done."
