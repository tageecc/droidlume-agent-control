#!/bin/zsh
set -euo pipefail
TARGET="${1:-all}"
REPO="tageecc/droidlume-agent-control"
TMP="$(mktemp -d -t droidlume-agent-install)"
trap 'rm -rf "$TMP"' EXIT
BASE="https://github.com/$REPO/releases/latest/download"
curl -fL "$BASE/DroidLume-Agent-Tools-darwin-arm64.zip" -o "$TMP/tools.zip"
curl -fL "$BASE/DroidLume-Agent-Tools-darwin-arm64.zip.sha256" -o "$TMP/tools.zip.sha256"
EXPECTED="$(awk '{print $1}' "$TMP/tools.zip.sha256")"
ACTUAL="$(shasum -a 256 "$TMP/tools.zip" | awk '{print $1}')"
[[ "$EXPECTED" == "$ACTUAL" ]] || { echo "SHA-256 verification failed" >&2; exit 65; }
ditto -x -k "$TMP/tools.zip" "$TMP/unpacked"
INSTALLER="$(find "$TMP/unpacked" -maxdepth 2 -name install.sh -type f | head -1)"
[[ -n "$INSTALLER" ]] || { echo "DroidLume installer is missing" >&2; exit 66; }
"$INSTALLER" "$TARGET"
