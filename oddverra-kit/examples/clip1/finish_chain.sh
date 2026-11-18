#!/bin/bash
# [CL] Oddverra split-screen Short #1 chain ("The first speeding ticket was for 8 mph"). Waits for the calendar chain DONE/FAILED (keeps
# waiting while /root/shorts/calendar/chain_status.txt is missing), then:
#  1. renders the reusable STUNT LIBRARY (/root/shorts/stuntlib, 2700 f = 90 s at 1080x960, RS=2 WORKERS=2, resume + PIL verify passes),
#     encodes /root/shorts/stuntlib/out/stunt_library.mp4 (x264 CRF 16, kept as an asset), writes out/events.json, deletes its frames;
#  2. needs the voice: if work/words.json / audio/mix.wav / work/captions.ass are missing it runs voice_steps.sh as soon as
#     audio/take1.mp3 exists (status "WAITING for voice" until then);
#  3. renders the STORY panel 0..NF-1 at 1080x960 (?ph=960, RS=2 -> 2160x1920, JPGQ 0.92, WORKERS=2, resume + verify, up to 60 passes);
#  4. -14 LUFS two-pass audio; split-screen composite (story top, stunt library bottom from LIB_OFF, thin divider, seam captions);
#     Clip1_captions.mp4 + Clip1_no_captions.mp4 (1080x1920, x264 slower two-pass 5.5M, maxrate 8M, AAC 192k, < 50 MB) into the scratchpad;
#  5. full-video QA (out/qa.txt, out/qa_sheet.jpg, stills at every shot boundary), frames deleted, DONE.
cd /root/shorts/clip1
mkdir -p out
SP=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad
LIB=/root/shorts/stuntlib; LNF=2700; NAME=Clip1; TITLE="The First Speeding Ticket Was for 8 MPH"
LIB_OFF=$(cat work/lib_offset.txt 2>/dev/null || echo 12.8)
st() { cat "$1" 2>/dev/null | head -c 7; }
verify() { [ -d "$1" ] || return 0; python3 - "$1" <<'PY'
import os, sys
from PIL import Image
d = sys.argv[1]; bad = 0
for f in sorted(os.listdir(d)):
    p = os.path.join(d, f)
    try:
        with Image.open(p) as im: im.verify()
        with Image.open(p) as im: im.load()
    except Exception:
        os.remove(p); bad += 1
print('removed broken', bad)
PY
}
echo "WAITING for calendar $(date)" > chain_status.txt  # RESUME: frames already rendered are kept (render.mjs RESUME=1)
while true; do
  b=$(st /root/shorts/calendar/chain_status.txt)
  case "$b" in DONE*|FAILED*) break;; esac
  timeout 60 tail -f /dev/null
done

# ---------------------------------------------------------------- 1. stunt library
if [ ! -s $LIB/out/stunt_library.mp4 ]; then
  for pass in $(seq 1 40); do
    verify $LIB/frames
    n=$(ls $LIB/frames 2>/dev/null | grep -c '^f[0-9]*\.jpg$')
    echo "stunt pass $pass: $n/$LNF frames, disk free $(df -h / | awk 'NR==2{print $4}') $(date)"
    echo "RENDERING stunt library $n/$LNF $(date)" > chain_status.txt
    [ "$n" -ge $LNF ] && break
    free_kb=$(df --output=avail / | tail -1)
    if [ "$free_kb" -lt 300000 ]; then echo "FAILED disk full (stunt $n frames)" > chain_status.txt; exit 1; fi
    ( cd $LIB && JPGQ=0.93 RESUME=1 RS=2 WORKERS=2 nice timeout 1800 node render.mjs frames "0-$((LNF - 1))" 2>&1 | grep -vE "willReadFrequently" | tail -n 20 )
  done
  n=$(ls $LIB/frames | grep -c '^f[0-9]*\.jpg$')
  if [ "$n" -lt $LNF ]; then echo "FAILED stunt frames $n" > chain_status.txt; exit 1; fi
  echo "ENCODING stunt library $(date)" > chain_status.txt
  nice ffmpeg -v error -y -framerate 30 -i $LIB/frames/f%04d.jpg -vf "scale=1080:960:flags=lanczos" -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -movflags +faststart \
    -metadata title="Oddverra stunt library (original, 90 s, 1080x960)" $LIB/out/stunt_library.mp4 || { echo "FAILED stunt encode" > chain_status.txt; exit 1; }
  ( cd $LIB && [ -s out/events.json ] || nice node events.mjs )
  rm -rf $LIB/frames
fi

# ---------------------------------------------------------------- 2. voice
vw=0  # other chains queue behind this one: give the voice 45 min, then FAILED (with the stunt library done) so the queue moves on
while [ ! -s work/words.json ] || [ ! -s audio/mix.wav ] || [ ! -s work/captions.ass ] || [ ! -s audio/voice.wav ]; do
  if [ -s audio/take1.mp3 ]; then echo "VOICE steps $(date)" > chain_status.txt; ./voice_steps.sh > out/voice_steps.log 2>&1 || { echo "FAILED voice steps (see out/voice_steps.log)" > chain_status.txt; exit 1; }; break; fi
  vw=$((vw + 1)); if [ $vw -gt 45 ]; then echo "FAILED no voice: stunt library done; add audio/take1.mp3 and re-run finish_chain.sh $(date)" > chain_status.txt; exit 1; fi
  echo "WAITING for voice (audio/take1.mp3) $(date)" > chain_status.txt
  timeout 60 tail -f /dev/null
done
NF=$(grep -o 'NF_VOICE = [0-9]*' web/cl_words.js | grep -o '[0-9]*'); LAST=$((NF - 1))
[ -n "$NF" ] && [ "$NF" -gt 900 ] || { echo "FAILED bad NF '$NF'" > chain_status.txt; exit 1; }
DUR=$(python3 -c "print($NF/30)")

# ---------------------------------------------------------------- 3. story panel
echo "RENDERING 0/$NF $(date)" > chain_status.txt
for pass in $(seq 1 60); do
  verify frames
  n=$(ls frames 2>/dev/null | grep -c '^f[0-9]*\.jpg$')
  echo "pass $pass: $n/$NF frames, disk free $(df -h / | awk 'NR==2{print $4}') $(date)"
  echo "RENDERING $n/$NF $(date)" > chain_status.txt
  [ "$n" -ge $NF ] && break
  free_kb=$(df --output=avail / | tail -1)
  if [ "$free_kb" -lt 300000 ]; then echo "FAILED disk full ($n frames)" > chain_status.txt; exit 1; fi
  PH=960 JPGQ=0.92 RESUME=1 RS=2 WORKERS=2 nice timeout 1200 node render.mjs frames "0-$LAST" 2>&1 | grep -vE "willReadFrequently" | tail -n 40
done
n=$(ls frames | grep -c '^f[0-9]*\.jpg$')
if [ "$n" -lt $NF ]; then echo "FAILED frames $n" > chain_status.txt; exit 1; fi

# ---------------------------------------------------------------- 4. audio + composite
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
mkdir -p "$SP"
# story frames (2160x1920) -> 1080x960 top; stunt library from LIB_OFF -> bottom; a thin divider on the seam (dark edge + light core)
SPLIT="[0:v]scale=1080:960:flags=lanczos,setsar=1[top];[1:v]setpts=PTS-STARTPTS,fps=30,scale=1080:960,setsar=1[bot];[top][bot]vstack=inputs=2,drawbox=x=0:y=955:w=1080:h=10:color=0x1a1430@0.75:t=fill,drawbox=x=0:y=958:w=1080:h=4:color=0xf6f2e6@0.95:t=fill"
for v in no_captions captions; do
  echo "ENCODING 1080 $v $(date)" > chain_status.txt
  vf="$SPLIT"; [ $v = captions ] && vf="$vf,ass=work/captions.ass:fontsdir=/root/shorts/fonts"
  O="$SP/${NAME}_$v.mp4"
  nice ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -ss $LIB_OFF -t $DUR -i $LIB/out/stunt_library.mp4 -filter_complex "$vf[v]" -map "[v]" -c:v libx264 -preset slower -b:v 5.5M -maxrate 8M -bufsize 12M -pix_fmt yuv420p -pass 1 -passlogfile out/x264_$v -an -f null /dev/null &&
  nice ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -ss $LIB_OFF -t $DUR -i $LIB/out/stunt_library.mp4 -i audio/final.wav -filter_complex "$vf[v]" -map "[v]" -map 2:a -c:v libx264 -preset slower -b:v 5.5M -maxrate 8M -bufsize 12M -pix_fmt yuv420p -pass 2 -passlogfile out/x264_$v -c:a aac -b:a 192k -movflags +faststart -metadata title="$TITLE" -shortest "$O" || { echo "FAILED encode $v" > chain_status.txt; exit 1; }
done
rm -f out/x264_*
ok=1; for v in captions no_captions; do s=$(stat -c %s "$SP/${NAME}_$v.mp4" 2>/dev/null || echo 0); [ "$s" -gt 1000000 ] && [ "$s" -lt 52428800 ] || ok=0; done
if [ $ok != 1 ]; then echo "FAILED size" > chain_status.txt; exit 1; fi
rm -rf frames

# ---------------------------------------------------------------- 5. QA on the captioned deliverable
echo "QA $(date)" > chain_status.txt
Q="$SP/${NAME}_captions.mp4"
{ ls -la "$SP"/${NAME}_*.mp4
  ffprobe -v error -show_entries format=duration:stream=width,height,codec_name,bit_rate -of compact "$Q"
  echo "freeze/black:"; ffmpeg -hide_banner -i "$Q" -vf freezedetect=n=0.002:d=0.4,blackdetect=d=0.1 -an -f null - 2>&1 | grep -E "freeze_(start|duration)|black_start" || echo none
  echo "freeze/black (story panel only):"; ffmpeg -hide_banner -i "$Q" -vf crop=1080:950:0:0,freezedetect=n=0.002:d=0.4 -an -f null - 2>&1 | grep -E "freeze_(start|duration)" || echo none
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
mkdir -p out/boundaries; for b in $(node -e "import('/root/shorts/clip1/web/story_clip1.js').then(m=>console.log(m.SHOT_STARTS.slice(1).flatMap(x=>[x-1,x]).join(' ')))"); do
  ffmpeg -v error -y -ss $(python3 -c "print($b/30+0.001)") -i "$Q" -frames:v 1 -vf scale=270:480 out/boundaries/b$b.jpg; done
echo DONE > chain_status.txt
