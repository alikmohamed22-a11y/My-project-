# Stems for "Cleopatra lived closer to the Moon landing than to the pyramids": a playful ancient-Egypt theme (D "Hijaz" flavour:
# D Eb F# G A Bb C, 118 bpm; oud-like plucks, frame-drum doum/tek, finger cymbals, a reedy fife tune), a driving "fast-forward"
# arpeggio for the timeline road (rising, faster), an elegant harp + pad for Alexandria, a space synth (pads with tremolo, vibes
# arps, sub pulse) for 1969, the Egypt tune over the synth pulse for the comparison, and a light major reprise in the classroom.
# Real stops on the punchlines ("pyramids", "big", "69 BC", "1969", "Moon", "...is to you").
# SFX: whooshes on cuts + every timeline sign the camera passes, stone scrape (sledge), thuds on stamps, dings, rocket rumble,
# radio beeps, crowd murmur, kid gasp, marker squeak, sparkle.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, colored
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, boom, scratch
DUR = 64.4; N = ns(DUR); m2f = I.m2f
B = 60.0 / 118.0
F = lambda fr: fr / 30.0
STOPS = [(F(99), F(126)), (F(371), F(394)), (F(697), F(716)), (F(1374), F(1392)), (F(1457), F(1472)), (F(1876), F(1898))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 128, 'egypt'), (128, 185, 'pizz'), (185, 506, 'egypt'), (506, 740, 'ff'), (740, 828, 'pad'), (828, 1071, 'egyptL'), (1071, 1308, 'harp'),
       (1308, 1392, 'ff'), (1392, 1474, 'space'), (1474, 1723, 'mix'), (1723, 1930, 'reprise')]
def sec(t):
    for a, b, k in SEC:
        if F(a) <= t < F(b): return k
    return 'reprise'
CUTS = [52, 96, 128, 185, 239, 300, 397, 432, 506, 608, 663, 740, 828, 872, 948, 1004, 1071, 1139, 1197, 1308, 1374, 1424, 1474, 1534, 1617, 1696, 1723, 1805]
# D hijaz: D Eb F# G A Bb C D
HJ = [62, 63, 66, 67, 69, 70, 72, 74]
TUNE = [0, 2, 3, 4, 3, 2, 1, 0, 4, 5, 4, 3, 2, 3, 1, 0]   # scale degrees
def oud(f, vel, r, dur=0.35): return I.pluck(f, vel, r, dur=dur, bright=0.45, pos=0.12)
def doum(vel, r): t = tt(0.4); return fades(np.sin(2 * np.pi * np.cumsum(90 * (1 + 0.8 * np.exp(-t / 0.015))) / SR) * np.exp(-t / 0.12) * vel)
def tek(vel, r): t = tt(0.12); return fades(bp(r.standard_normal(len(t)), 1800, 6000) * np.exp(-t / 0.02) * vel)
def zill(vel, r): return I.triangle(vel, r, dur=0.9, f=2900.0)

def music():
    buf = np.zeros((2, N)); r = rng(69)
    t, k = 0.12, 0
    while t < DUR - 1.2:
        s = sec(t); beat = k % 4; bar = k // 4
        if not silent(t):
            if s in ('egypt', 'egyptL', 'mix'):
                g = 0.75 if s == 'egyptL' else 1.0
                d = TUNE[k % 16]
                if s != 'mix' or k % 2 == 0: place(buf, pan(oud(m2f(HJ[d] - 12), 0.32 * g, r), -0.2), t)
                place(buf, pan(oud(m2f(HJ[(d + 2) % 7]), 0.12 * g, r, 0.2), 0.25), t + B / 2)
                place(buf, pan(doum(0.5 * g if beat in (0, 2) else 0.0, r), 0), t)
                place(buf, pan(tek(0.18 * g, r), 0.15), t + B / 2); place(buf, pan(tek(0.1 * g, r), -0.1), t + B * 0.75)
                if beat == 0 and bar % 2 == 0: place(buf, pan(zill(0.08 * g, r), 0.3), t)
                if bar % 4 >= 2 and s != 'egyptL': place(buf, pan(I.fife(m2f(HJ[d] + 12), B * 0.9, 0.06 * g, r), 0.2), t)
                if s == 'mix': place(buf, pan(I.pluck(m2f(38), 0.35, r, dur=0.25, bright=0.2), 0), t + B / 2)   # synth-ish sub pulse
                if s == 'mix' and k % 2 == 1: place(buf, pan(I.vibes(m2f(HJ[(d + 4) % 7] + 12), 0.08, r, dur=0.6), -0.3), t)
            elif s == 'pizz':
                place(buf, pan(I.pluck(m2f([50, 57][beat % 2]), 0.38, r, dur=0.3, bright=0.35), 0), t)
                place(buf, pan(I.pluck(m2f([66, 69, 74, 69][beat]), 0.12, r, dur=0.2, bright=0.8), 0.25), t + B / 2)
                place(buf, pan(I.brush(0.1, r, dur=0.2), -0.15), t)
            elif s == 'ff':
                for i in range(4):   # sixteenth arpeggio, rising each bar
                    n = HJ[(i * 2 + bar) % 7] + 12 * (i % 2) + (bar % 4); place(buf, pan(I.pluck(m2f(n), 0.12, r, dur=0.14, bright=0.85), 0.2 - 0.13 * i), t + i * B / 4)
                place(buf, pan(doum(0.55, r), 0), t); place(buf, pan(I.snare(0.07, r, tune=1.2, snappy=0.7), -0.1), t + B / 2)
                if beat == 0: place(buf, pan(I.brass(m2f(38 + bar % 4), B * 0.9, 0.18, r, kind='tuba'), 0), t)
            elif s == 'pad':
                if k % 8 == 0: place(buf, I.pad([m2f(x) for x in [50, 57, 62, 66]], B * 8.2, 0.12, r, att=0.6, rel=1.2, warm=900), t)
                if k % 2 == 0: place(buf, pan(I.glock(m2f(HJ[(k // 2) % 7] + 12), 0.06, r, dur=1.0), 0.3), t)
            elif s == 'harp':
                for i in range(2): place(buf, pan(I.pluck(m2f(HJ[(k * 2 + i) % 7] + (0 if i else -12)), 0.16, r, dur=0.9, bright=0.6, pos=0.3), -0.2 + 0.4 * i), t + i * B / 2)
                if k % 8 == 0: place(buf, I.pad([m2f(x) for x in [50, 57, 62, 66]], B * 8.2, 0.09, r, att=0.8, rel=1.2, warm=1000), t)
                if beat == 0: place(buf, pan(zill(0.05, r), 0.3), t)
            elif s == 'space':
                if k % 4 == 0: place(buf, I.pad([m2f(x) for x in [45, 52, 57, 64, 69]], B * 4.2, 0.13, r, att=0.3, rel=1.0, warm=2200, trem=lambda tt_: 0.75 + 0.25 * np.sin(2 * np.pi * 6 * tt_)), t)
                for i in range(2): place(buf, pan(I.vibes(m2f([69, 72, 76, 79, 81][(k * 2 + i) % 5] + 12), 0.07, r, dur=0.8), 0.3 - 0.6 * i), t + i * B / 2)
                place(buf, pan(I.pluck(m2f(33), 0.4, r, dur=0.3, bright=0.2), 0), t)
            else:   # reprise: D major, light glock + pizz + brush
                ch = [[62, 66, 69], [67, 71, 74], [69, 73, 76], [62, 66, 69]][bar % 4]
                place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.36, r, dur=0.3, bright=0.35), 0), t)
                for n in ch: place(buf, pan(I.pluck(m2f(n), 0.07, r, dur=0.18, bright=0.8), 0.2), t + B / 2)
                place(buf, pan(I.glock(m2f([74, 78, 81, 78, 76, 74, 73, 74][k % 8] + 12), 0.08, r, dur=0.6), -0.25), t)
                place(buf, pan(I.brush(0.09, r, dur=0.2, swish=beat % 2 == 0), -0.15), t)
        t += B; k += 1
    # stingers
    place(buf, I.cymbal(0.14, r, dur=1.2), F(57)); place(buf, I.pad([m2f(x) for x in [57, 64, 69, 76]], 1.2, 0.12, r, att=0.05, rel=0.8, warm=2400), F(57))   # Moon landing (synth hint)
    place(buf, pan(I.brass(m2f(38), 0.9, 0.3, r, kind='tuba', fall=-5), 0), F(99)); place(buf, I.cymbal(0.16, r, dur=1.4), F(99))                            # pyramids?!
    place(buf, pan(I.timpani(m2f(38), 0.4, r, dur=1.2), 0), F(239))                                                                                        # 2560 BC
    place(buf, pan(I.brass(m2f(36), 1.0, 0.34, r, kind='tuba', fall=-3), 0), F(371)); place(buf, pan(I.timpani(m2f(36), 0.45, r, dur=1.4), 0), F(371))  # BIG.
    for i, n in enumerate([62, 66, 69, 74]): place(buf, pan(I.glock(m2f(n + 12), 0.16, r, dur=0.9), 0.1), F(697) + i * 0.07)                              # 69 BC
    place(buf, I.pad([m2f(x) for x in [50, 57, 62, 66]], 1.6, 0.14, r, att=0.03, rel=1.0, warm=1300), F(697))
    for i, n in enumerate([57, 64, 69, 76, 81]): place(buf, pan(I.vibes(m2f(n + 12), 0.14, r, dur=1.0), 0), F(1374) + i * 0.06)                            # 1969
    place(buf, I.cymbal(0.16, r, dur=1.6), F(1457)); place(buf, I.pad([m2f(x) for x in [45, 52, 57, 64, 69]], 1.6, 0.16, r, att=0.04, rel=1.2, warm=2600), F(1457))   # Moon
    place(buf, I.pad([m2f(x) for x in [50, 57, 62, 66, 69]], 2.0, 0.16, r, att=0.04, rel=1.4, warm=1300), F(1877)); place(buf, I.cymbal(0.18, r, dur=2.0), F(1877))   # you!
    for i, n in enumerate([62, 66, 69, 74, 78]): place(buf, pan(I.glock(m2f(n + 12), 0.2, r, dur=1.4), 0.1), F(1898) + i * 0.09)                            # button
    return buf

def thud(r, f0=120, dur=0.25):
    t = tt(dur); return fades(np.sin(2 * np.pi * np.cumsum(f0 * (1 + 0.6 * np.exp(-t / 0.02))) / SR) * np.exp(-t / 0.07) + 0.3 * lp(r.standard_normal(len(t)), 900) * np.exp(-t / 0.03))
def stamp_hit(r): return thud(r, 90, 0.3)
def scrape(r, dur=1.2):   # stone sledge dragging on sand/wood
    t = tt(dur); n = len(t); x = bp(colored(n, r, slope=-0.6), 200, 1600) * (0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 3.2 * t + r.uniform(0, 6)))) + 0.4 * np.resize(np.asarray(G.stick_slip(dur, 38, r), float).ravel(), n)
    x = np.asarray(x, float); return fades(x * np.minimum(1, t / 0.08) * np.minimum(1, (dur - t) / 0.15) / (np.abs(x).max() + 1e-9))
def rumble(r, dur=2.6):
    t = tt(dur); x = lp(colored(len(t), r, slope=-1.0), 260) + 0.3 * bp(r.standard_normal(len(t)), 300, 2000) * np.minimum(1, t / dur)
    return fades(x * np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.4) / (np.abs(x).max() + 1e-9), 0.01, 0.2)
def beep(f=2525.0, dur=0.25):
    t = tt(dur); return fades(np.sin(2 * np.pi * f * t) * 0.6, 0.004, 0.01)
def squeak(r, dur=0.35):
    t = tt(dur); f = 1800 + 600 * np.sin(2 * np.pi * 3 * t); return fades(np.sin(np.cumsum(2 * np.pi * f / SR)) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 14 * t))) * 0.4)
def sparkle(r):
    out = np.zeros(ns(1.0))
    for i, f in enumerate([2637, 3136, 3520, 4186]): y = I.glock(f, 0.25, r, dur=0.5); k = ns(i * 0.06); out[k:k + len(y)] += y[:len(out) - k]
    return out

# sign passes on the two timeline flights (same curves as story_cleo.js)
def smr(a, b, x): t = min(1, max(0, (x - a) / (b - a))); return t * t * t * (t * (t * 6 - 15) + 10)
RZ = lambda y: -(y + 2600) / 100 * 6
zC, zM = RZ(-69), RZ(1969)
fly1 = lambda f: 14 - (14 - (zC + 7)) * smr(506, 738, f)
fly2 = lambda f: (zC + 7) - ((zC + 7) - (zM + 18)) * smr(1306, 1400, f)
def passes(fn, f0, f1):
    out = []
    for y in range(-2600, 2001, 100):
        z = RZ(y)
        for f in range(f0, f1):
            if fn(f) > z >= fn(f + 1): out.append((f, y)); break
    return out

def sfx():
    buf = np.zeros((2, N)); r = rng(2560)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for c in CUTS: P(gentle_whoosh(r), F(c - 5), 0.24)
    P(ting(r, 2637), F(4), 0.16)                                                  # CLEOPATRA board
    for i in range(3): P(beep(2525 if i % 2 == 0 else 2475, 0.18), F(54) + i * 0.24, 0.12, 0.2)   # radio beeps (hook Moon)
    P(stamp_hit(r), F(98), 0.45); P(scrape(r, 1.0), F(100), 0.25, -0.2)
    P(squeak(r), F(140), 0.18, -0.2); P(stamp_hit(r), F(162), 0.4); P(ting(r, 3136), F(166), 0.16)
    P(G.breeze(4.0, r, level=0.6), F(185), 0.18); P(scrape(r, 1.6), F(200), 0.22, -0.3)
    P(stamp_hit(r), F(238), 0.45); P(boom(r, 0.5, dur=1.2), F(240), 0.22)
    P(paper(r), F(305), 0.3); P(stamp_hit(r), F(370), 0.5); P(boom(r, 0.7, dur=1.4), F(371), 0.3)
    P(scrape(r, 1.4), F(398), 0.38, -0.2); P(G.oof(r, 'oof', base=150), F(415), 0.2, -0.3); P(G.oof(r, 'oof', base=180), F(425), 0.18, 0.1)   # heave
    P(scrape(r, 2.0), F(436), 0.4, 0.1); P(stamp_hit(r), F(470), 0.4); for_ = [P(thud(r, 70, 0.4), F(f0), 0.35) for f0 in (474, 484, 494)]
    P(G.whoosh(1.2, r, peak=0.5, f_lo=300, f_hi=3200), F(512), 0.3)                                   # fast-forward
    for f, y in passes(fly1, 506, 740) + passes(fly2, 1306, 1400): P(G.whoosh(0.35, r, peak=0.4, f_lo=600, f_hi=4000), F(f) - 0.1, 0.12 if y % 1000 else 0.2, 0.5)
    P(stamp_hit(r), F(609), 0.35); P(stamp_hit(r), F(633), 0.4)
    P(stamp_hit(r), F(696), 0.45); P(sparkle(r), F(700), 0.25)
    P(G.whoosh(0.9, r, peak=0.5, f_lo=200, f_hi=1600), F(748), 0.2); P(ting(r, 2349), F(752), 0.18)
    P(G.breeze(3.0, r, level=0.5), F(830), 0.16); P(stamp_hit(r), F(862), 0.4)
    P(G.babble(2.2, r, base=170, scale=1.0), F(880), 0.12, 0.2); P(sparkle(r), F(902), 0.2)
    P(scratch(r), F(980), 0.22, -0.2); P(scratch(r), F(1012), 0.2, -0.2); P(stamp_hit(r), F(1006), 0.4)
    P(ting(r, 2637), F(1076), 0.14); P(stamp_hit(r), F(1155), 0.45); P(paper(r), F(1210), 0.3); P(sparkle(r), F(1273), 0.25)
    P(G.whoosh(1.2, r, peak=0.5, f_lo=300, f_hi=3200), F(1316), 0.3)
    P(stamp_hit(r), F(1375), 0.45); P(rumble(r, 2.4), F(1384), 0.55); P(boom(r, 0.8, dur=1.6), F(1394), 0.3)                          # rocket
    for i in range(2): P(beep(2525, 0.22), F(1428) + i * 0.3, 0.14, -0.2)                                                             # radio beeps
    P(G.whoosh(0.6, r, peak=0.3, f_lo=200, f_hi=1200), F(1430), 0.15); P(stamp_hit(r), F(1456), 0.45)
    P(G.whoosh(1.0, r, peak=0.5, f_lo=200, f_hi=1600), F(1490), 0.22); P(ting(r, 2349), F(1494), 0.18)
    P(ting(r, 2093), F(1536), 0.18); P(ting(r, 2794), F(1580), 0.18)
    P(sparkle(r), F(1660), 0.22); P(stamp_hit(r), F(1700), 0.4)
    P(squeak(r), F(1740), 0.18, -0.2); P(squeak(r, 0.25), F(1770), 0.15, -0.2)
    P(G.whoa(r), F(1848), 0.25, 0.1); P(stamp_hit(r), F(1876), 0.5); P(sparkle(r), F(1892), 0.28)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
