# [GC-audio] Stems for "In October 1582, ten days vanished from the calendar": a hushed night music-box lullaby in the Roman bedroom,
# a bright morning pluck (cut dead on "15th"), a ticking-clock "theory" groove (vibes + pad over a tick-tock pulse that speeds up while the
# year counter spins), a stately papal processional (pad, timpani, horn chords), a bouncy pizzicato for the map, a jaunty Georgian
# fife + harpsichord-ish pluck for London 1752 (a grumbling snare for the riot myth), and a minor snare march for Petrograd that turns
# major with a cymbal on "November". Motif SFX: calendar pages flipping (the ten vanishing days), a clock tick-tock, and stamps.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, clop
DUR = 1791 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 112
SEC = [(0, 207, 'hush'), (207, 256, 'morning'), (256, 293, None), (293, 635, 'theory'), (635, 810, 'papal'), (810, 944, 'map'), (944, 1101, 'theory'), (1101, 1318, 'london'), (1318, 1429, 'riot'), (1429, 1561, 'map'), (1561, 1690, 'march'), (1690, 1791, 'gold')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def kickd(vel, r, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)
def tick(r, f0=2600, g=0.4):
    t = tt(0.05); x = bp(r.standard_normal(len(t)), f0 * 0.7, f0 * 1.6) * np.exp(-t / 0.006) * g + np.sin(2 * np.pi * f0 * 0.5 * t) * np.exp(-t / 0.01) * g * 0.5
    return fades(x, 0.0003, 0.005)
def flip(r):  # one calendar page flicked off
    t = tt(0.16); x = bp(r.standard_normal(len(t)), 1200, 6000) * np.exp(-t / 0.03) * (1 + 0.6 * np.sin(2 * np.pi * 38 * t)) * 0.6; return fades(x, 0.002, 0.03)
def blow(r):
    t = tt(0.45); return fades(bp(r.standard_normal(len(t)), 300, 2400) * np.sin(np.pi * t / 0.45) ** 1.5 * 0.7, 0.01, 0.05)
def crackle(dur, r):
    t = tt(dur); x = np.zeros(len(t)); n = int(dur * 18)
    for _ in range(n):
        i = r.integers(0, len(t) - 600); k = tt(0.012); x[i:i + len(k)] += bp(r.standard_normal(len(k)), 1500, 6000) * np.exp(-k / 0.002) * (0.3 + 0.7 * r.random())
    x += lp(r.standard_normal(len(t)), 400) * 0.25; return fades(x * 0.5, 0.2, 0.3)
def bell(f, vel, r, dur=3.0):
    t = tt(dur); x = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / (dur * d)) for k, a, d in [(1, 1.0, 0.5), (2.0, 0.5, 0.3), (2.76, 0.35, 0.2), (5.4, 0.2, 0.08)])
    return fades(x * vel * 0.4, 0.002, 0.2)

def music():
    buf = np.zeros((2, N)); r = rng(1582)
    LUL = [76, 79, 81, 79, 76, 74, 72, 74, 76, 72, 69, 71, 72, 74, 76, 74]        # lullaby (C major, music-box)
    Am, F_, C, G_, E7, Dm = [57, 60, 64], [53, 57, 60], [48, 52, 55], [43, 47, 50], [52, 56, 59, 62], [50, 53, 57]
    JIG = [74, 76, 78, 79, 81, 79, 78, 76, 74, 78, 81, 86, 85, 81, 78, 76]           # Georgian fife tune (D major, our own)
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s == 'hush':
            if beat in (0, 2): place(buf, pan(I.musicbox(m2f(LUL[(k // 2) % 16] + 12), 0.1, r, 1.4), 0.15), t)
            if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in ([48, 55, 60, 64] if bar % 4 == 0 else [45, 52, 57, 60])], B * 8, 0.07, r, att=0.8, rel=1.0, warm=1100), t)
        elif s == 'morning':
            ch = [C, G_, F_, C][bar % 4]
            place(buf, pan(I.pluck(m2f(ch[beat % 3] + 24), 0.12, r, dur=0.3, bright=0.6, pos=0.2), 0.2 if beat % 2 else -0.2), t)
            if beat == 0: place(buf, pan(I.glock(m2f(ch[0] + 36), 0.08, r, dur=1.2), 0), t)
        elif s == 'theory':
            ch = [Am, F_, Dm, E7][bar % 4]
            if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.07, r, att=0.4, rel=0.9, warm=1300), t)
            if beat in (0, 2): place(buf, pan(I.vibes(m2f(ch[(beat // 2 + bar) % len(ch)] + 24), 0.07, r, dur=1.2), -0.2), t)
            if beat == 3: place(buf, pan(I.pluck(m2f(ch[0]), 0.1, r, dur=0.4, bright=0.3, pos=0.3), 0.1), t)
        elif s == 'papal':
            ch = [C, F_, G_, C][bar % 4]
            if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch] + [m2f(ch[0])], B * 4, 0.09, r, att=0.3, rel=1.0, warm=1600)
                               , t); place(buf, pan(I.timpani(m2f(ch[0] - 12), 0.3, r, dur=1.2), 0), t)
            if beat == 2: place(buf, pan(I.brass(m2f(ch[1] + 12), B * 1.6, 0.09, r, kind='horn'), -0.2), t)
        elif s == 'map':
            ch = [G_, C, D_ := [50, 54, 57], G_][bar % 4]
            for e in range(2): place(buf, pan(I.pluck(m2f(ch[(beat + e) % 3] + 12 + 12 * e), 0.12, r, dur=0.18, bright=0.5, pos=0.2), 0.25 if e else -0.25), t + e * B / 2)
            if beat in (0, 2): place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.15, r, dur=0.4, bright=0.25, pos=0.3), 0), t)
            if beat in (1, 3): place(buf, pan(I.brush(0.05, r, dur=0.14), 0.1), t)
        elif s == 'london':
            ch = [[50, 54, 57], [43, 47, 50], [45, 49, 52], [50, 54, 57]][bar % 4]
            for e in range(2): place(buf, pan(I.fife(m2f(JIG[(k * 2 + e) % 16]), B / 2 * 0.85, 0.1, r), 0.2), t + e * B / 2)
            place(buf, pan(I.pluck(m2f(ch[beat % 3] + 12), 0.1, r, dur=0.25, bright=0.8, pos=0.1), -0.2), t)
            if beat in (0, 2): place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.14, r, dur=0.4, bright=0.3, pos=0.3), 0), t)
            if beat in (1, 3): place(buf, pan(I.snare(0.07, r, dur=0.12), 0.05), t)
        elif s == 'riot':
            if beat == 0: place(buf, I.pad([m2f(n) for n in [50, 53, 56]], B * 4, 0.07, r, att=0.2, rel=0.8, warm=900, detune=12), t)
            place(buf, pan(I.snare(0.12 if beat % 2 else 0.18, r, dur=0.18), 0.05), t); place(buf, pan(I.timpani(m2f(38), 0.14, r, dur=0.5), 0), t)
        elif s == 'march':
            ch = [Am, Dm, E7, Am][bar % 4]
            place(buf, pan(I.snare(0.14 if beat % 2 else 0.2, r, dur=0.2), 0.05), t); place(buf, pan(I.snare(0.08, r, dur=0.12), 0.05), t + B / 2)
            if beat in (0, 2): place(buf, pan(kickd(0.3, r), 0), t)
            if beat == 0: place(buf, pan(I.brass(m2f(ch[0] - 12), B * 1.8, 0.12, r, kind='tuba'), 0), t); place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.06, r, att=0.3, rel=0.8, warm=1000), t)
        elif s == 'gold':
            ch = [C, F_, G_, C][bar % 4]
            if beat in (0, 2): place(buf, pan(I.musicbox(m2f(LUL[(k // 2) % 16] + 12), 0.12, r, 1.4), 0.15), t)
            if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.08, r, att=0.3, rel=1.2, warm=1500), t)
            place(buf, pan(I.pluck(m2f(ch[beat % 3] + 24), 0.09, r, dur=0.3, bright=0.6, pos=0.2), -0.2), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='stab': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.brass(m2f(38), 0.7, 0.18, r, kind='tuba', fall=-5), 0), F(86))                                                 # ten days vanished
    place(buf, I.cymbal(0.1, r, dur=2.0), F(207)); place(buf, pan(I.brass(m2f(40), 0.6, 0.18, r, kind='tuba', fall=-4), 0), F(257))   # morning / 15th?!
    place(buf, pan(I.timpani(m2f(33), 0.4, r), 0), F(294)); place(buf, pan(I.brass(m2f(41), 0.6, 0.14, r, kind='tuba', fall=-3), 0), F(409))  # culprit / too long
    st([57, 60, 64, 69], F(604), 0.07, 0.13, 'horn')                                                                                 # drifted ten days
    st([60, 64, 67, 72], F(651), 0.08, 0.15, 'horn'); place(buf, I.cymbal(0.12, r, dur=2.0), F(767)); st([60, 64, 67, 72, 76], F(767), 0.07, 0.17, 'horn')  # Gregory / skip!
    for i, f0 in enumerate([813, 830, 855, 865]): place(buf, pan(I.glock(m2f(76 + i * 3), 0.12, r, dur=1.0), 0), F(f0))            # pins
    place(buf, pan(I.vibes(m2f(84), 0.1, r, dur=1.6), 0), F(915))
    for i in range(5): place(buf, pan(I.glock(m2f([72, 67, 67, 67, 79][i]), 0.12 if i in (0, 4) else 0.08, r, dur=1.0), 0), F(1012 + 14 * i))  # leap blocks
    st([60, 64, 67, 72], F(1068), 0.07, 0.14, 'horn')
    place(buf, pan(I.timpani(m2f(33), 0.45, r), 0), F(1229)); place(buf, pan(I.brass(m2f(38), 0.7, 0.16, r, kind='tuba', fall=-4), 0), F(1296))  # 1752 / lost 11 days
    place(buf, pan(I.pluck(m2f(57), 0.2, r, dur=0.4, bright=0.4), 0), F(1401)); place(buf, pan(I.pluck(m2f(56), 0.2, r, dur=0.6, bright=0.4), 0), F(1409))  # myth
    place(buf, pan(I.timpani(m2f(36), 0.4, r), 0), F(1456)); place(buf, pan(I.timpani(m2f(31), 0.4, r), 0), F(1514))
    place(buf, pan(I.timpani(m2f(33), 0.4, r), 0), F(1562)); st([57, 60, 64], F(1641), 0.09, 0.13, 'horn')
    place(buf, I.cymbal(0.16, r, dur=2.6), F(1690)); st([60, 64, 67, 72, 76], F(1690), 0.07, 0.18, 'horn'); place(buf, pan(I.musicbox(m2f(84), 0.12, r, dur=2.0), 0), F(1736))
    return buf

def sfx():
    buf = np.zeros((2, N)); r = rng(1752)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (137, 293, 437, 635, 810, 944, 1101, 1318, 1429, 1561): P(gentle_whoosh(r), F(f0) - 0.25, 0.26)
    P(G.crickets(6.9, r), F(0), 0.045); P(G.breeze(6.9, r, 0.4), F(0), 0.05)
    for i in range(10): P(flip(r), F(84) + i * 5 / 30, 0.3, 0.3 * ((i % 2) * 2 - 1))                                               # ten pages fly
    P(G.whoa(r), F(90), 0.05)
    for i in range(6): P(tick(r, 2400 if i % 2 else 3000, 0.3), F(140) + i * 1.0, 0.1, 0.4)                                          # night clock
    P(blow(r), F(194), 0.2); P(G.bird_chirps(2.8, r, 0.6), F(207), 0.09); P(flip(r), F(212), 0.2); P(G.whoa(r), F(258), 0.07)
    # theory space: tick-tock pulse; it races while the counter spins (468-560)
    t0 = F(293)
    while t0 < F(635):
        fr = t0 * 30; rate = 1.0 if fr < 468 or fr > 560 else 0.18 + 0.82 * abs(fr - 514) / 46
        P(tick(r, 2400 if int(t0 * 10) % 2 else 3000, 0.3), t0, 0.12 if rate < 1 else 0.14, 0.2); t0 += 0.5 * rate
    P(G.push_thump(r), F(294), 0.18); P(bonk(r), F(409), 0.1); P(G.push_thump(r), F(405), 0.2); P(G.push_thump(r), F(600), 0.24)
    P(paper(r), F(712), 0.16); P(paper(r), F(722), 0.12, 0.2); P(G.push_thump(r), F(764), 0.26)
    for i in range(10): P(flip(r), F(768) + i * 4 / 30, 0.26, 0.3 * ((i % 2) * 2 - 1))
    for f0 in (811, 828, 853, 864, 1431, 1503): P(ting(r, 2093), F(f0) + 0.05, 0.08); P(G.push_thump(r), F(f0) + 0.06, 0.08)
    P(G.push_thump(r), F(914), 0.22)
    t0 = F(944)
    while t0 < F(1101): P(tick(r, 2400 if int(t0 * 4) % 2 else 3000, 0.3), t0, 0.1, -0.2); t0 += 0.5
    for i in range(5): P(G.push_thump(r), F(1010 + 14 * i) + 0.08, 0.16)
    P(G.push_thump(r), F(1064), 0.22)
    P(G.babble(7.2, r, 160, 1.0), F(1101), 0.035); P(G.bird_chirps(7.0, r, 0.3), F(1101), 0.04)
    for i in range(6): P(clop(r), F(1110) + i * 0.32 + r.random() * 0.05, 0.06, 0.4)
    P(G.push_thump(r), F(1227), 0.22); P(paper(r), F(1277), 0.14)
    for i in range(10): P(flip(r), F(1277) + i * 2 / 30, 0.22, 0.2)
    P(G.push_thump(r), F(1295), 0.2)
    P(G.flag_flutter(3.6, r), F(1322), 0.08); P(G.babble(3.0, r, 150, 1.0), F(1322), 0.06); P(G.hurrah(r, 140, 0.9), F(1340), 0.05); P(G.push_thump(r), F(1399), 0.24)
    P(G.breeze(7.7, r, 1.0, bright=1300), F(1561), 0.08); P(crackle(7.6, r), F(1561), 0.07, 0.3); P(G.hurrah(r, 150, 0.9), F(1566), 0.05)
    P(paper(r), F(1684), 0.18); P(flip(r), F(1688), 0.26); P(G.push_thump(r), F(1689), 0.22); P(G.hurrah(r, 160, 1.0), F(1695), 0.07); P(ting(r, 3136), F(1745), 0.1)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
