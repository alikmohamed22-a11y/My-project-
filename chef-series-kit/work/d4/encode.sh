#!/bin/bash
# encode: frames dir (2160x3840 jpg) -> 1080x1920 lanczos H.264 two-pass 5.5M (preset slower) + loudnormed mix (AAC 192k), faststart
set -e; cd /root/shorts/chefd4
OUT=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad
SRC=work/$1; NAME=$2; PL=work/pass_$1
V="-framerate 30 -i $SRC/f%04d.jpg"; VF="scale=1080:1920:flags=lanczos,format=yuv420p"
X="-c:v libx264 -preset slower -profile:v high -b:v 5.5M -maxrate 8M -bufsize 11M -threads 2 -passlogfile $PL"
nice -n 15 ffmpeg -y -hide_banner -loglevel error $V -vf "$VF" $X -pass 1 -an -f mp4 /dev/null
nice -n 15 ffmpeg -y -hide_banner -loglevel error $V -i audio/mix_d4_ln.wav -vf "$VF" $X -pass 2 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -map 0:v -map 1:a -shortest -movflags +faststart $OUT/$NAME
rm -f ${PL}*
ls -la $OUT/$NAME
