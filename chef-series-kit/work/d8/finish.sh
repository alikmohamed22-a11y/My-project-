#!/bin/bash
# full render (RS=2, WORKERS=2, under the shared test-render lock): captions pass -> encode -> delete frames, then no-captions pass
cd /root/shorts/chefd8
LOCK=/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad/testrender.lock
memok() { a=$(free -g | awk '/Mem:/{print $7}'); [ "$a" -ge 4 ] || { echo "LOW MEM ($a GB available), abort" ; exit 1; }; }
memok >> work/fc.log
flock $LOCK env RESUME=1 RS=2 Q="?story=d8" WORKERS=2 nice -n 10 node tools/render.mjs work/fc "0-969" >> work/fc.log 2>&1
work/encode.sh fc ChefDay8_captions.mp4 > work/enc_fc.log 2>&1 && rm -rf work/fc
memok >> work/fn.log
flock $LOCK env RESUME=1 RS=2 Q="?story=d8&nocap=1" WORKERS=2 nice -n 10 node tools/render.mjs work/fn "0-969" >> work/fn.log 2>&1
work/encode.sh fn ChefDay8_no_captions.mp4 > work/enc_fn.log 2>&1 && rm -rf work/fn
echo ALLDONE >> work/enc_fn.log
