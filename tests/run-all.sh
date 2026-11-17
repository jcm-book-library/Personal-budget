#!/usr/bin/env bash
# Build index.html from app.html, then run the app tests in headless Chromium.
# Run from anywhere:  bash tests/run-all.sh
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tools/build-pages.py
# Use a local Playwright if the repo has one, otherwise the machine's global install
export NODE_PATH="${NODE_PATH:-}:$(npm root -g 2>/dev/null || true)"
node tests/app.test.mjs
