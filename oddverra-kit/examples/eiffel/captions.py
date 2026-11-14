# words.json (whisper word timestamps) -> punchy 1-3 word ASS captions, key words yellow, pop-in.
# usage: captions.py words.json out.ass "KEY1,KEY2,..." ["from=>to;from=>to"]
import json, re, sys
W = json.load(open(sys.argv[1])); out = sys.argv[2]
KEYS = set(k.strip().upper() for k in sys.argv[3].split(',') if k.strip())
SUBS = [p.split('=>') for p in sys.argv[4].split(';')] if len(sys.argv) > 4 and sys.argv[4] else []
# glue hyphen tokens ("thirty" "-four") and clean
toks = []
for w in W:
    t = w['w'].strip()
    t = re.sub(r'^(ITV|Breitbart)(?=[A-Z])', '', t)  # ASR prompt junk
    if t.startswith('-') and toks: toks[-1]['w'] += t; toks[-1]['e'] = w['e']; continue
    toks.append({'w': t, 's': w['s'], 'e': w['e']})
# phrase substitutions on the spoken text (e.g. "nineteen eleven" -> "1911")
for a, b in SUBS:
    aw = a.lower().split(); i = 0
    while i <= len(toks) - len(aw):
        seg = [re.sub(r'[^\w\'-]', '', t['w'].lower()) for t in toks[i:i + len(aw)]]
        if seg == aw:
            punct = re.sub(r'[\w\'-]', '', toks[i + len(aw) - 1]['w'])
            toks[i:i + len(aw)] = [{'w': b + punct, 's': toks[i]['s'], 'e': toks[i + len(aw) - 1]['e']}]
        i += 1
chunks, cur = [], []
for t in toks:
    cur.append(t)
    end = re.search(r'[.,!?;:]$', t['w'])
    if end or len(cur) == int(__import__('os').environ.get('CAP_N', '3')):
        chunks.append(cur); cur = []
if cur: chunks.append(cur)
def ts(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f"{h}:{m:02d}:{s:05.2f}"
lines = []
for i, c in enumerate(chunks):
    s = c[0]['s'] - 0.05
    e = c[-1]['e'] + 0.25
    if i + 1 < len(chunks): e = min(e, chunks[i + 1][0]['s'] - 0.05) if chunks[i + 1][0]['s'] - c[-1]['e'] < 0.6 else e
    words = []
    for t in c:
        raw = re.sub(r'[.,!?;:]+$', '', t['w']).upper()
        bare = re.sub(r"[^\w]", '', raw.replace("'S", ''))
        words.append('{\\c&H0038D8FF&}' + raw + '{\\c&H00FFFFFF&}' if bare in KEYS or raw in KEYS else raw)
    lines.append(f"Dialogue: 0,{ts(max(0, s))},{ts(e)},Cap,,0,0,0,,{{\\fscx80\\fscy80\\t(0,90,\\fscx106\\fscy106)\\t(90,160,\\fscx100\\fscy100)}}" + ' '.join(words))
hdr = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Luckiest Guy,120,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,2,0,1,10,5,2,60,60,560,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open(out, 'w').write(hdr + '\n'.join(lines) + '\n')
print(len(lines), 'captions'); print('\n'.join(l.split(',,')[-1][-60:] for l in lines[:6]))
