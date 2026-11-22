#!/bin/bash
# [MM] voice_in.sh N : ElevenLabs take N (audio/takeN.mp3, Jesse eleven_v4) -> silence-trimmed + tempo (auto 1.0-1.2 so the Short lands
# near 60 s), faster-whisper words, alignment to the script, beat pauses (splice.py), web/mm_words.js, music + SFX stems, mix, captions,
# then audio/VOICE_READY (finish_chain.sh waits for it). Rerun with the other take number to switch takes.
set -e; cd /root/shorts/mammoth/audio; T=${1:-1}
ffmpeg -v error -y -i take$T.mp3 -af "silenceremove=stop_periods=-1:stop_duration=0.18:stop_threshold=-42dB" -ar 48000 -ac 1 raw$T.wav
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 raw$T.wav); TEMPO=$(python3 -c "print(round(min(1.2, max(1.0, $D / 55.0)), 3))")
echo "take $T raw ${D}s -> atempo $TEMPO"
ffmpeg -v error -y -i raw$T.wav -af "atempo=$TEMPO" -ar 48000 take${T}_t.wav
python3 asr.py $T && python3 align.py $T && python3 splice.py $T && (cd ../work && python3 mkwords.py)
python3 audio_mammoth.py && python3 mix.py voice.wav music.wav sfx.wav
cd .. && CAP_N=3 python3 captions.py work/words.json work/captions.ass "$(cat work/caption_keys.txt)" "ten thousand=>10,000;six thousand=>6,000;four thousand=>4,000;twenty twenty-four=>2024"
echo "take $T tempo $TEMPO $(date)" > audio/VOICE_READY; echo VOICE_READY
