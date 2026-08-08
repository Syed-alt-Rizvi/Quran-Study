#!/usr/bin/env bash
set -euo pipefail
for f in assets/icon.png assets/splash.png; do
  signature=$(od -A n -N 8 -t x1 "$f" | tr -d ' \n')
  if [ "$signature" != "89504e470d0a1a0a" ]; then
    echo "ERROR: $f does not have valid PNG signature (found: $signature)" >&2
    exit 2
  fi
  if ! file "$f" | grep -qi "PNG"; then
    echo "ERROR: $f is not recognized as PNG by file command" >&2
    exit 3
  fi
done
