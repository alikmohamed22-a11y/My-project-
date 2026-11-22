# Stems for "Statue of Liberty was meant for Egypt": Hijaz-mode oud plucks + fife + frame drum (Egypt), hard stop on "no", sad tuba,
# then a bright D-major brass march for France/America, hush before the twist, majestic finale with glock sparkle.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, chalk, bonk, kick, boom
DUR = 61.0; N = ns(DUR); m2f = I.m2f
B = 60.0 / 108.0
STOPS = [(28.5, 29.4), (49.6, 50.7)]
def silent(t): return any(a <= t < b for a, b in STOPS)
def music():
    buf = np.zeros((2, N)); r = rng(7)
    # --- Egypt: D Hijaz (D Eb F# G A Bb C) ---
    hij = [62, 63, 66, 67, 69, 70, 72, 74]
    riff = [0, 1, 2, 1, 0, 2, 3, 4, 3, 2, 1, 0, 4, 5, 4, 2]
    t, k = 0.15, 0
    while t < 31.0:
        if not silent(t):
            place(buf, pan(I.pluck(m2f(hij[riff[k % 16]]), 0.42, r, dur=0.5, bright=0.75, pos=0.09), -0.25), t)
            if k % 2 == 0: place(buf, pan(I.pluck(m2f(38), 0.5, r, dur=0.6, bright=0.25), 0.0), t)
            if k % 4 == 0: place(buf, kick(0.5, r) * 0.6, t)
            if k % 4 == 2: place(buf, pan(I.snare(0.25, r, tune=0.55, snappy=0.2), 0.15), t)
            if k % 4 == 3: place(buf, pan(I.snare(0.15, r, tune=0.6, snappy=0.1), -0.15), t + B / 2)
        if k % 16 == 8 and t > 3:
            for j, n in enumerate([74, 75, 74, 72, 70, 69]):
                if not silent(t + j * B / 2): place(buf, pan(I.fife(m2f(n), B * 0.48, 0.2, r), 0.2), t + j * B / 2)
        t += B; k += 1
    place(buf, I.pad([m2f(x) for x in [50, 57, 62, 63]], 4.0, 0.16, r, att=1.0, rel=1.2, warm=800), 6.0)      # giant statues
    place(buf, pan(I.brass(m2f(38), 0.7, 0.55, r, kind='tuba'), 0), 29.4)                                     # "no" thud after stop
    for j, n in enumerate([45, 44, 43, 40]): place(buf, pan(I.brass(m2f(n), 0.45 if j < 3 else 0.9, 0.45, r, kind='tuba', fall=(-4 if j == 3 else 0)), 0), 31.3 + j * 0.42)   # crushed wah
    # --- France / America: D major march ---
    prog = [[62, 66, 69], [67, 71, 74], [69, 73, 76], [62, 66, 69]]
    bass = [38, 43, 45, 38]; mel = [74, 76, 78, 81, 79, 78, 76, 74]
    t, k = 33.5, 0
    while t < 49.5:
        bar = (k // 4) % 4
        if not silent(t):
            if k % 2 == 0: place(buf, pan(I.brass(m2f(bass[bar]), B * 0.8, 0.45, r, kind='tuba'), 0), t)
            else:
                for n in prog[bar]: place(buf, pan(I.pluck(m2f(n), 0.14, r, dur=0.25, bright=0.6), 0.2), t)
            place(buf, pan(I.snare(0.18 if k % 2 else 0.12, r, tune=1.0), 0.1), t)
            if t > 38 and k % 2 == 0: place(buf, pan(I.glock(m2f(mel[(k // 2) % 8] + 12), 0.18, r, dur=0.8), 0.3), t)
        if k % 8 == 0 and t > 36: place(buf, pan(I.brass(m2f(mel[(k // 8) % 8]), B * 1.8, 0.35, r, kind='trumpet' if False else 'stab'), -0.2), t)
        t += B; k += 1
    for i, n in enumerate([69, 74, 78]): place(buf, pan(I.brass(m2f(n), 0.5, 0.45, r, kind='stab'), 0), 43.0 + i * 0.12)   # sound familiar?
    place(buf, I.pad([m2f(x) for x in [50, 57, 62, 66]], 0.9, 0.12, r, att=0.3, rel=0.6, warm=600), 49.6)               # hush
    # --- Twist / finale ---
    place(buf, I.timpani(m2f(38), 0.7, r), 50.7)
    place(buf, I.pad([m2f(x) for x in [50, 57, 62, 66, 69]], 9.6, 0.22, r, att=0.6, rel=1.4, warm=1400), 50.8)
    t, k = 50.8, 0
    while t < 59.0:
        place(buf, pan(I.pluck(m2f([62, 66, 69, 74][k % 4] + 12), 0.16, r, dur=0.5, bright=0.7), 0.25), t)
        if k % 4 == 0: place(buf, pan(I.brass(m2f(bass[(k // 4) % 4]), B * 1.6, 0.4, r, kind='tuba'), 0), t)
        t += B / 2; k += 1
    place(buf, I.timpani(m2f(38), 0.6, r), 54.9); place(buf, I.cymbal(0.3, r, dur=2.0), 54.9)                            # officially
    for i, n in enumerate([62, 66, 69, 74, 78]): place(buf, pan(I.glock(m2f(n + 12), 0.26, r, dur=1.8), 0.1), 59.3 + i * 0.11)
    place(buf, pan(I.brass(m2f(62), 1.4, 0.5, r, kind='stab'), 0), 59.3)
    return buf
def sfx():
    buf = np.zeros((2, N)); r = rng(23)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    P(boom(r, 0.6, 2.0), 2.1, 0.25)                                                        # EGYPT
    P(gentle_whoosh(r), 3.0, 0.3)
    P(G.breeze(4.0, r, 0.5), 6.0, 0.25)                                                    # desert wind, statues
    P(G.water_bed(3.0, r, 0.4), 11.5, 0.2)                                                 # Suez Canal
    P(paper(r), 13.8, 0.35)                                                                # pitch sketches
    P(ting(r, 2637), 20.0, 0.3)                                                            # torch high
    P(modal(1.5, [(330, 1.0, 1.2), (495, 0.5, 0.9)], r) * 0.3, 22.6, 0.35)                 # lighthouse horn-ish bell
    P(G.clink(r, f0=2200, dur=0.1), 27.4, 0.3); P(G.clink(r, f0=2800, dur=0.1), 27.6, 0.25)   # price: coins
    P(G.push_thump(r), 28.6, 0.6)                                                          # NO
    P(bonk(r), 32.0, 0.3)                                                                  # crushed
    P(ting(r, 3136), 33.6, 0.3)                                                            # kept the idea
    P(gentle_whoosh(r), 34.3, 0.3)                                                         # years later
    P(G.hurrah(r, 220, 1.0), 37.5, 0.25)                                                   # birthday
    P(paper(r), 38.2, 0.4); P(G.breeze(0.5, r, 0.6, bright=2500), 38.5, 0.2)               # dusted off
    P(ting(r, 2637), 42.1, 0.3)                                                            # torch
    P(gentle_whoosh(r, 0.4), 47.5, 0.35)                                                   # side by side
    P(ting(r, 3520), 49.1, 0.3)                                                            # alike
    P(G.applause(3.0, r, people=40), 51.6, 0.18)                                           # 1886 opening
    P(G.water_bed(3.0, r, 0.5), 52.0, 0.15)
    P(modal(2.0, [(220, 1.0, 1.6), (330, 0.5, 1.2)], r) * 0.35, 54.2, 0.35)                # lighthouse beam / foghorn bell
    P(G.hammer_hit(r, 0.8), 54.9, 0.45)                                                    # OFFICIALLY stamp
    P(G.bird_chirps(3.0, r, 0.4, kind='gull') if False else G.bird_chirps(3.0, r, 0.4), 56.5, 0.12)
    P(ting(r, 2637), 57.2, 0.3)                                                            # job
    return buf
if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
