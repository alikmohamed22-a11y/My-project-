# Stems for "The Chef Résumé" Ep3 (Day 3, the risotto): same bouncy pizzicato family as Ep1/Ep2, new key (F), 126 BPM.
# Sections: mandolin tremolo for the "Italian" delivery/plating stretch, music drops for "Bro… that's jam" and the panic beat.
# Cue times are output frames / 30 from web/story_d3.js. Run from this folder: python3 audio_chef_d3.py
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, bonk

LEN = 1470
DUR = round(LEN / 30, 3); N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
D = lambda a, b: (b - a) / 30.0
BPM = 126.0; B = 60.0 / BPM
STOPS = [(F(878), F(936)), (F(1299), F(1326))]   # roommate's line, panic beat
ITALY = (F(1021), F(1177))                       # delivery → plating → photo: mandolin tremolo
DRILL = (F(549), F(603))                         # drill chaos: drums double
def silent(t): return any(a <= t < b for a, b in STOPS)

def music():
    buf = np.zeros((2, N)); r = rng(13)
    prog = [[53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55]]     # F  Dm  Bb  C
    bass = [41, 38, 34, 36]; mel = [77, 81, 84, 81, 79, 77, 76, 79, 81, 84, 86, 84, 81, 79, 77, 76]
    t, k = 0.1, 0
    while t < DUR - 1.4:
        bar = k % 4; ita = ITALY[0] <= t < ITALY[1]; dr = DRILL[0] <= t < DRILL[1]
        for b in range(4):
            tb = t + b * B
            if silent(tb) or tb > DUR - 1.4: continue
            place(buf, pan(I.pluck(m2f(bass[bar] + (12 if b % 2 else 0)), 0.55, r, dur=0.25, bright=0.3), -0.15), tb)
            place(buf, pan(I.pluck(m2f(prog[bar][(b + 1) % 3] + 12), 0.3, r, dur=0.18, bright=0.6), 0.2), tb + B / 2)
            if b in (1, 3): place(buf, pan(I.brush(0.25, r, dur=0.15), 0.1), tb)
            if dr: place(buf, pan(I.snare(0.3, r, dur=0.15), 0.05), tb + B / 2)
            if ita:
                n = mel[(b + 4 * k) % 16]
                for q in range(8): place(buf, pan(I.pluck(m2f(n), 0.16 * (0.8 + 0.2 * (q % 2)), r, dur=0.12, bright=0.9, pos=0.08), 0.3), tb + q * B / 8)
            elif k % 2 == 1 and t > 3.5: place(buf, pan(I.glock(m2f(mel[(b + 4 * (k // 2)) % 16]), 0.15, r, dur=0.5), 0.3), tb)
        t += 4 * B; k += 1
    # stings
    place(buf, pan(I.brass(m2f(45), 0.4, 0.55, r), 0), F(201)); place(buf, pan(I.brass(m2f(44), 0.8, 0.55, r, fall=-3), 0), F(213))   # "never made" wah-wah
    place(buf, pan(I.brass(m2f(41), 0.9, 0.6, r, fall=-5), 0), F(451))                                                               # arm flop
    for i, n in enumerate([65, 69, 72, 77]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.0), 0.2), F(529) + i * 0.06)          # pro hack
    place(buf, pan(I.brass(m2f(47), 0.5, 0.55, r), 0), F(808)); place(buf, pan(I.brass(m2f(46), 0.9, 0.55, r, fall=-4), 0), F(818))   # purple wah-wah
    for i, n in enumerate([53, 57, 60, 65]): place(buf, pan(I.brass(m2f(n), 0.5, 0.45, r), 0), F(956) + i * 0.09)                    # hero fanfare
    for i, n in enumerate([65, 69, 72, 77]): place(buf, pan(I.glock(m2f(n + 12), 0.35, r, dur=1.4), 0.2), F(1333) + i * 0.12)      # 27 days button
    place(buf, I.timpani(m2f(41), 0.5, r, dur=1.4), F(1333) + 0.5)
    env = np.ones(N); tN = np.arange(N) / SR
    for a, b in STOPS: env = np.minimum(env, np.clip(np.maximum((a - tN) / 0.04, (tN - b) / 0.08), 0, 1))
    buf *= env
    for i, n in enumerate([72, 77, 81, 84]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.2), -0.2), DUR - 1.3 + i * 0.1)
    return buf

# ---------------- sfx ----------------
def ding(r): return modal(0.6, [(1568, 1.0, 0.25), (2349, 0.6, 0.18)], r) * 0.5
def chime(r): return modal(0.8, [(1319, 1.0, 0.3), (1976, 0.6, 0.25)], r) * 0.4
def buzz(r): t = tt(0.35); return fades(bp(np.sin(2 * np.pi * 180 * t) * (np.sin(2 * np.pi * 30 * t) > 0), 120, 900) * 0.5, 0.005, 0.02)
def splat(r, big=1.0): t = tt(0.6); return fades((lp(r.standard_normal(len(t)), 900) * np.exp(-t / 0.12) * 0.8 + np.sin(phase(80 * (1 + np.exp(-t / 0.03)))) * np.exp(-t / 0.08) * 0.6) * big, 0.002, 0.1)
def click(r, f=3200): return modal(0.05, [(f, 1.0, 0.006), (f * 2.3, 0.4, 0.003)], r) * 0.6
def tap(r): t = tt(0.06); return fades(bp(r.standard_normal(len(t)), 1500, 6000) * np.exp(-t / 0.006) * 0.8, 0.0005, 0.01)
def beep(f, dur): t = tt(dur); return fades(np.sin(2 * np.pi * f * t) * 0.35, 0.003, 0.01)
def boil(r, dur): t = tt(dur); return fades(G.bubbles(dur, r, 45, 120, 700, (0.02, 0.06)) * 0.9 + lp(colored(len(t), r, 1.0), 400) * 0.15, 0.1, 0.3)
def blorp(r): t = tt(0.25); return fades(np.sin(phase(180 + 260 * t / 0.25)) * np.exp(-t / 0.08) * 0.6, 0.005, 0.03)
def glug(r, dur):   # pour with glug modulation + bubbles
    t = tt(dur); n = r.standard_normal(len(t)); g = 0.5 + 0.5 * np.maximum(0, np.sin(2 * np.pi * 5 * t))
    return fades(bp(n, 200, 1600) * g * 0.6 + G.bubbles(dur, r, 40, 150, 700, (0.01, 0.03)) * 0.8, 0.04, 0.15)
def scrape(r, dur, rate=4.0):   # wooden spoon scraping the pot, rhythmic
    t = tt(dur); n = bp(r.standard_normal(len(t)), 900, 3500); am = 0.3 + 0.7 * np.abs(np.sin(np.pi * rate * t)) ** 2
    return fades(n * am * 0.35, 0.05, 0.1)
def tape_rip(r, dur=0.45):
    t = tt(dur); n = r.standard_normal(len(t)); crack = (r.random(len(t)) < 0.02) * r.standard_normal(len(t)) * 3
    y = bp(n + crack, 1200, 7000) * (0.4 + 0.6 * t / dur) * 0.7; return fades(y, 0.01, 0.06)
def motor(r, dur, f0=180, f1=420, lvl=1.0, down=False):   # drill whine: harmonic saw + gear noise, pitch ramps
    t = tt(dur); k = np.clip(t / min(0.35, dur), 0, 1); f = (f1 + (f0 - f1) * np.clip(t / dur, 0, 1)) if down else (f0 + (f1 - f0) * k)
    ph = phase(f); y = sum(np.sin(ph * h) / h for h in range(1, 7)) * 0.25 + bp(r.standard_normal(len(t)), 2000, 6000) * 0.12 * (0.6 + 0.4 * np.sin(ph * 0.5))
    return fades(y * lvl * (1 - 0.6 * np.clip(t / dur, 0, 1) if down else 1), 0.02, 0.12)
def shutter(r):
    t = tt(0.18); n = bp(r.standard_normal(len(t)), 1500, 6000); env = np.exp(-t / 0.01) + 0.6 * np.exp(-np.maximum(0, t - 0.07) / 0.01) * (t > 0.07)
    return fades(n * env * 0.8, 0.0005, 0.02)
def send_whoosh(r): return G.whoosh(0.35, r, peak=0.08, f_lo=900, f_hi=4200, tail=0.12) * 0.9
def chew(r, dur):
    y = np.zeros(ns(dur)); tm = 0.0
    while tm < dur - 0.1: t = tt(0.09); s = ns(tm); c = fades(lp(r.standard_normal(len(t)), 700) * np.exp(-t / 0.03) * 0.5, 0.002, 0.02); y[s:s + len(c)] += c[:len(y) - s]; tm += 0.2 + r.random() * 0.06
    return y

def sfx():
    buf = np.zeros((2, N)); r = rng(43)
    def P(x, fr, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, F(fr))
    P(gentle_whoosh(r, 0.5, 0.3), 0, 0.4); P(ting(r, 2349), 3, 0.3); P(ding(r), 13, 0.5)            # title + hook text
    P(gentle_whoosh(r, 0.4, 0.25), 35, 0.5); P(buzz(r), 44, 0.6); P(ding(r), 47, 0.4)               # couch buzz
    P(gentle_whoosh(r, 0.4, 0.25), 95, 0.5); P(ding(r), 99, 0.45); P(ding(r), 153, 0.55); P(bonk(r), 160, 0.35)   # "Tonight."
    P(gentle_whoosh(r, 0.4, 0.25), 183, 0.5); P(G.rattle(0.6, r, density=70), 188, 0.35, 0.2)      # rice bag shake
    P(gentle_whoosh(r, 0.4, 0.25), 246, 0.5)
    for k in range(4):
        for i in range(5): P(tap(r), 250 + k * 8 + i * 1.3, 0.35)
        if k < 3: P(beep(330, 0.12), 256 + k * 8, 0.25)                                             # 0 results
    P(ting(r, 2637), 283, 0.35)
    P(gentle_whoosh(r, 0.4, 0.3), 292, 0.5); P(ting(r, 2093), 333, 0.25); P(click(r, 1800), 383, 0.5); P(bonk(r), 384, 0.4)   # recipe
    P(gentle_whoosh(r, 0.4, 0.25), 393, 0.5); P(boil(r, D(395, 475)), 395, 0.5); P(scrape(r, D(395, 450), 4.5), 395, 0.9)    # stirring
    for fr in range(400, 449, 15): P(click(r, 4200), fr, 0.25)
    P(beep(2200, 0.1), 449, 0.4); P(beep(2200, 0.1), 453, 0.4); P(G.push_thump(r), 451, 0.7)       # timer + FLOP
    P(gentle_whoosh(r, 0.4, 0.25), 473, 0.5); P(tape_rip(r), 487, 0.8, 0.2); P(tape_rip(r, 0.3), 497, 0.5, 0.2)   # duct tape
    P(motor(r, 0.6, 150, 520), 527, 0.6, 0.15)                                                       # BZZZT
    P(motor(r, D(549, 587), 300, 620, 1.0), 549, 0.8); P(G.rattle(D(552, 586), r, density=140), 552, 0.8)          # drill in the pot
    P(splat(r, 0.5), 552, 0.6)
    P(motor(r, D(585, 603), 620, 120, 0.8, down=True), 585, 0.7); P(G.rattle(0.5, r, density=30), 586, 0.3)        # wind down
    P(gentle_whoosh(r, 0.4, 0.25), 601, 0.5); P(G.rattle(D(603, 640), r, density=40), 603, 0.4, -0.1)
    P(splat(r, 0.5), 628, 0.6); P(G.whoosh(0.4, r, peak=0.15, f_lo=300, f_hi=1500), 630, 0.4)                    # dough lets go
    P(splat(r, 1.3), 645, 0.9); P(bonk(r), 646, 0.4)                                                              # onto Sam
    P(gentle_whoosh(r, 0.4, 0.25), 668, 0.5); P(ting(r, 2093), 695, 0.25)
    P(gentle_whoosh(r, 0.4, 0.25), 727, 0.5); P(G.water_bed(0.5, r, close=0.5), 733, 0.25); P(ting(r, 3136), 759, 0.3)   # juice slosh
    P(gentle_whoosh(r, 0.3, 0.2), 775, 0.4); P(glug(r, D(781, 801)), 781, 0.8, 0.1); P(boil(r, D(790, 836)), 790, 0.5)
    for fr in (812, 826): P(blorp(r), fr, 0.5)
    P(gentle_whoosh(r, 0.4, 0.25), 834, 0.5); P(click(r, 1500), 845, 0.3); P(chew(r, D(852, 870)), 852, 0.7)       # taste
    P(bonk(r), 918, 0.3)                                                                                            # "jam."
    P(gentle_whoosh(r, 0.4, 0.25), 950, 0.5); P(G.push_thump(r), 981, 0.4); P(ting(r, 2637), 999, 0.35)            # hero beat
    P(gentle_whoosh(r, 0.4, 0.25), 1019, 0.5); P(tap(r), 1031, 0.6); P(chime(r), 1040, 0.6)                        # order placed
    P(gentle_whoosh(r, 0.4, 0.25), 1064, 0.5); P(G.clink(r, 1400, 0.3), 1074, 0.5); P(splat(r, 0.3), 1080, 0.4); P(ting(r, 2349), 1076, 0.25)
    P(click(r, 5200), 1100, 0.35); P(click(r, 5400), 1118, 0.4); P(ting(r, 3520), 1119, 0.35)                     # tweezers + leaf
    P(gentle_whoosh(r, 0.4, 0.25), 1139, 0.5); P(shutter(r), 1146, 0.8); P(send_whoosh(r), 1155, 0.7)               # photo sent
    P(gentle_whoosh(r, 0.4, 0.25), 1175, 0.5); P(buzz(r), 1188, 0.6); P(ding(r), 1190, 0.45)
    for i in range(3): P(I.timpani(m2f(38), 0.25, r, dur=0.4), 1200 + i * 9, 0.6)                                  # nervous heartbeat
    P(gentle_whoosh(r, 0.4, 0.25), 1220, 0.5)
    for fr in (1223, 1249, 1277): P(ding(r), fr, 0.45)
    P(G.whoosh(0.3, r, peak=0.1, f_lo=500, f_hi=2500), 1284, 0.4)
    P(I.brass(m2f(38), 0.5, 0.7, r), 1301, 0.5); P(I.timpani(m2f(36), 0.6, r, dur=1.0), 1301, 0.7)                 # panic stab
    P(gentle_whoosh(r, 0.4, 0.25), 1323, 0.5); P(bonk(r), 1333, 0.45)                                               # 27 days left
    P(gentle_whoosh(r, 0.4, 0.25), 1370, 0.5)
    for i, fr in enumerate([1384, 1394]): P(click(r, 2200 + 300 * i), fr, 0.45)
    for i in range(4): P(ting(r, [1568, 1760, 1976, 2093][i]), 1417 + i * 9, 0.25)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music_d3.wav", m[:, :N]); write_wav("sfx_d3.wav", s[:, :N]); print("stems", m.shape, DUR)
