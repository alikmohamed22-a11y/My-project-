#!/bin/bash
# tst.sh "<frames>" name : story stills (WORKERS=1, <=6 frames, global lock, >=4 GB available) + sheet
SP=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad
n=$(echo "$1" | tr ',' '\n' | wc -l); [ "$n" -le 6 ] || { echo "max 6 frames"; exit 1; }
av=$(free -g | awk '/Mem:/{print $7}'); [ "$av" -ge 4 ] || { echo "only ${av} GB available"; exit 1; }
flock $SP/testrender.lock env WORKERS=1 nice node render.mjs $SP/calendar/fs_$2 "$1" 2>&1 | grep -v willRead | grep -iE "error|PAGE|DONE" | sort | uniq -c | head -8
python3 sheet.py $SP/calendar/fs_$2 $SP/calendar/sheet_$2.jpg
