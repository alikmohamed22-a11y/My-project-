#!/bin/bash
# one linear gain to -14 LUFS + -1 dBFS peak limiter, H.264 CRF 17 + AAC, freeze/black + loudness QA, qa sheet
set -e
TITLE="$1"; NAME="$2"
cd audio && python3 - <<'PY'
import numpy as np
from dsp import read_wav, write_wav, integrated, SR
from mix import cap_peaks
x,_ = read_wav("mix.wav"); L = integrated(x); g = 10 ** ((-14 - L) / 20); y = cap_peaks(x * g, 10 ** (-1 / 20))
for _ in range(2):  # [LN] second pass: re-measure after the limiter and correct the gain
    L2 = integrated(y); g *= 10 ** ((-14 - L2) / 20); y = cap_peaks(x * g, 10 ** (-1 / 20))
print(f"mix {L:.1f} LUFS -> gain {20*np.log10(g):+.1f} dB -> {integrated(y):.1f} LUFS, peak {20*np.log10(np.abs(y).max()):.2f} dBFS")
write_wav("final.wav", y)
PY
cd ..
ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i audio/final.wav -vf "scale=2160:3840:flags=lanczos,unsharp=5:5:0.4" -c:v libx264 -crf 16 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 256k -metadata title="$TITLE" -shortest out/$NAME.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 out/$NAME.mp4
echo "freeze:"; ffmpeg -hide_banner -i out/$NAME.mp4 -vf freezedetect=n=0.002:d=0.4,blackdetect=d=0.1 -an -f null - 2>&1 | grep -E "freeze_(start|duration)|black_start" || echo none
ffmpeg -hide_banner -i out/$NAME.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
ffmpeg -v error -y -i out/$NAME.mp4 -vf "fps=1,scale=180:320,tile=8x6" -frames:v 1 out/qa_sheet.jpg
if [ -f work/captions.ass ]; then
  ffmpeg -v error -y -i out/$NAME.mp4 -vf "ass=work/captions.ass:fontsdir=/root/shorts/fonts" -c:v libx264 -crf 16 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a copy out/${NAME}_captions.mp4 && echo "captions burned"
fi
