# Writes web/words_d2_slow.json (original caption text, new-voice whisper timings) and web/story_d2slow.js (TMAP wrapper).
import json
FPS = 30; W = '/root/shorts/chefd2'
O = json.load(open(f'{W}/web/words_d2.json')); N = json.load(open(f'{W}/work/slow/words_new_raw.json'))
assert len(O) == len(N)
words = [{'w': o['w'], 's': n['s'], 'e': n['e']} for o, n in zip(O, N)]
json.dump(words, open(f'{W}/web/words_d2_slow.json', 'w'), indent=0)
# quotes: same words as the old quote ranges, re-framed on the new timings
OLDQ = [[649, 712], [1000, 1045], [1080, 1100]]; Q = []
for a, b in OLDQ:
    ix = [i for i, w in enumerate(O) if a <= round(w['s'] * FPS) < b]
    nb = round(words[ix[-1] + 1]['s'] * FPS) if ix[-1] + 1 < len(words) else round(words[ix[-1]]['e'] * FPS) + 20
    Q.append([round(words[ix[0]]['s'] * FPS) - 2, nb]); print('quote', ' '.join(O[i]['w'] for i in ix), Q[-1])
TM = json.load(open(f'{W}/work/slow/tmap_frames.json')); LEN = TM[-1][0]
js = f'''// Ep2 slow cut = story_d2 timeline played on the relaxed voice (audio/voice_slow.wav, take1 @ atempo {json.load(open(f"{W}/work/slow/meta.json"))["tempo"]}, natural pauses,
// longer beats before the punchlines). Same approach as Ep1 story_v3: output frame -> story frame via TMAP (piecewise-linear,
// keyed on the voice's silence edges, slope eased over ~4 frames). Built by work/slow/make_story.py. Select with ?story=d2slow.
import * as S from './story_d2.js';
export const SHOTS = S.SHOTS;
export const STORYLEN = S.LEN;
export const LEN = {LEN};
export const TMAP = {json.dumps(TM, separators=(',', ':'))};
export const CAPCONF = {{ ...S.CAPCONF, file: 'words_d2_slow.json', quotes: {json.dumps(Q)} }};
'''
open(f'{W}/web/story_d2slow.js', 'w').write(js); print('LEN', LEN)
