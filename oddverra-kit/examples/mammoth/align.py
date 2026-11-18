# [MM] align whisper words (../work/words_takeN.json) to the script tokens (../work/script_tts.txt) -> ../work/words_takeN_al.json
# Every script token gets a time: matched tokens take whisper's, unmatched runs are spread over the gap. Numbers whisper writes as
# digits ("10,000", "2024") are expanded to the script's words first.
import json, re, sys, difflib
NUM = {'10,000': 'ten thousand', '10000': 'ten thousand', '6,000': 'six thousand', '6000': 'six thousand', '4,000': 'four thousand', '4000': 'four thousand', '2024': 'twenty twenty-four', '8': 'eight', 'wrangell': 'wrangel', 'rangel': 'wrangel'}
norm = lambda s: re.sub(r"[^\w'-]", '', s).lower()
t = sys.argv[1]
S = open('../work/script_tts.txt').read().split()
Wr = json.load(open(f'../work/words_take{t}.json')); Wx = []
for w in Wr:
    k = norm(w['w']); parts = NUM.get(k, NUM.get(w['w'].strip('.,!?:').lower(), None))
    parts = parts.split() if parts else [w['w']]
    d = (w['e'] - w['s']) / len(parts)
    for i, p in enumerate(parts): Wx.append({'w': p, 's': w['s'] + i * d, 'e': w['s'] + (i + 1) * d})
a = [norm(x) for x in S]; b = [norm(x['w']) for x in Wx]
sm = difflib.SequenceMatcher(None, a, b, autojunk=False); T = [None] * len(S)
for i, j, n in sm.get_matching_blocks():
    for k in range(n): T[i + k] = (Wx[j + k]['s'], Wx[j + k]['e'])
# fill unmatched runs
i = 0
while i < len(S):
    if T[i] is None:
        j = i
        while j < len(S) and T[j] is None: j += 1
        t0 = T[i - 1][1] if i else 0.0; t1 = T[j][0] if j < len(S) else t0 + 0.3 * (j - i)
        d = (t1 - t0) / (j - i)
        for k in range(i, j): T[k] = (t0 + (k - i) * d, t0 + (k - i + 1) * d)
        print('filled', S[i:j]); i = j
    else: i += 1
miss = sum(1 for x in sm.get_opcodes() if x[0] != 'equal'); print('opcodes not equal:', miss, '| matched', sum(n for *_, n in sm.get_matching_blocks()), 'of', len(S))
json.dump([{'w': w, 's': round(s, 3), 'e': round(e, 3)} for w, (s, e) in zip(S, T)], open(f'../work/words_take{t}_al.json', 'w'), indent=0)
