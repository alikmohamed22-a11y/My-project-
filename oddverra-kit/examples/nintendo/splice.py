# [NT] take2_t.wav (silenceremove + atempo 1.2) + beat pauses -> voice.wav (stereo) and ../work/words.json (fixed words, shifted times)
import json, numpy as np
from dsp import read_wav, write_wav
SR = 48000
x, _ = read_wav('take2_t.wav'); m = x.mean(0) if x.ndim > 1 else x
W = json.load(open('../work/words_take2.json'))
# glue whisper's split hyphen tokens ("great" "-grandson") and tidy
G = []
for w in W:
    if w['w'].startswith('-') and G: G[-1]['w'] += w['w']; G[-1]['e'] = w['e']; continue
    G.append(dict(w))
FIX = {'So,': 'So'}
W = [{'w': FIX.get(w['w'], w['w']), 's': w['s'], 'e': max(w['e'], w['s'] + 0.1)} for w in G]
LEAD = 0.12
def after(word, k=0):
    hits = [w for w in W if w['w'].rstrip('.,!?').lower() == word]; return (hits[k]['e'] + W[W.index(hits[k]) + 1]['s']) / 2
INS = [(after('cards'), 0.15), (after('flopped'), 0.22), (after('games', 1), 0.2), (after('today'), 0.25), (after('toy'), 0.1)]
cut = []
for t, d in INS:
    i0, i1 = int((t - 0.12) * SR), int((t + 0.12) * SR); w = int(0.01 * SR)
    e = [np.abs(m[i:i + w]).mean() for i in range(i0, i1, w // 2)]; k = i0 + int(np.argmin(e)) * (w // 2) + w // 2
    cut.append((k, d))
cut.sort()
pieces, last = [np.zeros(int(LEAD * SR))], 0
for k, d in cut: pieces += [m[last:k], np.zeros(int(d * SR))]; last = k
pieces += [m[last:], np.zeros(int(1.3 * SR))]
y = np.concatenate(pieces)
def shift(t): return t + LEAD + sum(d for k, d in cut if k / SR <= t)
for w in W: w['s'] = round(shift(w['s']), 3); w['e'] = round(shift(w['e'] - 0.001), 3)
write_wav('voice.wav', np.stack([y, y]))
json.dump(W, open('../work/words.json', 'w'), indent=0)
print('voice', len(y) / SR, 's; frames', int(np.ceil(len(y) / SR * 30)))
open('../work/words_frames.txt', 'w').write('\n'.join(f"{int(w['s']*30)} {w['w']}" for w in W))
