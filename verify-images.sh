#!/usr/bin/env bash
set -euo pipefail
for f in assets/icon.png assets/splash.png; do
  if ! head -c 8 "$f" | node -e "let chunks=[]; process.stdin.on('data', c=>chunks.push(c)); process.stdin.on('end', ()=>console.log(Buffer.concat(chunks).toString('hex')))" | grep -qi '^89504e470d0a1a0a'; then
    echo "ERROR: $f does not have valid PNG signature" >&2
    exit 2
  fi
  identify -format "%m %z-bit %r %w x %h\n" "$f" || { echo "identify failed for $f"; exit 3; }
done
