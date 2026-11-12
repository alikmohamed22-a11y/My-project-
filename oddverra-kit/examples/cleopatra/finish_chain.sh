#!/bin/bash
# [CLEO] wait for Lincoln DONE/FAILED, render 0-1929 at RS=2 (2160x3840, resume + PIL verify), -14 LUFS two-pass audio,
# 1080x1920 deliverables encoded straight from the frames (libx264 slower, two-pass 5.5M), full-video QA, free disk, DONE
cd /root/shorts/cleopatra
mkdir -p out
SP=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad
st() { cat "$1" 2>/dev/null | head -c 7; }
echo "WAITING for lincoln $(date)" > chain_status.txt
while true; do
  b=$(st /root/shorts/lincoln/chain_status.txt)
  case "$b" in DONE*|FAILED*) break;; esac
  timeout 60 tail -f /dev/null
done
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
  echo "pass $pass: $n/1930 frames $(date)"
  echo "RENDERING $n/1930 $(date)" > chain_status.txt
  [ "$n" -ge 1930 ] && break
  RESUME=1 RS=2 WORKERS=2 nice timeout 1200 node render.mjs frames "0-1929" 2>&1 | grep -vE "willReadFrequently" | tail -n 40
done
n=$(ls frames | grep -c '^f[0-9]*\.jpg$')
if [ "$n" -lt 1930 ]; then echo "FAILED frames $n" > chain_status.txt; exit 1; fi
echo "FINISHING $(date)" > chain_status.txt
( cd audio && python3 - <<'PY'
import numpy as np
from dsp import read_wav, write_wav, integrated
from mix import cap_peaks
x,_ = read_wav("mix.wav"); L = integrated(x); g = 10 ** ((-14 - L) / 20); y = cap_peaks(x * g, 10 ** (-1 / 20))
for _ in range(2):
    L2 = integrated(y); g *= 10 ** ((-14 - L2) / 20); y = cap_peaks(x * g, 10 ** (-1 / 20))
print(f"mix {L:.1f} LUFS -> {integrated(y):.2f} LUFS, peak {20*np.log10(np.abs(y).max()):.2f} dBFS")
write_wav("final.wav", y)
PY
) || { echo "FAILED audio" > chain_status.txt; exit 1; }
mkdir -p "$SP"
for v in no_captions captions; do
  vf="scale=1080:1920:flags=lanczos"; [ $v = captions ] && vf="$vf,ass=work/captions.ass:fontsdir=/root/shorts/fonts"
  O="$SP/Cleopatra_$v.mp4"
  nice ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -vf "$vf" -c:v libx264 -preset slower -b:v 5.5M -maxrate 8M -bufsize 12M -pix_fmt yuv420p -pass 1 -passlogfile out/x264_$v -an -f null /dev/null &&
  nice ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i audio/final.wav -vf "$vf" -c:v libx264 -preset slower -b:v 5.5M -maxrate 8M -bufsize 12M -pix_fmt yuv420p -pass 2 -passlogfile out/x264_$v -c:a aac -b:a 192k -movflags +faststart -metadata title="Cleopatra Lived Closer to the Moon Landing Than to the Pyramids" -shortest "$O" || { echo "FAILED encode $v" > chain_status.txt; exit 1; }
done
rm -f out/x264_*
ok=1; for v in captions no_captions; do s=$(stat -c %s "$SP/Cleopatra_$v.mp4" 2>/dev/null || echo 0); [ "$s" -gt 1000000 ] && [ "$s" -lt 52428800 ] || ok=0; done
if [ $ok != 1 ]; then echo "FAILED size" > chain_status.txt; exit 1; fi
rm -rf frames
# QA on the captioned deliverable
Q="$SP/Cleopatra_captions.mp4"
{ ls -la "$SP"/Cleopatra_*.mp4
  ffprobe -v error -show_entries format=duration:stream=width,height,codec_name,bit_rate -of compact "$Q"
  echo "freeze/black:"; ffmpeg -hide_banner -i "$Q" -vf freezedetect=n=0.002:d=0.4,blackdetect=d=0.1 -an -f null - 2>&1 | grep -E "freeze_(start|duration)|black_start" || echo none
  ffmpeg -hide_banner -i "$Q" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
  echo "mpdecimate drops:"; ffmpeg -i "$Q" -vf "scale=270:480,mpdecimate=hi=64*4:lo=64:frac=0.1" -f null - -loglevel debug 2>&1 | grep " drop " | grep -o "pts_time:[0-9.]*" | tr '\n' ' '
} > out/qa.txt 2>&1
ffmpeg -v error -y -i "$Q" -vf "fps=0.5,scale=216:384,tile=8x4" -frames:v 1 out/qa_sheet.jpg
echo DONE > chain_status.txt
