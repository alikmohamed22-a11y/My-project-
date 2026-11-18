# Stems for "The Chef Résumé" Ep5 (Day 5, the in-person class + the easy sandwich): same bouncy pizzicato family as Ep1-4, new key (F), 122 BPM.
# Sections: music drops out for "Sam froze" (icy shimmer instead) and turns soft and warm (glock + pad) for Sam's reply to the viewer.
# Cue times are output frames / 30 from web/story_d5.js. Run: python3 audio_chef_d5.py
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, bonk, chalk

LEN = 1470
DUR = round(LEN / 30, 3); N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
D = lambda a, b: (b - a) / 30.0
BPM = 122.0; B = 60.0 / BPM
STOPS = [(F(398), F(436))]            # "Sam froze": the band freezes too
WARM = (F(1244), F(1384))             # Sam's reply: soft glock + pad, no bass/brush
PRESS = (F(1054), F(1124))            # pressing / burst: snare doubles
def silent(t): return any(a <= t < b for a, b in STOPS)

def music():
    buf = np.zeros((2, N)); r = rng(23)
    prog = [[53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55]]     # F  Dm  Bb  C
    bass = [41, 38, 34, 36]; mel = [77, 81, 84, 81, 79, 77, 76, 79, 81, 84, 86, 84, 81, 79, 77, 76]
    t, k = 0.1, 0
    while t < DUR - 1.4:
        bar = k % 4; warm = WARM[0] <= t < WARM[1]; ch = PRESS[0] <= t < PRESS[1]
        for b in range(4):
            tb = t + b * B
            if silent(tb) or tb > DUR - 1.4: continue
            if warm:
                if b == 0: place(buf, I.pad([m2f(n) for n in prog[bar]], 4 * B, 0.18, r, att=0.3, rel=0.6), tb)
                place(buf, pan(I.glock(m2f(mel[(b + 4 * k) % 16]), 0.14, r, dur=0.9), 0.25), tb)
                if b in (0, 2): place(buf, pan(I.pluck(m2f(bass[bar] + 12), 0.3, r, dur=0.5, bright=0.25), -0.15), tb)
                continue
            place(buf, pan(I.pluck(m2f(bass[bar] + (12 if b % 2 else 0)), 0.55, r, dur=0.25, bright=0.3), -0.15), tb)
            place(buf, pan(I.pluck(m2f(prog[bar][(b + 1) % 3] + 12), 0.3, r, dur=0.18, bright=0.6), 0.2), tb + B / 2)
            if b in (1, 3): place(buf, pan(I.brush(0.25, r, dur=0.15), 0.1), tb)
            if ch: place(buf, pan(I.snare(0.3, r, dur=0.15), 0.05), tb + B / 2)
            if k % 2 == 1 and t > 3.5: place(buf, pan(I.glock(m2f(mel[(b + 4 * (k // 2)) % 16]), 0.15, r, dur=0.5), 0.3), tb)
        t += 4 * B; k += 1
    # stings
    for i, n in enumerate([65, 69, 72, 77]): place(buf, pan(I.brass(m2f(n - 12), 0.45, 0.45, r), 0), F(268) + i * 0.08)            # dare accepted
    place(buf, pan(I.brass(m2f(41), 0.5, 0.6, r), 0), F(358)); place(buf, I.timpani(m2f(29), 0.6, r, dur=1.2), F(358))            # "background check" stab
    for i, n in enumerate([65, 69, 72, 77]): place(buf, pan(I.brass(m2f(n - 12), 0.5, 0.45, r), 0), F(572) + i * 0.07)            # impressive fanfare
    place(buf, pan(I.brass(m2f(43), 0.4, 0.5, r), 0), F(778)); place(buf, pan(I.brass(m2f(42), 0.9, 0.5, r, fall=-4), 0), F(788))   # the plate wah-wah
    place(buf, pan(I.brass(m2f(43), 0.4, 0.5, r), 0), F(907)); place(buf, pan(I.brass(m2f(42), 0.9, 0.5, r, fall=-4), 0), F(917))   # inside out wah-wah
    for i, n in enumerate([65, 69, 72, 77]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.2), 0.2), F(1175) + i * 0.07)        # bread sandwich reveal
    for i, n in enumerate([65, 69, 72, 77]): place(buf, pan(I.glock(m2f(n + 12), 0.35, r, dur=1.4), 0.2), F(1390) + i * 0.12)      # 25 days button
    place(buf, I.timpani(m2f(41), 0.5, r, dur=1.4), F(1390) + 0.5)
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

def wail(r, dur=0.9, f0=620, f1=380):   # cartoon "WAAAH": nasal saw with vibrato, falling
    t = tt(dur); f = f0 + (f1 - f0) * t / dur + 18 * np.sin(2 * np.pi * 6.5 * t); ph = phase(f)
    y = sum(np.sin(ph * h) / h for h in range(1, 9)); y = bp(y, 400, 3500) * 0.35
    return fades(y * (0.6 + 0.4 * np.minimum(1, t / 0.08)), 0.03, 0.2)
def spray(r, dur):   # tear fountain: hissy water jet with flutter
    t = tt(dur); n = r.standard_normal(len(t)); am = 0.7 + 0.3 * np.sin(2 * np.pi * 11 * t)
    return fades(bp(n, 1500, 7000) * am * 0.3 + G.bubbles(dur, r, 30, 400, 1800, (0.01, 0.03)) * 0.5, 0.05, 0.2)
def chop(r): t = tt(0.12); return fades(lp(r.standard_normal(len(t)), 2500) * np.exp(-t / 0.012) * 0.8 + np.sin(2 * np.pi * 140 * t) * np.exp(-t / 0.03) * 0.5, 0.001, 0.02)
def endcall(r):     # three falling call-ended beeps
    y = np.zeros(ns(0.6))
    for i, f in enumerate([880, 660, 440]): b = beep(f, 0.13); s = ns(i * 0.17); y[s:s + len(b)] += b
    return y
def feedback(r, dur=0.4): t = tt(dur); return fades(np.sin(phase(2600 + 300 * t)) * 0.18, 0.05, 0.1)
def slap(r): t = tt(0.25); return fades(bp(r.standard_normal(len(t)), 600, 5000) * np.exp(-t / 0.02) * 0.9 + np.sin(2 * np.pi * 110 * t) * np.exp(-t / 0.05) * 0.5, 0.001, 0.05)

def ice(r, dur=1.0):   # freeze: glassy shimmer + crackle
    t = tt(dur); y = sum(np.sin(2 * np.pi * f * t + r.random() * 6) * np.exp(-t / (0.3 + 0.2 * r.random())) for f in (2637, 3136, 3951, 4699)) * 0.08
    crack = (r.random(len(t)) < 0.004) * r.standard_normal(len(t)) * 2.5
    return fades(y + bp(crack, 2000, 8000) * np.exp(-t / 0.4) * 0.5, 0.005, 0.2)
def tip(r): t = tt(0.07); return fades(bp(r.standard_normal(len(t)), 300, 1800) * np.exp(-t / 0.012) * 0.7, 0.001, 0.01)
def squeak(r, dur=0.25, f0=1700, f1=2300):   # marker on whiteboard
    t = tt(dur); f = f0 + (f1 - f0) * t / dur + 120 * np.sin(2 * np.pi * 23 * t); return fades(np.sin(phase(f)) * 0.12 + bp(r.standard_normal(len(t)), 2000, 5000) * 0.05, 0.01, 0.04)
def squelch(r, dur=0.35):   # squeeze bottle
    t = tt(dur); f = 220 + 400 * (t / dur) ** 2; y = np.sin(phase(f)) * (0.5 + 0.5 * np.sin(2 * np.pi * 30 * t)) * 0.35 + bp(r.standard_normal(len(t)), 300, 2500) * 0.2
    return fades(y * np.exp(-t / 0.25), 0.01, 0.05)
def hmm(r, dur=0.6): t = tt(dur); f = 160 + 30 * np.sin(np.pi * t / dur); y = sum(np.sin(phase(f) * h) / h for h in range(1, 6)); return fades(lp(y, 900) * 0.25, 0.05, 0.15)

def sfx():
    buf = np.zeros((2, N)); r = rng(53)
    def P(x, fr, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, F(fr))
    P(gentle_whoosh(r, 0.5, 0.3), 0, 0.4); P(ting(r, 2349), 2, 0.3); P(ding(r), 5, 0.5)                   # title + hook banner
    P(gentle_whoosh(r, 0.4, 0.25), 36, 0.5); P(click(r, 2200), 56, 0.4); P(bonk(r), 64, 0.35)            # A DARE?!, gulp
    P(gentle_whoosh(r, 0.4, 0.25), 90, 0.5); P(click(r, 2600), 92, 0.35)
    P(G.whoosh(0.25, r, peak=0.06, f_lo=1200, f_hi=4000, tail=0.08), 103, 0.4); P(click(r, 2000), 122, 0.45)  # OFFLINE
    P(G.whoosh(0.25, r, peak=0.06, f_lo=1200, f_hi=4000, tail=0.08), 153, 0.4); P(G.push_thump(r), 153, 0.45); P(click(r, 1800), 158, 0.45)
    P(gentle_whoosh(r, 0.4, 0.2), 176, 0.3); P(G.whoosh(0.3, r, peak=0.08, f_lo=1200, f_hi=4000, tail=0.1), 184, 0.4); P(click(r, 2400), 214, 0.45)
    P(blorp(r), 230, 0.4); P(ting(r, 3136), 231, 0.3)                                                    # heart
    P(gentle_whoosh(r, 0.4, 0.25), 244, 0.5); P(tap(r), 258, 0.6); P(chime(r), 264, 0.6); P(G.hammer_hit(r, 0.6), 271, 0.5)
    P(gentle_whoosh(r, 0.4, 0.25), 287, 0.5); P(click(r, 2000), 294, 0.4); P(click(r, 2400), 300, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 331, 0.5); P(G.push_thump(r), 358, 0.45)
    P(G.whoosh(0.3, r, peak=0.2, f_lo=500, f_hi=2500), 399, 0.5); P(I.timpani(m2f(36), 0.6, r, dur=1.0), 400, 0.6); P(ice(r, 1.1), 401, 0.7)   # FROZE
    P(G.hammer_hit(r, 0.5), 417, 0.45); P(click(r, 1800), 404, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 436, 0.5)
    for i in range(8): P(tip(r), 446 + i * 4, 0.5, (i % 2 - 0.5) * 0.3)                                  # tiptoe side-step
    P(ting(r, 2637), 488, 0.3); P(click(r, 2200), 489, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 513, 0.5); P(hmm(r, 0.7), 524, 0.5); P(hmm(r, 0.6), 548, 0.4)
    for i in range(4): P(I.timpani(m2f(38), 0.18, r, dur=0.4), 520 + i * 12, 0.5)                         # nervous heartbeat
    P(chime(r), 572, 0.5); P(G.hammer_hit(r, 0.6), 587, 0.5)
    P(gentle_whoosh(r, 0.4, 0.25), 610, 0.5); P(click(r, 1800), 612, 0.4)
    for i in range(5): P(squeak(r, 0.3, 1600 + i * 80, 2200 + i * 60), 614 + i * 10.5, 0.45, 0.2)        # marker writes the recipe
    P(squeak(r, 0.4, 2100, 1500), 647, 0.5)
    P(gentle_whoosh(r, 0.4, 0.25), 692, 0.5); P(click(r, 2200), 696, 0.4); P(scrape(r, D(725, 745), 3.0), 725, 0.4)
    P(scrape(r, D(760, 792), 5.0), 760, 0.55); P(bonk(r), 778, 0.4)                                       # buttering the plate
    P(gentle_whoosh(r, 0.4, 0.25), 801, 0.5); P(click(r, 2200), 803, 0.4); P(ting(r, 3520), 838, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 880, 0.5); P(bonk(r), 907, 0.4); P(click(r, 1600), 910, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 939, 0.5); P(click(r, 2200), 942, 0.4); P(click(r, 1700), 975, 0.35)
    P(squelch(r, 0.3), 1006, 0.7); P(splat(r, 1.0), 1014, 0.8); P(G.push_thump(r), 1014, 0.45); P(bonk(r), 1022, 0.3)   # SPLURT
    P(gentle_whoosh(r, 0.4, 0.25), 1054, 0.5); P(G.whoosh(0.3, r, peak=0.2, f_lo=300, f_hi=1500), 1064, 0.5); P(G.push_thump(r), 1075, 0.6); P(slap(r), 1075, 0.4)
    P(splat(r, 1.0), 1097, 0.8)
    for i in range(5): P(G.whoosh(0.3, r, peak=0.08, f_lo=900, f_hi=3500, tail=0.1), 1097 + i * 3, 0.35, (-1) ** i * 0.6)   # fillings fly
    P(gentle_whoosh(r, 0.4, 0.25), 1124, 0.4); P(splat(r, 0.4), 1125, 0.5); P(bonk(r), 1130, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 1145, 0.5); P(ting(r, 2637), 1188, 0.25)
    P(gentle_whoosh(r, 0.4, 0.25), 1211, 0.5)
    for i in range(10): P(tap(r), 1216 + i * 2.8, 0.4)                                                   # typing the reply
    P(gentle_whoosh(r, 0.4, 0.2), 1246, 0.35)
    P(gentle_whoosh(r, 0.4, 0.2), 1339, 0.35); P(ting(r, 1976), 1357, 0.2)
    P(gentle_whoosh(r, 0.4, 0.25), 1384, 0.5); P(bonk(r), 1390, 0.45)
    for i in range(4): P(ting(r, [1568, 1760, 1976, 2093][i]), 1428 + i * 9, 0.25)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music_d5.wav", m[:, :N]); write_wav("sfx_d5.wav", s[:, :N]); print("stems", m.shape, DUR)
