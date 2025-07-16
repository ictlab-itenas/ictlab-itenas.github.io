#!/bin/bash

# Usage: ./ci.sh <git_repo_url> <destination_dir>
# Example: ./ci.sh https://github.com/user/repo.git /var/www/html

set -e

REPO_URL="$1"
DEST_DIR="$2"

if [[ -z "$REPO_URL" || -z "$DEST_DIR" ]]; then
  echo "Usage: $0 <git_repo_url> <destination_dir>"
  exit 1
fi

TMP_DIR=$(mktemp -d)

echo "Cloning $REPO_URL into $TMP_DIR..."
git clone "$REPO_URL" "$TMP_DIR/repo"

echo "Copying files to $DEST_DIR..."
mkdir -p "$DEST_DIR"
cp -r "$TMP_DIR/repo/"* "$DEST_DIR/"

echo "Cleaning up..."
rm -rf "$TMP_DIR"

echo "Deployment complete! Files are now in $DEST_DIR"
