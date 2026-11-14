#!/bin/bash
# [BW] wait for Napoleon DONE/FAILED, render 0-1886 at RS=1.5 (resume + PIL verify, watchdog in render.mjs), finish 4K master, 1080p deliverables (<50 MB), free disk, DONE
cd /root/shorts/bubblewrap
mkdir -p out
SP=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad
echo "WAITING for napoleon $(date)" > chain_status.txt
while true; do
  ns=$(cat /root/shorts/napoleon/chain_status.txt 2>/dev/null)
  case "$ns" in DONE*|FAILED*) break;; esac
  timeout 60 tail -f /dev/null
done
echo "napoleon finished: $ns $(date)"
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
  echo "pass $pass: $n/1887 frames $(date)"; echo "RENDERING $n/1887 $(date)" > chain_status.txt
  [ "$n" -ge 1887 ] && break
  RESUME=1 RS=1.5 WORKERS=2 nice timeout 1200 node render.mjs frames "0-1886" 2>&1 | grep -vE "willReadFrequently" | tail -n 40
done
n=$(ls frames | grep -c '^f[0-9]*\.jpg$')
if [ "$n" -lt 1887 ]; then echo "FAILED frames $n" > chain_status.txt; exit 1; fi
echo "FINISHING $(date)" > chain_status.txt
nice bash finish4k.sh "Bubble Wrap Was Invented as Wallpaper" bubblewrap_4k > finish.log 2>&1 || { echo "FAILED finish" > chain_status.txt; exit 1; }
mkdir -p "$SP"
for v in captions no_captions; do
  src=out/bubblewrap_4k_captions.mp4; [ $v = no_captions ] && src=out/bubblewrap_4k.mp4
  nice ffmpeg -v error -y -i $src -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -preset slow -b:v 5M -maxrate 7M -bufsize 10M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$SP/BubbleWrap_$v.mp4"
done
ls -la "$SP"/BubbleWrap_* out/
ok=1; for v in captions no_captions; do s=$(stat -c %s "$SP/BubbleWrap_$v.mp4" 2>/dev/null || echo 0); [ "$s" -gt 1000000 ] && [ "$s" -lt 52428800 ] || ok=0; done
if [ -s out/bubblewrap_4k_captions.mp4 ] && [ $ok = 1 ]; then
  rm -rf frames
  free=$(df --output=avail -k / | tail -1); [ "$free" -lt 3670016 ] && rm -f out/bubblewrap_4k.mp4 && echo "deleted 4K no-captions master (disk)"
  echo DONE > chain_status.txt
else echo "FAILED copies" > chain_status.txt; fi
