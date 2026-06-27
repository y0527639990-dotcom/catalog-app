#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
gh auth setup-git
git push -u origin main
echo "✓ Bait נדחף ל-GitHub: https://github.com/y0527639990-dotcom/bait"
