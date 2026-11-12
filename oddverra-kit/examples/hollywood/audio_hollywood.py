# Stems for "The Hollywood sign was an ad for houses": 1920s hot-jazz / showbiz (F major, 168 bpm two-beat: tuba oom on 1 & 3,
# banjo-style plucked chords on 2 & 4, brushes, fife "clarinet" lead, muted brass stabs), a sparse minor stretch for the decay years
# (bust, rot, the H blowing over, the 70s), a disco-tinged four-on-the-floor for the 1978 gala, stops on the punchlines.
# SFX: hooves + sled creak, hammering, bulb hum + relay clacks, wind + storm, the H crash, LAND toppling, cash register, crowd, shutter, ting.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored, curve
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, chalk, bonk, kick, boom, clop
DUR = 64.0; N = ns(DUR); m2f = I.m2f
B = 60.0 / 168.0
F = lambda fr: fr / 30.0
STOPS = [(F(846), F(899)), (F(1240), F(1295)), (F(1852), F(1922))]
def silent(t): return any(a <= t < b for a, b in STOPS)
DARK = [(F(899), F(1098)), (F(1295), F(1371))]
def dark(t): return any(a <= t < b for a, b in DARK)
DISCO = (F(1421), F(1686))

def music():
    buf = np.zeros((2, N)); r = rng(1923)
    prog = [[65, 69, 72], [62, 66, 69, 72], [67, 71, 74, 77], [60, 64, 67, 70], [65, 69, 72], [62, 66, 69, 72], [67, 71, 74, 77], [60, 64, 67, 70]]  # F D7 G7 C7
    roots = [41, 38, 43, 36, 41, 38, 43, 36]
    dprog = [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64]]; droots = [38, 34, 36, 33]                                                   # Dm Bb C A (decay)
    tune = [77, 76, 74, 72, 74, 77, 81, 79, 77, 74, 72, 69, 72, 74, 76, 77]
    t, k = 0.06, 0
    while t < DUR - 0.5:
        bar = (k // 4) % 8; beat = k % 4
        if not silent(t):
            if dark(t):
                ch = dprog[(k // 4) % 4]
                if beat == 0: place(buf, pan(I.brass(m2f(droots[(k // 4) % 4] - 12 + 12), 0.9, 0.18, r, kind='tuba'), 0), t)
                if beat == 2: place(buf, I.pad([m2f(n) for n in ch], B * 2, 0.07, r, att=0.2, rel=0.6, warm=700), t)
                if k % 8 == 6: place(buf, pan(I.glock(m2f(ch[2] + 12), 0.07, r, dur=1.4), -0.2), t)
            elif DISCO[0] <= t < DISCO[1]:
                ch = prog[bar]; place(buf, pan(np.asarray(kick(0.5, r), float).reshape(-1) if np.asarray(kick(0.5, r)).ndim == 1 else np.asarray(kick(0.5, r)).mean(0), 0), t)
                place(buf, pan(I.pluck(m2f(roots[bar] + (12 if beat % 2 else 0)), 0.45, r, dur=0.3, bright=0.4, pos=0.2), 0), t)
                place(buf, pan(I.brush(0.18, r, dur=0.12), 0.2), t + B / 2)
                if beat in (1, 3): place(buf, pan(I.snare(0.14, r, tune=1.2, snappy=0.7), -0.1), t); [place(buf, pan(I.pluck(m2f(n + 12), 0.09, r, dur=0.18, bright=0.9), 0.3), t) for n in ch]
                if (k // 16) % 2 == 1: place(buf, pan(I.glock(m2f(tune[k % 16] + 12), 0.12, r, dur=0.6), -0.25), t)
            else:
                ch = prog[bar]
                if beat in (0, 2): place(buf, pan(I.brass(m2f(roots[bar] - 12 + (7 if beat == 2 else 0) + 12), B * 0.9, 0.3, r, kind='tuba'), 0), t)   # oom
                if beat in (1, 3):
                    for n in ch: place(buf, pan(I.pluck(m2f(n), 0.13, r, dur=0.22, bright=0.95, pos=0.1), 0.25), t)                        # pah (banjo)
                place(buf, pan(I.brush(0.2 if beat % 2 else 0.11, r, dur=0.2, swish=beat % 2 == 0), -0.15), t)
                place(buf, pan(I.brush(0.08, r, dur=0.1), -0.2), t + B * 0.66)                                                               # swing ghost
                if t > F(104) and (k // 16) % 2 == 0 and k % 2 == 0: place(buf, pan(I.fife(m2f(tune[(k // 2) % 16]), B * 1.5, 0.11, r), 0.2), t)   # clarinet-ish line
                if (k // 16) % 2 == 1 and beat == 3 and bar % 2: place(buf, pan(I.brass(m2f(ch[0] + 12), 0.18, 0.12, r, kind='stab'), -0.1), t + B * 0.66)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.22, kind='stab': [place(buf, pan(I.brass(m2f(n), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, n in enumerate(notes)]
    st([72, 77], F(64), 0.12)                                                                                   # ...for houses!
    st([69, 72, 77, 81], F(234), 0.09); place(buf, I.cymbal(0.16, r, dur=1.4), F(234))                         # HOLLYWOODLAND
    for f0, n in [(684, 77), (711, 81), (736, 84)]: place(buf, pan(I.glock(m2f(n + 12), 0.22, r, dur=0.9), 0), F(f0))   # HOLLY WOOD LAND
    place(buf, pan(I.brass(m2f(40), 1.2, 0.22, r, kind='tuba', fall=-5), 0), F(851))                            # nobody (in the stop)
    for j, n in enumerate([58, 57, 56, 53]): place(buf, pan(I.brass(m2f(n), 0.34 if j < 3 else 1.0, 0.24, r, kind='stab', fall=(-4 if j == 3 else 0)), 0), F(926) + j * 0.34)  # sad trombone: went bust
    place(buf, I.pad([m2f(x) for x in [50, 57, 62]], 2.0, 0.12, r, att=0.05, rel=1.2, warm=600), F(1064))       # H crash
    st([65, 69, 72, 77], F(1101), 0.1, 0.18)                                                                   # 1949
    place(buf, pan(I.brass(m2f(41), 0.9, 0.24, r, kind='tuba'), 0), F(1252))                                   # chop (in the stop)
    st([72, 76, 79, 84], F(1383), 0.1); place(buf, I.cymbal(0.18, r, dur=1.6), F(1383))                        # 1978
    for f0, n in [(1596, 79), (1657, 84)]: st([n - 7, n], F(f0), 0.1, 0.2)                                     # O / L
    place(buf, I.pad([m2f(x) for x in [53, 60, 65, 69, 72]], 1.8, 0.16, r, att=0.04, rel=1.4, warm=1300), F(1857))  # button
    for i, n in enumerate([72, 77, 81, 84, 89]): place(buf, pan(I.glock(m2f(n + 12), 0.24, r, dur=1.4), 0.1), F(1857) + i * 0.09)
    st([77, 81, 84, 89], F(1880), 0.11, 0.16)
    return buf

def register(r):
    bell = modal(1.1, [(1850, 1.0, 0.5), (2780, 0.6, 0.35), (4100, 0.3, 0.2)], r) * 0.6
    slide = bp(colored(ns(0.35), r, slope=-0.3), 300, 2400) * np.exp(-tt(0.35) / 0.15) * 0.5
    clk = G.clink(r, f0=1400, dur=0.08); out = np.zeros(ns(1.3)); out[:len(clk)] += clk * 0.7; s0 = ns(0.12); out[s0:s0 + len(slide)] += slide; b0 = ns(0.3); out[b0:b0 + len(bell)] += bell[:len(out) - b0]
    return fades(out / (np.abs(out).max() + 1e-9))
def hum(r, dur, f0=120.0):
    t = tt(dur); x = np.zeros(len(t))
    for h in range(1, 9): x += np.sin(2 * np.pi * f0 * h * t + r.uniform(0, 6)) / h ** 1.2
    x = bp(x + 0.2 * colored(len(t), r, slope=-0.5), 100, 3000); return fades(x / (np.abs(x).max() + 1e-9), 0.05, 0.1)
def clack(r):
    c = modal(0.12, [(1800, 1.0, 0.02), (3400, 0.5, 0.012), (650, 0.6, 0.03)], r); return fades(c / (np.abs(c).max() + 1e-9))
def shutter(r):
    a = clack(r); b = clack(r); out = np.zeros(ns(0.2)); out[:len(a)] += a; out[ns(0.07):ns(0.07) + len(b)] += 0.7 * b[:len(out) - ns(0.07)]; return out
def crash(r, big=1.0):
    out = np.zeros(ns(2.4)); tear = G.timber_tear(r, 0.9); out[:len(tear)] += tear * 0.8; bm = boom(r, big, 2.2); out[:len(bm)] += bm[:len(out)] if bm.ndim == 1 else bm.mean(0)[:len(out)]
    rt = G.rattle(1.6, r, 40.0, heavy=True); out[ns(0.05):ns(0.05) + len(rt)] += 0.5 * rt[:len(out) - ns(0.05)]; return fades(out / (np.abs(out).max() + 1e-9))

def sfx():
    buf = np.zeros((2, N)); r = rng(1978)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    W = lambda f0, g=0.3: P(gentle_whoosh(r), F(f0), g)
    P(G.breeze(1.8, r, 0.5), 0.0, 0.25); P(ting(r, 2637), F(48), 0.22)                                      # hook
    for f0 in (50, 98, 149, 201, 263, 351, 451, 537, 594, 678, 766, 945, 988, 1092, 1160, 1365, 1415, 1482, 1562, 1616, 1680, 1776, 1824): W(f0)
    P(register(r), F(66), 0.25)                                                                             # houses
    P(paper(r), F(108), 0.3)                                                                                # 1923
    P(bonk(r), F(184), 0.22)                                                                                # buyers
    P(ting(r, 3136), F(236), 0.28)                                                                          # Hollywoodland
    P(paper(r), F(313), 0.35)                                                                               # newspaper
    for i in range(6): P(G.clink(r, f0=2200 + 300 * i, dur=0.1), F(366) + i * 0.16, 0.18, 0.2)              # coins count up
    P(register(r), F(398), 0.42); P(bonk(r), F(428), 0.2)                                                   # $21,000 / billboard
    for i in range(16): P(clop(r), F(460) + i * 0.32, 0.22, -0.1 if i % 2 else 0.1)                         # mule hooves
    P(G.creak(2.6, r, 70, 110, scale=0.8), F(470), 0.18, 0.2)                                              # sled creak
    for f0 in (548, 556, 570, 578, 588): P(G.hammer_hit(r, 0.7), F(f0), 0.32, 0.15)                        # hammering
    P(G.breeze(2.6, r, 0.4), F(600), 0.12)                                                                  # night air
    P(clack(r), F(642), 0.4); P(hum(r, 4.4), F(643), 0.12)                                                  # bulbs on + hum
    for f0 in (684, 711, 736): P(clack(r), F(f0), 0.45)                                                     # HOLLY WOOD LAND relay
    for i in range(4): P(clack(r), F(752 + 6 * i), 0.25)                                                    # flashing
    P(paper(r), F(805), 0.35)                                                                               # calendar flips
    P(G.breeze(1.8, r, 0.7), F(846), 0.25)                                                                  # nobody (silence + wind)
    P(G.creak(1.2, r, 60, 90, scale=0.7), F(905), 0.2); P(G.push_thump(r), F(930), 0.4)                    # bust
    P(G.breeze(3.4, r, 1.0, gust=0.4), F(951), 0.3)                                                         # rot + wind
    P(G.breeze(3.6, r, 1.6, gust=0.6), F(994), 0.45); P(G.creak(1.6, r, 50, 80, scale=1.2), F(1010), 0.3)  # storm, the H groans
    P(G.creak(0.8, r, 40, 70, scale=1.4), F(1046), 0.35); P(crash(r, 1.0), F(1064), 0.6)                   # the H crashes
    for f0 in (1104, 1138): P(paper(r), F(f0), 0.25)
    for f0 in (1172, 1180, 1188, 1196, 1214, 1222): P(G.hammer_hit(r, 0.8), F(f0), 0.32, -0.1)            # crew hammering
    P(ting(r, 2637), F(1203), 0.25)                                                                         # condition
    for f0 in (1255, 1268, 1280, 1290): P(crash(r, 0.6), F(f0), 0.42, 0.1)                                 # L A N D topple
    P(G.breeze(2.6, r, 0.8), F(1295), 0.25)                                                                 # 70s decay
    P(ting(r, 3520), F(1384), 0.22)                                                                         # 1978
    P(G.babble(8.6, r, 220, 1.0, rate=4.5), F(1421), 0.1); P(G.applause(2.4, r, 40), F(1458), 0.22)        # gala crowd
    for i in range(9): P(G.hammer_hit(r, 0.4), F(1453 if i < 3 else 1500) + (i if i < 3 else i - 3) * (0.4 if i < 3 else 0.33), 0.18)   # SOLD stamps
    P(register(r), F(1497), 0.4)                                                                            # $27,000
    P(G.applause(2.0, r, 40), F(1597), 0.3); P(G.hurrah(r, 200, 1.0), F(1598), 0.18)                        # O
    P(G.applause(2.0, r, 40), F(1658), 0.3); P(G.hurrah(r, 230, 1.05), F(1659), 0.18)                       # L
    P(G.bird_chirps(3.0, r, 0.5), F(1690), 0.15); P(shutter(r), F(1716), 0.45)                              # today: selfie
    P(G.breeze(2.4, r, 0.5), F(1782), 0.15)
    P(ting(r, 2637), F(1857), 0.3)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
