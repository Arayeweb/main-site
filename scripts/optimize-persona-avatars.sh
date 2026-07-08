#!/usr/bin/env bash
# Generate card (400px) and thumb (96px) JPEGs from full-size persona PNGs.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$ROOT/public/assets/img"
OUT_DIR="$ROOT/public/assets/img/personas"
mkdir -p "$OUT_DIR"

pairs=(
  "elon-musk:elon.png"
  "cristiano-ronaldo:Ronaldo.png"
  "steve-jobs:jobs.png"
  "albert-einstein:enishtan.png"
  "oprah-winfrey:opera.png"
  "bill-gates:bilgates.png"
  "leonardo-da-vinci:davinchi.png"
  "marie-curie:mary.png"
  "nelson-mandela:nelson.png"
  "shakespeare:shekspir.png"
  "socrates:soqrat.png"
  "marie-antoinette:maryy.png"
)

for pair in "${pairs[@]}"; do
  id="${pair%%:*}"
  file="${pair##*:}"
  src="$SRC_DIR/$file"
  sips -Z 400 -s format jpeg -s formatOptions 78 "$src" --out "$OUT_DIR/${id}-card.jpg" >/dev/null
  sips -Z 96 -s format jpeg -s formatOptions 78 "$src" --out "$OUT_DIR/${id}-thumb.jpg" >/dev/null
  echo "ok $id"
done

du -sh "$OUT_DIR"
