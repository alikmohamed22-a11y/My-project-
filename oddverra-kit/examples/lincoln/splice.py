# take1_t.wav + beat pauses -> voice.wav (stereo) and ../work/words.json (fixed words, shifted times)   [LN-audio]
import json, numpy as np
from dsp import read_wav, write_wav
SR = 48000
x, _ = read_wav('take1_t.wav'); m = x.mean(0) if x.ndim > 1 else x
W = json.load(open('../work/words_take1.json'))
out = []
for w in W:
    t = w['w']
    if t == '6': out.append({'w': '6-FOOT-4,', 's': w['s'], 'e': w['e']}); continue
    if t in ('foot', '4,'): out[-1]['e'] = w['e']; continue
    if t == 'out': out.append({'w': 'out-wrestle', 's': w['s'], 'e': w['e']}); continue
    if t == 'wrestle' and out and out[-1]['w'] == 'out-wrestle': out[-1]['e'] = w['e']; continue
    if t == 'boys,': t = 'Boys,'
    if t == 'outstanding': t = 'Outstanding'
    if t == "I'm": t = '"I\'m'
    if t == 'lick.': t = 'lick."'
    if t == 'really!': t = 'really.'
    if t == 'History': w = {**w, 's': w['s'] + 0.3}
    out.append({'w': t, 's': w['s'], 'e': max(w['e'], w['s'] + 0.12)})
W = out
INS = [(3.5, 0.35), (15.68, 0.3), (23.95, 0.3), (25.75, 0.2), (30.2, 0.2), (37.3, 0.35), (42.25, 0.4), (46.85, 0.45), (49.5, 0.25), (54.7, 0.3), (56.37, 0.4)]
cut = []
for t, d in INS:
    i0, i1 = int((t - 0.15) * SR), int((t + 0.15) * SR); w = int(0.01 * SR)
    e = [np.abs(m[i:i + w]).mean() for i in range(i0, i1, w // 2)]; k = i0 + int(np.argmin(e)) * (w // 2) + w // 2
    cut.append((k, d))
pieces, last = [], 0
for k, d in cut: pieces += [m[last:k], np.zeros(int(d * SR))]; last = k
pieces += [m[last:], np.zeros(int(1.7 * SR))]
y = np.concatenate(pieces)
def shift(t): return t + sum(d for k, d in cut if k / SR <= t)
for w in W: w['s'] = round(shift(w['s']), 3); w['e'] = round(shift(w['e'] - 0.001), 3)
write_wav('voice.wav', np.stack([y, y]))
json.dump(W, open('../work/words.json', 'w'), indent=0)
print('voice', len(y) / SR, 's; frames', int(np.ceil(len(y) / SR * 30)))
open('../work/words_frames.txt', 'w').write('\n'.join(f"{int(w['s']*30)} {w['w']}" for w in W))
