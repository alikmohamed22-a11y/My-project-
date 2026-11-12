#!/bin/bash
# [HW-story] wait for Play-Doh + Joughin renders, then render 0-1919 at RS=1.5 (resume + PIL verify), finish 4K, 1080p deliverables (<50 MB), free disk, DONE
cd /root/shorts/hollywood
mkdir -p out
SP=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad
st() { cat "$1" 2>/dev/null | head -c 7; }
echo "WAITING (Play-Doh + Joughin) $(date)" > chain_status.txt
while true; do
  a=$(st /root/shorts/playdoh/chain_status.txt); b=$(st /root/shorts/joughin/chain_status.txt)
  case "$a" in DONE*|FAILED*) ;; *) timeout 60 tail -f /dev/null; continue;; esac
  case "$b" in DONE*|FAILED*) break;; esac
  timeout 60 tail -f /dev/null
done
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
  echo "pass $pass: $n/1920 frames $(date)"
  [ "$n" -ge 1920 ] && break
  RESUME=1 RS=1.5 WORKERS=2 nice node render.mjs frames "0-1919" 2>&1 | grep -vE "willReadFrequently" | tail -n 40
done
n=$(ls frames | grep -c '^f[0-9]*\.jpg$')
if [ "$n" -lt 1920 ]; then echo "FAILED frames $n" > chain_status.txt; exit 1; fi
echo "FINISHING $(date)" > chain_status.txt
nice bash finish4k.sh "The Hollywood Sign Was an Ad for Houses" hollywood_4k > finish.log 2>&1 || { echo "FAILED finish" > chain_status.txt; exit 1; }
mkdir -p "$SP"
for v in captions no_captions; do
  src=out/hollywood_4k_captions.mp4; [ $v = no_captions ] && src=out/hollywood_4k.mp4
  nice ffmpeg -v error -y -i $src -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -preset slow -b:v 5M -maxrate 7M -bufsize 10M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$SP/Hollywood_$v.mp4"
done
ls -la "$SP"/Hollywood_* out/
ok=1; for v in captions no_captions; do s=$(stat -c %s "$SP/Hollywood_$v.mp4" 2>/dev/null || echo 0); [ "$s" -gt 1000000 ] && [ "$s" -lt 52428800 ] || ok=0; done
if [ -s out/hollywood_4k_captions.mp4 ] && [ $ok = 1 ]; then rm -rf frames; echo DONE > chain_status.txt; else echo "FAILED copies" > chain_status.txt; fi
