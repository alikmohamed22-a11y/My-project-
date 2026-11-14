#!/bin/bash
# [PR] wait for Eiffel DONE/FAILED (keeps waiting while the status file does not exist yet), render 0-1757 at RS=2 (2160x3840, resume + PIL verify, up to 60 passes of timeout 1200),
# -14 LUFS two-pass audio, 4K masters (out/pringles_4k.mp4 + out/pringles_4k_captions.mp4), 1080x1920 deliverables encoded straight
# from the frames (libx264 slower, two-pass 5.5M, maxrate 8M), full-video QA (qa.txt, qa_sheet.jpg, boundary stills), free disk, DONE
cd /root/shorts/pringles
mkdir -p out
SP=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad
NF=1758; LAST=$((NF - 1)); NAME=Pringles; TITLE="The Pringles Can Designer Was Buried in a Pringles Can"
st() { cat "$1" 2>/dev/null | head -c 7; }
echo "WAITING for eiffel $(date)" > chain_status.txt  # RESUME: frames already in frames/ are kept (render.mjs RESUME=1)
while true; do
  b=$(st /root/shorts/eiffel/chain_status.txt)
  case "$b" in DONE*|FAILED*) break;; esac
  timeout 60 tail -f /dev/null
done
echo "RENDERING 0/$NF $(date)" > chain_status.txt
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
  echo "pass $pass: $n/$NF frames $(date)"
  echo "RENDERING $n/$NF $(date)" > chain_status.txt
  [ "$n" -ge $NF ] && break
  RESUME=1 RS=2 WORKERS=2 nice timeout 1200 node render.mjs frames "0-$LAST" 2>&1 | grep -vE "willReadFrequently" | tail -n 40
done
n=$(ls frames | grep -c '^f[0-9]*\.jpg$')
if [ "$n" -lt $NF ]; then echo "FAILED frames $n" > chain_status.txt; exit 1; fi
echo "ENCODING audio $(date)" > chain_status.txt
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
# 4K masters (2160x3840, high quality)
echo "ENCODING 4k $(date)" > chain_status.txt
for v in plain captions; do
  vf="null"; [ $v = captions ] && vf="ass=work/captions.ass:fontsdir=/root/shorts/fonts"
  O=out/pringles_4k.mp4; [ $v = captions ] && O=out/pringles_4k_captions.mp4
  nice ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i audio/final.wav -vf "$vf" -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -metadata title="$TITLE" -shortest "$O" || { echo "FAILED encode 4k $v" > chain_status.txt; exit 1; }
done
# 1080x1920 deliverables straight from the frames
mkdir -p "$SP"
for v in no_captions captions; do
  echo "ENCODING 1080 $v $(date)" > chain_status.txt
  vf="scale=1080:1920:flags=lanczos"; [ $v = captions ] && vf="$vf,ass=work/captions.ass:fontsdir=/root/shorts/fonts"
  O="$SP/${NAME}_$v.mp4"
  nice ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -vf "$vf" -c:v libx264 -preset slower -b:v 5.5M -maxrate 8M -bufsize 12M -pix_fmt yuv420p -pass 1 -passlogfile out/x264_$v -an -f null /dev/null &&
  nice ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i audio/final.wav -vf "$vf" -c:v libx264 -preset slower -b:v 5.5M -maxrate 8M -bufsize 12M -pix_fmt yuv420p -pass 2 -passlogfile out/x264_$v -c:a aac -b:a 192k -movflags +faststart -metadata title="$TITLE" -shortest "$O" || { echo "FAILED encode $v" > chain_status.txt; exit 1; }
done
rm -f out/x264_*
ok=1; for v in captions no_captions; do s=$(stat -c %s "$SP/${NAME}_$v.mp4" 2>/dev/null || echo 0); [ "$s" -gt 1000000 ] && [ "$s" -lt 52428800 ] || ok=0; done
if [ $ok != 1 ]; then echo "FAILED size" > chain_status.txt; exit 1; fi
rm -rf frames
# QA on the captioned deliverable: probe, freeze/black, loudness, mpdecimate runs of 3+, sheet, stills at every shot boundary
echo "QA $(date)" > chain_status.txt
Q="$SP/${NAME}_captions.mp4"
{ ls -la "$SP"/${NAME}_*.mp4 out/pringles_4k*.mp4
  ffprobe -v error -show_entries format=duration:stream=width,height,codec_name,bit_rate -of compact "$Q"
  echo "freeze/black:"; ffmpeg -hide_banner -i "$Q" -vf freezedetect=n=0.002:d=0.4,blackdetect=d=0.1 -an -f null - 2>&1 | grep -E "freeze_(start|duration)|black_start" || echo none
  ffmpeg -hide_banner -i "$Q" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
  echo "mpdecimate drops:"; ffmpeg -i "$Q" -vf "scale=270:480,mpdecimate=hi=64*4:lo=64:frac=0.1" -f null - -loglevel debug 2>&1 | grep " drop " | grep -o "pts_time:[0-9.]*" | cut -d: -f2 > out/drops.txt
  python3 - <<'PY'
ts = [float(x) for x in open('out/drops.txt').read().split()]
fr = sorted(round(t * 30) for t in ts); runs = []; s = None
for i, f in enumerate(fr):
    if s is None: s = f
    if i + 1 == len(fr) or fr[i + 1] != f + 1:
        if f - s + 1 >= 3: runs.append((s, f))
        s = None
print(len(fr), 'dropped frames; runs of 3+ repeats:', runs if runs else 'none')
PY
} > out/qa.txt 2>&1
ffmpeg -v error -y -i "$Q" -vf "fps=1/2,scale=180:-1,tile=8x4" -frames:v 1 out/qa_sheet.jpg
mkdir -p out/boundaries; for b in 133 134 308 309 440 441 575 576 730 731 809 810 887 888 983 984 1165 1166 1300 1301 1474 1475 1520 1521 1663 1664; do
  ffmpeg -v error -y -ss $(python3 -c "print($b/30+0.001)") -i "$Q" -frames:v 1 -vf scale=270:480 out/boundaries/b$b.jpg; done
echo DONE > chain_status.txt
