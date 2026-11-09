# Stems for "The Chef Résumé" Ep1: bouncy pizzicato comedy bed, fancy vibes for Lumière, record-scratch stops, kitchen chaos SFX.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored
import instruments as I
import sfx_gen as G
from audio import boom, ting, gentle_whoosh, paper, scratch, hiss, bonk, buzzer
DUR = 54.6; N = ns(DUR); m2f = I.m2f
BPM = 124.0; B = 60.0 / BPM
STOPS = [(9.9, 10.6), (25.6, 26.4), (42.7, 45.9), (46.9, 47.3), (49.6, 50.7)]   # music drops out for punchlines
FANCY = (3.0, 7.6)

def silent(t): return any(a <= t < b for a, b in STOPS)

def music():
    buf = np.zeros((2, N)); r = rng(5)
    prog = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]]
    bass = [36, 33, 29, 31]; mel = [72, 74, 76, 79, 76, 74, 72, 71]
    t, k = 0.15, 0
    while t < 54.0:
        bar = k % 4
        fancy = FANCY[0] <= t < FANCY[1]
        for b in range(4):
            tb = t + b * B
            if silent(tb) or tb > 54.0: continue
            if fancy:
                place(buf, pan(I.vibes(m2f(prog[bar][b % 3] + 24), 0.28, r, dur=1.0), 0.25 * (-1) ** b), tb)
            else:
                place(buf, pan(I.pluck(m2f(bass[bar] + (12 if b % 2 else 0)), 0.55, r, dur=0.25, bright=0.3), -0.15), tb)
                place(buf, pan(I.pluck(m2f(prog[bar][(b + 1) % 3] + 12), 0.32, r, dur=0.18, bright=0.6), 0.2), tb + B / 2)
                if b in (1, 3): place(buf, pan(I.brush(0.25, r, dur=0.15), 0.1), tb)
                if k % 2 == 1 and t > 10: place(buf, pan(I.glock(m2f(mel[(b + 4 * (k // 2)) % 8]), 0.16, r, dur=0.5), 0.3), tb)
        if fancy: place(buf, I.pad([m2f(n + 12) for n in prog[bar]], 4 * B, 0.18, r, att=0.3, rel=0.6, warm=1500), t)
        t += 4 * B; k += 1
    place(buf, pan(I.brass(m2f(43), 0.5, 0.6, r), 0), 8.9); place(buf, pan(I.brass(m2f(42), 0.9, 0.6, r, fall=-3), 0), 9.35)   # "one problem" wah
    for i, n in enumerate([60, 64, 67, 72]): place(buf, pan(I.glock(m2f(n + 12), 0.35, r, dur=1.4), 0.2), 49.7 + i * 0.12)   # end button
    place(buf, I.timpani(m2f(36), 0.5, r, dur=1.4), 50.2)
    for i, n in enumerate([67, 72, 76, 79]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.2), -0.2), 53.9 + i * 0.1)
    return buf

def beep(f, dur, r):
    t = tt(dur); return fades(np.sign(np.sin(2 * np.pi * f * t)) * 0.25, 0.003, 0.01)

def ding(r): return modal(0.6, [(1568, 1.0, 0.25), (2349, 0.6, 0.18)], r) * 0.5
def buzz(r): t = tt(0.35); return fades(bp(np.sin(2 * np.pi * 180 * t) * (np.sin(2 * np.pi * 30 * t) > 0), 120, 900) * 0.5, 0.005, 0.02)
def spark(r, dur=0.9):
    x = np.zeros(ns(dur))
    for _ in range(int(dur * 28)):
        i = r.integers(0, len(x) - 400); x[i:i + 400] += hp(r.standard_normal(400), 2500) * np.exp(-np.arange(400) / 60) * r.uniform(0.3, 1)
    return x * 0.5
def pop(r): t = tt(0.4); return fades(lp(r.standard_normal(len(t)), 1800) * np.exp(-t / 0.05) * 1.2 + np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.08), 0.001, 0.05)
def splat(r): t = tt(0.5); return fades(lp(r.standard_normal(len(t)), 900) * np.exp(-t / 0.12) * 0.7, 0.01, 0.1)

def sfx():
    buf = np.zeros((2, N)); r = rng(29)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    P(buzz(r), 1.0, 0.5); P(ding(r), 1.6, 0.6)                                  # hired
    P(G.babble(4.4, r, base=150, scale=1.0), 3.1, 0.1); P(G.clink(r), 3.9, 0.3); P(G.clink(r), 5.2, 0.25)
    P(ting(r, 2093), 7.0, 0.35)                                                 # two-year waitlist
    P(scratch(r), 9.85, 0.6)                                                    # can't cook
    P(gentle_whoosh(r, 0.4, 0.4), 12.3, 0.5); P(paper(r), 13.6, 0.3)            # résumé
    P(ting(r, 2637), 16.8, 0.35)                                                # technically true
    for k in range(4): P(G.clink(r), 17.8 + k * 0.45, 0.2)                     # eating montage
    for k in range(5): P(modal(0.08, [(3000, 1.0, 0.02)], r) * 0.4, 20.4 + k * 0.25, 0.4)   # stopwatch ticks
    P(G.creak(0.4, r, 80, 120), 22.5, 0.3)
    P(ting(r, 3136), 25.9, 0.4); P(bonk(r), 27.4, 0.45)                         # Oui / no French
    P(gentle_whoosh(r, 0.5, 0.4), 28.0, 0.5); P(G.stroll_step(r, 0.3), 28.7, 0.4); P(G.stroll_step(r, 0.3), 29.1, 0.4)
    P(G.bubbles(2.0, r, 14), 30.6, 0.25)
    P(pop(r), 32.45, 0.9); P(splat(r), 32.7, 0.6)                               # egg explodes
    P(hiss(r, 2.4), 36.2, 0.4)                                                  # dry pot
    for i in range(6): P(beep(3100, 0.18, r), 37.8 + i * 0.34, 0.35)            # smoke alarm
    P(buzz(r), 39.6, 0.6); P(ding(r), 40.1, 0.4)                                # mom
    P(G.creak(0.6, r, 70, 110), 40.7, 0.4); P(G.stroll_step(r, 0.5), 41.3, 0.4); P(G.stroll_step(r, 0.5), 41.8, 0.4)
    P(modal(0.25, [(900, 1.0, 0.06), (1350, 0.5, 0.04)], r) * 0.5, 46.4, 0.5)  # yolk drip
    P(bonk(r), 47.05, 0.35)                                                     # looks back down
    P(bonk(r), 49.6, 0.4)                                                       # 29 days left
    P(gentle_whoosh(r, 0.4, 0.4), 50.7, 0.5)
    for i in range(4): P(ting(r, [1568, 1760, 1976, 2093][i]), 51.4 + i * 0.3, 0.25)
    P(ding(r), 53.0, 0.5)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music_v2.wav", m[:, :N]); write_wav("sfx_v2.wav", s[:, :N]); print("stems", m.shape)
