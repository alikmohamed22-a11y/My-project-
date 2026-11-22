#!/bin/bash
# [CL] audio/take1.mp3 (ElevenLabs Jesse 4N8zjn9tVNuDEBFWVHAq, eleven_v4) -> trimmed 1.15x take, ASR, script-aligned words, voice.wav,
# web/cl_words.js (story cuts re-time themselves), music + SFX stems, level-locked mix.wav, seam captions (work/captions.ass).
set -e
cd /root/shorts/clip1/audio
ffmpeg -v error -y -i take1.mp3 -af "silenceremove=start_periods=1:start_threshold=-42dB:stop_periods=-1:stop_duration=0.18:stop_threshold=-42dB,atempo=1.15" -ar 48000 -ac 1 take1_t.wav
python3 asr.py 1
python3 splice.py
cd /root/shorts/clip1 && python3 tools/mkwords.py work/words.json
cd audio && python3 audio_clip1.py && python3 mix.py voice.wav music.wav sfx.wav
cd /root/shorts/clip1 && CAP_N=2 python3 captions.py work/words.json work/captions.ass "$(cat work/caption_keys.txt)" "eighteen ninety-six=>1896;eight=>8;fourteen=>14;five=>5;two=>2;four=>4;one=>1"
# seam captions: centred on the split line (y = 960 of 1920), a touch smaller than full-frame captions
sed -i 's/^Style: Cap,Luckiest Guy,120,\(.*\),2,60,60,560,1$/Style: Cap,Luckiest Guy,104,\1,5,60,60,0,1/' work/captions.ass
grep -q ',5,60,60,0,1' work/captions.ass || { echo "caption style patch failed"; exit 1; }
echo "voice steps done: $(python3 -c "import json;W=json.load(open('work/words.json'));print(round(W[-1]['e']+1.3,2),'s')")"
