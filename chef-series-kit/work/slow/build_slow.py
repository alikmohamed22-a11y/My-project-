# Day 2 "slow" cut (same approach as Ep1 v3): relaxed read of take1.mp3 (light atempo, natural pauses, longer
# beats before punchlines), then a piecewise-linear old->new time map so the existing story / SFX / captions follow.
#   old  = current fast voice (audio/voice.wav: take1 + silenceremove + atempo 1.15) = output time of story_d2.js
#   raw  = audio/take1.mp3
#   new  = audio/voice_slow.wav
# Anchors: silence edges (exact in raw->new because we make the edit; old<->raw matched silence by silence),
# speech between anchors is a constant tempo on both sides, so linear interpolation between them is exact.
# Writes: audio/voice_slow.wav, work/slow/timemap_slow.json ([[old_s,new_s],...]), work/slow/meta.json
import json, subprocess, numpy as np, sys
TEMPO = 1.03
SR = 48000
W = '/root/shorts/chefd2'
raw_sil = [tuple(map(float, l.split())) for l in open(f'{W}/work/slow/sil_raw.txt')]
old_sil = [tuple(map(float, l.split())) for l in open(f'{W}/work/slow/sil_old.txt')]
OLD_TEMPO = 1.15
OLD_VOICE = 40.7188; OLD_LEN = 1250 / 30

# target pause (seconds, new voice) per raw silence, keyed by raw silence start; None = keep as is (after tempo)
T = {0.75: 0.45,   # DAY 2 | Sam
     2.76: 0.42,   # and | you delivered
     4.30: 0.55,   # delivered. | First
     6.09: 0.45,   # cereal. | Easy, right?
     7.15: 0.50,   # right? | Sam poured
     9.16: 0.30,   # first, | then the cereal
     10.35: 0.50,  # cereal. | Then (milk-first lands)
     12.23: 0.42,  # and | cooked it.
     13.06: 0.55,  # it. | Next
     15.55: 0.45,  # chicken. | Sam had no idea
     22.21: 0.62,  # bath in ... | his bathtub.  (punchline)
     23.61: 0.60,  # bathtub. | His roommate
     25.22: 0.50,  # in. | Bro
     28.11: 0.58,  # tub? | Then somebody
     30.31: 0.45,  # pizza. | Sam spun
     33.26: 0.28,  # TV and | it flew
     35.69: 0.65,  # fan. | It's still up there. (punchline)
     37.05: 0.60,  # there. | Then the head chef
     39.17: 0.45,  # him. | Can't wait
     41.11: 0.50,  # do! | Sam replies
     42.36: 0.62,  # replies, | Same. (punchline)
     43.15: 0.60,  # Same. | 28 days left
     44.81: 0.50,  # left. | So what
     46.94: 0.36}  # next? | Comment below!

# 1) raw -> 48 kHz mono float with light tempo
pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f'{W}/audio/take1.mp3', '-af', f'aresample=48000:resampler=soxr,atempo={TEMPO}',
                      '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.float32).astype(np.float64)
Lr = len(x) / SR   # tempo'd length

# 2) edit pauses
out = []; pos = 0; tnew = 0.0; anchors = [(0.0, 0.0)]   # (raw_s, new_s)
for a_raw, b_raw in raw_sil:
    a, b = a_raw / TEMPO, b_raw / TEMPO; d = b - a
    tgt = T.get(round(a_raw, 2), d)
    if tgt is None: tgt = d
    if b >= Lr - 0.01:   # trailing silence: keep
        continue
    h = min(d, tgt) / 2
    ia, iah, ibh, ib = (int(round(v * SR)) for v in (a, a + h, b - h, b))
    out.append(x[pos:iah]); tnew += (iah - pos) / SR
    anchors.append((a_raw, tnew - h))
    z = int(round((tgt - 2 * h) * SR)); out.append(np.zeros(z)); tnew += z / SR
    out.append(x[ibh:ib]); tnew += (ib - ibh) / SR
    anchors.append((b_raw, tnew)); pos = ib
out.append(x[pos:]); tnew += (len(x) - pos) / SR
y = np.concatenate(out); NEW_VOICE = len(y) / SR
anchors.append((Lr * TEMPO, NEW_VOICE))
p = np.abs(y).max(); print('new voice', round(NEW_VOICE, 3), 'peak', round(20 * np.log10(p), 2))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s16le', f'{W}/audio/voice_slow.wav'],
               input=y.astype('<f8').tobytes(), check=True)

def interp(pairs, t):
    xs, ys = zip(*pairs); return float(np.interp(t, xs, ys, left=None, right=None)) if xs[0] <= t <= xs[-1] else (ys[-1] + (t - xs[-1]) if t > xs[-1] else ys[0] + t - xs[0])
raw2new = lambda t: interp(anchors, t)

# 3) old <-> raw anchors: greedy silence matching with running offset
oldraw = [(0.0, 0.0)]; delta = 0.0; j = 0; used = set()
for a_raw, b_raw in raw_sil:
    pred = (a_raw - delta) / OLD_TEMPO   # predicted old start
    best = min((k for k in range(len(old_sil)) if k not in used), key=lambda k: abs(old_sil[k][0] - pred))
    if abs(old_sil[best][0] - pred) > 0.25: print('  no match for raw silence', a_raw); continue
    used.add(best); oa, ob = old_sil[best]
    if oa <= oldraw[-1][0] + 0.02: print('  non-monotone at', a_raw); continue
    oldraw += [(oa, a_raw), (ob, b_raw)]
    delta = b_raw - ob * OLD_TEMPO
if oldraw[-1][0] < OLD_VOICE - 0.02: oldraw.append((OLD_VOICE, Lr * TEMPO))   # both files end on the same (trailing) silence
# speech-segment tempo check (should be ~1.15 everywhere)
rat = [(r1 - r0) / (o1 - o0) for (o0, r0), (o1, r1) in zip(oldraw, oldraw[1:]) if o1 - o0 > 0.4]
print('old->raw speech ratio min/med/max', round(min(rat), 3), round(float(np.median(rat)), 3), round(max(rat), 3), 'matched', (len(oldraw) - 2) // 2, 'of', len(raw_sil))

# 4) old -> new map, sampled at every anchor + tail (slope 1 after the voice ends)
pairs = [(o, raw2new(r)) for o, r in oldraw]
NEW_LEN_S = pairs[-1][1] + (OLD_LEN - OLD_VOICE)
pairs.append((OLD_LEN, NEW_LEN_S))
pairs = [(round(o, 4), round(n, 4)) for o, n in pairs]
for (o0, n0), (o1, n1) in zip(pairs, pairs[1:]): assert o1 > o0 and n1 > n0, (o0, o1, n0, n1)
json.dump(pairs, open(f'{W}/work/slow/timemap_slow.json', 'w'))
json.dump({'tempo': TEMPO, 'new_voice': NEW_VOICE, 'new_len_s': NEW_LEN_S, 'raw2new': anchors}, open(f'{W}/work/slow/meta.json', 'w'))
print('timemap knots', len(pairs), 'new LEN', round(NEW_LEN_S * 30), 'frames =', round(NEW_LEN_S, 2), 's')
