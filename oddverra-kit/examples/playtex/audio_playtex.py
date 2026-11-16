# [PX-audio] Stems for "The Moon spacesuits were sewn by a bra company": a starry space pad + glock motif for the Moon (hook and the
# July 1969 step), a cool 1960s vibes-and-walking-bass groove for NASA's test hall, a bouncy swing for the sewing floor, a sad tuba fall
# for "kicked off", a ticking countdown that rises through the six-week crunch, a march into the head-to-head trial with a fanfare for
# "by far the best", a mysterious blue pad for the "You see" cutaway, a busy sewing groove for the 21 layers (stops on the bad stitch),
# and a triumphant space fanfare for the giant leap.
# SFX: radio beeps and a low space hum on the Moon, chalk ticks, the stamp thuds, sewing machines whirring, phone ring, a paper rip,
# clock ticks, stiff-suit clanks vs soft-suit swishes, crowd gasp + cheer, accordion-joint squeaks, the layer "flicks", needle taps,
# a leak hiss, the ladder clanks and the bootstep puff, whooshes at every cut.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, chalk, boom, hiss
DUR = 1822 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 116
STOPS = [(F(1470), F(1506))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 126, 'space'), (126, 374, 'lab'), (374, 646, 'swing'), (646, 746, 'down'), (746, 873, 'tick'), (873, 1032, 'march'), (1032, 1258, 'blue'),
       (1258, 1531, 'sew'), (1531, 1671, 'space'), (1671, 1822, 'triumph')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def kickd(vel, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)

def music():
    buf = np.zeros((2, N)); r = rng(1969)
    C, F_, G7, Am, Dm, E7, Fm = [48, 52, 55], [53, 57, 60], [43, 47, 50, 53], [57, 60, 64], [50, 53, 57], [52, 56, 59, 62], [53, 56, 60]
    MEL = [72, 76, 79, 76, 77, 74, 72, 71, 72, 76, 79, 84, 83, 79, 77, 74]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s and not silent(t):
            if s == 'space':
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in ([48, 55, 64, 71] if bar % 4 == 0 else [45, 52, 60, 67])], B * 8, 0.07, r, att=1.0, rel=1.4, warm=1500), t)
                if beat in (0, 2): place(buf, pan(I.glock(m2f([84, 79, 76, 83][(k // 2) % 4]), 0.05, r, dur=1.4), 0.25 if beat else -0.25), t)
            elif s == 'lab':
                ch = [Dm, G7, C, Am][bar % 4]
                place(buf, pan(I.pluck(m2f(ch[beat % len(ch)] - 12), 0.16, r, dur=0.35, bright=0.3, pos=0.3), -0.05), t)                       # walking bass
                place(buf, pan(I.brush(0.08, r), 0.1), t); place(buf, pan(I.brush(0.05, r), 0.1), t + B * 0.66)
                if beat in (0, 2): place(buf, pan(I.vibes(m2f(ch[(beat + bar) % len(ch)] + 24), 0.06, r, dur=0.9), 0.2), t)
            elif s == 'swing':
                ch = [C, Am, Dm, G7][bar % 4]
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.13, r, kind='tuba'), 0), t)
                if beat in (1, 3): place(buf, pan(I.pluck(m2f(ch[1] + 12), 0.09, r, dur=0.2, bright=0.7, pos=0.12), 0.25), t); place(buf, pan(I.snare(0.05, r, dur=0.12), 0.05), t)
                place(buf, pan(I.glock(m2f(MEL[k % 16]), 0.045, r, dur=0.5), -0.15), t + B * 0.66 * (beat % 2))
            elif s == 'down':
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in [53, 56, 60]], B * 8, 0.06, r, att=0.6, rel=1.0, warm=800), t)
                if beat == 2: place(buf, pan(I.pluck(m2f([41, 40][bar % 2]), 0.14, r, dur=0.6, bright=0.3, pos=0.3), 0), t)
            elif s == 'tick':
                rise = (t - F(746)) / F(127); nn = 45 + int(rise * 8)
                place(buf, pan(I.pluck(m2f(nn + (12 if beat % 2 else 0)), 0.12 + 0.06 * rise, r, dur=0.2, bright=0.4, pos=0.25), 0.2 if beat % 2 else -0.2), t)
                place(buf, pan(I.pluck(m2f(nn + 19), 0.06, r, dur=0.15, bright=0.6, pos=0.15), 0.3), t + B / 2)
                if beat == 0: place(buf, pan(kickd(0.2 + 0.1 * rise), 0), t)
            elif s == 'march':
                ch = [C, G7, C, F_, C, G7, C, C][bar]
                place(buf, pan(kickd(0.25 if beat in (0, 2) else 0.12), 0), t); place(buf, pan(I.snare(0.07 if beat in (1, 3) else 0.03, r, dur=0.15), 0.05), t)
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.14, r, kind='tuba'), 0), t)
                if beat == 0: place(buf, pan(I.brass(m2f(MEL[(k // 4) % 16] - 12), B * 1.5, 0.08, r, kind='horn'), 0.15), t)
            elif s == 'blue':
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in ([45, 52, 60, 64] if bar % 4 == 0 else [41, 48, 57, 64])], B * 8, 0.07, r, att=0.8, rel=1.2, warm=1100), t)
                if beat in (1, 3): place(buf, pan(I.vibes(m2f([76, 79, 74, 72][(k // 2) % 4]), 0.05, r, dur=1.2), -0.2), t)
                if beat == 0: place(buf, pan(I.pluck(m2f(33 if bar % 4 < 2 else 29), 0.14, r, dur=0.8, bright=0.25, pos=0.3), 0), t)
            elif s == 'sew':
                ch = [C, F_, G7, C][bar % 4]
                for e in range(2): place(buf, pan(I.pluck(m2f(ch[(beat + e) % 3] + 12), 0.07, r, dur=0.15, bright=0.7, pos=0.12), 0.3 - 0.6 * e), t + e * B / 2)
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.45, 0.12, r, kind='tuba'), 0), t); place(buf, pan(kickd(0.16), 0), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.05, r, dur=0.12), 0.05), t)
                if beat == 0: place(buf, pan(I.glock(m2f(MEL[(k // 4) % 16]), 0.05, r, dur=0.6), -0.15), t)
            elif s == 'triumph':
                ch = [C, F_, G7, C][bar % 4]
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.08, r, att=0.3, rel=1.0, warm=1600), t)
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.6, 0.14, r, kind='tuba'), 0), t); place(buf, pan(I.timpani(m2f(36), 0.12, r, dur=0.8), 0), t)
                place(buf, pan(I.glock(m2f(MEL[(k * 3) % 16]), 0.05, r, dur=0.8), -0.15), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='horn': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.timpani(m2f(33), 0.6, r), 0), F(91)); place(buf, I.cymbal(0.1, r, dur=1.4), F(91)); st([72, 67, 64], F(93), 0.08, 0.14)        # a BRA company!
    for i, nn in enumerate([79, 84, 88]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.9), 0), F(277) + i * 0.07)                           # and bend!
    st([60, 64, 67, 72], F(481), 0.07, 0.15); place(buf, I.cymbal(0.08, r, dur=1.2), F(495))                                                   # bras & girdles
    place(buf, pan(I.brass(m2f(40), 0.9, 0.2, r, kind='tuba', fall=-6), 0), F(695)); place(buf, pan(I.timpani(m2f(31), 0.7, r), 0), F(695))  # kicked off
    place(buf, pan(I.timpani(m2f(36), 0.6, r), 0), F(826)); place(buf, I.cymbal(0.1, r, dur=1.4), F(826))                                      # six weeks
    st([60, 64, 67, 72, 76], F(1006), 0.08, 0.2); place(buf, I.cymbal(0.14, r, dur=2.0), F(1006)); place(buf, pan(I.timpani(m2f(36), 0.7, r), 0), F(1006))  # BEST
    for i, nn in enumerate([76, 79, 84]): place(buf, pan(I.vibes(m2f(nn), 0.1, r, dur=1.2), 0), F(1225) + i * 0.08)                         # accordions
    st([67, 72, 76], F(1348), 0.06, 0.12)                                                                                                       # 21 layers
    place(buf, pan(I.brass(m2f(38), 0.7, 0.18, r, kind='tuba', fall=-5), 0), F(1506))                                                          # a leak
    place(buf, I.cymbal(0.12, r, dur=2.4), F(1531)); place(buf, pan(I.timpani(m2f(33), 0.8, r), 0), F(1531))                                  # July 1969
    st([60, 67, 72], F(1617), 0.12, 0.16); place(buf, I.cymbal(0.1, r, dur=2.0), F(1617))                                                     # the step
    place(buf, pan(I.timpani(m2f(36), 0.8, r), 0), F(1762)); place(buf, I.cymbal(0.14, r, dur=2.6), F(1762)); st([67, 72, 76, 79, 84], F(1764), 0.08, 0.18)  # underwear!
    return buf

def beep(f0=2525.0, dur=0.25):
    t = tt(dur); return fades(np.sin(phase(np.full(len(t), f0))) * 0.3, 0.005, 0.02)
def hum(dur, r):
    n = ns(dur); x = lp(r.standard_normal(n), 160) * 0.8 + np.sin(phase(np.full(n, 55.0))) * 0.08; return fades(x, 0.4, 0.4)
def sewing(dur, r, rate=14.0):
    n = ns(dur); out = np.zeros(n); T = 1 / rate; t = 0.0
    while t < dur - 0.05:
        i = int(t * SR); L = min(int(0.03 * SR), n - i); tc = np.arange(L) / SR
        out[i:i + L] += (bp(r.standard_normal(L), 1500, 6000) * np.exp(-tc / 0.006) * 0.5 + np.sin(2 * np.pi * 900 * tc) * np.exp(-tc / 0.01) * 0.15)
        t += T * (1 + 0.04 * r.standard_normal())
    out += lp(r.standard_normal(n), 300) * 0.08; return fades(out, 0.05, 0.08)
def tick(r):
    t = tt(0.06); return fades(bp(r.standard_normal(len(t)), 2000, 7000) * np.exp(-t / 0.008) * 0.6, 0.0005, 0.01)
def thud(r):
    t = tt(0.3); return fades(np.sin(phase(np.full(len(t), 90.0))) * np.exp(-t / 0.06) * 0.6 + lp(r.standard_normal(len(t)), 600) * np.exp(-t / 0.03) * 0.3, 0.001, 0.05)
def clank(r):
    t = tt(0.5); x = sum(np.sin(phase(np.full(len(t), f))) * a * np.exp(-t / d) for f, a, d in [(420, 0.4, 0.12), (1130, 0.25, 0.08), (2310, 0.12, 0.05)]); return fades(x + bp(r.standard_normal(len(t)), 300, 2000) * np.exp(-t / 0.02) * 0.3, 0.001, 0.05)
def swish(r, dur=0.4):
    t = tt(dur); return fades(bp(r.standard_normal(len(t)), 600, 3000) * np.sin(np.pi * t / dur) * 0.3, 0.01, 0.05)
def squeak(r, f0=900):
    t = tt(0.3); return fades(np.sin(phase(f0 * (1 + 0.3 * np.sin(2 * np.pi * 6 * t)))) * np.exp(-t / 0.15) * 0.25, 0.01, 0.05)
def ring(r, dur=1.2):
    t = tt(dur); g = (np.sin(2 * np.pi * 20 * t) > 0).astype(float); return fades((np.sin(phase(np.full(len(t), 1100.0))) + np.sin(phase(np.full(len(t), 1340.0)))) * 0.15 * g, 0.01, 0.05)
def flick(r):
    t = tt(0.12); return fades(bp(r.standard_normal(len(t)), 1200, 5000) * np.exp(-t / 0.02) * 0.4, 0.001, 0.02)
def sfx():
    buf = np.zeros((2, N)); r = rng(1965)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (126, 297, 374, 569, 746, 873, 1032, 1258, 1400, 1671): P(gentle_whoosh(r), F(f0) - 0.25, 0.26)
    # the Moon: low hum + radio beeps
    for f0, f1 in [(0, 126), (1531, 1822)]: P(hum(F(f1 - f0) + 0.3, r), F(f0) - 0.1, 0.1)
    for t0 in (F(4), F(1534), F(1700)): P(beep(), t0, 0.08, 0.2); P(beep(2525, 0.18), t0 + 0.35, 0.06, 0.2)
    P(thud(r), F(91), 0.3)                                                                                                                   # stamp
    for i in range(3): P(chalk(r, 0.35), F(200) + i * 0.75, 0.12, -0.2)                                                                   # chalk checks
    P(thud(r), F(277), 0.25)
    for i, f0 in enumerate([330, 336, 344, 350]): P(clank(r), F(f0), 0.16, -0.2 + 0.4 * (i % 2))                                          # stiff suits flex
    P(sewing(F(272), r, 13), F(374), 0.12, -0.15)                                                                                          # sewing floor
    P(G.babble(3.0, r, 210, 1.0), F(380), 0.04); P(thud(r), F(481), 0.25); P(ting(r, 2637), F(529), 0.1)
    P(squeak(r, 700), F(592), 0.08)                                                                                                         # doubter's side-eye
    P(paper(r), F(680), 0.16); P(thud(r), F(695), 0.32); P(G.whoa(r), F(698), 0.08)                                                        # kicked off
    P(ring(r), F(756), 0.12, 0.2)                                                                                                          # phone
    for i in range(int((873 - 760) / 30 * 2)): P(tick(r), F(760) + i * 0.5, 0.18, 0.3)                                                   # clock
    P(thud(r), F(826), 0.25); for_ = [P(flick(r), F(840) + i * 0.15, 0.2, 0.25) for i in range(6)]; P(sewing(F(110), r, 18), F(760), 0.1, -0.2)
    P(G.whoosh(0.6, r, 0.4), F(852), 0.14); P(ting(r, 3136), F(866), 0.12)                                                                 # new suit pops in
    for i, f0 in enumerate([892, 900, 912, 920, 930, 945]): P(clank(r), F(f0), 0.14, -0.3 + 0.2 * (i % 2))                                 # stiff suits stall
    for f0 in (895, 915, 942, 962, 980): P(swish(r), F(f0), 0.12, 0.3)                                                                    # soft suit bends
    P(G.babble(2.0, r, 220, 1.0), F(950), 0.05); P(G.hurrah(r, 250, 1.0), F(1008), 0.1); P(G.applause(2.0, r, 30), F(1010), 0.08)
    for i in range(6): P(squeak(r, 1100 + 80 * i), F(1125) + i * 0.27, 0.07, -0.3)                                                       # girdle squeeze
    for f0 in (1170, 1190, 1210, 1230, 1245): P(swish(r, 0.35), F(f0), 0.12, 0.3)                                                          # accordion joints
    P(sewing(F(212), r, 14), F(1258), 0.12, -0.15)
    for i in range(21): P(flick(r), F(1348) + i * 0.075, 0.18, -0.3 + 0.03 * i)                                                          # 21 layers
    for i in range(14): P(tick(r), F(1400) + i * 0.16, 0.12, -0.1)                                                                       # needle taps
    P(bonk(r), F(1472), 0.12); P(hiss(r, 1.1), F(1506), 0.4)                                                                              # bad stitch / leak
    for i in range(6): P(clank(r), F(1540) + i * 0.38, 0.06, 0.2)                                                                          # ladder rungs
    P(G.push_thump(r), F(1622), 0.2); P(G.push_thump(r), F(1690), 0.14); P(G.whoosh(1.0, r, 0.4), F(1735), 0.16); P(G.push_thump(r), F(1772), 0.2)  # steps / leap
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
