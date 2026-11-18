# Stems for "The Chef Résumé" Ep2 (Day 2): same bouncy pizzicato family as Ep1, new key (D), new progression + tune,
# 128 BPM. Sections: spa vibes for the bathtub, mandolin tremolo for the pizza, music drops for the punchlines.
# SLOW CUT (voice_slow.wav). Cue frames are story_d2.js frames, remapped by F(). Run from this folder: python3 audio_chef_d2_slow.py
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, scratch, hiss, bonk

import json as _j
# Slow cut (as Ep1 audio_chef_v3): every cue below is still written in the ORIGINAL story_d2 frames; F() sends it through the
# old->new time map (work/slow/timemap_slow_s.json, the same map web/story_d2slow.js uses), D() stretches sustained beds.
_P = _j.load(open('../work/slow/timemap_slow_s.json'))
_O = np.array([p[0] for p in _P]); _NW = np.array([p[1] for p in _P])
def R(t): return float(np.interp(t, _O, _NW)) if t <= _O[-1] else float(_NW[-1] + t - _O[-1])
LEN = 1528
DUR = round(LEN / 30, 3); N = ns(DUR); m2f = I.m2f
F = lambda fr: R(fr / 30.0)
D = lambda fr, d: R(fr / 30.0 + d) - R(fr / 30.0)
BPM = 128.0; B = 60.0 / BPM
STOPS = [(F(648), F(717)), (F(884), F(946)), (F(1080), F(1101))]   # roommate's line, splat → "still up there", "Same."
SPA = (F(533), F(648))        # bathtub: vibes + pad
PIZZA = (F(747), F(884))      # pizza: mandolin tremolo
def silent(t): return any(a <= t < b for a, b in STOPS)

def music():
    buf = np.zeros((2, N)); r = rng(11)
    prog = [[50, 54, 57], [47, 50, 54], [43, 47, 50], [45, 49, 52]]     # D  Bm  G  A
    bass = [38, 35, 31, 33]; mel = [74, 78, 81, 78, 76, 74, 73, 76, 78, 81, 83, 81, 78, 76, 74, 73]
    t, k = 0.1, 0
    while t < DUR - 1.4:
        bar = k % 4; spa = SPA[0] <= t < SPA[1]; piz = PIZZA[0] <= t < PIZZA[1]
        for b in range(4):
            tb = t + b * B
            if silent(tb) or tb > DUR - 1.4: continue
            if spa:
                place(buf, pan(I.vibes(m2f(prog[bar][b % 3] + 24), 0.26, r, dur=1.0), 0.25 * (-1) ** b), tb)
                if b % 2 == 0: place(buf, pan(I.pluck(m2f(bass[bar]), 0.4, r, dur=0.5, bright=0.2), -0.1), tb)
                continue
            place(buf, pan(I.pluck(m2f(bass[bar] + (12 if b % 2 else 0)), 0.55, r, dur=0.25, bright=0.3), -0.15), tb)
            place(buf, pan(I.pluck(m2f(prog[bar][(b + 1) % 3] + 12), 0.3, r, dur=0.18, bright=0.6), 0.2), tb + B / 2)
            if b in (1, 3): place(buf, pan(I.brush(0.25, r, dur=0.15), 0.1), tb)
            if piz:   # mandolin: fast tremolo plucks on the tune
                n = mel[(b + 4 * k) % 16]
                for q in range(8): place(buf, pan(I.pluck(m2f(n), 0.16 * (0.8 + 0.2 * (q % 2)), r, dur=0.12, bright=0.9, pos=0.08), 0.3), tb + q * B / 8)
            elif k % 2 == 1 and t > 3.5: place(buf, pan(I.glock(m2f(mel[(b + 4 * (k // 2)) % 16]), 0.15, r, dur=0.5), 0.3), tb)
        if spa: place(buf, I.pad([m2f(n + 12) for n in prog[bar]], 4 * B, 0.18, r, att=0.3, rel=0.6, warm=1500), t)
        t += 4 * B; k += 1
    # stings
    place(buf, pan(I.brass(m2f(45), 0.4, 0.55, r), 0), F(404)); place(buf, pan(I.brass(m2f(44), 0.8, 0.55, r, fall=-3), 0), F(416))   # "no idea" wah-wah
    for i, n in enumerate([62, 66, 69, 74]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.0), 0.2), F(749) + i * 0.08)        # pizza time
    for i, n in enumerate([62, 66, 69, 74]): place(buf, pan(I.glock(m2f(n + 12), 0.35, r, dur=1.4), 0.2), F(1116) + i * 0.12)       # 28 days button
    place(buf, I.timpani(m2f(38), 0.5, r, dur=1.4), F(1116) + 0.5)
    # hard music drop inside STOPS (fast 40 ms fades) so ringing tails don't step on the punchlines; stings placed after
    env = np.ones(N); tN = np.arange(N) / SR
    for a, b in STOPS: env = np.minimum(env, np.clip(np.maximum((a - tN) / 0.04, (tN - b) / 0.08), 0, 1))
    buf *= env
    for i, n in enumerate([69, 74, 78, 81]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.2), -0.2), DUR - 1.3 + i * 0.1)
    return buf

# ---------------- sfx ----------------
def ding(r): return modal(0.6, [(1568, 1.0, 0.25), (2349, 0.6, 0.18)], r) * 0.5
def buzz(r): t = tt(0.35); return fades(bp(np.sin(2 * np.pi * 180 * t) * (np.sin(2 * np.pi * 30 * t) > 0), 120, 900) * 0.5, 0.005, 0.02)
def splat(r, big=1.0): t = tt(0.6); return fades((lp(r.standard_normal(len(t)), 900) * np.exp(-t / 0.12) * 0.8 + np.sin(phase(80 * (1 + np.exp(-t / 0.03)))) * np.exp(-t / 0.08) * 0.6) * big, 0.002, 0.1)
def click(r, f=3200): return modal(0.05, [(f, 1.0, 0.006), (f * 2.3, 0.4, 0.003)], r) * 0.6
def tap(r): t = tt(0.06); return fades(bp(r.standard_normal(len(t)), 1500, 6000) * np.exp(-t / 0.006) * 0.8, 0.0005, 0.01)
def beep(f, dur): t = tt(dur); return fades(np.sin(2 * np.pi * f * t) * 0.35, 0.003, 0.01)
def pour(r, dur):   # milk pour: band noise with glug modulation + small bubbles
    t = tt(dur); n = r.standard_normal(len(t)); g = 0.6 + 0.4 * np.sin(2 * np.pi * 7 * t + np.sin(2 * np.pi * 1.3 * t))
    y = bp(n, 300, 2200) * g * 0.6 + G.bubbles(dur, r, 60, 300, 1400, (0.006, 0.02)) * 0.6
    return fades(y, 0.05, 0.12)
def whoomp(r): t = tt(0.9); return fades(lp(r.standard_normal(len(t)), 500) * (1 - np.exp(-t / 0.03)) * np.exp(-t / 0.25) * 1.4 + np.sin(phase(60 + 40 * np.exp(-t / 0.1))) * np.exp(-t / 0.2) * 0.5, 0.01, 0.2)
def boil(r, dur): t = tt(dur); return fades(G.bubbles(dur, r, 45, 120, 700, (0.02, 0.06)) * 0.9 + lp(colored(len(t), r, 1.0), 400) * 0.15, 0.1, 0.3)
def blorp(r): t = tt(0.25); return fades(np.sin(phase(180 + 260 * t / 0.25)) * np.exp(-t / 0.08) * 0.6, 0.005, 0.03)
def zipper(r, dur=0.35):
    y = np.zeros(ns(dur)); n = int(dur * 70)
    for i in range(n): tm = i / n * dur; c = click(r, 2200 + 2400 * i / n); s = ns(tm); y[s:s + len(c)] += c[:len(y) - s] * r.uniform(0.5, 1)
    return y
def squeak(r): t = tt(0.35); f = 1500 + 700 * np.sin(np.pi * t / 0.35) + 60 * np.sin(2 * np.pi * 28 * t); return fades(np.sin(phase(f)) * 0.3 * np.sin(np.pi * t / 0.35), 0.005, 0.02)
def fan_whir(r, dur, rate=6.0, lvl=1.0):
    t = tt(dur); n = r.standard_normal(len(t)); am = 0.55 + 0.45 * np.abs(np.sin(np.pi * rate * t))
    y = bp(n, 200, 1600) * am * 0.35 + np.sin(2 * np.pi * 110 * t) * 0.05
    return fades(y * lvl, 0.15, 0.3)
def spin_swish(r, dur, rate=4.5):
    y = np.zeros(ns(dur)); tm = 0
    while tm < dur - 0.2: w = G.whoosh(0.22, r, peak=0.1, f_lo=500, f_hi=2600, tail=0.08) * 0.6; s = ns(tm); y[s:s + len(w)] += w[:len(y) - s]; tm += 1 / rate
    return y
def send_whoosh(r): return G.whoosh(0.35, r, peak=0.08, f_lo=900, f_hi=4200, tail=0.12) * 0.9

def sfx():
    buf = np.zeros((2, N)); r = rng(41)
    def P(x, fr, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, F(fr))
    P(gentle_whoosh(r, 0.5, 0.3), 0, 0.4); P(ting(r, 2349), 3, 0.3)                               # title
    P(gentle_whoosh(r, 0.4, 0.3), 31, 0.5)                                                        # phone in
    for i, fr in enumerate([40, 52, 63]): P(ding(r), fr, 0.6, -0.2 + 0.2 * i)                     # comment dings
    P(gentle_whoosh(r, 0.4, 0.25), 78, 0.5)                                                       # whip
    for fr in (84, 86, 90): P(click(r, 2600), fr, 0.5)                                            # tags pop
    P(G.whoosh(0.4, r, peak=0.15, f_lo=400, f_hi=1800), 92, 0.4); P(G.push_thump(r), 106, 0.5)   # hop + land
    P(G.rattle(D(120, 0.7), r, density=70), 120, 0.35, 0.2); P(ting(r, 2637), 140, 0.3)                    # cereal box shake / sparkle
    P(ting(r, 3136), 170, 0.25)                                                                   # smug glint
    P(gentle_whoosh(r, 0.3, 0.15), 186, 0.3); P(pour(r, D(197, 1.05)), 197, 0.7, 0.1); P(bonk(r), 212, 0.3) # milk pour
    P(gentle_whoosh(r, 0.3, 0.15), 235, 0.3); P(G.rattle(D(243, 0.75), r, density=110), 243, 0.6, -0.1)   # cereal pour rattle
    P(click(r, 1800), 254, 0.3)
    P(gentle_whoosh(r, 0.3, 0.2), 268, 0.4); P(G.clink(r, 1300, 0.25), 276, 0.6)                  # bowl on burner
    P(click(r, 1200), 286, 0.6); P(click(r, 1500), 290, 0.6); P(whoomp(r), 296, 0.9)             # knob + gas
    P(boil(r, D(300, 1.5)), 300, 0.7); [P(blorp(r), fr, 0.5) for fr in (306, 319)]                        # bubbling
    P(ting(r, 2093), 324, 0.35)                                                                   # proud snap
    P(gentle_whoosh(r, 0.4, 0.25), 337, 0.5); P(ding(r), 348, 0.4)                                # back to phone
    P(splat(r, 0.4), 368, 0.5)                                                                    # raw chicken slap
    for i in range(10): P(tap(r), 432 + i * 1.4, 0.35)                                            # search typing
    P(ting(r, 2637), 456, 0.25)
    P(gentle_whoosh(r, 0.3, 0.25), 478, 0.4); P(splat(r, 0.8), 486, 0.6); P(zipper(r), 512, 0.6)  # bag + zip
    P(gentle_whoosh(r, 0.4, 0.25), 531, 0.5); P(G.splash_big(r) * 0.5, 541, 0.5)                   # splash into tub
    P(G.water_bed(D(545, 3.6), r, close=0.5), 545, 0.25); P(squeak(r), 560, 0.45, -0.3)                   # bath + duck
    P(beep(2800, 0.12), 584, 0.4); P(beep(2800, 0.12), 589, 0.4); P(ting(r, 2349), 587, 0.25)     # thermometer
    P(gentle_whoosh(r, 0.4, 0.25), 605, 0.5); P(G.creak(0.6, r, 70, 110), 607, 0.35)              # door
    for fr in (615, 624, 633): P(G.stroll_step(r, 0.4), fr, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 716, 0.5); P(ding(r), 726, 0.4)                                # pizza request
    P(G.push_thump(r), 760, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 772, 0.5); P(spin_swish(r, D(776, 2.2)), 776, 0.5)                     # dough spin
    P(G.applause(0.8, r, people=20) * 0.6, 809, 0.25)                                             # TV crowd
    P(spin_swish(r, 0.33), 832, 0.5); P(G.whoosh(0.5, r, peak=0.12, f_lo=600, f_hi=3800, tail=0.3), 841, 0.9)   # launch
    P(fan_whir(r, D(872, 2.1), 6.0), 872, 0.7); P(G.whoosh(0.3, r, peak=0.25, f_lo=300, f_hi=2000), 874, 0.5)
    P(splat(r, 1.3), 884, 0.9); P(bonk(r), 885, 0.4)                                              # SPLAT
    P(fan_whir(r, D(932, 0.8), 1.5, 0.6), 932, 0.7); P(modal(0.25, [(900, 1.0, 0.06), (1350, 0.5, 0.04)], r) * 0.5, 942, 0.6)   # slow fan + drip
    P(gentle_whoosh(r, 0.4, 0.25), 948, 0.5); P(buzz(r), 956, 0.6); P(ding(r), 959, 0.45)         # head chef texts
    P(ding(r), 1001, 0.4)
    for i in range(3): P(I.timpani(m2f(38), 0.25, r, dur=0.4), 1056 + i * 9, 0.6)                 # nervous heartbeat
    for i in range(5): P(tap(r), 1080 + i * 1.4, 0.5)                                             # types "Same."
    P(send_whoosh(r), 1088, 0.7); P(click(r, 2400), 1097, 0.3)                                    # send + read
    P(gentle_whoosh(r, 0.4, 0.25), 1101, 0.5); P(bonk(r), 1116, 0.45)                             # 28 days left
    P(gentle_whoosh(r, 0.4, 0.25), 1143, 0.5)
    for i, fr in enumerate([1158, 1167, 1176, 1185]): P(click(r, 2200 + 300 * i), fr, 0.45)
    for i in range(4): P(ting(r, [1568, 1760, 1976, 2093][i]), 1198 + i * 9, 0.25)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music_d2_slow.wav", m[:, :N]); write_wav("sfx_d2_slow.wav", s[:, :N]); print("stems", m.shape, DUR)
