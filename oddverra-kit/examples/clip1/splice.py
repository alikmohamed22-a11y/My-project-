# [CL] take1_t.wav (silenceremove 0.18 s -42 dB + atempo 1.15) + short beat pauses -> voice.wav (stereo) and ../work/words.json.
# The ASR words are aligned onto the exact script tokens (numbers like "1896" / "8" are expanded), so captions and story cues use the
# script's spelling; script words the ASR missed get interpolated times.
import json, re, difflib, numpy as np
from dsp import read_wav, write_wav
SR = 48000
x, _ = read_wav('take1_t.wav'); m = x.mean(0) if x.ndim > 1 else x
A = json.load(open('../work/words_take1.json'))
SCRIPT = open('../work/script_tts.txt').read().split()
norm = lambda w: re.sub(r"[^a-z0-9']", '', w.lower())
NUM = {'8': ['eight'], '1896': ['eighteen', 'ninetysix'], '14': ['fourteen'], '5': ['five'], '2': ['two'], '4': ['four'], '1': ['one'], '96': ['ninetysix'], '18': ['eighteen']}
asr = []
for w in A:
    for piece in re.split(r'[\s]+', w['w'].strip()):
        n = norm(piece); ex = NUM.get(n, [n])
        if n.endswith('mph'): ex = NUM.get(n[:-3], [n[:-3]]) + ['miles', 'an', 'hour']
        d = (w['e'] - w['s']) / len(ex)
        for i, e in enumerate(ex): asr.append({'n': e, 's': w['s'] + i * d, 'e': w['s'] + (i + 1) * d})
sn = [norm(w) for w in SCRIPT]; an = [a['n'] for a in asr]
T = [None] * len(SCRIPT)
for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, sn, an, autojunk=False).get_opcodes():
    if tag == 'equal' or (tag == 'replace' and i2 - i1 == j2 - j1):
        for k in range(i2 - i1): T[i1 + k] = (asr[j1 + k]['s'], asr[j1 + k]['e'])
miss = sum(t is None for t in T)
for i in range(len(T)):  # interpolate gaps
    if T[i] is None:
        a = max([j for j in range(i) if T[j]] or [None], key=lambda j: j if j is not None else -1); b = min([j for j in range(i + 1, len(T)) if T[j]] or [None], key=lambda j: j if j is not None else 1e9)
        ta = T[a][1] if a is not None else 0.0; tb = T[b][0] if b is not None else ta + 0.4
        T[i] = (ta + (tb - ta) * 0.1, ta + (tb - ta) * 0.9)
W = [{'w': SCRIPT[i], 's': round(T[i][0], 3), 'e': round(max(T[i][1], T[i][0] + 0.08), 3)} for i in range(len(SCRIPT))]
print('aligned', len(W), 'script words,', miss, 'interpolated')
LEAD = 0.1
def after(word, k=0):
    hits = [i for i, w in enumerate(W) if norm(w['w']) == word]; i = hits[k]; return (W[i]['e'] + W[i + 1]['s']) / 2
INS = [(after('hour'), 0.12), (after('england'), 0.1), (after('carriage'), 0.15), (after('two'), 0.2), (after('miles', 2), 0.12), (after('him'), 0.22), (after('horse'), 0.18), (after('costs'), 0.2), (after('changed'), 0.12), (after('brighton'), 0.15), (after('november'), 0.25)]
cut = []
for t, d in INS:
    i0, i1 = int((t - 0.1) * SR), int((t + 0.1) * SR); w = int(0.01 * SR)
    e = [np.abs(m[i:i + w]).mean() for i in range(max(0, i0), i1, w // 2)]; k = max(0, i0) + int(np.argmin(e)) * (w // 2) + w // 2
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
