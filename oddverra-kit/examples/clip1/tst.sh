#!/bin/bash
# tst.sh "<frames>" name : story-panel stills (WORKERS=1, <=6 frames, global test-render lock, >=4 GB available) + sheet. Q2 = extra query (e.g. "&clview=a")
SP=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad
n=$(echo "$1" | tr ',' '\n' | wc -l); [ "$n" -le 6 ] || { echo "max 6 frames"; exit 1; }
av=$(free -g | awk '/Mem:/{print $7}'); [ "$av" -ge 4 ] || { echo "only ${av} GB available"; exit 1; }
cd /root/shorts/clip1; rm -rf $SP/clip1/fs_$2; mkdir -p $SP/clip1
flock $SP/testrender.lock env WORKERS=1 RS=${RS:-1} Q="${Q2:-}" nice node render.mjs $SP/clip1/fs_$2 "$1" 2>&1 | grep -v willRead | grep -iE "error|PAGE|DONE|progress" | sort | uniq -c | head -12
python3 - "$SP/clip1/fs_$2" "$SP/clip1/sheet_$2.jpg" <<'PY'
import sys, glob, os
from PIL import Image, ImageDraw
fs = sorted(glob.glob(sys.argv[1] + '/f*.jpg')); cols = 2; rows = (len(fs) + 1) // 2; tw, th = 540, 480
S = Image.new('RGB', (cols * tw, max(1, rows) * (th + 20)), 'white'); D = ImageDraw.Draw(S)
for i, f in enumerate(fs):
    im = Image.open(f).resize((tw, th)); x, y = (i % cols) * tw, (i // cols) * (th + 20); S.paste(im, (x, y + 20)); D.text((x + 6, y + 4), os.path.basename(f), fill='black')
S.save(sys.argv[2], quality=88)
PY
