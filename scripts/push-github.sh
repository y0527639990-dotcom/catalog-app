#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="${1:-https://github.com/y0527639990-dotcom/bait.git}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

rsync -a --exclude node_modules --exclude .next --exclude .env.local "$ROOT/" "$TMP/"
cd "$TMP"
git init -b main
git add .
git commit -m "Initial commit — Bait Next.js app"
git remote add origin "$REPO"
git push -u origin main

echo "✓ נדחף ל-$REPO"
