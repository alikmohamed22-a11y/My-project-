#!/bin/bash
# fstill.sh "<frames>" name  -> story frames + sheet (WORKERS=1, max 6 frames, global test-render lock, needs >= 4 GB free)
SP=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad/calendar; mkdir -p $SP
LOCK=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad/testrender.lock
n=$(echo "$1" | tr ',' '\n' | wc -l); [ "$n" -le 6 ] || { echo "max 6 frames"; exit 1; }
av=$(free -g | awk '/Mem:/{print $7}'); [ "$av" -ge 4 ] || { echo "only ${av} GB available"; exit 1; }
rm -rf $SP/fs_$2; flock $LOCK env WORKERS=1 nice node render.mjs $SP/fs_$2 "$1" 2>&1 | grep -v willRead | grep -iE "error|PAGE" | sort | uniq -c | head -8
python3 sheet.py $SP/fs_$2 $SP/sheet_$2.jpg
