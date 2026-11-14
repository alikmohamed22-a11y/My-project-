# Stems for "Napoleon wasn't short": playful French military march (C major, 112 bpm, 2/4 feel: oom-pah tuba, snare rat-a-tat,
# fife tune, glock), a soft respectful pad for the 1821 measuring room, a plucky "explainer" pizzicato for the height chart,
# a cheeky tiptoe (pizz + bassoon-ish tuba) in the London print shop, the full march on the parade ground, grand in the war tent,
# and a light major reprise in the museum. Music stops on the punchlines ("five foot two", "London", "Little Boney", "never beat the
# cartoon", "Napoleon complex"). SFX: drum roll + cymbal, quill scratches, measuring-tape zip, paper pops, crowd laugh, boots, cheers, cannon.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, colored
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, boom, scratch
DUR = 61.0; N = ns(DUR); m2f = I.m2f
B = 60.0 / 112.0
F = lambda fr: fr / 30.0
STOPS = [(F(262), F(290)), (F(730), F(750)), (F(1003), F(1036)), (F(1552), F(1583)), (F(1714), F(1752))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 151, 'march'), (151, 316, 'soft'), (316, 668, 'pizz'), (668, 1085, 'sneak'), (1085, 1440, 'march'), (1440, 1583, 'grand'), (1583, 1830, 'reprise')]
def sec(t):
    for a, b, k in SEC:
        if F(a) <= t < F(b): return k
    return 'reprise'
CUTS = [64, 112, 151, 206, 250, 288, 316, 392, 470, 520, 570, 668, 748, 825, 895, 955, 1000, 1036, 1085, 1150, 1215, 1290, 1365, 1440, 1503, 1583, 1645, 1700]

def music():
    buf = np.zeros((2, N)); r = rng(1769)
    prog = [[60, 64, 67], [55, 59, 62], [60, 64, 67], [55, 59, 62, 65]]          # C G C G7
    bass = [[48, 55], [43, 50], [48, 55], [43, 50]]
    tune = [67, 72, 72, 74, 76, 76, 74, 72, 71, 74, 74, 76, 77, 74, 71, 67]
    t, k = 0.15, 0
    while t < 60.6:
        bar = (k // 4) % 4; beat = k % 4; ch = prog[bar]; s = sec(t)
        if not silent(t):
            if s in ('march', 'grand'):
                g = 1.15 if s == 'grand' else 1.0
                place(buf, pan(I.brass(m2f(bass[bar][beat % 2] - 12), B * 0.45, 0.32 * g, r, kind='tuba'), 0), t)        # oom
                for n in ch[:3]: place(buf, pan(I.pluck(m2f(n), 0.12 * g, r, dur=0.18, bright=0.7), 0.2), t + B / 2)   # pah
                place(buf, pan(I.snare(0.14 if beat % 2 == 0 else 0.08, r, tune=1.1, snappy=0.8), -0.15), t)
                place(buf, pan(I.snare(0.06, r, tune=1.1, snappy=0.8), -0.15), t + B * 0.75)
                if t > F(20) or s == 'grand': place(buf, pan(I.fife(m2f(tune[k % 16] + 12), B * 0.9, 0.09 * g, r), 0.25), t)
                if s == 'grand' and beat == 0: place(buf, pan(I.timpani(m2f(36), 0.3, r, dur=1.0), 0), t)
                if k % 8 == 0: place(buf, pan(I.glock(m2f(ch[2] + 24), 0.08, r, dur=0.6), -0.3), t)
            elif s == 'soft':
                if k % 8 == 0: place(buf, I.pad([m2f(x) for x in [57, 60, 64, 67]], B * 8.2, 0.1, r, att=0.8, rel=1.4, warm=800), t)
                if k % 4 == 2: place(buf, pan(I.glock(m2f([76, 72, 74, 71][(k // 4) % 4]), 0.06, r, dur=1.4), 0.3), t)
            elif s == 'pizz':
                place(buf, pan(I.pluck(m2f(bass[bar][beat % 2]), 0.42, r, dur=0.3, bright=0.35), 0), t)
                place(buf, pan(I.pluck(m2f(ch[beat % 3] + 12), 0.12, r, dur=0.2, bright=0.8), 0.25), t + B / 2)
                place(buf, pan(I.brush(0.12 if beat % 2 else 0.07, r, dur=0.2), -0.15), t)
                if k % 2 == 0: place(buf, pan(I.glock(m2f(tune[(k // 2) % 16] + 12), 0.07, r, dur=0.5), -0.25), t)
            elif s == 'sneak':   # tiptoe: staccato pizz in A minor + low tuba blips
                am = [[57, 60, 64], [53, 57, 60], [52, 56, 59], [57, 60, 64]][bar]
                place(buf, pan(I.pluck(m2f(am[beat % 3]), 0.3, r, dur=0.14, bright=0.5), -0.1), t)
                place(buf, pan(I.pluck(m2f(am[(beat + 1) % 3] + 12), 0.14, r, dur=0.12, bright=0.8), 0.2), t + B / 2)
                if beat == 0: place(buf, pan(I.brass(m2f(am[0] - 12), B * 0.4, 0.22, r, kind='tuba'), 0), t)
                if k % 4 == 3: place(buf, pan(I.glock(m2f(am[2] + 24), 0.05, r, dur=0.4), 0.3), t)
            else:                # reprise: light, major, glock tune + pizz
                place(buf, pan(I.pluck(m2f(bass[bar][beat % 2]), 0.38, r, dur=0.3, bright=0.35), 0), t)
                for n in ch[:3]: place(buf, pan(I.pluck(m2f(n + 12), 0.08, r, dur=0.18, bright=0.8), 0.2), t + B / 2)
                place(buf, pan(I.glock(m2f(tune[k % 16] + 12), 0.1, r, dur=0.6), -0.25), t)
                place(buf, pan(I.brush(0.1, r, dur=0.2, swish=beat % 2 == 0), -0.15), t)
        t += B; k += 1
    # stingers
    place(buf, I.cymbal(0.2, r, dur=1.6), F(43)); place(buf, pan(I.brass(m2f(48), 0.8, 0.3, r, kind='tuba'), 0), F(43))          # NOT short
    place(buf, pan(I.brass(m2f(40), 0.9, 0.3, r, kind='tuba', fall=-5), 0), F(264))                                              # five foot two (honk)
    for i, n in enumerate([60, 64, 67, 72]): place(buf, pan(I.glock(m2f(n + 12), 0.16, r, dur=0.8), 0.1), F(541) + i * 0.07)       # five foot seven
    place(buf, I.pad([m2f(x) for x in [48, 55, 60, 64]], 2.0, 0.14, r, att=0.03, rel=1.2, warm=1300), F(541))
    place(buf, pan(I.brass(m2f(45), 0.7, 0.26, r, kind='tuba', fall=-3), 0), F(734))                                              # London
    place(buf, I.cymbal(0.14, r, dur=1.2), F(1007)); place(buf, pan(I.brass(m2f(43), 0.6, 0.3, r, kind='tuba', fall=-7), 0), F(1007))  # Little Boney
    for i, n in enumerate([67, 72, 76, 79]): place(buf, pan(I.glock(m2f(n + 12), 0.14, r, dur=0.9), 0), F(1382) + i * 0.08)          # affection
    place(buf, pan(I.brass(m2f(36), 1.2, 0.32, r, kind='tuba', fall=-9), 0), F(1556))                                             # never beat the cartoon
    place(buf, I.pad([m2f(x) for x in [48, 55, 60, 64, 67]], 2.2, 0.16, r, att=0.04, rel=1.4, warm=1300), F(1717)); place(buf, I.cymbal(0.18, r, dur=2.0), F(1717))
    for i, n in enumerate([60, 64, 67, 72, 76]): place(buf, pan(I.glock(m2f(n + 12), 0.2, r, dur=1.4), 0.1), F(1752) + i * 0.09)       # button
    return buf

def zip_(r, dur=1.1):
    t = tt(dur); n = len(t); f = 900 + 2600 * (t / dur); x = bp(colored(n, r, slope=-0.3), 1200, 7000) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 40 * t)))
    y = x * np.minimum(1, t / 0.05) * np.exp(-np.maximum(0, t - dur * 0.8) / 0.05) + 0.2 * np.sin(np.cumsum(2 * np.pi * f / SR)) * 0.2; return fades(y / (np.abs(y).max() + 1e-9))
def thud(r, f0=120, dur=0.25):
    t = tt(dur); return fades(np.sin(2 * np.pi * np.cumsum(f0 * (1 + 0.6 * np.exp(-t / 0.02))) / SR) * np.exp(-t / 0.07) + 0.3 * lp(r.standard_normal(len(t)), 900) * np.exp(-t / 0.03))
def laugh(r, dur=1.8, base=170, scale=1.0):
    x = G.babble(dur, r, base=base, scale=scale, rate=7.5, active=0.95); x = np.asarray(x, float); m = x.mean(0) if x.ndim == 2 else x
    t = tt(dur)[:len(m)]; mod = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 4.6 * t)); y = m * mod * np.minimum(1, t / 0.08) * np.exp(-t / (dur * 0.7)); return fades(y / (np.abs(y).max() + 1e-9))
def stamp_hit(r): return thud(r, 90, 0.3)

def sfx():
    buf = np.zeros((2, N)); r = rng(1821)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for c in CUTS: P(gentle_whoosh(r), F(c - 5), 0.26)
    # hook: drum roll into the cymbal on "short"
    for (tt_, v) in I.snare_roll(0.05, F(42), 0.05, 0.35, r): P(I.snare(v, r, tune=1.05, snappy=1.0, dur=0.12), tt_, 0.5, -0.1)
    P(stamp_hit(r), F(72), 0.4); P(paper(r), F(84), 0.35); P(ting(r, 2637), F(90), 0.18)          # tricked + Boney pops off the page
    P(scratch(r), F(118), 0.25, 0.2)                                                              # quill
    P(G.creak(0.8, r, rate0=110, rate1=170), F(160), 0.08, -0.3)                                   # floorboard (St Helena)
    P(zip_(r, 1.1), F(213), 0.32, 0.1)                                                            # measuring tape
    P(stamp_hit(r), F(263), 0.45); P(bonk(r), F(298), 0.25); P(paper(r), F(290), 0.25)            # 5 ft 2 / Tiny?
    P(ting(r, 3136), F(346), 0.2)
    P(G.whoosh(0.9, r, peak=0.4, f_lo=500, f_hi=3000), F(398), 0.2); P(G.whoosh(0.9, r, peak=0.4, f_lo=400, f_hi=2400), F(414), 0.18)  # bars slide out
    for i in range(4): P(G.stroll_step(r, 0.3), F(472 + i * 10), 0.18, 0.2 - 0.1 * i)              # Napoleon walks to the chart
    P(zip_(r, 0.8), F(522), 0.22); P(stamp_hit(r), F(540), 0.45)                                  # marker rises / 5 ft 7
    P(stamp_hit(r), F(733), 0.4)                                                                  # LONDON
    P(scratch(r), F(808), 0.2, 0.2)
    P(stamp_hit(r), F(836), 0.35)
    for f0 in (900, 912, 924, 936): P(scratch(r), F(f0), 0.22, 0.15)                              # drawing him
    for f0 in (960, 968, 976, 984, 992): P(G.boot(r, 0.5), F(f0), 0.22)                           # tantrum stomps
    P(stamp_hit(r), F(1003), 0.45); P(ting(r, 2637), F(1007), 0.2)
    P(laugh(r, 2.2, 170, 1.0), F(1040), 0.5, -0.2); P(laugh(r, 1.8, 240, 1.15), F(1048), 0.35, 0.25)   # Britain loved it
    for i in range(10): P(G.boot(r, 0.8), F(1090 + i * 16), 0.2, -0.2 + 0.04 * i)                  # guard stamps
    P(G.flag_flutter(4.0, r), F(1100), 0.12)
    P(G.hurrah(r, 150, 1.0), F(1344), 0.35, -0.2); P(G.hurrah(r, 135, 0.95), F(1350), 0.3, 0.2)     # "le petit caporal!"
    P(stamp_hit(r), F(1380), 0.35)
    P(boom(r, 0.9), F(1457), 0.35)                                                               # cannon (conquered)
    P(boom(r, 0.6, dur=1.6), F(1493), 0.25)
    P(paper(r), F(1515), 0.35); for_ = [P(G.boot(r, 0.4), F(1520 + i * 8), 0.18) for i in range(5)]  # Boney lands on the map
    P(G.babble(1.4, r, base=260, scale=1.2), F(1600), 0.1)                                       # museum murmur
    P(laugh(r, 1.2, 300, 1.3), F(1658), 0.28)                                                    # kid giggles
    P(paper(r), F(1690), 0.3); P(stamp_hit(r), F(1716), 0.5); P(ting(r, 2637), F(1752), 0.25)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
