#!/bin/bash
# [AL] voice -> timing -> stems -> mix -> captions. Needs audio/take1.mp3 (and optionally take2.mp3) from ElevenLabs Jesse
# (4N8zjn9tVNuDEBFWVHAq, eleven_v4, prompt = work/script.txt). Picks the take whose transcript matches the script best and whose
# spliced length lands in 55-65 s. Writes audio/voice.wav, work/words.json, web/al_words.js, audio/{music,sfx,mix}.wav,
# work/captions.ass, then audio/VOICE_READY.
set -e
cd /root/shorts/alarm/audio
TAKES=""; for t in 1 2; do [ -f take$t.mp3 ] && { ffmpeg -v error -y -i take$t.mp3 -af "silenceremove=stop_periods=-1:stop_duration=0.18:stop_threshold=-42dB,atempo=${ATEMPO:-1.15}" -ar 48000 -ac 2 take${t}_t.wav; TAKES="$TAKES $t"; }; done
[ -z "$TAKES" ] && { echo "no takes"; exit 1; }
nice python3 asr_al.py $TAKES | tee ../work/asr.log
BEST=$(python3 - <<'PY'
import re
best = None
for l in open('../work/asr.log'):
    m = re.match(r'(\d) asr \d+ script \d+ match ([0-9.]+) dur ([0-9.]+)', l)
    if m:
        t, r, d = m.group(1), float(m.group(2)), float(m.group(3)); score = r - (0.5 if not (48 < d + 2.5 < 64) else 0)
        if best is None or score > best[0] + 0.005: best = (score, t)
print(best[1])
PY
)
echo "take $BEST"; python3 splice_al.py $BEST
cd .. && python3 gen_words.py
( cd web && node -e "import('./story_alarm.js').then(m=>{console.log('story ok NF', m.NF, m.SHOTS_AL.map(s=>s[2]+':'+s[0]).join(' ')); for (const s of m.SHOTS_AL) if (s[1]-s[0] < 20) throw new Error('short shot '+s[2]);}).catch(e=>{console.log('STORY FAIL', e.message); process.exit(1)})" )
cd audio && nice python3 audio_alarm.py && python3 mix.py voice.wav music.wav sfx.wav && cd ..
CAP_N=3 python3 captions.py work/words.json work/captions.ass "$(cat work/caption_keys.txt)" "seventeen eighty-seven=>1787;eighteen forty-seven=>1847;four o'clock=>4 o'clock;five=>5;sixty=>60"
date > audio/VOICE_READY; echo VOICE_READY
