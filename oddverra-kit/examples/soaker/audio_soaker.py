# [SK-audio] Stems for "The Super Soaker was invented by a NASA engineer": a bouncy summer ukulele-pluck + handclap groove for the
# backyard (hook / 1990 / sales), a bright vibes + synth-pad "mission" theme for JPL and space, a curious late-night pizzicato for the
# 1982 bathroom tinkering, a sneaky build groove in the garage, a slow sad-pad for the rejections, a "You see" reveal swell, a light
# legal-thriller pulse for the arbitration and a golden reprise of the backyard tune for the payoff.
# SFX: birds + breeze in the yard, jet sprays + splats on every water hit, clean-room hum, spacecraft whoosh, wrench clinks, a faucet
# squeak, the big bathroom blast + tub splash + a rubber-duck squeak, a lightbulb ding, pipe clacks and a bottle pop, letters dropping,
# kids laughing, paper shuffles and a big win sting. Whooshes on every cut.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, scratch
DUR = 1910 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 116
SEC = [(0, 178, 'yard'), (178, 467, 'space'), (467, 863, 'night'), (863, 995, 'build'), (995, 1100, 'sad'), (1100, 1521, 'yard2'), (1521, 1704, 'court'), (1704, 1800, 'space2'), (1800, 1910, 'gold')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def kickd(vel, r, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)
def clap(r, vel=0.3):
    t = tt(0.18); x = bp(r.standard_normal(len(t)), 900, 2600) * (np.exp(-t / 0.012) + 0.5 * np.exp(-np.maximum(t - 0.012, 0) / 0.05) * (t > 0.012)); return fades(x * vel, 0.0005, 0.03)
def pop(r, f0=900):
    t = tt(0.08); return fades(np.sin(phase(f0 * (1 + 2.0 * np.exp(-t / 0.01)))) * np.exp(-t / 0.025) * 0.6, 0.0005, 0.01)
def click(r):
    t = tt(0.03); return fades(bp(r.standard_normal(len(t)), 2500, 6000) * np.exp(-t / 0.006) * 0.6, 0.0005, 0.005)
def spray(dur, r, k=1.0):
    t = tt(dur); x = bp(r.standard_normal(len(t)), 1800, 7000) * (0.7 + 0.3 * np.sin(2 * np.pi * 23 * t) * r.random()) ; env = np.minimum(1, t / 0.04) * np.exp(-np.maximum(t - dur * 0.6, 0) / (dur * 0.2))
    return fades(x * env * 0.4 * k, 0.005, 0.05)
def splat(r, k=1.0):
    t = tt(0.5); x = lp(r.standard_normal(len(t)), 3500) * np.exp(-t / 0.06) * 0.8 + bp(r.standard_normal(len(t)), 2000, 8000) * np.exp(-t / 0.15) * 0.3
    bb = np.asarray(G.bubbles(0.5, r, 18), float); bb = bb[0] if bb.ndim > 1 else bb; y = fades(x * k, 0.001, 0.08); n = min(len(y), len(bb)); y[:n] += 0.4 * k * bb[:n]; return y
def hum(dur, r, f=120):
    t = tt(dur); return fades((np.sin(2 * np.pi * f * t) * 0.5 + np.sin(2 * np.pi * 2 * f * t) * 0.2) * 0.15, 0.2, 0.3)
def squeak(r, f0=1400):
    t = tt(0.25); return fades(np.sin(phase(f0 * (1 + 0.5 * np.sin(np.pi * t / 0.25)))) * 0.4 * np.exp(-t / 0.2), 0.005, 0.05)

def music():
    buf = np.zeros((2, N)); r = rng(1990)
    MEL = [72, 74, 76, 79, 76, 74, 72, 67, 69, 72, 74, 76, 74, 72, 69, 67]           # backyard tune (C major)
    C, F_, G7, Am, Dm, Em = [48, 52, 55], [53, 57, 60], [43, 47, 50, 53], [57, 60, 64], [50, 53, 57], [52, 55, 59]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s in ('yard', 'yard2', 'gold'):
            ch = [C, F_, Am, G7][bar % 4]; g = 1.1 if s == 'gold' else 1.0
            if beat in (0, 2): place(buf, pan(kickd(0.4, r), 0), t)
            if beat in (1, 3): place(buf, pan(clap(r, 0.22), 0.1), t)
            for e in range(2): place(buf, pan(I.pluck(m2f(ch[(beat + e) % len(ch)] + 12), 0.1, r, dur=0.25, bright=0.7, pos=0.15), 0.25), t + e * B / 2)
            place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.16, r, dur=0.35, bright=0.3, pos=0.3), 0), t)
            if beat in (0, 2): place(buf, pan(I.glock(m2f(MEL[(k // 2) % 16]), 0.08 * g, r, dur=0.9), -0.15), t)
            if s == 'gold' and beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.06, r, att=0.5, rel=0.8, warm=1500), t)
        elif s in ('space', 'space2'):
            ch = [Am, F_, C, G7][bar % 4]
            if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.08, r, att=0.4, rel=0.8, warm=1800, detune=8), t)
            for e in range(2): place(buf, pan(I.vibes(m2f(ch[(beat * 2 + e) % len(ch)] + 24), 0.06, r, dur=0.6), 0.25 if e else -0.25), t + e * B / 2)
            if beat in (0, 2): place(buf, pan(kickd(0.2, r), 0), t)
        elif s == 'night':
            ch = [Am, Dm, Em, Am][bar % 4]
            place(buf, pan(I.pluck(m2f(ch[beat % len(ch)]), 0.12, r, dur=0.18, bright=0.35, pos=0.3), 0.2 if beat % 2 else -0.2), t)
            if beat == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.16, r, dur=0.4, bright=0.25, pos=0.3), 0), t)
            if beat == 2: place(buf, pan(I.vibes(m2f(ch[2] + 24), 0.05, r, dur=1.0), 0.1), t + B / 2)
            if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in ch], B * 8, 0.04, r, att=0.6, rel=0.6, warm=1000), t)
        elif s == 'build':
            ch = [C, Am, Dm, G7][bar % 4]
            place(buf, pan(kickd(0.35 if beat in (0, 2) else 0.18, r), 0), t)
            if beat in (1, 3): place(buf, pan(I.brush(0.05, r, dur=0.14), 0.1), t)
            for e in range(2): place(buf, pan(I.pluck(m2f(ch[(beat + e) % len(ch)]), 0.12, r, dur=0.2, bright=0.5, pos=0.2), 0.2), t + e * B / 2)
            place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.15, r, dur=0.3, bright=0.3, pos=0.3), 0), t)
        elif s == 'sad':
            ch = [Am, F_, Dm, Em][bar % 4]
            if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.07, r, att=0.6, rel=1.0, warm=1100), t)
            if beat in (0, 2): place(buf, pan(I.vibes(m2f(ch[beat % len(ch)] + 24), 0.05, r, dur=1.4), -0.15), t)
        elif s == 'court':
            ch = [Dm, Am, F_, G7][bar % 4]
            for e in range(2): place(buf, pan(I.pluck(m2f(ch[0]), 0.1, r, dur=0.12, bright=0.3, pos=0.3), 0), t + e * B / 2)
            if beat in (0, 2): place(buf, pan(kickd(0.25, r, 50), 0), t)
            if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.05, r, att=0.4, rel=0.6, warm=1200), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='stab': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    st([60, 64, 67, 72], F(92), 0.07, 0.14, 'horn'); place(buf, pan(I.timpani(m2f(36), 0.5, r), 0), F(144)); place(buf, I.cymbal(0.1, r, dur=1.4), F(144))   # NASA engineer / by accident
    place(buf, I.cymbal(0.1, r, dur=1.6), F(178)); place(buf, pan(I.timpani(m2f(36), 0.4, r), 0), F(206))                                                  # Lonnie Johnson / nuclear
    place(buf, pan(I.vibes(m2f(84), 0.1, r, dur=1.6), 0), F(377)); place(buf, pan(I.vibes(m2f(88), 0.1, r, dur=1.6), 0), F(447))                           # Jupiter / Saturn
    place(buf, pan(I.timpani(m2f(33), 0.4, r), 0), F(473)); place(buf, pan(I.brass(m2f(38), 0.7, 0.14, r, kind='tuba', fall=-4), 0), F(600))           # 1982 / not Freon
    for i, nn in enumerate([60, 64, 67, 72, 76, 79]): place(buf, pan(I.glock(m2f(nn + 12), 0.1, r, dur=0.8), 0), F(705) + i * 0.05)                   # WHOOSH
    place(buf, I.cymbal(0.14, r, dur=2.0), F(705)); place(buf, pan(I.timpani(m2f(36), 0.6, r), 0), F(762))
    for i, nn in enumerate([72, 76, 79, 84]): place(buf, pan(I.glock(m2f(nn), 0.12, r, dur=0.9), 0), F(806) + i * 0.06)                               # idea
    st([64, 67, 72], F(975), 0.08, 0.14, 'horn')                                                                                                        # prototype done
    place(buf, pan(I.brass(m2f(40), 0.9, 0.14, r, kind='tuba', fall=-5), 0), F(1022))                                                                  # not so sure
    place(buf, I.cymbal(0.12, r, dur=1.8), F(1100)); place(buf, pan(I.timpani(m2f(36), 0.5, r), 0), F(1115))                                            # You see / 1990
    st([60, 64, 67, 72, 76], F(1172), 0.08, 0.2, 'horn'); st([67, 72, 76, 79], F(1278), 0.08, 0.2, 'horn'); place(buf, I.cymbal(0.12, r, dur=1.8), F(1278))  # launched / new name
    for i in range(8): place(buf, pan(I.glock(m2f(72 + i * 2), 0.07, r, dur=0.4), 0), F(1338) + i * 0.08)                                               # counter
    st([60, 64, 67, 72, 76], F(1462), 0.08, 0.2, 'horn'); place(buf, I.cymbal(0.12, r, dur=1.8), F(1462))                                              # best-selling
    place(buf, I.cymbal(0.1, r, dur=1.6), F(1521)); place(buf, pan(I.timpani(m2f(33), 0.4, r), 0), F(1624))
    for i in range(8): place(buf, pan(I.glock(m2f(72 + i * 2), 0.07, r, dur=0.4), 0), F(1660) + i * 0.09)
    st([60, 64, 67, 72, 76, 79], F(1686), 0.08, 0.22, 'horn'); place(buf, I.cymbal(0.14, r, dur=2.0), F(1686)); place(buf, pan(I.timpani(m2f(36), 0.6, r), 0), F(1690))  # won
    place(buf, pan(I.vibes(m2f(84), 0.1, r, dur=1.8), 0), F(1780))                                                                                       # Jupiter
    st([60, 64, 67, 72, 76], F(1832), 0.08, 0.18, 'horn'); place(buf, I.cymbal(0.12, r, dur=2.4), F(1834)); place(buf, pan(I.timpani(m2f(36), 0.6, r), 0), F(1853))  # soaking
    return buf

def sfx():
    buf = np.zeros((2, N)); r = rng(2013)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float)
        if x.ndim > 1 and x.shape[0] != 2: x = x[0]
        place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (178, 327, 467, 616, 784, 863, 995, 1100, 1313, 1521, 1704): P(gentle_whoosh(r), F(f0) - 0.25, 0.28)
    P(G.breeze(5.8, r, 0.4), F(0), 0.1); P(G.bird_chirps(5, r, 0.4), F(4), 0.07)
    P(spray(3.4, r), F(20), 0.35, 0.1); P(splat(r), F(30), 0.4, 0.3); P(G.hurrah(r, 320, 0.9, kid=True), F(40), 0.08); P(spray(1.5, r), F(128), 0.3, 0.1); P(splat(r), F(134), 0.3, 0.3)
    P(pop(r, 700), F(144), 0.25)
    P(hum(4.9, r, 60), F(178), 0.18); for_ = [P(G.stroll_step(r, 0.5), F(190) + i * 0.5, 0.06, 0.2) for i in range(4)]
    P(G.whoosh(3.0, r, 0.3, 200, 900), F(335), 0.25); P(hum(4.0, r, 50), F(330), 0.1)
    for i in range(5): P(click(r), F(500) + i * 0.6 + r.random() * 0.1, 0.18, -0.2)                                                         # wrench clinks
    P(G.crickets(5.0, r), F(467), 0.03)
    P(squeak(r, 1200), F(650), 0.2, -0.3); P(spray(2.9, r, 1.3), F(687), 0.45, -0.1); P(G.whoosh(0.6, r, 0.3, 800, 4000), F(690), 0.3)       # faucet squeak, BLAST
    for i in range(5): P(splat(r, 0.8), F(704) + i * 0.4, 0.3, 0.3)
    P(squeak(r, 1700), F(722), 0.25, 0.3); P(G.bubbles(1.5, r, 20), F(760), 0.25)                                                            # duck squeak, tub
    P(ting(r, 2637), F(806), 0.14)                                                                                                            # lightbulb
    for i in range(7): P(click(r), F(886) + i * 0.45, 0.22, 0.1); P(pop(r, 600), F(975), 0.3)                                               # pipe clacks + bottle pop
    for i in range(14): P(paper(r), F(1000) + i * 0.22, 0.08, 0.3)                                                                          # letters pile up
    for i in range(6): P(G.stroll_step(r, 0.3), F(1050) + i * 0.4, 0.04)
    P(G.breeze(14.0, r, 0.4), F(1100), 0.08); P(G.bird_chirps(12, r, 0.3), F(1110), 0.05)
    P(G.hurrah(r, 320, 1.0, kid=True), F(1176), 0.1); P(spray(4.0, r), F(1186), 0.3, -0.2); P(splat(r), F(1196), 0.35, -0.3); P(G.whoa(r), F(1198), 0.07)
    P(spray(1.0, r), F(1290), 0.3, 0.2); P(splat(r), F(1298), 0.3, 0.3)
    for i, f0 in enumerate((1316, 1330, 1345, 1360, 1380, 1400)): P(spray(min(6.5, (1521 - f0) / 30), r, 0.8), F(f0), 0.22, (-0.4, 0.4, -0.2, 0.3, -0.1, 0.1)[i])
    for i in range(5): P(splat(r, 0.8), F(1326 + i * 24), 0.25, 0.2 * (i % 3 - 1))
    P(G.hurrah(r, 300, 1.0, kid=True), F(1340), 0.1); P(G.hurrah(r, 260, 0.9, kid=True), F(1440), 0.09)
    P(G.babble(3.0, r, 180, 1.0, rate=3.6), F(1530), 0.04); for_ = [P(paper(r), F(1550) + i * 1.5, 0.12, 0.2) for i in range(3)]
    for i in range(8): P(click(r), F(1660) + i * 0.09, 0.15)
    P(G.hurrah(r, 280, 0.8), F(1690), 0.08)
    P(G.whoosh(2.6, r, 0.3, 200, 900), F(1710), 0.2)
    P(G.breeze(3.8, r, 0.4), F(1800), 0.08); P(G.bird_chirps(3, r, 0.3), F(1802), 0.05); P(spray(1.8, r, 1.2), F(1829), 0.4, -0.1); P(splat(r, 1.2), F(1835), 0.45, 0.2)
    P(G.whoa(r), F(1838), 0.1); P(G.hurrah(r, 320, 0.9, kid=True), F(1850), 0.1)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
