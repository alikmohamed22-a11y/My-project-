# [AL] takeN_t.wav + beat pauses after sentence ends / commas -> voice.wav (stereo) and ../work/words.json (shifted times)
import json, sys, numpy as np
from dsp import read_wav, write_wav
SR = 48000; t = sys.argv[1]
x, _ = read_wav(f'take{t}_t.wav'); m = x.mean(0) if x.ndim > 1 else x
W = json.load(open(f'../work/words_take{t}.json')); LEAD = 0.12
INS = []
for i in range(len(W) - 1):
    tok = W[i]['w']; gap = (W[i]['e'] + W[i + 1]['s']) / 2
    if tok.endswith(('.', '?', '!')): INS.append((gap, 0.3 if W[i + 1]['w'] in ('You', 'So', 'It', 'Finally,') else 0.2))
    elif tok.endswith('...'): INS.append((gap, 0.25))
cut = []
for tm, d in INS:
    i0, i1 = int((tm - 0.1) * SR), int((tm + 0.1) * SR); w = int(0.01 * SR)
    e = [np.abs(m[i:i + w]).mean() for i in range(max(0, i0), i1, w // 2)]; k = max(0, i0) + int(np.argmin(e)) * (w // 2) + w // 2; cut.append((k, d))
cut.sort(); pieces, last = [np.zeros(int(LEAD * SR))], 0
for k, d in cut: pieces += [m[last:k], np.zeros(int(d * SR))]; last = k
pieces += [m[last:], np.zeros(int(1.4 * SR))]; y = np.concatenate(pieces)
def shift(tm): return tm + LEAD + sum(d for k, d in cut if k / SR <= tm)
for w_ in W: w_['s'] = round(shift(w_['s']), 3); w_['e'] = round(shift(w_['e'] - 0.001), 3)
write_wav('voice.wav', np.stack([y, y])); json.dump(W, open('../work/words.json', 'w'), indent=0)
print('voice', round(len(y) / SR, 2), 's; frames', int(np.ceil(len(y) / SR * 30)))
