#!/bin/bash
# fstill.sh "<frames>" name  -> story frames + sheet
SP=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad/rushmore; mkdir -p $SP
rm -rf $SP/fs_$2; WORKERS=1 nice node render.mjs $SP/fs_$2 "$1" 2>&1 | grep -v willRead | grep -iE "error|PAGE" | sort | uniq -c | head -8
python3 sheet.py $SP/fs_$2 $SP/sheet_$2.jpg
