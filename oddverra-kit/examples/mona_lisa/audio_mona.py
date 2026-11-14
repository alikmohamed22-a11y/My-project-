# Stems for "Mona Lisa theft": music.wav (Paris musette waltz, sneaky pizzicato for the theft, stops on "Nobody notices",
# full waltz for the frenzy, music box for the 2 years, final cadence on "In France") and sfx.wav.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, phase, colored
import instruments as I
import sfx_gen as G
from audio import boom, ting, gentle_whoosh, paper, clop
DUR = 58.05; N = ns(DUR); m2f = I.m2f
BPM = 168.0; B = 60.0 / BPM; BAR = 3 * B

def accordion(f, dur, vel, r):
    t = tt(dur); y = np.zeros(len(t))
    for d in (1.0, 1.0045, 0.9962):                          # musette: three detuned reeds
        ph = np.cumsum(f * d * (1 + 0.003 * np.sin(2 * np.pi * 5 * t)) / SR); y += 2 * (ph % 1) - 1
    y = bp(y, 300, 3200) * 0.5 + bp(y, 1200, 2600) * 0.25
    env = np.clip(t / 0.03, 0, 1) * np.clip((dur - t) / 0.06, 0, 1)
    return y * env * vel * 0.35

MEL = [(76, 1), (79, 1), (83, 1), (81, 2), (79, 1), (76, 1), (74, 1), (72, 1), (71, 3), (72, 1), (74, 1), (76, 1), (79, 2), (76, 1), (74, 3)]
CH = [[45, 52, 57], [45, 52, 57], [43, 50, 55], [43, 50, 55], [41, 48, 53], [40, 47, 52], [40, 44, 47], [45, 52, 57]]   # Am Am G G F E E7 Am

def waltz(buf, t0, t1, r, vel=0.8, melody=True):
    t, bar, mi, mt = t0, 0, 0, t0
    while t < t1 - 0.05:
        ch = CH[bar % 8]
        place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.8 * vel, r, dur=0.45, bright=0.25), -0.1), t)
        for b in (1, 2):
            if t + b * B < t1: place(buf, pan(accordion(m2f(ch[1] + 12), 0.22, 0.45 * vel, r) + accordion(m2f(ch[2] + 12), 0.22, 0.4 * vel, r), 0.15), t + b * B)
        t += BAR; bar += 1
    if melody:
        while mt < t1 - 0.2:
            n, d = MEL[mi % len(MEL)]; place(buf, pan(accordion(m2f(n), d * B * 0.95, 0.9 * vel, r), 0.05), mt); mt += d * B; mi += 1

def music():
    buf = np.zeros((2, N)); r = rng(9)
    waltz(buf, 0.2, 13.0, r, 0.75)                                   # hook + Paris 1911
    t = 13.0                                                         # sneaky pizzicato (theft)
    seq = [57, 0, 60, 0, 64, 0, 63, 0, 62, 0, 59, 0]
    k = 0
    while t < 28.6:
        n = seq[k % len(seq)]
        if n: place(buf, pan(I.pluck(m2f(n - 12), 0.55, r, dur=0.25, bright=0.6), 0.2 * ((k % 2) * 2 - 1)), t)
        if k % 4 == 0: place(buf, pan(I.pluck(m2f(33), 0.6, r, dur=0.4, bright=0.2), 0), t)
        t += B; k += 1
    place(buf, I.pad([m2f(45), m2f(52)], 3.0, 0.15, r, att=0.6, rel=0.6, warm=500), 28.8)   # hush on "Nobody notices"
    place(buf, I.cymbal(0.5, r, dur=2.0), 31.4); place(buf, pan(I.timpani(m2f(33), 0.8, r, dur=1.4), 0), 31.75)
    waltz(buf, 31.75, 41.9, r, 0.95)                                 # the world loses its mind
    for k, n in enumerate([76, 72, 69, 72, 76, 74, 71, 74, 76, 72, 69, 64]):   # music box: two years in a trunk
        place(buf, pan(I.musicbox(m2f(n + 12), 0.4, r, dur=1.2), 0.2), 42.0 + k * 0.45)
    place(buf, I.pad([m2f(n) for n in [45, 52, 57, 60]], 5.4, 0.12, r, att=0.5, rel=0.8, warm=700), 42.0)
    for k in range(8): place(buf, pan(I.pluck(m2f([69, 72, 76, 72][k % 4]), 0.5, r, dur=0.3, bright=0.8), 0.3), 51.0 + k * 0.17 * 2)   # mandolin-ish
    waltz(buf, 53.6, 57.3, r, 0.9)                                   # payoff
    for n in [45, 52, 57, 61, 64]: place(buf, pan(accordion(m2f(n + 12), 1.2, 0.5, r), 0), 57.3)    # final A major cadence "In France."
    place(buf, I.timpani(m2f(33), 0.6, r, dur=1.2), 57.3)
    return buf

def whistle_police(r, dur=0.9):
    t = tt(dur); f = 2400 + 300 * np.sign(np.sin(2 * np.pi * 22 * t))
    return fades(np.sin(np.cumsum(2 * np.pi * f / SR)) * 0.3 + bp(r.standard_normal(len(t)), 2000, 3500) * 0.08, 0.02, 0.1)

def sfx():
    buf = np.zeros((2, N)); r = rng(33)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    P(ting(r, 2637), 4.2, 0.4)                                                     # "stole it."
    P(G.breeze(8.0, r, 0.4), 5.0, 0.2); P(G.bird_chirps(7.5, r, 0.3), 5.0, 0.15)  # Paris
    for k in range(10): P(clop(r), 5.4 + k * 0.42, 0.25, -0.4)                    # horse cab
    P(lp(colored(ns(9), r, 1.0), 700) * 0.15, 13.0, 0.5)                           # empty museum air
    for k in range(14): P(G.stroll_step(r, 0.2), 16.0 + k * 0.42, 0.35, 0.1 * np.sin(k))
    P(G.creak(0.6, r, 120, 180), 22.6, 0.45); P(gentle_whoosh(r, 0.4, 0.2), 23.2, 0.4)       # painting off the wall
    P(G.wood_crack(r), 25.3, 0.5); P(G.wood_crack(r), 25.55, 0.4)                             # frame off in the stairwell
    P(G.creak(0.8, r, 70, 110), 27.8, 0.5); P(G.push_thump(r), 28.6, 0.4)                     # door
    P(G.babble(10.0, r, base=150, scale=1.0), 31.8, 0.18); P(G.applause(1.2, r, people=20), 31.8, 0.15)
    for k in range(4): P(paper(r), 34.6 + k * 0.3, 0.5)                                       # newspapers
    for k in range(5): P(modal(0.2, [(3200, 1.0, 0.02)], r) + hp(r.standard_normal(ns(0.2)), 3000) * np.exp(-tt(0.2) / 0.03) * 0.5, 37.6 + k * 0.6, 0.35)   # camera flash pops
    P(G.creak(1.0, r, 60, 90), 43.6, 0.5); P(G.creak(0.6, r, 90, 140), 45.0, 0.4)            # trunk lid + false bottom
    P(whistle_police(r), 48.2, 0.5); for_step = [48.6, 48.9, 49.2, 49.5]
    for tc in for_step: P(G.stroll_step(r, 0.4), tc, 0.4)
    P(I.triangle(0.5, r, dur=1.4, f=2093), 51.1, 0.4)
    P(ting(r, 2637), 57.35, 0.5); P(G.applause(1.6, r, people=30), 57.4, 0.25)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
