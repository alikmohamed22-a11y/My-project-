#!/bin/bash
# [JG-story] render 0-1829 at RS=1.5 (resume + PIL verify), finish 4K, phone copies, free disk, DONE
cd /root/shorts/joughin
mkdir -p out
SP=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad
echo "RENDERING $(date)" > chain_status.txt
for pass in $(seq 1 40); do
  if [ -d frames ]; then
    python3 - <<'PY'
import os
from PIL import Image
bad = 0
for f in sorted(os.listdir('frames')):
    p = 'frames/' + f
    try:
        with Image.open(p) as im: im.verify()
        with Image.open(p) as im: im.load()
    except Exception:
        os.remove(p); bad += 1
print('removed broken', bad)
PY
  fi
  n=$(ls frames 2>/dev/null | grep -c '^f[0-9]*\.jpg$')
  echo "pass $pass: $n/1830 frames $(date)"
  [ "$n" -ge 1830 ] && break
  RESUME=1 RS=1.5 WORKERS=2 nice node render.mjs frames "0-1829" 2>&1 | grep -vE "willReadFrequently" | tail -n 40
done
n=$(ls frames | grep -c '^f[0-9]*\.jpg$')
if [ "$n" -lt 1830 ]; then echo "FAILED frames $n" > chain_status.txt; exit 1; fi
echo "FINISHING $(date)" > chain_status.txt
nice bash finish4k.sh "The Titanic's Baker Survived the Freezing Ocean" joughin_4k > finish.log 2>&1 || { echo "FAILED finish" > chain_status.txt; exit 1; }
mkdir -p "$SP"
nice ffmpeg -v error -y -i out/joughin_4k_captions.mp4 -c:v libx264 -b:v 12M -maxrate 16M -bufsize 24M -preset slow -pix_fmt yuv420p -movflags +faststart -c:a copy "$SP/Joughin_4k_captions_small.mp4"
nice ffmpeg -v error -y -i out/joughin_4k.mp4 -c:v libx264 -b:v 12M -maxrate 16M -bufsize 24M -preset slow -pix_fmt yuv420p -movflags +faststart -c:a copy "$SP/Joughin_4k_small.mp4"
nice ffmpeg -v error -y -i out/joughin_4k_captions.mp4 -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart -c:a copy "$SP/Joughin_1080p_captions.mp4"
ls -la "$SP"/Joughin_* out/
if [ -s out/joughin_4k_captions.mp4 ] && [ -s "$SP/Joughin_1080p_captions.mp4" ]; then rm -rf frames; echo DONE > chain_status.txt; else echo "FAILED copies" > chain_status.txt; fi
