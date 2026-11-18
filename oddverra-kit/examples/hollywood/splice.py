# take1_t.wav + beat pauses -> voice.wav (stereo) and ../work/words.json (fixed words, shifted times)
import json, numpy as np
from dsp import read_wav, write_wav
SR = 48000
x, _ = read_wav('take1_t.wav'); m = x.mean(0) if x.ndim > 1 else x
W = json.load(open('../work/words_take1.json'))
# word fixes
out = []
for w in W:
    t = w['w']
    if t == 'Hollywood' and abs(w['s'] - 22.40) < 0.05: out += [{'w': 'HOLLY...', 's': 21.92, 'e': 22.38}, {'w': 'WOOD...', 's': 22.56, 'e': 22.99}]; continue
    if t == 'Land.' and abs(w['s'] - 22.42) < 0.05: out.append({'w': 'LAND!', 's': 23.16, 'e': 23.66}); continue
    if t == 'Hollywood' and abs(w['s'] - 7.38) < 0.05: out.append({'w': 'Hollywoodland.', 's': 7.38, 'e': 7.90}); continue
    if t == 'Land.' and abs(w['s'] - 7.62) < 0.05: continue
    if t.startswith(',000'): out[-1]['w'] += t.replace(' ', ''); out[-1]['e'] = w['e']; continue
    if t in ('land.',): t = 'LAND.'
    if t == 'Sign': t = 'sign'
    if t == 'The' and abs(w['s'] - 26.84) < 0.05: w = {**w, 's': 27.24}
    if t == 'It' and abs(w['s'] - 53.88) < 0.05: w = {**w, 's': 54.1}
    if t == 'earth.': t = 'Earth.'
    out.append({'w': t, 's': w['s'], 'e': w['e']})
W = out
# (approx time, seconds of silence to insert)
INS = [(2.75, 0.45), (8.08, 0.25), (21.75, 0.2), (22.47, 0.25), (23.08, 0.25), (23.85, 0.35), (25.75, 0.45), (27.10, 0.55), (29.98, 0.25),
       (32.70, 0.75), (36.95, 0.2), (38.40, 0.65), (40.65, 0.25), (46.88, 0.35), (48.40, 0.35), (50.10, 0.35), (52.72, 0.55), (53.95, 0.45)]
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
