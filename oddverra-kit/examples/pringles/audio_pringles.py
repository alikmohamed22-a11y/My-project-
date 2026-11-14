# [PR-audio] Stems for "The man who designed the Pringles can is buried in one": a soft curious music-box pluck over a warm pad for the
# hook at the grave, a bouncy 1950s pizzicato + vibes "lab" groove, a twinkly synth arpeggio for the blueprint maths, a jaunty 60s
# strings-and-brass groove for the 1968 launch, a warm living-room waltz-feel for "so proud", a tender pad + vibes for "You see", a
# sneaky pizzicato for the drugstore flavour argument, and a warm golden reprise of the hook tune for the sunset payoff.
# SFX: breeze + birds at the cemetery, lab bubbles, paper, crinkly bag + crumb tinkles, pops as chips appear, chip clicks stacking,
# tube slide + lid pop, a typewriter + rubber stamp, store bustle + register ding, family chuckles, clock ticks, a fluorescent hum,
# bickering murmur, a ding for Original, whooshes at every cut. Gentle, never morbid.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, scratch, engine
DUR = 1758 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 112
STOPS = [(F(1475), F(1489))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 134, 'hook'), (134, 576, 'lab'), (576, 731, 'math'), (731, 888, 'lab'), (888, 984, 'sixties'), (984, 1166, 'home'), (1166, 1301, 'yousee'), (1301, 1521, 'store'), (1521, 1758, 'gold')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def kickd(vel, r, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)
def sq(f, dur, vel, duty=0.25):
    t = tt(dur); x = np.where((t * f) % 1 < duty, 1.0, -1.0) * vel * np.exp(-t / (dur * 0.6)); return fades(lp(x, 4200), 0.002, 0.02)
def box(f, vel, r, dur=1.0): return I.glock(f, vel, r, dur=dur)
def pop(r, f0=900):
    t = tt(0.08); return fades(np.sin(phase(f0 * (1 + 2.0 * np.exp(-t / 0.01)))) * np.exp(-t / 0.025) * 0.6, 0.0005, 0.01)
def click(r):
    t = tt(0.03); return fades(bp(r.standard_normal(len(t)), 2500, 6000) * np.exp(-t / 0.006) * 0.6, 0.0005, 0.005)
def crinkle(dur, r):
    t = tt(dur); x = hp(r.standard_normal(len(t)), 2000) * (r.random(len(t)) < 0.05) * 1.0; return fades(lp(x, 9000) * 0.5, 0.01, 0.05)
def hum(dur, r):
    t = tt(dur); return fades((np.sin(2 * np.pi * 120 * t) * 0.5 + np.sin(2 * np.pi * 240 * t) * 0.2) * 0.15, 0.2, 0.3)
def tick(r):
    t = tt(0.04); return fades(bp(r.standard_normal(len(t)), 1800, 4000) * np.exp(-t / 0.008) * 0.4, 0.0005, 0.005)

def music():
    buf = np.zeros((2, N)); r = rng(1968)
    MEL = [67, 72, 76, 74, 72, 67, 69, 72, 71, 67, 74, 72, 76, 79, 77, 76]          # hook / gold tune (C major, music-box)
    C, F_, G7, Am, Dm, E7 = [48, 52, 55], [53, 57, 60], [43, 47, 50, 53], [57, 60, 64], [50, 53, 57], [52, 56, 59, 62]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s and not silent(t):
            if s in ('hook', 'gold'):
                g = 1.0 if s == 'hook' else 1.1
                if beat in (0, 2): place(buf, pan(box(m2f(MEL[(k // 2) % 16] + 12), 0.1 * g, r, 1.4), 0.15), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in ([48, 55, 60, 64] if bar % 4 == 0 else [45, 52, 57, 64])], B * 8, 0.07, r, att=0.8, rel=1.0, warm=1300), t)
                if s == 'gold' and beat in (1, 3): place(buf, pan(I.pluck(m2f(MEL[(k + 3) % 16] - 12), 0.1, r, dur=0.6, bright=0.4, pos=0.2), -0.2), t)
            elif s == 'lab':
                ch = [C, Am, Dm, G7][bar % 4]
                place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.18, r, dur=0.3, bright=0.3, pos=0.3), 0), t)                     # walking pizz bass
                place(buf, pan(I.pluck(m2f(ch[(beat + 1) % len(ch)] - 12), 0.12, r, dur=0.25, bright=0.3, pos=0.3), 0), t + B / 2)
                if beat in (1, 3): place(buf, pan(I.brush(0.04, r, dur=0.14), 0.1), t)
                if beat == 0: place(buf, pan(I.vibes(m2f(ch[2] + 24), 0.07, r, dur=1.0), -0.2), t)
                if beat == 2: place(buf, pan(I.vibes(m2f(ch[1] + 24), 0.06, r, dur=0.8), 0.2), t + B / 2)
            elif s == 'math':
                ch = [Am, F_, C, G7][bar % 4]
                for e in range(4): place(buf, pan(sq(m2f(ch[(e + beat) % len(ch)] + 24), 0.1, 0.05), 0.2 if e % 2 else -0.2), t + e * B / 4)
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.07, r, att=0.3, rel=0.6, warm=1800, detune=8), t)
                if beat in (0, 2): place(buf, pan(kickd(0.25, r), 0), t)
            elif s == 'sixties':
                ch = [C, Am, Dm, G7][bar % 4]
                place(buf, pan(kickd(0.45 if beat in (0, 2) else 0.22, r), 0), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.15, r, dur=0.2), 0.05), t)
                place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.15, r, kind='tuba'), 0), t)
                for e in range(2): place(buf, pan(I.pluck(m2f(ch[(beat + e) % len(ch)] + 12), 0.1, r, dur=0.2, bright=0.7, pos=0.12), 0.3), t + e * B / 2)
                if beat == 0 and bar % 2 == 0: place(buf, pan(I.brass(m2f(ch[2] + 12), B * 1.5, 0.11, r, kind='horn'), -0.2), t)
            elif s == 'home':
                ch = [F_, C, Dm, G7][bar % 4]
                if beat == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.16, r, dur=0.6, bright=0.3, pos=0.3), 0), t)
                if beat in (1, 2, 3): place(buf, pan(I.pluck(m2f(ch[beat % 3] + 12), 0.08, r, dur=0.35, bright=0.5, pos=0.15), 0.15), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 8, 0.06, r, att=0.6, rel=0.8, warm=1400), t)
                if beat == 2: place(buf, pan(I.vibes(m2f(ch[2] + 24), 0.05, r, dur=1.0), -0.2), t)
            elif s == 'yousee':
                ch = [Am, F_, C, G7][bar % 4]
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.08, r, att=0.6, rel=1.0, warm=1200), t)
                if beat in (0, 2): place(buf, pan(I.vibes(m2f(ch[beat % len(ch)] + 24), 0.06, r, dur=1.4), -0.15), t)
            elif s == 'store':
                ch = [Am, E7, Am, E7][bar % 4]
                place(buf, pan(I.pluck(m2f(ch[beat % len(ch)]), 0.14, r, dur=0.18, bright=0.35, pos=0.3), 0.2 if beat % 2 else -0.2), t)
                place(buf, pan(I.pluck(m2f(ch[(beat + 2) % len(ch)]), 0.09, r, dur=0.14, bright=0.35, pos=0.3), 0.0), t + B / 2)
                if beat == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.16, r, dur=0.4, bright=0.25, pos=0.3), 0), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in ch[:3]], B * 8, 0.04, r, att=0.6, rel=0.6, warm=1000), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='stab': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.vibes(m2f(79), 0.12, r, dur=1.6), 0), F(60))                                                                 # buried in one?!
    place(buf, pan(I.pluck(m2f(55), 0.2, r, dur=0.4, bright=0.4), 0), F(108)); place(buf, pan(I.pluck(m2f(54), 0.2, r, dur=0.6, bright=0.4), 0), F(116))  # well... partly
    place(buf, I.cymbal(0.1, r, dur=1.6), F(134)); place(buf, pan(I.timpani(m2f(36), 0.5, r), 0), F(139))                          # 1950s
    st([60, 64, 67, 72], F(271), 0.07, 0.15, 'horn')                                                                                 # fix the chip!
    place(buf, pan(I.brass(m2f(38), 0.7, 0.16, r, kind='tuba', fall=-4), 0), F(406))                                                 # broken crumbs
    for i, nn in enumerate([72, 76, 79, 84]): place(buf, pan(I.glock(m2f(nn), 0.12, r, dur=0.9), 0), F(551) + i * 0.06)           # saddle!
    place(buf, I.cymbal(0.1, r, dur=1.4), F(576)); place(buf, pan(I.vibes(m2f(84), 0.1, r, dur=1.4), 0), F(624))                   # paraboloid
    place(buf, pan(I.timpani(m2f(36), 0.6, r), 0), F(655))                                                                           # sturdy
    for i, nn in enumerate([72, 76, 79, 84, 88]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.8), 0), F(696) + i * 0.08)         # perfectly
    st([64, 67, 72], F(801), 0.08, 0.14, 'horn')                                                                                     # perfect fit
    place(buf, pan(I.timpani(m2f(33), 0.6, r), 0), F(848))                                                                           # 1966
    place(buf, I.cymbal(0.12, r, dur=1.6), F(888)); st([60, 64, 67, 72, 76], F(932), 0.08, 0.2, 'horn'); place(buf, pan(I.timpani(m2f(36), 0.6, r), 0), F(932))  # launched
    st([67, 72, 76], F(1133), 0.08, 0.14, 'horn')                                                                                    # he meant it
    place(buf, pan(I.timpani(m2f(33), 0.35, r), 0), F(1166))                                                                         # you see
    place(buf, pan(I.vibes(m2f(76), 0.08, r, dur=1.8), 0), F(1283))                                                                  # the promise
    place(buf, pan(I.pluck(m2f(64), 0.2, r, dur=0.3, bright=0.5), 0.2), F(1425)); place(buf, pan(I.pluck(m2f(63), 0.2, r, dur=0.3, bright=0.5), -0.2), F(1433))  # argued
    st([60, 64, 67, 72, 76], F(1491), 0.08, 0.2, 'horn'); place(buf, I.cymbal(0.12, r, dur=1.8), F(1491))                           # ORIGINAL
    place(buf, pan(I.vibes(m2f(72), 0.08, r, dur=1.6), 0), F(1561)); place(buf, pan(I.vibes(m2f(76), 0.08, r, dur=1.6), 0), F(1604))  # can / urn
    st([60, 64, 67, 72, 76], F(1683), 0.1, 0.16, 'horn'); place(buf, I.cymbal(0.12, r, dur=2.4), F(1683)); place(buf, pan(I.timpani(m2f(36), 0.6, r), 0), F(1690))  # buried in his work
    return buf

def sfx():
    buf = np.zeros((2, N)); r = rng(2008)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (134, 309, 441, 576, 731, 810, 888, 984, 1166, 1301, 1521): P(gentle_whoosh(r), F(f0) - 0.25, 0.28)
    P(G.breeze(4.6, r, 0.4), F(0), 0.1); P(G.bird_chirps(4, r, 0.4), F(4), 0.07)
    P(pop(r, 700), F(62), 0.3, 0.2); P(G.whoa(r), F(64), 0.08)                                                                       # chippy pops up
    P(G.babble(5.0, r, 190, 1.0), F(140), 0.03); for_ = [P(G.stroll_step(r, 0.5), F(205) + i * 0.45, 0.1, 0.3) for i in range(5)]
    P(paper(r), F(262), 0.14, 0.2)                                                                                                    # memo handed over
    P(crinkle(1.2, r), F(312), 0.2, 0.2); P(crinkle(0.8, r), F(354), 0.16, 0.2)
    for i in range(14): P(tick(r), F(400) + i * 0.05 + r.random() * 0.03, 0.2, 0.1)                                                 # crumbs tinkle
    for i in range(8): P(pop(r, 800 + i * 60), F(466) + i * 0.24, 0.18, -0.2 + i * 0.05)                                              # chips pop into the mould
    for i in range(14): P(click(r), F(666) + i * 0.13, 0.16, 0.15)                                                                   # chips stacking
    P(G.push_thump(r), F(655), 0.2)
    P(scratch(r), F(772), 0.12); P(pop(r, 500), F(805), 0.3)                                                                          # slide in / lid pop
    for i in range(12): P(tick(r), F(818) + i * 0.09, 0.22, 0.2)                                                                     # typewriter
    P(G.push_thump(r), F(848), 0.32)                                                                                                  # rubber stamp
    P(G.babble(3.2, r, 200, 1.0, rate=4.2), F(888), 0.06); P(ting(r, 2093), F(905), 0.12, -0.3); P(G.hurrah(r, 320, 1.0, kid=True), F(934), 0.1)
    for i in range(10): P(tick(r), F(990) + i * 1.0, 0.07, -0.3)                                                                     # mantel clock
    P(G.hurrah(r, 240, 0.9), F(1107), 0.1); P(G.hurrah(r, 300, 0.7), F(1112), 0.07)                                                  # chuckles
    P(G.crickets(4.4, r), F(1166), 0.03); for_ = [P(tick(r), F(1170) + i * 1.0, 0.05, -0.3) for i in range(4)]
    P(hum(5.8, r), F(1301), 0.12); P(ting(r, 2637), F(1305), 0.06)                                                                    # fluorescent hum + door chime
    P(G.babble(1.6, r, 160, 1.0, rate=4.0), F(1425), 0.1, 0.2); P(G.babble(1.4, r, 230, 1.0, rate=4.4), F(1430), 0.09, -0.2)       # bickering
    P(ting(r, 3136), F(1491), 0.16); P(G.hurrah(r, 280, 0.8), F(1496), 0.07)
    P(G.breeze(8.0, r, 0.4), F(1521), 0.1); P(G.bird_chirps(7, r, 0.3), F(1530), 0.06)
    P(ting(r, 2093), F(1561), 0.08); P(ting(r, 2349), F(1604), 0.08); P(ting(r, 3136), F(1700), 0.12)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
