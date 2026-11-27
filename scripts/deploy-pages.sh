#!/bin/sh
# Build the app and publish dist/ to the gh-pages branch (served by GitHub Pages).
set -e
cd "$(dirname "$0")/.."
REMOTE_URL=$(git remote get-url origin)
npm run build
touch dist/.nojekyll
TMP=$(mktemp -d)
cp -R dist/. "$TMP"
cd "$TMP"
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git push -q -f "$REMOTE_URL" gh-pages
cd - >/dev/null
rm -rf "$TMP"
echo "Published to gh-pages."
