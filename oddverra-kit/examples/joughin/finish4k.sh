#!/bin/bash
# one linear gain to -14 LUFS + -1 dBFS peak limiter, H.264 CRF 17 + AAC, freeze/black + loudness QA, qa sheet
set -e
TITLE="$1"; NAME="$2"
cd audio
# two-pass loudnorm to -14 LUFS / -1 dBTP (linear mode)
M=$(ffmpeg -hide_banner -i mix.wav -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
IIN=$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'])"); TPIN=$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_tp'])")
LRAIN=$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_lra'])"); THIN=$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_thresh'])"); OFF=$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['target_offset'])")
echo "loudnorm pass1: I=$IIN TP=$TPIN LRA=$LRAIN"
ffmpeg -v error -y -i mix.wav -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$IIN:measured_TP=$TPIN:measured_LRA=$LRAIN:measured_thresh=$THIN:offset=$OFF:linear=true:print_format=summary" -ar 48000 final.wav
cd ..
ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i audio/final.wav -vf "scale=2160:3840:flags=lanczos,unsharp=5:5:0.4" -c:v libx264 -crf 16 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 256k -metadata title="$TITLE" -shortest out/$NAME.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 out/$NAME.mp4
echo "freeze:"; ffmpeg -hide_banner -i out/$NAME.mp4 -vf freezedetect=n=0.002:d=0.4,blackdetect=d=0.1 -an -f null - 2>&1 | grep -E "freeze_(start|duration)|black_start" || echo none
ffmpeg -hide_banner -i out/$NAME.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
ffmpeg -v error -y -i out/$NAME.mp4 -vf "fps=1,scale=180:320,tile=8x6" -frames:v 1 out/qa_sheet.jpg
if [ -f work/captions.ass ]; then
  ffmpeg -v error -y -i out/$NAME.mp4 -vf "ass=work/captions.ass:fontsdir=/root/shorts/fonts" -c:v libx264 -crf 16 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a copy out/${NAME}_captions.mp4 && echo "captions burned"
fi
