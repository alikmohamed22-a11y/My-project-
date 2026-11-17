# [MW-audio] Stems for "The microwave oven was invented after a candy bar melted in an engineer's pocket": a soft late-night vibes
# lullaby under the humming microwave (hook), a 1940s brush-swing for the radar lab, sneaky pizzicato for the pocket, a bouncy pizzicato
# rag for the popcorn and the egg, a twinkling science pad that heats up for "You see", a brass fanfare for the patent, a showtime march
# for the 1947 oven, a rising clock run for the 20-year shrink, a 60s vibes groove for the countertop oven, a deflating tuba for the $2,
# and a warm music-box reprise at the final DING.
# SFX motif: the microwave DING (bell partials) + popcorn pops. Also the microwave hum + door click, a gooey melt slide, magnetron buzz,
# radar ping, the egg's crack-SPLAT, the rubber stamp, a ruler squeak, a scale clank + needle wobble, a cash-register ka-ching, a
# shrink zip, flipping year digits, the countertop drop, kids cheering, bills rustling, whooshes at every cut.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, boom
DUR = 1842 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 118
STOPS = [(F(442), F(448)), (F(735), F(740))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 127, 'night'), (127, 357, 'swing'), (357, 457, 'sneak'), (457, 804, 'rag'), (804, 981, 'science'), (981, 1056, 'fanfare'), (1056, 1388, 'march'),
       (1388, 1440, 'rise'), (1440, 1562, 'groove'), (1562, 1710, 'comic'), (1710, 1842, 'gold')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def kickd(vel, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)

def music():
    buf = np.zeros((2, N)); r = rng(1945)
    C, F_, G7, Am, Dm, E7, D7, Fm = [48, 52, 55], [53, 57, 60], [43, 47, 50, 53], [57, 60, 64], [50, 53, 57], [52, 56, 59, 62], [50, 54, 57, 60], [53, 56, 60]
    MEL = [72, 76, 79, 76, 74, 72, 69, 72, 71, 74, 77, 74, 72, 71, 67, 72]
    WALK = [36, 40, 43, 45, 41, 45, 48, 47, 43, 47, 50, 48, 36, 43, 40, 38]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s and not silent(t):
            if s == 'night':
                ch = [C, Am, F_, G7][bar % 4]
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.05, r, att=0.5, rel=0.9, warm=1000), t)
                place(buf, pan(I.vibes(m2f(ch[beat % len(ch)] + 24), 0.05, r, dur=1.0), -0.15 + 0.1 * beat), t)
            elif s == 'swing':
                place(buf, pan(I.pluck(m2f(WALK[k % 16]), 0.2, r, dur=0.4, bright=0.35, pos=0.25), 0), t)
                if beat in (1, 3): place(buf, pan(I.brush(0.18, r, dur=0.25), 0.1), t)
                place(buf, pan(I.brush(0.08, r, dur=0.2, swish=True), -0.1), t + B * 0.66)
                ch = [C, Am, Dm, G7][bar % 4]
                if beat in (0, 2): place(buf, pan(I.vibes(m2f(ch[1] + 12), 0.05, r, dur=0.6), 0.25), t + B * 0.66); place(buf, pan(I.vibes(m2f(ch[2] + 12), 0.04, r, dur=0.6), 0.25), t + B * 0.66)
                if beat == 0 and bar % 2 == 1: place(buf, pan(I.brass(m2f(MEL[(k // 4) % 16]), B * 1.5, 0.08, r, kind='horn'), -0.2), t)
            elif s == 'sneak':
                nn = [45, 48, 52, 51][k % 4]
                place(buf, pan(I.pluck(m2f(nn), 0.2 if beat % 2 == 0 else 0.12, r, dur=0.25, bright=0.35, pos=0.3), 0.15 if beat % 2 else -0.15), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(45), m2f(52), m2f(60)], B * 8, 0.05, r, att=0.6, rel=0.9, warm=900), t)
                if beat == 3: place(buf, pan(I.vibes(m2f(76 if bar % 2 else 75), 0.05, r, dur=0.8), -0.2), t)
            elif s == 'rag':
                ch = [C, E7, Am, D7, G7, G7, C, G7][bar]
                place(buf, pan(kickd(0.26 if beat in (0, 2) else 0.12), 0), t)
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.14, r, kind='tuba'), 0), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.07, r, dur=0.15), 0.05), t)
                for e in range(2): place(buf, pan(I.pluck(m2f(ch[(beat + e) % len(ch)] + 12), 0.09, r, dur=0.2, bright=0.7, pos=0.12), 0.3), t + e * B / 2)
                place(buf, pan(I.glock(m2f(MEL[(k * 3) % 16]), 0.04, r, dur=0.4), -0.15), t + B / 2)
            elif s == 'science':
                ch = [Am, F_, C, G7][bar % 4]; heat = min(1.0, max(0.0, (t - F(900)) / 2.5))
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.06, r, att=0.4, rel=0.8, warm=1200 + 1200 * heat), t)
                for e in range(2 if t < F(896) else 4): place(buf, pan(I.glock(m2f(ch[(beat * 2 + e) % len(ch)] + 24), 0.035 + 0.02 * heat, r, dur=0.6), -0.3 + 0.2 * e), t + e * B / (2 if t < F(896) else 4))
                if t > F(896) and beat in (0, 2): place(buf, pan(I.timpani(m2f(33), 0.12 + 0.1 * heat, r, dur=0.8), 0), t)
            elif s == 'fanfare':
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in [C, F_][bar % 2]], B * 4, 0.05, r, att=0.2, rel=0.8, warm=1400), t)
                if beat in (0, 2): place(buf, pan(I.snare(0.08, r, dur=0.2), 0.05), t)
            elif s == 'march':
                ch = [C, F_, G7, C, Am, Dm, G7, C][bar]
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.15, r, kind='tuba'), 0), t)
                if beat in (1, 3): place(buf, pan(I.pluck(m2f(ch[1] + 12), 0.09, r, dur=0.2, bright=0.7, pos=0.12), 0.25), t); place(buf, pan(I.pluck(m2f(ch[2] + 12), 0.07, r, dur=0.2, bright=0.7, pos=0.12), -0.25), t)
                place(buf, pan(I.snare(0.05 if beat % 2 else 0.08, r, dur=0.12), 0.05), t)
                if beat == 0: place(buf, pan(I.brass(m2f(MEL[(k // 4) % 16] - 12), B * 0.9, 0.07, r, kind='horn'), -0.2), t)
            elif s == 'rise':
                for e in range(4): place(buf, pan(I.glock(m2f(60 + ((k * 4 + e) % 24)), 0.05, r, dur=0.3), -0.3 + 0.15 * e), t + e * B / 4)
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in G7], B * 4, 0.06, r, att=0.3, rel=0.5, warm=1500), t)
            elif s == 'groove':
                ch = [F_, G7, C, Am][bar % 4]
                place(buf, pan(kickd(0.24 if beat in (0, 2) else 0.0), 0), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.08, r, dur=0.15), 0.05), t)
                place(buf, pan(I.pluck(m2f(ch[0] - 12 + (7 if beat == 2 else 0)), 0.18, r, dur=0.3, bright=0.45, pos=0.2), 0), t); place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.1, r, dur=0.2, bright=0.45, pos=0.2), 0), t + B * 0.75)
                if beat in (0, 2): place(buf, pan(I.vibes(m2f(ch[1] + 12), 0.05, r, dur=0.6), 0.25), t); place(buf, pan(I.vibes(m2f(ch[2] + 12), 0.05, r, dur=0.6), -0.25), t)
                if beat == 1: place(buf, pan(I.triangle(0.05, r, dur=0.6), 0.3), t)
            elif s == 'comic':
                ch = [C, G7][bar % 2] if t < F(1631) else [Fm, C][bar % 2]
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12 + (2 if beat == 2 else 0)), B * 0.6, 0.16, r, kind='tuba'), 0), t)
                if beat == 3: place(buf, pan(I.pluck(m2f(ch[2] + 12), 0.08, r, dur=0.2, bright=0.6, pos=0.15), 0.2), t)
            elif s == 'gold':
                ch = [C, Am, F_, G7][bar % 4]
                place(buf, pan(I.musicbox(m2f(MEL[k % 16]), 0.11, r, dur=0.9), 0.15), t)
                if beat == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.16, r, dur=0.6, bright=0.4, pos=0.2), 0), t); place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.05, r, att=0.6, rel=0.9, warm=1100), t)
                if beat == 2: place(buf, pan(I.glock(m2f(MEL[(k + 5) % 16]), 0.05, r, dur=1.2), -0.1), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='horn': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.timpani(m2f(36), 0.5, r), 0), F(99)); place(buf, I.cymbal(0.08, r, dur=1.2), F(99))                                          # in a man's pocket!
    place(buf, I.cymbal(0.1, r, dur=1.6), F(127)); st([60, 64, 67, 72], F(131), 0.07, 0.14)                                                       # 1945
    for i, nn in enumerate([72, 76, 79, 84]): place(buf, pan(I.glock(m2f(nn), 0.08, r, dur=0.8), 0), F(252) + i * 0.07)                          # self-taught
    place(buf, pan(I.timpani(m2f(33), 0.4, r), 0), F(292))                                                                                         # magnetron
    place(buf, pan(I.brass(m2f(38), 0.7, 0.2, r, kind='tuba', fall=-5), 0), F(442)); place(buf, I.cymbal(0.08, r, dur=1.2), F(442))             # MELTED
    for i, nn in enumerate([79, 84, 88]): place(buf, pan(I.glock(m2f(nn), 0.09, r, dur=0.9), 0), F(513) + i * 0.07)                              # popcorn!
    st([60, 64, 67, 72, 76], F(615), 0.06, 0.16); place(buf, I.cymbal(0.12, r, dur=1.6), F(615))                                                  # popped
    place(buf, pan(I.timpani(m2f(31), 0.7, r), 0), F(735)); place(buf, I.cymbal(0.14, r, dur=1.6), F(735))                                       # exploded
    place(buf, pan(I.vibes(m2f(76), 0.1, r, dur=1.6), 0), F(806))                                                                                  # you see
    st([60, 64, 67, 72, 76], F(952), 0.08, 0.14); place(buf, I.cymbal(0.1, r, dur=1.8), F(952))                                                  # heat
    st([67, 72, 76, 79], F(1009), 0.08, 0.18); place(buf, I.cymbal(0.1, r, dur=1.4), F(1009))                                                    # patent
    place(buf, I.cymbal(0.12, r, dur=2.0), F(1056)); st([60, 67, 72, 76, 79], F(1157), 0.07, 0.18)                                               # 1947 / first oven
    for i, nn in enumerate([60, 64, 67, 72, 76, 79]): place(buf, pan(I.glock(m2f(nn), 0.07, r, dur=0.6), 0), F(1196) + i * 0.1)                 # 6 ft
    place(buf, pan(I.brass(m2f(31), 0.8, 0.22, r, kind='tuba'), 0), F(1280)); place(buf, pan(I.timpani(m2f(31), 0.6, r), 0), F(1280))           # 750 lb
    place(buf, I.cymbal(0.12, r, dur=1.6), F(1357)); st([72, 76, 79, 84], F(1357), 0.06, 0.16)                                                    # $5,000
    place(buf, I.cymbal(0.1, r, dur=1.4), F(1440)); place(buf, pan(I.timpani(m2f(36), 0.5, r), 0), F(1458))                                     # counter
    st([67, 72, 76, 79], F(1517), 0.08, 0.16); place(buf, I.cymbal(0.1, r, dur=1.6), F(1517))                                                    # 1967
    st([72, 67, 64, 60], F(1631), 0.12, 0.14, kind='tuba'); place(buf, pan(I.brass(m2f(34), 1.0, 0.2, r, kind='tuba', fall=-6), 0), F(1692))   # $2 ... every patent
    place(buf, I.cymbal(0.08, r, dur=2.0), F(1777)); st([67, 72, 76, 79, 84], F(1800), 0.08, 0.14)                                               # final ding / thanks
    return buf

def ding(r, f0=1568.0):
    t = tt(2.2); x = sum(np.sin(phase(np.full(len(t), f0 * m))) * a * np.exp(-t / d) for m, a, d in [(1, 0.5, 0.9), (2.76, 0.22, 0.35), (5.4, 0.1, 0.15), (2.0, 0.12, 0.6)])
    return fades(x, 0.002, 0.2)
def hum(dur, r, level=1.0):
    n = ns(dur); t = np.arange(n) / SR; x = (np.sin(2 * np.pi * 120 * t) * 0.3 + np.sin(2 * np.pi * 240 * t) * 0.12 + lp(r.standard_normal(n), 600) * 0.25) * level
    return fades(x, 0.1, 0.15)
def buzz(dur, r, level=1.0):
    n = ns(dur); t = np.arange(n) / SR; x = (np.sign(np.sin(2 * np.pi * 60 * t)) * 0.08 + np.sin(2 * np.pi * 180 * t) * 0.1 + bp(r.standard_normal(n), 1500, 6000) * 0.04) * level
    return fades(lp(x, 2500), 0.2, 0.3)
def popk(r, muff=False):
    t = tt(0.12); x = (bp(r.standard_normal(len(t)), 600, 3500) * np.exp(-t / 0.012) + np.sin(phase(np.full(len(t), 900 + 500 * r.random()))) * 0.4 * np.exp(-t / 0.02)) * 0.6
    return fades(lp(x, 900) if muff else x, 0.0005, 0.03)
def click(r):
    t = tt(0.08); return fades(hp(r.standard_normal(len(t)), 2000) * np.exp(-t / 0.006) * 0.6, 0.0005, 0.02)
def goo(r, dur=0.8):
    t = tt(dur); f = 260 * np.exp(-t / 0.5) + 70; x = np.sin(phase(f)) * 0.35 * np.exp(-t / 0.35) + lp(r.standard_normal(len(t)), 500) * 0.15 * np.exp(-t / 0.3); return fades(x, 0.01, 0.1)
def ping(r):
    t = tt(1.4); return fades(np.sin(phase(np.full(len(t), 1320.0))) * 0.4 * np.exp(-t / 0.45) * (1 + 0.3 * np.sin(2 * np.pi * 7 * t)), 0.002, 0.1)
def squeak(r, dur=0.9, f0=900, f1=1500):
    t = tt(dur); f = f0 + (f1 - f0) * t / dur; x = np.sin(phase(f + 40 * np.sin(2 * np.pi * 23 * t))) * 0.2; return fades(x, 0.03, 0.1)
def zip_(r, dur=1.1, f0=1400, f1=200):
    t = tt(dur); f = f0 * (f1 / f0) ** (t / dur); x = np.sin(phase(f)) * 0.25 + bp(r.standard_normal(len(t)), 800, 3000) * 0.06; return fades(x, 0.02, 0.15)
def kaching(r):
    out = np.zeros(ns(2.6)); place1 = lambda x, t: out.__setitem__(slice(ns(t), ns(t) + len(x)), out[ns(t):ns(t) + len(x)] + x)
    place1(G.clink(r) * 0.8, 0.0); place1(G.clink(r) * 0.6, 0.05); place1(ding(r, 2637) * 0.7, 0.12); return out
def sfx():
    buf = np.zeros((2, N)); r = rng(1967)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (292, 357, 457, 549, 670, 804, 981, 1185, 1302, 1388, 1562, 1710): P(gentle_whoosh(r), F(f0) - 0.25, 0.26)
    for f0 in (127, 1056, 1440): P(G.whoosh(0.9, r, 0.4), F(f0) - 0.35, 0.22)
    # hook: humming microwave, muffled pops inside, DING, door click, steam hiss; CHOCO's melt
    P(hum(F(38), r), 0, 0.22); [P(popk(r, True), F(4) + i * 0.13 + 0.05 * r.random(), 0.16, 0.1) for i in range(9)]
    P(ding(r), F(36), 0.5); P(click(r), F(40), 0.3, -0.1); P(G.whoosh(0.6, r, 0.15, 2000, 6000), F(42), 0.08)
    P(goo(r), F(71), 0.3, 0.2); P(bonk(r), F(99), 0.12)
    # lab: magnetron buzz, radar ping, chalk-free ambience
    P(buzz(F(804 - 286), r), F(286), 0.12); P(ping(r), F(338), 0.18, 0.3); P(ping(r), F(346), 0.08, 0.3)
    P(goo(r, 1.2), F(442), 0.35); P(G.whoa(r), F(446), 0.06)                                                                      # MELTED
    P(paper(r), F(480), 0.14); P(paper(r), F(509), 0.16, 0.2)                                                                     # napkin, popcorn bag
    for i in range(46): P(popk(r), F(615) + 0.08 * i + 0.06 * r.random(), 0.3 * (0.6 + 0.4 * r.random()), -0.6 + 1.2 * r.random())  # popcorn!
    P(G.whoa(r), F(620), 0.08, -0.3); P(G.hurrah(r, 220, 0.6), F(640), 0.05)
    for i in range(3): P(G.clink(r), F(704) + i * 0.1, 0.08)                                                                       # egg in the pot
    P(boom(r, 0.6, 1.2), F(735), 0.28); P(G.splash_big(r), F(735), 0.2); P(bonk(r), F(737), 0.18); P(G.oof(r), F(742), 0.1, 0.2)   # SPLAT
    # inside: bubbling heat
    P(G.bubbles(F(981 - 900), r, 6), F(900), 0.08); P(ting(r, 3136), F(896), 0.1)
    P(G.push_thump(r), F(1009), 0.35); P(G.hammer_hit(r, 0.6), F(1009), 0.12)                                                     # stamp
    P(G.babble(3.5, r, 200, 1.0), F(1060), 0.04); P(hum(F(1385 - 1100), r, 0.6), F(1100), 0.1)
    P(squeak(r, 1.1), F(1196), 0.14, -0.2)                                                                                        # ruler marker
    P(G.creak(0.8, r), F(1246), 0.12); P(G.hammer_hit(r, 1.0), F(1280), 0.16); P(G.rattle(0.4, r), F(1282), 0.06)                # scale
    P(G.whoa(r), F(1290), 0.06, 0.3)
    for i in range(10): P(click(r), F(1323) + i * 0.11, 0.12, 0.2)                                                               # price counting
    P(kaching(r), F(1357), 0.35)
    P(zip_(r, 1.1), F(1405), 0.2); [P(click(r), F(1397) + i * 0.09, 0.14) for i in range(20)]                                 # shrink + years flipping
    P(G.push_thump(r), F(1458), 0.35); P(bonk(r), F(1460), 0.1); P(G.hurrah(r, 300, 1.0, kid=True), F(1464), 0.1); P(G.applause(1.2, r, 8), F(1470), 0.05)  # 1967 drop
    P(ding(r, 1760), F(1505), 0.15)
    P(paper(r), F(1628), 0.2, 0.2); P(paper(r), F(1636), 0.12, 0.2)                                                               # $2 bills
    # payoff: hum + muffled pops, final DING, door click, kid's cheer
    P(hum(F(1777 - 1712), r), F(1712), 0.2); [P(popk(r, True), F(1748) + i * 0.1 + 0.05 * r.random(), 0.18, 0.1) for i in range(10)]
    P(ding(r), F(1777), 0.55); P(click(r), F(1780), 0.3, -0.1); P(G.hurrah(r, 300, 1.0, kid=True), F(1786), 0.1)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
