# Stems for "Acoustic Kitty": music.wav (60s spy jazz, stops at the taxi, light reprise for the payoff) and sfx.wav.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, phase, colored
import instruments as I
import sfx_gen as G
from audio import boom, ting, gentle_whoosh, honk, scratch, paper, chalk, engine, hiss

DUR = 55.85
N = ns(DUR)
m2f = I.m2f
BPM = 126.0; B = 60.0 / BPM
STOP = 41.55          # music cuts as the taxi arrives
REPRISE = 53.45       # cosy reprise under the payoff line

# Em spy vamp: Em - Em - C - B7 (walking bass), vibes stabs, brushes, brass hits on bar 4
CH = [[40, 43, 47], [40, 43, 47], [36, 40, 43], [35, 39, 42]]
BASS = [[40, 43, 47, 46], [40, 38, 35, 38], [36, 40, 43, 40], [35, 39, 42, 39]]

def music():
    buf = np.zeros((2, N)); r = rng(5); t, bar = 0.25, 0
    while t < STOP - 0.05:
        ch = CH[bar % 4]; quiet = 30.4 < t < 34.0
        v = 0.55 if quiet else 0.8
        for b in range(4):
            tb = t + b * B
            if tb >= STOP - 0.05: break
            sw = 0.06 if b % 2 else 0.0
            place(buf, pan(I.pluck(m2f(BASS[bar % 4][b] - 12), 0.85 * v, r, dur=0.5, bright=0.25), -0.1), tb + sw)
            place(buf, pan(I.brush(0.35 * v, r, dur=0.3, swish=(b % 2 == 0)), 0.2), tb)
            if b % 2 == 1: place(buf, pan(I.snare(0.18 * v, r, dur=0.15, snappy=0.4), 0.15), tb + sw)
        for k, off in enumerate([0.5, 2.5] if bar % 2 == 0 else [1.5, 3.0]):
            if t + off * B < STOP - 0.1:
                for n in ch: place(buf, pan(I.vibes(m2f(n + 24), 0.22 * v, r, dur=0.9), 0.3), t + off * B)
        if bar % 4 == 3 and t + 3 * B < STOP:
            for n in [47, 51, 54]: place(buf, pan(I.brass(m2f(n), 0.35, 0.45 * v, r, kind="horn"), -0.2), t + 3 * B)
        t += 4 * B; bar += 1
    i0, i1 = ns(STOP), ns(STOP + 0.06); buf[:, i1:] = 0; buf[:, i0:i1] *= np.linspace(1, 0, i1 - i0)
    place(buf, I.pad([m2f(28), m2f(35)], REPRISE - STOP, 0.25, r, att=0.3, rel=0.8, warm=380), STOP + 0.4)
    for k, n in enumerate([64, 67, 71, 69, 67, 64]):
        place(buf, pan(I.vibes(m2f(n), 0.3, r, dur=1.4), 0.15), REPRISE + 0.2 + k * B)
    place(buf, I.pad([m2f(n) for n in [40, 43, 47, 52]], DUR - REPRISE, 0.16, r, att=0.6, rel=1.2, warm=900), REPRISE)
    return buf

def meow(r, f0=620, dur=0.55, happy=False):
    t = tt(dur); x = t / dur
    f = f0 * (1 + 0.45 * np.sin(np.pi * np.clip(x * 1.1, 0, 1)) - (0 if happy else 0.15 * x)) * (1 + 0.012 * np.sin(2 * np.pi * 6 * t))
    saw = 2 * ((np.cumsum(f / SR)) % 1) - 1
    y = bp(saw, 600, 1500) * 0.8 + bp(saw, 1900, 3200) * 0.35
    return fades(y * np.sin(np.pi * x) ** 0.6 * 0.6, 0.01, 0.06)

def purr(r, dur=1.6):
    t = tt(dur); n = lp(r.standard_normal(len(t)), 260)
    return fades(n * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 26 * t))) * 1.4, 0.15, 0.3)

def screech(r, dur=0.9):
    t = tt(dur); f = 1900 + 500 * np.sin(2 * np.pi * 9 * t)
    y = np.sin(np.cumsum(2 * np.pi * f / SR)) * 0.3 + bp(r.standard_normal(len(t)), 1500, 5000) * 0.35
    return fades(y, 0.02, 0.15)

def beep(r, f=1760, dur=0.09):
    t = tt(dur); return fades(np.sin(2 * np.pi * f * t) * 0.3, 0.003, 0.02)

def typewriter(r, t0, t1, P):
    t = t0
    while t < t1:
        tk = tt(0.06); P(modal(0.06, [(r.uniform(1800, 2600), 1.0, 0.008), (900, 0.5, 0.01)], r) * 0.7, t, 0.5, 0.2); t += r.uniform(0.07, 0.14)
    P(I.triangle(0.4, r, dur=0.8, f=2800), t1, 0.4)

def sfx():
    buf = np.zeros((2, N)); r = rng(21)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    # 0-4.6 office: cash piling up
    for k in range(7): P(paper(r), 0.3 + k * 0.42, 0.5, (k % 3 - 1) * 0.3)
    P(ting(r, 2637), 2.9, 0.4); P(meow(r, 700, happy=True), 3.6, 0.35)
    # 4.6-16 city + park
    P(gentle_whoosh(r, 0.6, 0.3), 4.4, 0.6)
    P(G.breeze(11.5, r, 0.5), 4.6, 0.3); P(G.bird_chirps(11.5, r, 0.35), 4.6, 0.2)
    P(lp(colored(ns(11.5), r, 1.0), 400) * 0.25, 4.6, 0.5)
    P(engine(2.5, r, 9), 6.0, 0.25, -0.5); P(honk(r), 8.2, 0.18, 0.6)
    for k in range(6): P(G.stroll_step(r, 0.4), 10.0 + k * 0.45, 0.25)
    P(meow(r, 620), 14.2, 0.5, 0.2)
    # 16.3-24.4 lab + blueprint
    P(gentle_whoosh(r, 0.5, 0.3), 16.1, 0.6)
    for k in range(10): P(beep(r, 1760 if k % 2 else 1320), 16.4 + k * 0.8, 0.4)
    P(lp(colored(ns(8), r, 1.0), 180) * 0.4, 16.3, 0.3)
    for tc in (16.9, 18.4, 20.7): P(chalk(r, 0.8), tc, 0.35); P(I.pluck(1046, 0.5, r, dur=0.3, bright=0.7), tc + 0.05, 0.4)
    # 24.4-30.6 "it's a cat"
    P(meow(r, 560), 25.95, 0.55); for_steps = [26.9, 27.15, 27.4]
    for tc in for_steps: P(G.stroll_step(r, 0.1), tc, 0.15)
    P(lp(r.standard_normal(ns(0.7)), 150) * 0.8, 27.9, 0.4)
    P(purr(r, 2.0), 28.5, 0.45)
    # 30.6-34 van
    P(engine(2.0, r, 8), 30.6, 0.3); P(G.creak(0.7, r, 90, 140), 32.2, 0.5, 0.3); P(G.wood_crack(r), 32.9, 0.2, 0.3)
    P(lp(colored(ns(2.5), r, 1.0), 900) * 0.12, 31.0, 0.6)
    # 34-41.6 park + taxi
    P(G.breeze(7.0, r, 0.5), 34.0, 0.3); P(G.bird_chirps(5.0, r, 0.35), 34.0, 0.2)
    for k in range(8): P(G.stroll_step(r, 0.05), 36.5 + k * 0.32, 0.12)
    P(engine(3.0, r, 12), 38.8, 0.45, 0.6); P(honk(r), 40.6, 0.55, 0.5); P(screech(r, 0.9), 40.85, 0.5)
    P(gentle_whoosh(r, 0.4, 0.5), 41.5, 0.8); P(ting(r, 3520), 41.7, 0.45)
    # 42-48.5 "never happened": record scratch, purr, yawn
    P(scratch(r), 41.95, 0.8); P(purr(r, 1.8), 45.2, 0.5); P(meow(r, 640, 0.7, happy=True), 45.4, 0.45)
    P(meow(r, 480, 0.9), 47.2, 0.35)
    # 48.5-53.6 report + stamp
    P(gentle_whoosh(r, 0.5, 0.25), 48.3, 0.5); typewriter(r, 48.7, 51.0, P)
    P(boom(r, 0.5, 0.8), 52.0, 0.7); P(G.wood_crack(r), 52.01, 0.4); P(I.timpani(m2f(31), 0.6, r, dur=1.0), 52.0, 0.5)
    # 53.6-55.85 living room
    for k in range(5): P(modal(0.1, [(2400, 1.0, 0.01)], r) * 0.4, 53.7 + k * 0.5, 0.3)
    P(purr(r, 2.0), 53.8, 0.5); P(meow(r, 700, 0.45, happy=True), 55.0, 0.35)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx()
    write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape, s.shape)
