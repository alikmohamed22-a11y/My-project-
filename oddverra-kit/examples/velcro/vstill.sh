#!/bin/bash
# vstill.sh <flag> "<frames>" <name>   e.g. vstill.sh vcview 0,1,2 sets -> renders ?flag=a frames (view index = frame) and a sheet
SP=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad; mkdir -p $SP/velcro
n=$(echo "$2" | tr ',' '\n' | wc -l); [ $n -le 6 ] || { echo "max 6 frames"; exit 1; }
av=$(free -g | awk '/Mem:/{print $7}'); [ "$av" -ge 4 ] || { echo "only ${av} GB available, not rendering"; exit 1; }
rm -rf $SP/velcro/vs_$3; flock $SP/testrender.lock env Q="?$1=a${Q2:-}" WORKERS=1 nice node render.mjs $SP/velcro/vs_$3 "$2" 2>&1 | grep -v willRead | grep -iE "error|PAGE|warn" | sort | uniq -c | head -8
python3 sheet.py $SP/velcro/vs_$3 $SP/velcro/sheet_$3.jpg
