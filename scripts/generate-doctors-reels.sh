#!/usr/bin/env bash
# Generate Instagram Reels + hero video for /doctors via Higgsfield
# Prerequisites:
#   1. higgsfield CLI in PATH (~/.local/bin/higgsfield)
#   2. higgsfield auth login
#   3. higgsfield workspace set <your-workspace-id>
#
# Usage: ./scripts/generate-doctors-reels.sh [1-4|all]
# Output: public/reels/doctors/reel-XX.mp4

set -euo pipefail

HF="${HF_BIN:-$HOME/.local/bin/higgsfield}"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/reels/doctors"
mkdir -p "$OUT_DIR"

if ! command -v "$HF" &>/dev/null; then
  echo "Error: higgsfield not found. Install to ~/.local/bin or set HF_BIN."
  exit 1
fi

declare -a REELS=(
  '1|reel-01-patient-books-2am.mp4|seedance_2_0|8|Vertical 9:16 cinematic. Iranian doctor sleeping peacefully at night, phone on nightstand lights up with notification: new appointment booked. Warm mood shift, satisfied feeling. Medical clinic branding subtle. Persian UI on phone showing online booking confirmed. TikTok hook in first second, authentic not stock.'

  '2|reel-02-before-after-schedule.mp4|seedance_2_0|10|Vertical 9:16 before-after. BEFORE: frustrated clinic receptionist with empty paper calendar and ringing phone. Hard cut AFTER: same clinic calm, digital calendar full of green booked slots on tablet, smiling staff. Fast montage 2s per shot, transformation reveal for medical practice.'

  '3|reel-03-doctor-ugc-shocked.mp4|marketing_studio_video|12|UGC vertical 9:16. Iranian male doctor in white coat at modern clinic, looks at laptop with genuine surprise and smile, points at screen showing patient online bookings increasing. Authentic phone-filmed vibe, trustworthy medical professional, morning clinic light.'

  '4|reel-04-chatbot-patients.mp4|seedance_2_0|8|Vertical 9:16. Split: patient phone asking Persian question about visit cost and address, instant chatbot reply on clinic website. Doctor in background relaxed reading chart. Problem-solution fast pass, clean medical web UI, sky blue accent colors.'
)

generate_reel() {
  local id="$1" file="$2" model="$3" duration="$4" prompt="$5"
  local out_path="$OUT_DIR/$file"

  echo ""
  echo "━━━ Doctors Reel $id: $file ━━━"
  echo "Model: $model | Duration: ${duration}s"

  if [[ -f "$out_path" ]]; then
    echo "Skip: already exists → $out_path"
    return 0
  fi

  local extra_flags=()
  if [[ "$model" == "marketing_studio_video" ]]; then
    extra_flags+=(--mode ugc_how_to --resolution 720p --generate-audio true)
  else
    extra_flags+=(--resolution 720p)
  fi

  local result
  result=$("$HF" generate create "$model" \
    --prompt "$prompt" \
    --duration "$duration" \
    --aspect_ratio 9:16 \
    "${extra_flags[@]}" \
    --wait --wait-timeout 30m 2>&1) || {
      echo "FAILED reel $id"
      echo "$result"
      return 1
    }

  echo "$result"

  local url
  url=$(echo "$result" | grep -Eo 'https?://[^ ]+\.(mp4|webm|mov)' | head -1 || true)
  if [[ -n "$url" ]]; then
    curl -fsSL "$url" -o "$out_path"
    echo "Saved → $out_path"
  else
    echo "Note: download URL manually from output above"
  fi
}

TARGET="${1:-all}"

for entry in "${REELS[@]}"; do
  IFS='|' read -r id file model duration prompt <<< "$entry"
  if [[ "$TARGET" == "all" || "$TARGET" == "$id" ]]; then
    generate_reel "$id" "$file" "$model" "$duration" "$prompt" || true
  fi
done

echo ""
echo "Done. Doctors reels: $OUT_DIR"
echo "Hero embed uses: reel-01-patient-books-2am.mp4 (see manifest.json)"
