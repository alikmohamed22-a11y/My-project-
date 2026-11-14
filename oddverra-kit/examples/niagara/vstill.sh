#!/bin/bash
# vstill.sh <flag> "<frames>" <name>   e.g. vstill.sh dhview 0,1,2 homes  -> renders ?flag=a frames (view index = frame) and a sheet
SP=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad/niagara; mkdir -p $SP
rm -rf $SP/vs_$3; Q="?$1=a${Q2:-}" WORKERS=1 nice node render.mjs $SP/vs_$3 "$2" 2>&1 | grep -v willRead | grep -iE "error|PAGE|warn" | sort | uniq -c | head -8
python3 sheet.py $SP/vs_$3 $SP/sheet_$3.jpg
