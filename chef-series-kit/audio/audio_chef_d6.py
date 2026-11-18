# Stems for "The Chef Résumé" Ep6 (Day 6, family meal: Bloop orders 20 chefs, the 2x recipe video, the noodle brick, "the owner is coming").
# Same bouncy pizzicato family as Ep1-5, new key (G), 122 BPM. The band doubles its snare for the 2x video, and cuts out for Sam's
# "THE OWNER?!" panic before the 24-days button. Cue times are output frames / 30 from web/story_d6.js. Run: python3 audio_chef_d6.py
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, bonk
from audio_chef_d5 import ding, chime, click, tap, beep, boil, blorp, glug, scrape, splat, slap, chop, endcall, hmm, tip, send_whoosh

LEN = 1426
DUR = round(LEN / 30, 3); N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
D = lambda a, b: (b - a) / 30.0
BPM = 122.0; B = 60.0 / BPM
STOPS = [(F(1320), F(1342))]          # "THE OWNER?!": the band stops dead
FAST = (F(676), F(777))               # the 2x video: snare doubles, glock every beat
def silent(t): return any(a <= t < b for a, b in STOPS)

def music():
    buf = np.zeros((2, N)); r = rng(29)
    prog = [[55, 59, 62], [52, 55, 59], [48, 52, 55], [50, 54, 57]]     # G  Em  C  D
    bass = [43, 40, 36, 38]; mel = [79, 83, 86, 83, 81, 79, 78, 81, 83, 86, 88, 86, 83, 81, 79, 78]
    t, k = 0.1, 0
    while t < DUR - 1.4:
        bar = k % 4; fast = FAST[0] <= t < FAST[1]
        for b in range(4):
            tb = t + b * B
            if silent(tb) or tb > DUR - 1.4: continue
            place(buf, pan(I.pluck(m2f(bass[bar] + (12 if b % 2 else 0)), 0.55, r, dur=0.25, bright=0.3), -0.15), tb)
            place(buf, pan(I.pluck(m2f(prog[bar][(b + 1) % 3] + 12), 0.3, r, dur=0.18, bright=0.6), 0.2), tb + B / 2)
            if b in (1, 3): place(buf, pan(I.brush(0.25, r, dur=0.15), 0.1), tb)
            if fast:
                place(buf, pan(I.snare(0.3, r, dur=0.15), 0.05), tb + B / 2)
                place(buf, pan(I.glock(m2f(mel[(b + 4 * k) % 16]), 0.14, r, dur=0.3), 0.3), tb)
                place(buf, pan(I.glock(m2f(mel[(b + 4 * k + 2) % 16]), 0.1, r, dur=0.3), -0.3), tb + B / 2)
            elif k % 2 == 1 and t > 3.5: place(buf, pan(I.glock(m2f(mel[(b + 4 * (k // 2)) % 16]), 0.15, r, dur=0.5), 0.3), tb)
        t += 4 * B; k += 1
    # stings
    place(buf, pan(I.brass(m2f(43), 0.5, 0.6, r), 0), F(112)); place(buf, I.timpani(m2f(31), 0.6, r, dur=1.2), F(112))              # "YOU"
    for i, n in enumerate([67, 71, 74, 79]): place(buf, pan(I.brass(m2f(n - 12), 0.45, 0.45, r), 0), F(230) + i * 0.07)              # 20 chefs!
    place(buf, pan(I.brass(m2f(45), 0.4, 0.5, r), 0), F(421)); place(buf, pan(I.brass(m2f(44), 0.9, 0.5, r, fall=-4), 0), F(431))     # order placed wah-wah
    place(buf, pan(I.brass(m2f(43), 0.5, 0.6, r), 0), F(452))                                                                         # cancelled stab
    for i, n in enumerate([67, 71, 74, 79]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.0), 0.2), F(749) + i * 0.06)        # video ta-da
    place(buf, pan(I.brass(m2f(45), 0.4, 0.5, r), 0), F(906)); place(buf, pan(I.brass(m2f(44), 0.9, 0.5, r, fall=-4), 0), F(916))     # all of it wah-wah
    place(buf, I.timpani(m2f(26), 0.7, r, dur=1.4), F(1036))                                                                          # THUNK
    for i, n in enumerate([67, 71, 74, 79]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.2), 0.2), F(1190) + i * 0.07)       # "rustic"
    place(buf, pan(I.brass(m2f(43), 0.55, 0.7, r), 0), F(1306)); place(buf, I.timpani(m2f(31), 0.7, r, dur=1.2), F(1306))           # "owner"
    for i, n in enumerate([67, 71, 74, 79]): place(buf, pan(I.glock(m2f(n + 12), 0.35, r, dur=1.4), 0.2), F(1348) + i * 0.12)      # 24 days button
    place(buf, I.timpani(m2f(43), 0.5, r, dur=1.4), F(1348) + 0.5)
    env = np.ones(N); tN = np.arange(N) / SR
    for a, b in STOPS: env = np.minimum(env, np.clip(np.maximum((a - tN) / 0.04, (tN - b) / 0.08), 0, 1))
    buf *= env
    for i, n in enumerate([74, 79, 83, 86]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.2), -0.2), DUR - 1.3 + i * 0.1)
    return buf

# ---------------- sfx ----------------
def wake(r):     # Bloop wakes: two rising beeps
    y = np.zeros(ns(0.3)); a = beep(880, 0.09); b = beep(1320, 0.12); y[:len(a)] += a; s = ns(0.11); y[s:s + len(b)] += b; return y * 0.7
def robo(r, dur=0.9):   # the speaker "talking": chirpy square-ish blips
    y = np.zeros(ns(dur)); tm = 0.0
    while tm < dur - 0.08:
        f = 500 + 500 * r.random(); t = tt(0.06); b = fades(np.sign(np.sin(2 * np.pi * f * t)) * 0.12, 0.004, 0.01); s = ns(tm); y[s:s + len(b)] += b[:len(y) - s]; tm += 0.08
    return bp(y, 300, 4000)
def knock(r):    # knuckle on a dense noodle block: dull wooden thock
    return modal(0.25, [(180, 1.0, 0.05), (410, 0.5, 0.03), (930, 0.25, 0.015)], r) * 0.9
def suction(r):  # pot lifting off the brick
    t = tt(0.35); f = 120 + 500 * (t / 0.35) ** 2; return fades(np.sin(phase(f)) * np.exp(-t / 0.2) * 0.4 + bp(r.standard_normal(len(t)), 300, 1500) * 0.15, 0.01, 0.06)
def tick(r): t = tt(0.03); return fades(bp(r.standard_normal(len(t)), 2500, 7000) * np.exp(-t / 0.004) * 0.6, 0.0005, 0.005)

def sfx():
    buf = np.zeros((2, N)); r = rng(61)
    def P(x, fr, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, F(fr))
    P(gentle_whoosh(r, 0.5, 0.3), 0, 0.4); P(ting(r, 2349), 2, 0.3); P(ding(r), 4, 0.5)                       # title + hook banner
    P(gentle_whoosh(r, 0.4, 0.25), 30, 0.5); P(bonk(r), 64, 0.35); P(click(r, 2200), 66, 0.4)                 # gulp, FAMILY MEAL?!
    P(gentle_whoosh(r, 0.4, 0.25), 87, 0.5); P(ding(r), 90, 0.45); P(G.push_thump(r), 112, 0.45); P(click(r, 2000), 116, 0.45); P(ding(r), 137, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 153, 0.5); P(click(r, 2200), 155, 0.4); P(click(r, 2600), 186, 0.4)
    for i in range(20): P(blorp(r), 176 + i * 1.9, 0.18, (i % 5 - 2) * 0.25)                                   # crew pops in
    P(G.hammer_hit(r, 0.6), 230, 0.45); P(G.push_thump(r), 231, 0.4)
    for i, d in enumerate([0, 3, 6]): P(hmm(r, 0.8), 233 + d, 0.35, (i - 1) * 0.5)                            # crowd "mmm"
    P(click(r, 2000), 244, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 262, 0.5); P(click(r, 2200), 286, 0.4); P(click(r, 2600), 300, 0.35); P(wake(r), 322, 0.6, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 330, 0.5); P(click(r, 1800), 368, 0.3)
    P(gentle_whoosh(r, 0.3, 0.2), 395, 0.35); P(robo(r, 1.1), 398, 0.6); P(chime(r), 421, 0.6); P(ding(r), 423, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 446, 0.5); P(slap(r), 451, 0.6); P(G.push_thump(r), 451, 0.5); P(G.hammer_hit(r, 0.6), 455, 0.45); P(endcall(r), 457, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 478, 0.5); P(tap(r), 490, 0.5); P(click(r, 1800), 566, 0.45); P(ting(r, 3136), 540, 0.2)
    P(send_whoosh(r), 605, 0.5); P(tap(r), 625, 0.6); P(click(r, 2400), 628, 0.45)
    P(G.whoosh(0.5, r, peak=0.4, f_lo=400, f_hi=4500, tail=0.1), 636, 0.5); P(click(r, 2000), 648, 0.45); P(click(r, 2600), 659, 0.4)
    for at in (676, 712, 730, 749): P(G.whoosh(0.2, r, peak=0.05, f_lo=1500, f_hi=6000, tail=0.06), at, 0.45)  # 2x hard cuts
    for i in range(10): P(chop(r), 678 + i * 3, 0.45, (i % 2 - 0.5) * 0.3)
    P(boil(r, 0.6), 712, 0.5); P(ting(r, 2637), 731, 0.35); P(ting(r, 3520), 733, 0.25); P(chime(r), 750, 0.45)
    P(gentle_whoosh(r, 0.4, 0.25), 777, 0.5); P(scrape(r, D(780, 834), 6.0), 780, 0.35); P(click(r, 2200), 790, 0.4); P(click(r, 2800), 806, 0.35)
    P(G.whoosh(0.4, r, peak=0.3, f_lo=300, f_hi=1800), 838, 0.5); P(splat(r, 0.7), 851, 0.6); P(glug(r, 0.8), 852, 0.4); P(boil(r, D(860, 926)), 860, 0.3)
    for i in range(4): P(bonk(r), 912 + i * 3, 0.3, (i % 2 - 0.5) * 0.6)                                       # empty boxes land
    P(click(r, 1800), 906, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 926, 0.45); P(boil(r, D(926, 970)), 926, 0.45)
    for i in range(17): P(tick(r), 928 + i * 2, 0.6)                                                          # time-lapse clock
    P(ding(r), 962, 0.5); P(click(r, 2000), 945, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 970, 0.5); P(suction(r), 992, 0.6); P(G.whoosh(0.4, r, peak=0.2, f_lo=300, f_hi=1500), 996, 0.35)
    P(G.push_thump(r), 1036, 0.65); P(slap(r), 1036, 0.3); P(click(r, 2000), 1040, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 1053, 0.5); P(knock(r), 1069, 0.9, 0.3); P(knock(r), 1077, 0.9, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 1100, 0.5); P(hmm(r, 0.5), 1120, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 1157, 0.5); P(ting(r, 2637), 1192, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 1212, 0.5); P(click(r, 2000), 1240, 0.35)
    P(ding(r), 1285, 0.5); P(G.push_thump(r), 1306, 0.5)
    P(G.whoosh(0.3, r, peak=0.2, f_lo=500, f_hi=2500), 1321, 0.5); P(G.hammer_hit(r, 0.6), 1322, 0.5); P(bonk(r), 1324, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 1342, 0.5); P(bonk(r), 1348, 0.45)
    for i in range(4): P(ting(r, [1568, 1760, 1976, 2093][i]), 1392 + i * 7, 0.25)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music_d6.wav", m[:, :N]); write_wav("sfx_d6.wav", s[:, :N]); print("stems", m.shape, DUR)
