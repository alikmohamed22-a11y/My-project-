# [MM] takeN_t.wav + beat pauses -> voice.wav (stereo) and ../work/words.json (script tokens, shifted times). usage: splice.py N
import json, sys, numpy as np
from dsp import read_wav, write_wav
SR = 48000; t = sys.argv[1]
x, _ = read_wav(f'take{t}_t.wav'); m = x.mean(0) if x.ndim > 1 else x
W = json.load(open(f'../work/words_take{t}_al.json')); W = [{'w': w['w'], 's': w['s'], 'e': max(w['e'], w['s'] + 0.1)} for w in W]
norm = lambda s: ''.join(c for c in s.lower() if c.isalnum() or c in "'-")
LEAD = 0.1
def after(word, k=0):
    hits = [i for i, w in enumerate(W) if norm(w['w']) == word]; i = hits[k]; return (W[i]['e'] + W[i + 1]['s']) / 2
INS = [(after('built'), 0.25), (after('obviously'), 0.15), (after('island', 1), 0.3), (after('stranded'), 0.3), (after('eight'), 0.3), (after('out'), 0.25), (after('years', 1), 0.3),
       (after('size'), 0.3), (after('fast'), 0.35), (after('late'), 0.3), (after('mutations'), 0.35), (after('once'), 0.35)]
cut = []
for tm, d in INS:
    i0, i1 = int((tm - 0.12) * SR), int((tm + 0.12) * SR); w = int(0.01 * SR)
    e = [np.abs(m[i:i + w]).mean() for i in range(i0, i1, w // 2)]; k = i0 + int(np.argmin(e)) * (w // 2) + w // 2
    cut.append((k, d))
cut.sort()
pieces, last = [np.zeros(int(LEAD * SR))], 0
for k, d in cut: pieces += [m[last:k], np.zeros(int(d * SR))]; last = k
pieces += [m[last:], np.zeros(int(1.4 * SR))]
y = np.concatenate(pieces)
def shift(tm): return tm + LEAD + sum(d for k, d in cut if k / SR <= tm)
for w in W: w['s'] = round(shift(w['s']), 3); w['e'] = round(shift(w['e'] - 0.001), 3)
write_wav('voice.wav', np.stack([y, y]))
json.dump(W, open('../work/words.json', 'w'), indent=0)
print('voice', round(len(y) / SR, 2), 's; frames', int(np.ceil(len(y) / SR * 30)))
open('../work/words_frames.txt', 'w').write('\n'.join(f"{int(w['s']*30)} {w['w']}" for w in W))
