#!/bin/bash
cd /root/shorts/chefd3
work/encode.sh fc ChefDay3_captions.mp4 > work/enc_fc.log 2>&1 && rm -rf work/fc
RESUME=1 RS=2 Q="?story=d3&nocap=1" WORKERS=2 nice -n 10 node tools/render.mjs work/fn "0-1469" >> work/fn.log 2>&1
work/encode.sh fn ChefDay3_no_captions.mp4 > work/enc_fn.log 2>&1
echo ALLDONE >> work/enc_fn.log
