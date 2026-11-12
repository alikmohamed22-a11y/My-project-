#!/bin/bash
# [NAP] wait for Hollywood DONE/FAILED, render 0-1829 at RS=1.5 (resume + PIL verify, watchdog in render.mjs), finish 4K master, 1080p deliverables, DONE
cd /root/shorts/napoleon
mkdir -p out
SP=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad
echo "WAITING for hollywood $(date)" > chain_status.txt
while true; do
  hs=$(cat /root/shorts/hollywood/chain_status.txt 2>/dev/null)
  case "$hs" in DONE*|FAILED*) break;; esac
  timeout 60 tail -f /dev/null
done
echo "hollywood finished: $hs $(date)"
echo "RENDERING $(date)" > chain_status.txt
for pass in $(seq 1 60); do
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
  echo "RENDERING $n/1830 $(date)" > chain_status.txt
  [ "$n" -ge 1830 ] && break
  RESUME=1 RS=1.5 WORKERS=2 nice timeout 1200 node render.mjs frames "0-1829" 2>&1 | grep -vE "willReadFrequently" | tail -n 40
done
n=$(ls frames | grep -c '^f[0-9]*\.jpg$')
if [ "$n" -lt 1830 ]; then echo "FAILED frames $n" > chain_status.txt; exit 1; fi
echo "FINISHING $(date)" > chain_status.txt
nice bash finish4k.sh "Napoleon Wasn't Short. A Cartoonist Tricked You." napoleon_4k > finish.log 2>&1 || { echo "FAILED finish" > chain_status.txt; exit 1; }
mkdir -p "$SP"
nice ffmpeg -v error -y -i out/napoleon_4k_captions.mp4 -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -preset slow -b:v 5M -maxrate 7M -bufsize 10M -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k "$SP/Napoleon_captions.mp4"
nice ffmpeg -v error -y -i out/napoleon_4k.mp4 -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -preset slow -b:v 5M -maxrate 7M -bufsize 10M -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k "$SP/Napoleon_no_captions.mp4"
ls -la "$SP"/Napoleon_* out/
if [ -s out/napoleon_4k_captions.mp4 ] && [ -s "$SP/Napoleon_captions.mp4" ] && [ -s "$SP/Napoleon_no_captions.mp4" ]; then rm -rf frames; echo DONE > chain_status.txt; else echo "FAILED copies" > chain_status.txt; fi
