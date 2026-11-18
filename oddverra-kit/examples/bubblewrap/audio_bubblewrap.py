# Stems for "Bubble Wrap was supposed to go on your walls": bouncy late-50s cocktail jazz / exotica (Bb major, 152 bpm swing:
# walking pizzicato bass, brushes on 2 & 4 + ride swish, vibraphone comping, bongo-ish taps, a whistly fife melody), a minor
# sad stretch for the two flops, a bright modern lift for today. Stops on the punchlines. SFX: lots of pops, heat-sealer hiss,
# sad trombone, crate hammering, computer beeps, cash register, whooshes on the whips.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, kick, boom, hiss
DUR = 62.95; N = ns(DUR); m2f = I.m2f
B = 60.0 / 152.0
F = lambda fr: fr / 30.0
STOPS = [(F(473), F(523)), (F(1203), F(1228)), (F(1815), F(1890))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SAD = [(F(664), F(750))]
def sad(t): return any(a <= t < b for a, b in SAD)
MOD = (F(1481), F(1815))

def bongo(r, hi=True):
    f0 = 420 if hi else 300; return modal(0.25, [(f0 * r.uniform(0.98, 1.02), 1.0, 0.05), (f0 * 2.3, 0.4, 0.02)], r, glide=-0.05)

def music():
    buf = np.zeros((2, N)); r = rng(1957)
    prog = [[58, 62, 65, 69], [55, 58, 62, 65], [60, 63, 67, 70], [53, 57, 60, 63]]   # Bbmaj7 Gm7 Cm7 F7
    roots = [46, 43, 48, 41]
    sprog = [[55, 58, 62], [51, 55, 58], [48, 51, 55], [50, 54, 57]]; sroots = [43, 39, 36, 38]   # Gm Eb Cm D
    tune = [74, 72, 70, 72, 74, 77, 74, 72, 70, 67, 70, 72, 74, 72, 70, 65]
    walk = [0, 4, 7, 9]
    t, k = 0.05, 0
    while t < DUR - 0.4:
        bar = (k // 4) % 4; beat = k % 4
        if not silent(t):
            if sad(t):
                ch = sprog[(k // 4) % 4]
                if beat == 0: place(buf, pan(I.pluck(m2f(sroots[(k // 4) % 4]), 0.5, r, dur=1.2, bright=0.3), 0), t)
                if beat == 0: place(buf, I.pad([m2f(n) for n in ch], B * 4, 0.07, r, att=0.2, rel=0.6, warm=700), t)
                if beat == 2: place(buf, pan(I.vibes(m2f(ch[2] + 12), 0.12, r, dur=1.6), -0.2), t)
            else:
                ch = prog[bar]; up = 12 if MOD[0] <= t < MOD[1] else 0
                place(buf, pan(I.pluck(m2f(roots[bar] + walk[beat]), 0.42, r, dur=B * 1.1, bright=0.35, pos=0.2), 0), t)          # walking bass
                place(buf, pan(I.brush(0.2 if beat % 2 else 0.1, r, dur=0.22, swish=beat % 2 == 0), -0.15), t)
                place(buf, pan(I.brush(0.08, r, dur=0.1), -0.2), t + B * 0.66)                                                 # swing ghost
                if beat in (1, 3): [place(buf, pan(I.vibes(m2f(n + up * 0), 0.07, r, dur=0.5, damp=0.35), 0.25), t) for n in ch]   # vibes comp
                if beat in (0, 2): place(buf, pan(bongo(r, beat == 0) * 0.18, 0.35), t + B * 0.5)
                if t > F(97) and (k // 16) % 2 == 0 and k % 2 == 0: place(buf, pan(I.fife(m2f(tune[(k // 2) % 16] + up), B * 1.5, 0.1, r), 0.15), t)
                if (k // 16) % 2 == 1 and beat == 0: place(buf, pan(I.vibes(m2f(tune[(k // 4) % 16] + 12), 0.14, r, dur=1.2), -0.25), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.22, kind='stab': [place(buf, pan(I.brass(m2f(n), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, n in enumerate(notes)]
    st([70, 74, 77], F(57), 0.1)                                                                                 # ...walls!
    place(buf, I.cymbal(0.14, r, dur=1.2), F(97))                                                                # 1957
    st([65, 70, 74, 77], F(372), 0.09); place(buf, I.cymbal(0.16, r, dur=1.4), F(372))                          # WALLPAPER!
    place(buf, pan(I.brass(m2f(46), 1.2, 0.22, r, kind='tuba', fall=-5), 0), F(478))                            # nobody (in the stop)
    for j, n in enumerate([58, 57, 56, 53]): place(buf, pan(I.brass(m2f(n), 0.34 if j < 3 else 1.0, 0.26, r, kind='stab', fall=(-4 if j == 3 else 0)), 0), F(668) + j * 0.34)  # sad trombone: flopped
    st([70, 74, 77, 82], F(827), 0.1, 0.18)                                                                      # 1960
    st([74, 77, 81, 86], F(1003), 0.08, 0.16)                                                                    # 1401
    st([70, 74, 77, 82], F(1226), 0.08, 0.24); place(buf, I.cymbal(0.18, r, dur=1.6), F(1226))                   # bubbles!
    st([77, 82], F(1338), 0.12, 0.2)                                                                             # customer
    place(buf, I.cymbal(0.16, r, dur=1.4), F(1481))                                                              # today
    place(buf, I.pad([m2f(x) for x in [58, 62, 65, 69, 74]], 1.8, 0.16, r, att=0.04, rel=1.4, warm=1300), F(1815))  # button
    for i, n in enumerate([70, 74, 77, 81, 86]): place(buf, pan(I.glock(m2f(n + 12), 0.22, r, dur=1.4), 0.1), F(1815) + i * 0.09)
    st([77, 81, 82, 86], F(1840), 0.11, 0.16)
    return buf

def pop(r, big=1.0):
    t = tt(0.12); n = colored(len(t), r, slope=0.0)
    crack = bp(n, 1200 * r.uniform(0.85, 1.2), 7000) * np.exp(-t / (0.0035 * big))
    tock = modal(0.12, [(r.uniform(260, 420) / big ** 0.3, 1.0, 0.018 * big), (r.uniform(900, 1300), 0.4, 0.008)], r)
    y = crack * 1.2 + tock * 0.7; return fades(y / (np.abs(y).max() + 1e-9), 0.0, 0.02)
def bigpop(r):
    out = np.zeros(ns(1.0)); p = pop(r, 2.2); out[:len(p)] += p; b = boom(r, 0.5, 0.8); b = b if b.ndim == 1 else b.mean(0); out[:len(b)] += 0.5 * b[:len(out)]
    tail = bp(colored(ns(0.6), r, slope=-0.2), 400, 5000) * np.exp(-tt(0.6) / 0.12) * 0.3; out[ns(0.01):ns(0.01) + len(tail)] += tail; return fades(out / (np.abs(out).max() + 1e-9))
def beep(f0=1600, dur=0.08):
    t = tt(dur); return fades(np.sin(2 * np.pi * f0 * t) * 0.6 + 0.2 * np.sign(np.sin(2 * np.pi * f0 * t)) * 0.3, 0.003, 0.01)
def register(r):
    bell = modal(1.1, [(1850, 1.0, 0.5), (2780, 0.6, 0.35), (4100, 0.3, 0.2)], r) * 0.6
    slide = bp(colored(ns(0.35), r, slope=-0.3), 300, 2400) * np.exp(-tt(0.35) / 0.15) * 0.5
    clk = G.clink(r, f0=1400, dur=0.08); out = np.zeros(ns(1.3)); out[:len(clk)] += clk * 0.7; s0 = ns(0.12); out[s0:s0 + len(slide)] += slide; b0 = ns(0.3); out[b0:b0 + len(bell)] += bell[:len(out) - b0]
    return fades(out / (np.abs(out).max() + 1e-9))
def boing(r):
    t = tt(0.5); f = 180 + 120 * np.sin(2 * np.pi * 9 * t) * np.exp(-t / 0.2); return fades(np.sin(np.cumsum(2 * np.pi * f / SR)) * np.exp(-t / 0.18), 0.002, 0.05)
def stampthud(r): return G.push_thump(r)

def sfx():
    buf = np.zeros((2, N)); r = rng(1960)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    W = lambda f0, g=0.28: P(gentle_whoosh(r), F(f0), g)
    for f0 in (50, 91, 158, 210, 242, 322, 358, 405, 432, 517, 563, 608, 658, 707, 744, 798, 855, 912, 997, 1041, 1096, 1144, 1252, 1353, 1414, 1475, 1574, 1623, 1706, 1776): W(f0)
    POPS = lambda f0, f1, n, g=0.3: [P(pop(r), F(f0) + (F(f1) - F(f0)) * (i + r.uniform(-0.3, 0.3)) / n, g * r.uniform(0.7, 1.1), r.uniform(-0.5, 0.5)) for i in range(n)]
    P(pop(r), 0.05, 0.4); P(pop(r), F(12), 0.3, 0.3); P(pop(r), F(26), 0.3, -0.3)                         # hook: pops
    P(boing(r), F(57), 0.3); P(ting(r, 2637), F(59), 0.18)                                                  # walls
    P(paper(r), F(100), 0.25)                                                                               # 1957
    P(pop(r), F(198), 0.3); P(pop(r), F(224), 0.3)                                                          # names
    P(G.creak(1.0, r, 80, 120, scale=0.6), F(250), 0.2); P(hiss(r, 2.6), F(256), 0.55); P(hiss(r, 1.0), F(290), 0.4)   # sealer hiss
    for i in range(6): P(G.clink(r, f0=900 + 80 * i, dur=0.06), F(258) + i * 0.4, 0.12, 0.2)                # roller clicks
    P(pop(r), F(297), 0.5); P(boing(r), F(300), 0.2)                                                        # Poppy is born
    P(ting(r, 3136), F(337), 0.28)                                                                          # idea
    P(paper(r), F(366), 0.3)
    P(stampthud(r), F(412), 0.4); P(pop(r), F(413), 0.3); P(stampthud(r), F(439), 0.4); POPS(440, 470, 6, 0.28)   # MODERN! BUBBLY!
    P(stampthud(r), F(477), 0.55); P(G.breeze(1.6, r, 0.4), F(473), 0.15)                                   # NOBODY (in the stop)
    P(G.bird_chirps(3.0, r, 0.5), F(523), 0.15); P(paper(r), F(530), 0.2)                                    # again
    P(G.bird_chirps(3.0, r, 0.6), F(569), 0.15); P(G.flag_flutter(1.2, r), F(575), 0.12)                    # greenhouse
    P(pop(r), F(640), 0.3); P(pop(r), F(650), 0.25)                                                         # warm
    P(G.breeze(1.8, r, 0.8), F(664), 0.25); P(stampthud(r), F(672), 0.45)                                    # flopped (sad trombone in music)
    P(bonk(r), F(720), 0.25)                                                                                 # two failures
    for i in range(10): P(G.clink(r, f0=700 + 40 * (i % 3), dur=0.07), F(752) + i * 0.4, 0.1, -0.2)          # factory clatter
    P(G.creak(2.0, r, 60, 90, scale=0.7), F(760), 0.12)
    P(ting(r, 2637), F(828), 0.25)                                                                          # 1960
    P(bonk(r), F(872), 0.2); P(bonk(r), F(886), 0.18)                                                       # question marks
    for i in range(12): P(beep(1200 + 400 * ((i * 7) % 4), 0.07), F(920) + i * 0.17, 0.14, 0.2)            # computer beeps
    P(ting(r, 3520), F(932), 0.22)                                                                          # IBM
    for i in range(6): P(beep(1800 - 200 * i, 0.06), F(1005) + i * 0.09, 0.18)                              # 1401
    P(G.creak(0.6, r, 50, 70, scale=1.2), F(1050), 0.3); P(G.clink(r, f0=2400, dur=0.15), F(1064), 0.25)   # big / delicate
    P(G.creak(1.6, r, 60, 100, scale=0.9), F(1104), 0.22)                                                   # dolly
    for f0 in (1112, 1124, 1136): P(G.hammer_hit(r, 0.6), F(f0), 0.28, 0.2)                                  # crate hammering
    P(bonk(r), F(1176), 0.22)                                                                                # ?
    for i in range(10): P(pop(r), F(1212) + i * 0.12, 0.28, r.uniform(-0.5, 0.5))                           # wrapping (in the stop)
    P(pop(r, 1.4), F(1226), 0.45)                                                                            # bubbles!
    for f0 in (1290, 1302, 1314, 1326): P(G.hammer_hit(r, 0.8), F(f0), 0.3, 0.25)                            # crate built
    P(register(r), F(1340), 0.45)                                                                            # customer cash register
    for i in range(14): P(G.clink(r, f0=700 + 40 * (i % 3), dur=0.07), F(1362) + i * 0.3, 0.08, -0.2)       # factory busy
    POPS(1424, 1478, 6, 0.22)
    P(G.applause(1.6, r, 20), F(1530), 0.12); P(G.hurrah(r, 300, 1.3, kid=True), F(1532), 0.15)             # Appreciation Day
    POPS(1484, 1575, 14, 0.26)                                                                               # kid on the mat
    P(pop(r), F(1584), 0.3); P(ting(r, 2637), F(1586), 0.18)                                                # Monday
    POPS(1632, 1656, 5, 0.26)
    P(bigpop(r), F(1660), 0.7)                                                                               # POPPY POPS
    P(G.whoa(r), F(1664), 0.12) if hasattr(G, 'whoa') else None
    P(G.whoosh(0.5, r, peak=0.3, f_lo=300, f_hi=1500), F(1690), 0.3); P(boing(r), F(1696), 0.35)           # re-inflates
    POPS(1712, 1782, 18, 0.3)                                                                                # most satisfying sound
    P(pop(r, 1.3), F(1815), 0.5); P(ting(r, 2637), F(1817), 0.25)                                            # wanted.
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
