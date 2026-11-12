# take2_t.wav + beat pauses -> voice.wav (stereo) and ../work/words.json (fixed words, shifted times)   [BW]
import json, numpy as np
from dsp import read_wav, write_wav
SR = 48000
x, _ = read_wav('take2_t.wav'); m = x.mean(0) if x.ndim > 1 else x
W = json.load(open('../work/words_take2.json'))
FIX = {'bubble': 'Bubble', 'wrap': 'Wrap', 'Chavon,': 'Chavannes,', 'sealed': 'Sealed', 'air': 'Air', "wrap's": "Wrap's", 'appreciation': 'Appreciation', 'day,': 'Day,'}
out = []
for i, w in enumerate(W):
    t = w['w']
    if t in ('wrap', "wrap's") and not (out and out[-1]['w'] == 'Bubble'): pass
    elif t in FIX and not (t == 'sealed' and w['s'] < 9) and not (t == 'bubble' and w['s'] > 45.6 and w['s'] < 46): t = FIX[t]
    if t == 'Then' and w['s'] < 28.5: w = {**w, 's': 28.62}
    out.append({'w': t, 's': w['s'], 'e': w['e']})
W = out
INS = [(2.60, 0.4), (12.55, 0.2), (14.52, 0.45), (15.95, 0.3), (21.90, 0.3), (28.40, 0.35), (37.60, 0.35), (38.95, 0.3), (46.20, 0.25), (50.85, 0.3), (53.30, 0.35)]
cut = []
for t, d in INS:
    i0, i1 = int((t - 0.15) * SR), int((t + 0.15) * SR); w = int(0.01 * SR)
    e = [np.abs(m[i:i + w]).mean() for i in range(i0, i1, w // 2)]; k = i0 + int(np.argmin(e)) * (w // 2) + w // 2
    cut.append((k, d))
pieces, last = [], 0
for k, d in cut: pieces += [m[last:k], np.zeros(int(d * SR))]; last = k
pieces += [m[last:], np.zeros(int(1.6 * SR))]
y = np.concatenate(pieces)
def shift(t): return t + sum(d for k, d in cut if k / SR <= t)
for w in W: w['s'] = round(shift(w['s']), 3); w['e'] = round(shift(w['e'] - 0.001), 3)
write_wav('voice.wav', np.stack([y, y]))
json.dump(W, open('../work/words.json', 'w'), indent=0)
print('voice', len(y) / SR, 's; frames', int(np.ceil(len(y) / SR * 30)))
open('../work/words_frames.txt', 'w').write('\n'.join(f"{int(w['s']*30)} {w['w']}" for w in W))
