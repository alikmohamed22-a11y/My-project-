# [MM-audio] Stems for "Woolly mammoths were alive when the Great Pyramid was built". Cue times come from ../work/words.json (the
# same word clock as web/story_mammoth.js), so a new voice take only needs a rerun.
# Music: a bouncy desert pizzicato on the Phrygian-dominant scale with a frame drum for Giza (stops dead on "Not in Egypt"), an
# adventure map theme (pizz + glock + rising tremolo into "stranded", low tuba), a hopeful tundra folk tune for the island that swells
# when the herd holds on and grows, a comic tuba "tiny" and cymbal "MYTH", a thin pad that drains away for "they vanished", a sneaky
# pizzicato for the hunters ("nope" bonk), plinky lab vibes with pops as bad mutations are weeded out, a night music-box pad for
# "You see" under the storm, and a warm return of the desert tune for the payoff.
# SFX motif: TUSKY's trumpet (synthesised: a gliding brassy formant call with a growl), heard in the hook, when the herd holds on,
# as a fading echo when they vanish, and over the payoff's mammoth constellation. Also: heavy mammoth footfalls, desert breeze and
# rope creaks at Giza, a record scratch, paper map rustle and rising water, Arctic wind, waves and floe knocks on the island, a boat
# scrape, a lab hum, rain, thunder, ice crackle, sparkles, whooshes at every cut.
import json, re, numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, boom
W = json.load(open('../work/words.json')); WR = [[re.sub(r"[^\w'-]", '', w['w']).lower(), w['s'], w['e']] for w in W]
def ws(w, k=0):
    n = 0
    for r in WR:
        if r[0] == w:
            if n == k: return r[1]
            n += 1
    raise KeyError(w)
def we(w, k=0):
    n = 0
    for r in WR:
        if r[0] == w:
            if n == k: return r[2]
            n += 1
    raise KeyError(w)
def gap(w, k=0):
    n = 0
    for i, r in enumerate(WR):
        if r[0] == w:
            if n == k: return round((WR[i - 1][2] + r[1]) / 2 * 30) / 30 if i else 0.0
            n += 1
    raise KeyError(w)
NF = int(round(WR[-1][2] * 30)) + 40; DUR = NF / 30.0; m2f = I.m2f
import os
if os.path.exists('voice.wav'):
    from dsp import read_wav
    DUR = max(DUR, read_wav('voice.wav')[0].shape[1] / SR)
N = ns(DUR)
CUT = dict(not_=gap('not'), on=gap('on'), about=gap('about'), sci=gap('scientists'), mean=gap('meanwhile'), but=gap('but'), andno=gap('and', 2), then=gap('then'), so1=gap('so'), inb=gap('inbreeding'), you=gap('you'), so2=gap('so', 1))
SEC = [(0, CUT['not_'], 'desert'), (CUT['not_'], CUT['on'], None), (CUT['on'], CUT['sci'], 'map'), (CUT['sci'], CUT['mean'], 'tundra'), (CUT['mean'], CUT['but'], 'map'), (CUT['but'], CUT['then'], 'tundra'),
       (CUT['then'], CUT['so1'], 'thin'), (CUT['so1'], CUT['inb'], 'sneak'), (CUT['inb'], CUT['you'], 'lab'), (CUT['you'], CUT['so2'], 'night'), (CUT['so2'], DUR, 'desert2')]
B = 60 / 112
def sec(t):
    for a, b, n in SEC:
        if a <= t < b: return n
    return None
def trem(freqs, dur, vel, r, rate=11.0):
    x = I.pad(freqs, dur, vel, r, att=0.3, rel=0.4, warm=1600, detune=5); t = np.arange(x.shape[-1]) / SR
    return x * (0.6 + 0.4 * np.sin(2 * np.pi * rate * t))

def music():
    buf = np.zeros((2, N)); r = rng(2560)
    PD = [52, 53, 56, 57, 59, 60, 62, 64]                         # E Phrygian dominant (E F G# A B C D E)
    DES = [64, 65, 64, 62, 60, 59, 60, 62, 64, 68, 69, 68, 65, 64, 62, 64]
    TUN = [67, 69, 71, 74, 71, 69, 67, 64, 67, 69, 71, 72, 71, 69, 67, 67]   # G major folk shape
    G_, C_, D_, Em = [55, 59, 62], [48, 52, 55], [50, 54, 57], [52, 55, 59]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s:
            if s in ('desert', 'desert2'):
                g = 1.0 if s == 'desert' else 0.85
                place(buf, pan(I.pluck(m2f(DES[k % 16]), 0.12 * g, r, dur=0.25, bright=0.6, pos=0.15), 0.2), t)
                if beat in (0, 2): place(buf, pan(I.pluck(m2f(40 if bar % 2 == 0 else 41), 0.2 * g, r, dur=0.4, bright=0.35, pos=0.25), -0.1), t)
                if beat in (0, 3): place(buf, pan(I.timpani(m2f(40), 0.12 * g, r, dur=0.4), 0), t + (B / 2 if beat == 3 else 0))
                if beat in (1, 3): place(buf, pan(I.brush(0.08 * g, r, dur=0.18), 0.1), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(52), m2f(56), m2f(59)], B * 8, 0.04 * g, r, att=0.6, rel=0.9, warm=1000), t)
                if s == 'desert2' and beat == 2: place(buf, pan(I.glock(m2f(DES[(k + 5) % 16] + 12), 0.04, r, dur=1.2), -0.15), t)
            elif s == 'map':
                ch = [Em, C_, G_, D_][bar % 4]
                place(buf, pan(I.pluck(m2f(ch[beat % 3] + 12), 0.09, r, dur=0.25, bright=0.55, pos=0.15), 0.25 if beat % 2 else -0.25), t)
                if beat in (0, 2): place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.18, r, dur=0.5, bright=0.35, pos=0.25), 0), t)
                if beat == 0: place(buf, pan(I.glock(m2f(TUN[k % 16] + 12), 0.05, r, dur=1.0), 0.1), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 8, 0.045, r, att=0.6, rel=0.9, warm=1100), t)
            elif s == 'tundra':
                ch = [G_, Em, C_, D_][bar % 4]
                place(buf, pan(I.musicbox(m2f(TUN[k % 16]), 0.09, r, dur=0.9), 0.15), t)
                if beat == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.17, r, dur=0.6, bright=0.4, pos=0.2), 0), t)
                if beat in (1, 2, 3): place(buf, pan(I.pluck(m2f(ch[beat % 3]), 0.07, r, dur=0.3, bright=0.5, pos=0.15), -0.2), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 8, 0.05, r, att=0.6, rel=0.9, warm=1200), t)
                if t > ws('held') and t < CUT['andno'] and beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0]), B * 0.9, 0.08, r, kind='horn'), 0), t)
            elif s == 'thin':
                if beat == 0 and t < ws('fast'): place(buf, I.pad([m2f(n) for n in ([52, 55, 59] if bar % 2 == 0 else [48, 52, 55])], B * 4, 0.05 * max(0, 1 - (t - CUT['then']) / 5), r, att=0.8, rel=1.0, warm=800), t)
                if beat == 2 and t < ws('fast'): place(buf, pan(I.musicbox(m2f(TUN[k % 16]), 0.05, r, dur=1.4), 0.1), t)
            elif s == 'sneak':
                nn = [45, 48, 52, 51][k % 4]
                place(buf, pan(I.pluck(m2f(nn), 0.18 if beat % 2 == 0 else 0.1, r, dur=0.25, bright=0.35, pos=0.3), 0.15 if beat % 2 else -0.15), t)
                if beat == 3: place(buf, pan(I.vibes(m2f(76 if bar % 2 else 75), 0.05, r, dur=0.8), -0.2), t)
            elif s == 'lab':
                ch = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]][bar % 4]
                for e in range(2): place(buf, pan(I.vibes(m2f(ch[(beat * 2 + e) % 3] + 12), 0.045, r, dur=0.5), 0.3 if e else -0.3), t + e * B / 2)
                if beat == 0: place(buf, I.pad([m2f(n) for n in ch], B * 4, 0.05, r, att=0.5, rel=0.8, warm=1300), t)
                if beat in (0, 2): place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.13, r, dur=0.4, bright=0.4, pos=0.2), 0), t)
            elif s == 'night':
                if beat == 0: place(buf, I.pad([m2f(n) for n in ([52, 55, 59, 62] if bar % 2 == 0 else [48, 52, 55, 59])], B * 4, 0.06, r, att=0.8, rel=1.2, warm=900), t)
                if beat in (0, 2): place(buf, pan(I.musicbox(m2f(TUN[(k // 2) % 16]), 0.07, r, dur=1.4), 0.1 if beat else -0.1), t)
                if beat == 3: place(buf, pan(I.pluck(m2f(40), 0.11, r, dur=0.5, bright=0.3, pos=0.25), 0), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='horn': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.timpani(m2f(40), 0.5, r), 0), ws('alive')); place(buf, I.cymbal(0.07, r, dur=1.2), ws('alive'))                     # STILL ALIVE
    st([52, 56, 59, 64], ws('great'), 0.08, 0.14)                                                                                          # the Great Pyramid
    place(buf, pan(I.brass(m2f(40), 0.9, 0.2, r, kind='tuba', fall=-5), 0), ws('not') + 0.05)                                              # Not in Egypt (wah)
    for i, nn in enumerate([76, 79, 83, 88]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.8), 0), ws('wrangel') + i * 0.07)            # Wrangel Island
    place(buf, trem([m2f(40), m2f(47), m2f(52)], max(0.5, ws('stranded') - ws('rising')), 0.07, r, rate=13), ws('rising'))              # rising seas
    place(buf, pan(I.brass(m2f(28), 0.9, 0.22, r, kind='tuba', fall=-3), 0), ws('stranded')); place(buf, pan(I.timpani(m2f(33), 0.6, r), 0), ws('stranded'))
    for i, nn in enumerate([79, 83, 86]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.9), 0), ws('eight') + i * 0.07)                  # eight
    place(buf, pan(I.brass(m2f(31), 0.9, 0.18, r, kind='tuba', fall=-4), 0), ws('dying'))                                               # dying out
    st([55, 59, 62, 67], ws('held'), 0.09, 0.16)                                                                                          # held on
    st([55, 59, 62, 67, 71], ws('six'), 0.08, 0.16); place(buf, I.cymbal(0.1, r, dur=2.0), ws('six'))                                    # 6,000 years
    place(buf, pan(I.brass(m2f(26), 0.7, 0.2, r, kind='tuba'), 0), ws('tiny'))                                                           # tiny?
    place(buf, pan(I.timpani(m2f(40), 0.7, r), 0), ws('myth')); place(buf, I.cymbal(0.14, r, dur=2.0), ws('myth'))                       # MYTH
    place(buf, pan(I.timpani(m2f(28), 0.9, r), 0), ws('fast'))                                                                            # gone. fast.
    place(buf, pan(I.brass(m2f(36), 0.5, 0.16, r, kind='tuba', fall=-2), 0), ws('nope'))                                                 # nope
    for i, nn in enumerate([72, 76, 79, 84]): place(buf, pan(I.glock(m2f(nn), 0.08, r, dur=0.8), 0), ws('twenty') + i * 0.07)            # 2024 study
    place(buf, pan(I.timpani(m2f(33), 0.7, r), 0), ws('backup'))                                                                          # no backup
    place(buf, pan(I.timpani(m2f(28), 0.9, r), 0), ws('everyone')); place(buf, I.cymbal(0.12, r, dur=2.4), ws('everyone'))               # all at once
    st([52, 56, 59, 64, 68], ws('already'), 0.09, 0.16); place(buf, I.cymbal(0.1, r, dur=2.4), ws('old'))                                 # 500 years old
    for i, nn in enumerate([76, 80, 83, 88, 92]): place(buf, pan(I.glock(m2f(nn), 0.07, r, dur=1.4), (i - 2) * 0.2), ws('old') + 0.3 + i * 0.12)  # constellation sparkle
    return buf

# ---- the motif: TUSKY's trumpet. A brassy gliding call (saw harmonics through trunk formants) with a growl and breath.
def trumpet(r, dur=1.5, f0=260.0, up=1.9, vel=1.0):
    t = tt(dur); a = np.minimum(1, t / 0.12)
    glide = f0 * (1 + (up - 1) * np.clip(t / 0.22, 0, 1) - 0.25 * (up - 1) * np.clip((t - 0.6) / (dur - 0.6), 0, 1))
    f = glide * (1 + 0.015 * np.sin(2 * np.pi * 6.5 * t) + 0.01 * r.standard_normal(len(t)).cumsum() / np.sqrt(len(t)))
    ph = phase(f); x = sum(np.sin(h * ph) / h ** 0.9 for h in range(1, 14))
    x = bp(x, 380, 3200) * 1.4 + bp(x, 900, 1600) * 0.8; x *= (1 + 0.35 * np.sin(2 * np.pi * 31 * t))                                 # growl
    x += bp(r.standard_normal(len(t)), 1200, 5000) * 0.18                                                                                # breath
    env = a * np.where(t < dur - 0.35, 1.0, np.clip((dur - t) / 0.35, 0, 1)); x = x * env; x /= np.abs(x).max()
    return fades(np.stack([x, np.roll(x, int(0.009 * SR)) * 0.92]) * vel, 0.005, 0.15)
def footfall(r, big=1.0):
    t = tt(0.5); x = np.sin(phase(48 * (1 + 0.6 * np.exp(-t / 0.03)))) * np.exp(-t / 0.12) * big + lp(r.standard_normal(len(t)), 300) * np.exp(-t / 0.06) * 0.5; return fades(x * 0.8, 0.001, 0.08)
def scratch(r):
    t = tt(0.45); f = 900 + 700 * np.sin(2 * np.pi * 5 * t); x = bp(r.standard_normal(len(t)), 600, 4000) * (0.5 + 0.5 * np.sin(phase(f))) * np.exp(-t / 0.25); return fades(x * 0.9, 0.002, 0.05)
def thunder(r, dur=3.5):
    n = ns(dur); t = np.arange(n) / SR; out = np.zeros((2, n))
    for ch in range(2): x = r.standard_normal(n); out[ch] = (lp(x, 180) * 2.2 + lp(x, 900) * 0.5 * np.exp(-t / 0.3)) * np.exp(-t / 1.1) * (1 + 0.5 * np.sin(t * 7 + ch))
    return fades(out / np.abs(out).max(), 0.005, 0.6)
def rain(dur, r, level=1.0):
    n = ns(dur); out = np.zeros((2, n))
    for ch in range(2): x = r.standard_normal(n); drops = (r.random(n) < 0.004) * r.standard_normal(n) * 4; out[ch] = (hp(x, 1500) * 0.5 + bp(drops, 2000, 7000)) * level
    return fades(out, 0.6, 0.6)
def crackle(r, dur=0.6):
    t = tt(dur); n = r.standard_normal(len(t)); gate = (r.random(len(t)) < 0.015).astype(float)
    return fades(hp(n * gate * 3 + n * 0.1, 1800) * np.exp(-t / 0.25), 0.001, 0.05)
def hum(dur, r):
    t = tt(dur); x = np.sin(2 * np.pi * 120 * t) * 0.3 + np.sin(2 * np.pi * 240 * t) * 0.1 + lp(r.standard_normal(len(t)), 400) * 0.2; return fades(np.stack([x, x]), 0.3, 0.3)
def pop(r):
    t = tt(0.18); x = np.sin(phase(900 * np.exp(-t / 0.05) + 300)) * np.exp(-t / 0.04); return fades(x * 0.7, 0.001, 0.03)

def sfx():
    buf = np.zeros((2, N)); r = rng(4000)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, max(0.0, t))
    for c in ('not_', 'about', 'sci', 'mean', 'but', 'andno', 'then', 'so1', 'you', 'so2'): P(gentle_whoosh(r), CUT[c] - 0.25, 0.24)
    for c in ('on', 'inb'): P(gentle_whoosh(r, dur=0.4), CUT[c] - 0.15, 0.2)
    # the trumpet motif
    P(trumpet(r, 1.5, 250, 1.9), 3 / 30, 0.95); P(trumpet(r, 1.6, 240, 2.0), ws('held'), 0.9)
    v0 = ws('vanished'); P(trumpet(r, 1.2, 220, 1.6, 0.6), v0 - 0.6, 0.4); P(lp(trumpet(r, 1.4, 210, 1.5), 1200), v0 + 0.5, 0.18)        # the last call, echoing away
    P(lp(trumpet(r, 1.8, 230, 1.8), 2400), ws('old') + 0.2, 0.55); P(lp(trumpet(r, 1.8, 230, 1.8), 1200), ws('old') + 0.75, 0.2)          # payoff echo
    P(trumpet(r, 0.7, 330, 1.4, 0.7), ws('myth') + 0.15, 0.35)                                                                             # tiny squeak -> big
    # Giza: breeze, rope creaks, heavy footfalls, worker gasp, record scratch
    P(G.breeze(CUT['on'], r, 0.5, bright=1400), 0, 0.05); [P(G.creak(0.35, r), 0.4 + i * 0.6, 0.04, -0.3) for i in range(int(CUT['not_'] / 0.6))]
    k = 0
    while k * 0.95 < CUT['not_']: P(footfall(r), 0.15 + k * 0.95, 0.35, -0.1); k += 1
    P(G.whoa(r), ws('built'), 0.08, -0.3); P(G.whoa(r), ws('built') + 0.1, 0.06, 0.3); P(scratch(r), ws('not') - 0.05, 0.5)
    # map table: paper rustle, candle, rising water, tiny trumpet on the island, sinking mainland herd
    P(paper(r), CUT['on'] + 0.05, 0.2); P(G.bubbles(max(0.5, ws('stranded') - ws('rising')), r, 18), ws('rising'), 0.08); P(G.water_bed(ws('stranded') - ws('rising') + 1, r, 0.5), ws('rising'), 0.06)
    P(paper(r), CUT['mean'] + 0.05, 0.16); [P(pop(r), ws('everywhere') + i * 0.22, 0.12, (i % 3 - 1) * 0.4) for i in range(6)]
    # island: Arctic wind + waves (all island shots), herd footfalls and pops for the counter, sparkle
    for a, b in ((CUT['sci'], CUT['mean']), (CUT['but'], CUT['inb']), (CUT['you'], CUT['so2'])):
        P(G.breeze(b - a, r, 0.8, bright=700), a, 0.07); P(G.water_bed(b - a, r, 0.3), a, 0.04)
    for i in range(8): P(pop(r), ws('herd') + i * 0.1, 0.12, (i % 3 - 1) * 0.3)
    for i in range(10): P(footfall(r, 0.7), ws('grew') + i * 0.18, 0.12, (i % 3 - 1) * 0.4)
    P(G.wood_crack(r), ws('myth'), 0.1); P(boom(r, 0.5), ws('myth'), 0.1)
    P(G.breeze(CUT['so1'] - CUT['then'], r, 1.2, bright=600), CUT['then'], 0.1)                                                        # vanish wind
    # hunters: waves, boat scrape, nope bonk
    P(G.water_bed(CUT['inb'] - CUT['so1'], r, 0.8), CUT['so1'], 0.08); P(G.creak(0.8, r), ws('hunters') - 0.5, 0.08, 0.3); P(bonk(r), ws('nope'), 0.12)
    # lab: hum, pops for the weeded mutations
    P(hum(CUT['you'] - CUT['inb'], r), CUT['inb'], 0.03); P(ting(r, 2637), ws('twenty'), 0.08)
    for i, d in enumerate([0, 6, 11, 17, 21]): P(pop(r), ws('weeding') + d / 30, 0.18, (i - 2) * 0.2)
    # storm: rain, thunder, ice crackle
    P(rain(CUT['so2'] - ws('rain') + 0.6, r), ws('rain') - 0.3, 0.06)
    for x in ('disease', 'rain', 'everyone'): P(thunder(r), ws(x), 0.3)
    P(crackle(r, 1.2), ws('froze'), 0.25); P(crackle(r, 1.0), ws('ice'), 0.2)
    # payoff: desert night crickets, fire crackle
    P(G.crickets(DUR - CUT['so2'], r), CUT['so2'], 0.05); P(crackle(r, DUR - CUT['so2']), CUT['so2'], 0.03)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape, 'NF', NF)
