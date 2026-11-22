# Stems for "CIA vs Castro's beard": sly Cuban son (clave, bongos, tres pluck, muted trumpet, maracas) in a spy-minor key; stamps for each failed plot.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored
import instruments as I
import sfx_gen as G
from audio import boom, ting, gentle_whoosh, paper, bonk
DUR = 58.6; N = ns(DUR); m2f = I.m2f
BPM = 104.0; B = 60.0 / BPM
STOPS = [(3.2, 3.9), (20.4, 20.9), (26.5, 27.0), (31.7, 32.2), (39.2, 39.8), (56.6, 57.2)]
def silent(t): return any(a <= t < b for a, b in STOPS)
def clave(r): return modal(0.12, [(2400, 1.0, 0.03), (3900, 0.4, 0.02)], r) * 0.5
def bongo(r, hi=True): return modal(0.18, [((420 if hi else 300), 1.0, 0.07), ((690 if hi else 470), 0.4, 0.04)], r) * 0.5
def maraca(r): t = tt(0.08); return fades(hp(r.standard_normal(len(t)), 4000) * np.exp(-t / 0.025) * 0.25, 0.002, 0.02)
def stamp(r): t = tt(0.35); return fades(lp(r.standard_normal(len(t)), 700) * np.exp(-t / 0.05) * 1.1 + np.sin(2 * np.pi * 70 * t) * np.exp(-t / 0.09) * 0.8, 0.001, 0.05)
def boing(r): t = tt(0.6); f = 220 + 160 * np.sin(2 * np.pi * 7 * t) * np.exp(-t / 0.3); return fades(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.25) * 0.5, 0.005, 0.05)
def music():
    buf = np.zeros((2, N)); r = rng(9)
    prog = [[57, 60, 64], [52, 56, 59], [57, 60, 64], [50, 53, 57]]   # Am E Am Dm
    bass = [45, 40, 45, 38]; riff = [69, 72, 71, 69, 67, 69, 64, 0]
    t, k = 0.2, 0
    while t < 57.0:
        bar = k % 4
        for e8 in range(8):
            tb = t + e8 * B / 2
            if silent(tb) or tb > 57.0: continue
            if e8 in (0, 3, 6) and k % 2 == 0 or e8 in (2, 4) and k % 2 == 1: place(buf, pan(clave(r), 0.3), tb)   # 3-2 son clave
            place(buf, pan(maraca(r), -0.35), tb)
            if e8 in (1, 5): place(buf, pan(bongo(r, True), 0.15), tb)
            if e8 in (3, 7): place(buf, pan(bongo(r, False), 0.15), tb)
            if e8 in (0, 3, 6): place(buf, pan(I.pluck(m2f(bass[bar] - 12 + (7 if e8 == 6 else 0)), 0.55, r, dur=0.3, bright=0.25), -0.1), tb)
            n = riff[e8]
            if n and k % 4 in (1, 3) and t > 3.9: place(buf, pan(I.pluck(m2f(n), 0.32, r, dur=0.22, bright=0.7), 0.25), tb)   # tres
        place(buf, I.pad([m2f(x) for x in prog[bar]], 4 * B, 0.08, r, att=0.2, rel=0.5, warm=900), t)
        if k % 8 == 6 and t > 4 and not silent(t): place(buf, pan(I.brass(m2f(76), 0.6, 0.35, r, kind='stab', fall=-2), -0.2), t + B)
        t += 4 * B; k += 1
    for i, n in enumerate([57, 64, 69, 72]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.6), 0.1), 57.2 + i * 0.14)   # ending button
    place(buf, I.pad([m2f(x) for x in [45, 57, 60, 64]], 1.8, 0.2, r, att=0.05, rel=1.0, warm=1200), 57.2)
    return buf
def sfx():
    buf = np.zeros((2, N)); r = rng(31)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    P(gentle_whoosh(r, 0.5, 0.4), 2.3, 0.4); P(ting(r, 2637), 2.9, 0.35)                 # beard falls (hook)
    P(G.babble(4.0, r, base=150, scale=1.0), 5.0, 0.12)                                 # rally crowd
    P(paper(r), 12.4, 0.35)                                                              # the plan
    for k in range(5): P(modal(0.06, [(5200, 1.0, 0.01)], r) * 0.3, 14.6 + k * 0.08, 0.4) # powder sparkle
    P(gentle_whoosh(r, 0.4, 0.3), 16.9, 0.4)
    P(stamp(r), 20.5, 0.7)                                                               # never happened
    P(G.clink(r), 23.4, 0.3); P(paper(r), 23.6, 0.2)                                     # cigar box
    P(stamp(r), 26.6, 0.7)                                                               # never reached him
    P(lp(colored(ns(1.2), r, 0.0), 3000) * 0.08, 28.0, 0.5)                              # spray hiss
    P(stamp(r), 31.8, 0.7)                                                               # never used
    P(G.bubbles(3.0, r, 10), 33.5, 0.35); P(G.water_bed(4.0, r, close=0.6), 33.3, 0.25) # diving
    P(boing(r), 38.3, 0.6)                                                               # rigged to explode (comic)
    P(stamp(r), 39.3, 0.7)                                                               # too impractical
    P(paper(r), 43.8, 0.3); P(ting(r, 3136), 44.0, 0.3)                                  # gift
    for k in range(4): P(modal(0.2, [(2093 * (1 + k * 0.12), 1.0, 0.08)], r) * 0.3, 47.6 + k * 0.07, 0.35)   # clean suit sparkle
    P(G.hammer_hit(r, 0.6), 49.2, 0.4); P(G.hammer_hit(r, 0.6), 49.6, 0.4)              # gavel
    for k in range(8): P(modal(0.05, [(1500, 1.0, 0.02)], r) * 0.4, 50.2 + k * 0.12, 0.35)   # tally marks
    P(G.applause(2.0, r, people=20), 52.0, 0.15)                                         # survived
    return buf
if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
