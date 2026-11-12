#!/usr/bin/env bash
# push-to-github.sh — create the repo on your GitHub account and push this folder to it.
#
#   ./push-to-github.sh <username> <token> [repo-name]
#
# The token needs "Contents: write" (fine-grained) or "repo" scope (classic).
# Nothing is stored: the token is used for the API call and for one push only,
# then the remote is reset to the clean HTTPS URL.
set -euo pipefail

USER_NAME="${1:-}"
TOKEN="${2:-}"
REPO="${3:-cs9618-topical-quiz}"

if [[ -z "$USER_NAME" || -z "$TOKEN" ]]; then
  echo "usage: ./push-to-github.sh <github-username> <personal-access-token> [repo-name]" >&2
  exit 1
fi

cd "$(dirname "$0")"

echo "→ checking token…"
curl -sf -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/user > /dev/null || { echo "✖ token rejected"; exit 1; }

echo "→ creating repository $USER_NAME/$REPO (public)…"
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO\",\"private\":false,\"description\":\"Personal 9618 AS Level topical exam platform — teacher tests, AI mocks, notes, pseudocode drills\"}" \
  | grep -E '"(full_name|message)"' || true

echo "→ pushing main…"
git remote remove origin 2>/dev/null || true
git remote add origin "https://$USER_NAME:$TOKEN@github.com/$USER_NAME/$REPO.git"
git branch -M main
git push -u origin main

git remote set-url origin "https://github.com/$USER_NAME/$REPO.git"

cat <<EOF

✔ pushed to https://github.com/$USER_NAME/$REPO

Next: enable Pages
  Settings → Pages → Source: GitHub Actions
Your site will be at:
  https://$USER_NAME.github.io/$REPO/
EOF
