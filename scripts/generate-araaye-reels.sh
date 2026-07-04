#!/usr/bin/env bash
# Generate 10 viral Instagram Reels for Araaye AI via Higgsfield
# Prerequisites:
#   1. higgsfield CLI in PATH (~/.local/bin/higgsfield)
#   2. higgsfield auth login
#   3. higgsfield workspace set <your-workspace-id>
#
# Usage: ./scripts/generate-araaye-reels.sh [1-10|all]
# Output: public/reels/araaye-ai/reel-XX.mp4 + manifest.json

set -euo pipefail

HF="${HF_BIN:-$HOME/.local/bin/higgsfield}"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/reels/araaye-ai"
mkdir -p "$OUT_DIR"

if ! command -v "$HF" &>/dev/null; then
  echo "Error: higgsfield not found. Install to ~/.local/bin or set HF_BIN."
  exit 1
fi

# ── Reel definitions ────────────────────────────────────────────────────────
# Format: id|filename|model|duration|prompt
# Models: seedance_2_0 (cinematic) or marketing_studio_video (UGC ads)
# All reels: 9:16 vertical, 720p, optimized for Instagram Reels (7–15s)

declare -a REELS=(
  '1|reel-01-pov-vpn-free.mp4|seedance_2_0|8|Vertical 9:16 UGC selfie-style video. Young Iranian woman at desk, shocked happy expression, holding iPhone showing AI chat app. She turns off VPN icon on screen, AI still works. Warm home office, natural lighting, handheld phone camera feel, fast hook in first second. Text overlay space at top for Persian caption. Cinematic but authentic TikTok aesthetic.'

  '2|reel-02-contrarian-stop-paying.mp4|seedance_2_0|10|Vertical 9:16. Pattern interrupt: red X over dollar bills and credit cards, quick cut to smiling student paying with phone in Toman. Split screen showing 5 AI model logos (GPT Gemini Claude DeepSeek Llama) merging into one app. Bold energy, fast cuts every 2 seconds, Instagram Reels ad style.'

  '3|reel-03-shocked-five-free.mp4|marketing_studio_video|12|UGC vertical 9:16. Iranian freelancer at cafe, looks at laptop screen with wide eyes, points at camera saying wow. Shows AI writing a business plan in seconds. Authentic phone-filmed vibe, casual clothes, morning light. Hook: instant reaction in frame one. Product demo feel for AI subscription app.'

  '4|reel-04-battle-mode-vote.mp4|seedance_2_0|10|Vertical 9:16. Two anonymous AI chat panels side by side on phone screen, finger taps vote button, winner glows gold. Gamified UI, dark mode app, satisfying reveal animation. Fast-paced, Gen-Z aesthetic, esports energy for AI comparison battle mode.'

  '5|reel-05-problem-solution-vpn.mp4|seedance_2_0|8|Vertical 9:16 problem-solution reel. First 2s: frustrated person staring at VPN connection error on laptop, red error popup. Hard cut to same person smiling, typing in clean Persian AI chat interface, green checkmark. Before-after transformation, dramatic lighting shift from grey to warm.'

  '6|reel-06-number-hook-five-models.mp4|seedance_2_0|6|Vertical 9:16. Bold kinetic typography animation: number 5 counts up, five glowing AI model icons orbit a central app logo. Purple and violet gradient brand colors. Premium tech startup motion graphics, stomp beat sync feel, instant payoff in first frame.'

  '7|reel-07-stomp-reveal.mp4|seedance_2_0|8|Vertical 9:16 stomp-to-reveal trend. Person stomps foot, camera shakes, frame shifts down revealing text area and transformed scene: messy desk with 5 app icons becomes one clean dashboard. Trendy Instagram Reels transition, energetic, vertical full screen.'

  '8|reel-08-before-after-workflow.mp4|seedance_2_0|12|Vertical 9:16 before-after. BEFORE: chaotic split screen — VPN app, foreign payment declined, 5 different AI tabs, stress. AFTER: single elegant app, one payment in Toman, calm smile. Fast montage, 1.5s per shot, transformation reveal format.'

  '9|reel-09-how-to-compare-models.mp4|marketing_studio_video|15|UGC how-to vertical 9:16. Friendly presenter shows phone: step 1 type question, step 2 pick two models, step 3 see answers side by side. Educational TikTok tutorial style, clear hand gestures, bright modern apartment background, trustworthy tech creator vibe.'

  '10|reel-10-instant-payoff-free-trial.mp4|seedance_2_0|8|Vertical 9:16 instant payoff hook. Opens on perfect AI-generated landing page copy on screen (the result), then pull back to reveal user amazed. End card energy: free trial badge, 5 questions free. High retention pacing, satisfying reveal, call-to-action moment.'
)

generate_reel() {
  local id="$1" file="$2" model="$3" duration="$4" prompt="$5"
  local out_path="$OUT_DIR/$file"

  echo ""
  echo "━━━ Reel $id: $file ━━━"
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

  # Run generation; capture output for URL extraction
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

  # Try to download video URL if printed
  local url
  url=$(echo "$result" | grep -Eo 'https?://[^ ]+\.(mp4|webm|mov)' | head -1 || true)
  if [[ -n "$url" ]]; then
    curl -fsSL "$url" -o "$out_path"
    echo "Saved → $out_path"
  else
    echo "Note: download URL manually from output above"
  fi
}

# Filter by argument
TARGET="${1:-all}"

for entry in "${REELS[@]}"; do
  IFS='|' read -r id file model duration prompt <<< "$entry"
  if [[ "$TARGET" == "all" || "$TARGET" == "$id" ]]; then
    generate_reel "$id" "$file" "$model" "$duration" "$prompt" || true
  fi
done

echo ""
echo "Done. Reels output directory: $OUT_DIR"
