#!/bin/bash
# [VC] voice_prep.sh <take>   after saving the ElevenLabs takes as audio/take1.mp3 (and take2.mp3):
# trim + speed (silenceremove 0.18 s -42 dB, atempo 1.15), whisper word times, beat pauses (splice.py) -> voice.wav + work/words.json,
# vc_beats.js, captions, stems + mix, then work/VOICE_OK so finish_chain.sh can render.
set -e; cd /root/shorts/velcro/audio; TK=${1:-1}
for t in 1 2; do [ -f take$t.mp3 ] && ffmpeg -v error -y -i take$t.mp3 -af "silenceremove=stop_periods=-1:stop_duration=0.18:stop_threshold=-42dB,atempo=${ATEMPO:-1.15}" -ar 48000 -ac 2 take${t}_t.wav; done
python3 asr.py $(ls take*_t.wav | grep -o '[0-9]' | tr '\n' ' ')
python3 splice.py $TK
cd ../work && python3 beats.py | head -c 400; echo
cd .. && CAP_N=3 python3 captions.py work/words.json work/captions.ass "$(cat work/caption_keys.txt)" "$(cat work/caption_subs.txt)"
cd audio && nice python3 audio_velcro.py && python3 mix.py voice.wav music.wav sfx.wav
touch ../work/VOICE_OK; echo "voice ready: $(python3 -c "import json;W=json.load(open('../work/words.json'));print(round(W[-1]['e'],2),'s,',len(W),'words')")"
