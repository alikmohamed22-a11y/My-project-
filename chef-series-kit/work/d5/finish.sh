#!/bin/bash
# full render (RS=2, ONE worker — a long 3D chain shares this machine): captions pass -> encode -> delete frames, then no-captions pass
cd /root/shorts/chefd5
memok() { a=$(free -g | awk '/Mem:/{print $7}'); [ "$a" -gt 4 ] || { echo "LOW MEM ($a GB available), abort" ; exit 1; }; }
memok >> work/fc.log
RESUME=1 RS=2 Q="?story=d5" WORKERS=1 nice -n 10 node tools/render.mjs work/fc "0-1469" >> work/fc.log 2>&1
work/encode.sh fc Chef_Day5_captions.mp4 > work/enc_fc.log 2>&1 && rm -rf work/fc
memok >> work/fn.log
RESUME=1 RS=2 Q="?story=d5&nocap=1" WORKERS=1 nice -n 10 node tools/render.mjs work/fn "0-1469" >> work/fn.log 2>&1
work/encode.sh fn Chef_Day5_no_captions.mp4 > work/enc_fn.log 2>&1 && rm -rf work/fn
echo ALLDONE >> work/enc_fn.log
