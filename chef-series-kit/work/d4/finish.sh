#!/bin/bash
# full render: captions pass -> encode, then no-captions pass -> encode (RS=2, 2 workers)
cd /root/shorts/chefd4
RESUME=1 RS=2 Q="?story=d4" WORKERS=2 nice -n 10 node tools/render.mjs work/fc "0-1479" > work/fc.log 2>&1
work/encode.sh fc Chef_Day4_captions.mp4 > work/enc_fc.log 2>&1
RESUME=1 RS=2 Q="?story=d4&nocap=1" WORKERS=2 nice -n 10 node tools/render.mjs work/fn "0-1479" > work/fn.log 2>&1
work/encode.sh fn Chef_Day4_no_captions.mp4 > work/enc_fn.log 2>&1
echo ALLDONE >> work/enc_fn.log
