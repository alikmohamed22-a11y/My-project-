# Stems for "Teddy bear origin": warm 1902 ragtime (banjo + piano-ish pluck + tuba), swamp ambience, hush on "said no", toy-box sparkle ending.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, chalk, bonk
DUR = 54.0; N = ns(DUR); m2f = I.m2f
BPM = 118.0; B = 60.0 / BPM
STOPS = [(23.5, 25.3)]
SWAMP = (8.6, 15.0)
def silent(t): return any(a <= t < b for a, b in STOPS)
def music():
    buf = np.zeros((2, N)); r = rng(11)
    prog = [[60, 64, 67], [57, 60, 64], [62, 65, 69], [55, 59, 62]]       # C Am Dm G
    tub = [36, 33, 38, 31]; mel = [72, 74, 76, 79, 76, 74, 72, 67]
    t, k = 0.15, 0
    while t < 52.4:
        bar = k % 4; soft = SWAMP[0] <= t < SWAMP[1]
        for b in range(4):
            tb = t + b * B
            if silent(tb) or tb > 52.4: continue
            v = 0.55 if soft else 1.0
            if b % 2 == 0: place(buf, pan(I.brass(m2f(tub[bar] + (7 if b == 2 else 0)), 0.32, 0.45 * v, r, kind='tuba'), -0.1), tb)
            else:
                for n in prog[bar]: place(buf, pan(I.pluck(m2f(n), 0.22 * v, r, dur=0.3, bright=0.55), 0.15), tb)   # piano-ish chop
            place(buf, pan(I.pluck(m2f(prog[bar][(b + 1) % 3] + 12), 0.2 * v, r, dur=0.18, bright=0.85), 0.3), tb + B / 2)   # banjo
            if k % 2 == 1 and not soft and t > 25: place(buf, pan(I.glock(m2f(mel[(b + 4 * (k // 2)) % 8]), 0.14, r, dur=0.6), -0.25), tb)
        t += 4 * B; k += 1
    place(buf, I.brass(m2f(43), 0.5, 0.5, r, kind='tuba'), 13.2); place(buf, I.brass(m2f(42), 0.9, 0.5, r, kind='tuba', fall=-3), 13.7)   # "except the President" wah
    place(buf, I.pad([m2f(x) for x in [48, 55, 60, 64]], 2.0, 0.18, r, att=0.4, rel=0.8, warm=900), 23.6)                                 # hush under "said no"
    for i, n in enumerate([60, 64, 67, 72, 76, 79, 84]): place(buf, pan(I.glock(m2f(n + 12), 0.28, r, dur=1.4), 0.2 * (-1) ** i), 51.2 + i * 0.11)   # every kid on Earth
    place(buf, I.pad([m2f(x) for x in [48, 60, 64, 67]], 2.4, 0.22, r, att=0.1, rel=1.4, warm=1400), 52.0)
    return buf
def sfx():
    buf = np.zeros((2, N)); r = rng(23)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    P(ting(r, 2637), 2.0, 0.3)                                                          # "refused"
    P(lp(np.sin(2 * np.pi * 440 * tt(0.9)) * np.exp(-tt(0.9) / 0.6), 2000) * 0.25, 7.2, 0.5)   # hunting horn call
    P(G.bird_chirps(6.0, r, density=0.4), 8.6, 0.3); P(G.crickets(6.0, r), 8.8, 0.15); P(G.breeze(6.0, r, level=0.6), 8.6, 0.3)   # swamp
    P(gentle_whoosh(r, 0.5, 0.4), 15.5, 0.4)                                            # tracked
    P(G.creak(0.6, r, 90, 140), 17.7, 0.4)                                              # rope on tree
    P(ting(r, 3136), 24.0, 0.35)                                                        # "said no"
    P(chalk(r, 1.2), 27.6, 0.35); P(chalk(r, 0.9), 28.9, 0.3)                           # pen on paper
    P(G.push_thump(r), 30.3, 0.5)                                                       # press thump
    P(modal(0.8, [(1760, 1.0, 0.3), (2637, 0.5, 0.2)], r) * 0.35, 31.1, 0.4)             # trolley bell
    P(modal(0.6, [(2349, 1.0, 0.25)], r) * 0.35, 32.3, 0.4)                             # shop door bell
    P(G.rattle(1.6, r, density=26), 36.2, 0.25)                                         # sewing machine
    for k in range(4): P(modal(0.2, [(2093 * (1 + k * 0.12), 1.0, 0.08)], r) * 0.3, 39.8 + k * 0.07, 0.35)   # sign sparkle
    P(G.babble(2.2, r, base=170, scale=1.0), 40.7, 0.15)                                # line forms
    P(bonk(r), 42.2, 0.3); P(bonk(r), 43.4, 0.35)                                        # more, more
    P(gentle_whoosh(r, 0.4, 0.4), 45.2, 0.4); P(modal(0.7, [(1568, 1.0, 0.3), (2093, 0.6, 0.25)], r) * 0.4, 46.7, 0.5)   # sign flip + register ding
    P(G.hurrah(r, 300, 1.2, kid=True), 51.6, 0.2)                                        # kids
    return buf
if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
