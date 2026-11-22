# [AL] faster-whisper small.en word timestamps for takeN_t.wav, then force the tokens onto the known script (work/script.txt):
# difflib aligns ASR tokens to script tokens; matched runs keep their times, replaced runs share their span by character length.
# -> ../work/words_takeN.json  ({w, s, e} with the script's own spelling, so story anchors always resolve)
import json, sys, re, subprocess, difflib, numpy as np
from faster_whisper import WhisperModel
SCRIPT = open('../work/script.txt').read().split()
nz = lambda s: re.sub(r"[^a-z0-9]", '', s.lower())
NUM = {'4': 'four', '5': 'five', '1787': 'seventeeneightyseven', '1847': 'eighteenfortyseven', '60': 'sixty'}
m = WhisperModel('small.en', device='cpu', compute_type='int8')
for t in sys.argv[1:]:
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f'take{t}_t.wav', '-ar', '16000', '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
    segs, _ = m.transcribe(a, word_timestamps=True, initial_prompt='Four A.M. Seventeen eighty-seven, Concord, New Hampshire. Levi Hutchins. Antoine Redier, eighteen forty-seven.')
    A = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
    an = [NUM.get(nz(x['w']), nz(x['w'])) for x in A]; sn = [nz(x) for x in SCRIPT]
    out = [None] * len(SCRIPT)
    sm = difflib.SequenceMatcher(None, sn, an, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal':
            for k in range(i2 - i1): out[i1 + k] = (A[j1 + k]['s'], A[j1 + k]['e'])
        elif op == 'replace' or (op == 'delete' and j1 > 0):
            s0 = A[j1]['s'] if j2 > j1 else A[j1 - 1]['e']; e0 = A[j2 - 1]['e'] if j2 > j1 else s0 + 0.25 * (i2 - i1)
            L = [len(SCRIPT[i]) + 1 for i in range(i1, i2)]; tot = sum(L); c = s0
            for k, i in enumerate(range(i1, i2)): d = (e0 - s0) * L[k] / tot; out[i] = (round(c, 3), round(c + d, 3)); c += d
    for i in range(len(out)):  # any leftover gap: put it right after the previous word
        if out[i] is None: p = out[i - 1] if i else (0.0, 0.0); out[i] = (p[1], p[1] + 0.2)
    W = [{'w': SCRIPT[i], 's': out[i][0], 'e': max(out[i][1], out[i][0] + 0.08)} for i in range(len(SCRIPT))]
    ratio = sm.ratio(); json.dump(W, open(f'../work/words_take{t}.json', 'w'), indent=0)
    print(t, 'asr', len(A), 'script', len(SCRIPT), 'match %.3f' % ratio, 'dur %.2f' % (len(a) / 16000)); print('  ASR:', ' '.join(x['w'] for x in A))
