#!/usr/bin/env bash
# Generate a release keystore for AramaBul Android.
# Run this ONCE, then store the keystore file and passwords securely.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEYSTORE_DIR="$APP_DIR/android/keystore"
KEYSTORE_FILE="$KEYSTORE_DIR/aramabul-release.jks"
KEY_ALIAS="aramabul-release"

if [[ -f "$KEYSTORE_FILE" ]]; then
  echo "Keystore already exists at: $KEYSTORE_FILE"
  echo "Delete it first if you want to regenerate."
  exit 1
fi

mkdir -p "$KEYSTORE_DIR"

echo ""
echo "=== AramaBul Release Keystore Generator ==="
echo ""
echo "You will be asked for passwords and certificate info."
echo "IMPORTANT: Remember these passwords! You need them for every release."
echo ""

keytool -genkey -v \
  -keystore "$KEYSTORE_FILE" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias "$KEY_ALIAS"

echo ""
echo "Keystore created at: $KEYSTORE_FILE"
echo ""
echo "Now create android/key.properties with:"
echo "  storePassword=<your-store-password>"
echo "  keyPassword=<your-key-password>"
echo "  keyAlias=$KEY_ALIAS"
echo "  storeFile=../keystore/aramabul-release.jks"
echo ""
echo "See android/key.properties.example for a template."
