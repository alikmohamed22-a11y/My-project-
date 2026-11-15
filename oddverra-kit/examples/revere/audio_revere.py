# [RV-audio] Stems for "Paul Revere never shouted 'The British are coming!'": a hushed night-time music-box + low pad for the hook
# in the North End, a sneaky fife-and-snare march for the redcoats, a tiptoe pizzicato for "but quietly", a cheeky fife tune for
# "still British", a galloping 6/8 ride (timpani + strings pluck + fife) for the riders, a tense stop for the patrol, a warm lamp-lit
# pad + vibes for "You see" in the poet's study, and a golden morning reprise of the hook tune for the payoff.
# SFX: night crickets, an owl, distant dog, lamp hiss, hooves (idle stamps and full gallops locked to the 0.075 stride rate),
# marching boots + drum, a door knock and creak, lanterns lighting (whoomp + glass ting), river lapping and a ship's bell,
# wind on the road, the patrol's "halt" stab, a quill scratching, page rustle, stamps, the Concord bell, and park birds.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, scratch, clop
DUR = 1749 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 108
SEC = [(0, 247, 'hush'), (247, 372, 'march'), (372, 510, 'tiptoe'), (510, 600, 'brit'), (600, 897, 'hush2'), (897, 1110, 'ride'), (1110, 1195, 'tense'), (1195, 1267, 'ride'), (1267, 1599, 'study'), (1599, 1749, 'gold')]
STOPS = [(F(1108), F(1116))]
def silent(t): return any(a <= t < b for a, b in STOPS)
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def kickd(vel, r, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)
def tick(r):
    t = tt(0.04); return fades(bp(r.standard_normal(len(t)), 1800, 4000) * np.exp(-t / 0.008) * 0.4, 0.0005, 0.005)
def owl(r):
    out = []
    for i, (f0, d) in enumerate([(380, 0.28), (360, 0.5)]):
        t = tt(d); x = np.sin(phase(f0 * (1 - 0.08 * t / d))) * np.sin(np.pi * t / d) ** 1.5 * 0.5; out.append(np.concatenate([x, np.zeros(int(0.12 * SR))]))
    return lp(np.concatenate(out), 1500)
def whoomp(r):
    t = tt(0.5); return fades(lp(r.standard_normal(len(t)), 900) * np.exp(-t / 0.12) * (1 - np.exp(-t / 0.02)) * 0.8, 0.005, 0.1)
def knock(r):
    t = tt(0.18); return fades(np.sin(phase(160 * (1 + 0.5 * np.exp(-t / 0.01)))) * np.exp(-t / 0.035) + bp(r.standard_normal(len(t)), 600, 2500) * np.exp(-t / 0.01) * 0.6, 0.0, 0.03)
def bell(f, vel, r, dur=3.0):
    t = tt(dur); x = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / (dur * d)) for k, a, d in [(1, 1.0, 0.5), (2.0, 0.5, 0.3), (2.76, 0.35, 0.2), (5.4, 0.2, 0.08)])
    return fades(x * vel * 0.4, 0.002, 0.2)
def quill(dur, r):
    t = tt(dur); x = bp(r.standard_normal(len(t)), 2500, 7000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t) ** 2) * 0.35; return fades(x, 0.02, 0.05)
def lap(dur, r):
    t = tt(dur); x = lp(r.standard_normal(len(t)), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t)) * 0.6; return fades(x, 0.3, 0.3)

def music():
    buf = np.zeros((2, N)); r = rng(1775)
    MEL = [69, 72, 76, 74, 72, 69, 71, 72, 74, 72, 71, 69, 67, 69, 71, 72]          # hush / gold tune (A minor, music-box)
    Am, F_, C, G_, E7, Dm = [57, 60, 64], [53, 57, 60], [48, 52, 55], [43, 47, 50], [52, 56, 59, 62], [50, 53, 57]
    FIFE = [74, 76, 78, 79, 81, 79, 78, 76, 74, 76, 74, 71, 69, 71, 74, 74]       # D major march tune (Yankee-ish feel, original)
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s and not silent(t):
            if s in ('hush', 'hush2', 'gold'):
                g = 1.15 if s == 'gold' else 1.0
                if beat in (0, 2): place(buf, pan(I.musicbox(m2f(MEL[(k // 2) % 16] + 12), 0.1 * g, r, 1.4), 0.15), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in ([45, 52, 57, 60] if bar % 4 == 0 else [41, 48, 53, 57])] if s != 'gold' else [m2f(n) for n in ([48, 55, 60, 64] if bar % 4 == 0 else [43, 50, 55, 59])], B * 8, 0.07, r, att=0.8, rel=1.0, warm=1200), t)
                if s == 'gold' and beat in (1, 3): place(buf, pan(I.pluck(m2f(MEL[(k + 3) % 16] - 12), 0.1, r, dur=0.6, bright=0.4, pos=0.2), -0.2), t)
                if s == 'hush2' and beat == 3: place(buf, pan(I.pluck(m2f([45, 41, 48, 43][bar % 4]), 0.1, r, dur=0.5, bright=0.25, pos=0.3), 0), t)
            elif s == 'march':
                place(buf, pan(I.snare(0.16 if beat % 2 else 0.24, r, dur=0.2), 0.05), t); place(buf, pan(I.snare(0.1, r, dur=0.12), 0.05), t + B / 2)
                if beat in (0, 2): place(buf, pan(kickd(0.35, r), 0), t)
                for e in range(2): place(buf, pan(I.fife(m2f(FIFE[((k * 2 + e) % 16)]), B / 2 * 0.9, 0.12, r), 0.2), t + e * B / 2)
            elif s == 'tiptoe':
                ch = [Am, E7, Am, E7][bar % 4]
                place(buf, pan(I.pluck(m2f(ch[beat % len(ch)]), 0.13, r, dur=0.16, bright=0.35, pos=0.3), 0.2 if beat % 2 else -0.2), t)
                if beat == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.15, r, dur=0.4, bright=0.25, pos=0.3), 0), t)
            elif s == 'brit':
                ch = [C, G_, C, G_][bar % 4]
                place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.15, r, dur=0.3, bright=0.3, pos=0.3), 0), t)
                if beat in (1, 3): place(buf, pan(I.brush(0.05, r, dur=0.14), 0.1), t)
                place(buf, pan(I.fife(m2f([79, 81, 83, 84, 86, 84, 83, 81][k % 8]), B * 0.85, 0.1, r), -0.15), t)
            elif s == 'ride':                                                      # 6/8 gallop feel: triplets over each beat
                ch = [Dm, Am, Dm, E7][bar % 4]
                for e in range(3): place(buf, pan(I.pluck(m2f(ch[(e + beat) % len(ch)] + (12 if e else 0)), 0.11 if e else 0.16, r, dur=0.15, bright=0.45, pos=0.2), 0.25 if e % 2 else -0.25), t + e * B / 3)
                if beat in (0, 2): place(buf, pan(I.timpani(m2f(ch[0] - 12), 0.35, r, dur=0.8), 0), t)
                if beat == 0 and bar % 2 == 0: place(buf, pan(I.brass(m2f(ch[2]), B * 1.6, 0.1, r, kind='horn'), -0.2), t)
                if beat == 1: place(buf, pan(I.snare(0.1, r, dur=0.15), 0.1), t + B * 2 / 3)
            elif s == 'tense':
                if beat == 0: place(buf, I.pad([m2f(n) for n in [52, 58, 64]], B * 4, 0.08, r, att=0.2, rel=0.8, warm=900, detune=14), t)
                place(buf, pan(I.timpani(m2f(40), 0.18, r, dur=0.5), 0), t)
            elif s == 'study':
                ch = [F_, C, Dm, G_][bar % 4]
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.08, r, att=0.6, rel=1.0, warm=1300), t)
                if beat in (0, 2): place(buf, pan(I.vibes(m2f(ch[beat % len(ch)] + 24), 0.06, r, dur=1.4), -0.15), t)
                if beat == 3: place(buf, pan(I.pluck(m2f(ch[1] + 12), 0.07, r, dur=0.4, bright=0.4, pos=0.2), 0.2), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='stab': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.brass(m2f(38), 0.6, 0.18, r, kind='tuba', fall=-4), 0), F(74))                                                 # never said it
    place(buf, pan(I.pluck(m2f(57), 0.2, r, dur=0.4, bright=0.4), 0), F(136)); place(buf, pan(I.pluck(m2f(56), 0.2, r, dur=0.6, bright=0.4), 0), F(144))  # never got there
    place(buf, I.cymbal(0.08, r, dur=2.0), F(170)); place(buf, pan(I.timpani(m2f(33), 0.5, r), 0), F(198))                        # 1775
    st([62, 66, 69, 74], F(344), 0.07, 0.15, 'horn')                                                                                 # seize the weapons!
    place(buf, pan(I.pluck(m2f(81), 0.14, r, dur=0.5, bright=0.6), 0), F(491))                                                       # top secret
    st([60, 64, 67, 72], F(569), 0.07, 0.14, 'horn')                                                                                 # British!
    place(buf, pan(I.timpani(m2f(33), 0.5, r), 0), F(650))                                                                           # the Regulars
    for i, nn in enumerate([76, 81]): place(buf, pan(I.glock(m2f(nn), 0.13, r, dur=1.4), 0), F(711) + i * 0.27)                    # one, two lanterns
    place(buf, pan(I.brass(m2f(40), 0.6, 0.14, r, kind='tuba', fall=-3), 0), F(780))                                                 # not for Revere
    for i, nn in enumerate([69, 73, 76, 81]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.9), 0), F(865) + i * 0.07)              # Charlestown
    place(buf, I.cymbal(0.1, r, dur=1.4), F(897)); st([62, 65, 69], F(1005), 0.08, 0.14, 'horn')                                    # riders / Prescott
    place(buf, I.cymbal(0.14, r, dur=1.2), F(1113)); place(buf, pan(I.timpani(m2f(36), 0.7, r), 0), F(1113))                        # patrol!
    place(buf, pan(I.brass(m2f(36), 0.9, 0.18, r, kind='tuba', fall=-5), 0), F(1165))                                                # captured
    st([62, 66, 69, 74, 78], F(1233), 0.08, 0.18, 'horn'); place(buf, I.cymbal(0.12, r, dur=1.8), F(1233))                         # reached Concord!
    place(buf, pan(I.timpani(m2f(33), 0.35, r), 0), F(1267)); place(buf, pan(I.vibes(m2f(77), 0.08, r, dur=1.8), 0), F(1349))     # you see / a poem
    place(buf, pan(I.brass(m2f(40), 0.6, 0.15, r, kind='tuba', fall=-4), 0), F(1487))                                                # got a lot wrong
    for i, f0 in enumerate([1516, 1539, 1566]): place(buf, pan(I.pluck(m2f(52 - i * 2), 0.18, r, dur=0.4, bright=0.4), 0), F(f0))
    place(buf, pan(I.vibes(m2f(72), 0.08, r, dur=1.6), 0), F(1636)); place(buf, pan(I.musicbox(m2f(84), 0.12, r, dur=2.0), 0), F(1694)); place(buf, I.cymbal(0.06, r, dur=2.4), F(1694))
    return buf

def sfx():
    buf = np.zeros((2, N)); r = rng(1861)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (170, 247, 372, 510, 600, 700, 798, 897, 1069, 1195, 1267, 1419, 1599): P(gentle_whoosh(r), F(f0) - 0.25, 0.26)
    P(G.crickets(8.0, r), F(0), 0.05); P(owl(r), F(20), 0.08, -0.4); P(G.breeze(8, r, 0.5), F(0), 0.06)
    for i in range(4): P(clop(r), F(14) + i * 0.9 + r.random() * 0.1, 0.12, 0.1)                                                   # horse stamps (idle)
    P(G.whoa(r), F(98), 0.06)                                                                                                           # lanty pops in
    P(G.crickets(3.0, r), F(170), 0.04); P(G.bird_chirps(1, r, 0.2), F(200), 0.0)
    for i in range(14): P(G.boot(r, 0.8), F(247) + i * (B / 1) * 0.5 + 0.02 * r.random(), 0.12, 0.1)                                 # marching boots
    P(G.push_thump(r), F(344), 0.18)
    P(tick(r), F(436), 0.1); P(G.breeze(1.0, r, 0.4), F(440), 0.06)                                                                  # shh
    P(G.flag_flutter(3.0, r), F(510), 0.08); P(G.hurrah(r, 300, 0.7), F(569), 0.07)
    P(G.crickets(3.3, r), F(600), 0.05); P(knock(r), F(604), 0.3, -0.2); P(knock(r), F(611), 0.26, -0.2); P(G.creak(0.8, r), F(614), 0.15, -0.2); P(G.whoa(r), F(652), 0.06)
    P(whoomp(r), F(711), 0.22); P(ting(r, 2637), F(712), 0.08); P(whoomp(r), F(719), 0.22); P(ting(r, 3136), F(720), 0.08)            # lanterns light
    P(lap(3.4, r), F(798), 0.12); P(bell(1046, 0.5, r, 2.0), F(840), 0.06, 0.4); P(G.crickets(3.3, r), F(798), 0.03)
    # hooves: gallop clops locked to each visible horse's stride (ph rate 0.075 / frame -> 2.25 strides/s, 4 footfalls each)
    def gallop(f0, f1, g=0.14, p=0.0):
        stride = 1 / (0.075 * 30); tt0 = F(f0)
        while tt0 < F(f1):
            for j, off in enumerate([0.0, 0.11, 0.42, 0.53]): P(clop(r), tt0 + off * stride + 0.005 * r.random(), g * (0.8 + 0.2 * (j % 2)), p)
            tt0 += stride
    gallop(897, 993, 0.16); gallop(993, 1069, 0.13, -0.2); gallop(993, 1069, 0.11, 0.2); gallop(1069, 1112, 0.14)
    P(G.breeze(6, r, 1.0, bright=1400), F(897), 0.07)
    P(G.whoa(r), F(1113), 0.08); P(G.oof(r), F(1165), 0.07)                                                                          # halt! / captured
    gallop(1195, 1262, 0.15); P(bell(587, 0.8, r, 3.0), F(1236), 0.16); P(bell(587, 0.8, r, 3.0), F(1250), 0.12)                    # Concord bell
    P(quill(3.6, r), F(1280), 0.1); P(tick(r), F(1302), 0.05); P(paper(r), F(1419), 0.16, 0.1); P(paper(r), F(1430), 0.08, -0.1)   # writing, page
    for f0 in (1513, 1536, 1563): P(G.push_thump(r), F(f0) + 0.05, 0.26)                                                              # stamps
    P(G.bird_chirps(5.0, r, 0.5), F(1599), 0.07); P(G.breeze(5.0, r, 0.4), F(1599), 0.08); P(ting(r, 2093), F(1640), 0.06); P(ting(r, 3136), F(1694), 0.12)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
