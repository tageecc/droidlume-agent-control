#!/bin/zsh
set -euo pipefail

TARGET="${1:-all}"
PACKAGE="${DROIDLUME_AGENT_NPM_SPEC:-droidlume-agent-control@latest}"

command -v npm >/dev/null 2>&1 || {
  echo "Node.js 20+ and npm are required." >&2
  exit 69
}

npm install --global "$PACKAGE"
droidlume agent install "$TARGET"
droidlume version
