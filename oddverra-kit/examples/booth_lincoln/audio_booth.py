# Stems for "Booth saved Lincoln's son": fife & drum + train-chug bed, hush at Ford's Theatre, warm resolve, wry ending.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, phase, colored
import instruments as I
import sfx_gen as G
from audio import boom, ting, gentle_whoosh, paper
DUR = 59.8; N = ns(DUR); m2f = I.m2f
BPM = 112.0; B = 60.0 / BPM
T_TRAIN = (11.0, 23.0); T_FORDS = 34.2; T_CRUSH = 40.6; T_LATER = 48.6; T_END = 55.3

def chug(r, dur=0.18):
    t = tt(dur); return fades(bp(r.standard_normal(len(t)), 200, 1800) * np.exp(-t / 0.05) * 0.6, 0.002, 0.03)

def music():
    buf = np.zeros((2, N)); r = rng(17)
    tune = [(0, 67, 1), (1, 72, 1), (2, 72, 0.5), (2.5, 74, 0.5), (3, 76, 1), (4, 74, 1), (5, 72, 1), (6, 71, 2)]
    t = 0.2
    while t < T_FORDS - 0.3:                                        # fife & drum march, quieter under the train
        v = 0.45 if T_TRAIN[0] < t < T_TRAIN[1] else 0.75
        for b in range(4):
            place(buf, pan(I.snare(0.3 * v, r, dur=0.2), 0.1), t + b * B)
            if b % 2: place(buf, pan(I.snare(0.18 * v, r, dur=0.12), 0.1), t + b * B + B / 2)
        place(buf, I.timpani(m2f(36), 0.35 * v, r, dur=0.6), t)
        place(buf, I.pad([m2f(48), m2f(55), m2f(60)], 4 * B, 0.12 * v, r, att=0.2, rel=0.4, warm=900), t)
        if t < T_TRAIN[0] or t > T_TRAIN[1]:
            for (o, n, d) in tune: place(buf, pan(I.fife(m2f(n), d * B * 0.9, 0.5 * v, r), -0.1), t + o * B * 0.5 + (0 if int(t / (4 * B)) % 2 == 0 else 2 * B))
        t += 4 * B
    i0, i1 = ns(T_FORDS), ns(T_FORDS + 0.3); buf[:, i1:] = 0; buf[:, i0:i1] *= np.linspace(1, 0, i1 - i0)
    place(buf, I.pad([m2f(31), m2f(38)], T_CRUSH - T_FORDS, 0.32, r, att=0.6, rel=1.0, warm=350), T_FORDS)   # dark drone
    place(buf, I.timpani(m2f(31), 0.7, r, dur=2.4), 39.6)
    for k, ch in enumerate([[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]]):                    # warm resolve: comfort
        place(buf, I.pad([m2f(n) for n in ch + [ch[0] + 12]], 2.1, 0.22, r, att=0.4, rel=0.8, warm=1300), T_CRUSH + 0.3 + k * 2.0)
    for k, n in enumerate([72, 76, 79, 77, 76, 74, 72]): place(buf, pan(I.glock(m2f(n), 0.25, r, dur=1.2), 0.2), T_CRUSH + 1.2 + k * 0.95)
    for k in range(10): place(buf, pan(I.pluck(m2f([48, 55, 52, 55][k % 4]), 0.5, r, dur=0.4, bright=0.4), -0.1), T_LATER + k * 0.65)   # tense pluck
    for (o, n, d) in tune: place(buf, pan(I.fife(m2f(n), d * B * 0.9, 0.45, r), 0), T_END + o * B * 0.5)                    # wry reprise
    place(buf, I.timpani(m2f(36), 0.5, r, dur=1.4), T_END + 4 * B)
    return buf

def sfx():
    buf = np.zeros((2, N)); r = rng(41)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    P(G.babble(13.0, r, base=140, scale=1.0), 7.8, 0.18)                          # platform crowd
    t = 9.0
    while t < 20.6: P(chug(r), t, 0.45, -0.2); t += max(0.16, 0.55 - (t - 9.0) * 0.03)   # engine chugging, speeding up
    P(G.whistle_steam(1.2, r) if hasattr(G, 'whistle_steam') else lp(np.sin(np.cumsum(2 * np.pi * np.full(ns(1.2), 520.0) / SR)) + 0.6 * np.sin(np.cumsum(2 * np.pi * np.full(ns(1.2), 660.0) / SR)), 3000) * np.exp(-tt(1.2) / 0.9) * 0.3, 14.6, 0.5)
    P(G.creak(0.8, r, 60, 100), 15.2, 0.5); P(G.stroll_step(r, 0.9), 16.9, 0.6); P(gentle_whoosh(r, 0.5, 0.5), 17.0, 0.6)   # slip
    P(G.push_thump(r), 20.3, 0.7); P(G.oof(r, 'oof') if hasattr(G, 'oof') else G.push_thump(r), 22.5, 0.4)           # yank back
    P(ting(r, 2637), 26.8, 0.4)                                                    # recognizes Edwin
    P(G.babble(2.0, r, base=180, scale=1.1), 30.2, 0.12)
    P(paper(r), 35.0, 0.3); P(lp(colored(ns(5.0), r, 1.0), 300) * 0.25, 34.5, 0.5) # theatre hush
    P(boom(r, 0.35, 1.2), 39.15, 0.55); P(gentle_whoosh(r, 0.6, 0.4), 39.1, 0.5)   # muffled cut (no gunshot on screen)
    P(paper(r), 43.5, 0.4); P(paper(r), 43.8, 0.3)                                 # letter
    for k in range(3): P(modal(0.3, [(2093, 1.0, 0.05)], r) * 0.3, 49.5 + k * 1.1, 0.4)
    P(boom(r, 0.25, 0.8), 51.9, 0.4); P(boom(r, 0.25, 0.8), 54.6, 0.4)
    P(paper(r), 57.6, 0.5); P(ting(r, 3136), 59.1, 0.4)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
