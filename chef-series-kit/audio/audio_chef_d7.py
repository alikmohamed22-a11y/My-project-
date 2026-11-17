# Stems for "The Chef Résumé" Ep7 (Day 7, the viewer's Chicken Alfredo for 20: 30 bulbs of garlic, 74°C and kept going, a stove with two
# settings, the split sauce, all the pasta water at once, Alfredo soup, the owner asks for seconds, "The owner wants to meet you.").
# Same bouncy pizzicato family as Ep1-6, new key (A), 124 BPM. The band stops dead for "went quiet…" (only a clock ticks) and for Sam's
# "MEET ME?!" panic before the 23-days button. Cue times are output frames / 30 from web/story_d7.js. Run: python3 audio_chef_d7.py
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, bonk
from audio_chef_d5 import ding, chime, click, tap, beep, boil, blorp, glug, scrape, splat, slap, hmm, send_whoosh

LEN = 1395
DUR = round(LEN / 30, 3); N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
D = lambda a, b: (b - a) / 30.0
BPM = 124.0; B = 60.0 / BPM
STOPS = [(F(1122), F(1156)), (F(1294), F(1316))]   # "went quiet…" and "MEET ME?!": the band stops dead
def silent(t): return any(a <= t < b for a, b in STOPS)

def music():
    buf = np.zeros((2, N)); r = rng(37)
    prog = [[57, 61, 64], [54, 57, 61], [50, 54, 57], [52, 56, 59]]     # A  F#m  D  E
    bass = [45, 42, 38, 40]; mel = [81, 85, 88, 85, 83, 81, 80, 83, 85, 88, 90, 88, 85, 83, 81, 80]
    t, k = 0.1, 0
    while t < DUR - 1.4:
        bar = k % 4
        for b in range(4):
            tb = t + b * B
            if silent(tb) or tb > DUR - 1.4: continue
            place(buf, pan(I.pluck(m2f(bass[bar] + (12 if b % 2 else 0)), 0.55, r, dur=0.25, bright=0.3), -0.15), tb)
            place(buf, pan(I.pluck(m2f(prog[bar][(b + 1) % 3] + 12), 0.3, r, dur=0.18, bright=0.6), 0.2), tb + B / 2)
            if b in (1, 3): place(buf, pan(I.brush(0.25, r, dur=0.15), 0.1), tb)
            if k % 2 == 1 and t > 3.5: place(buf, pan(I.glock(m2f(mel[(b + 4 * (k // 2)) % 16] - 12), 0.15, r, dur=0.5), 0.3), tb)
        t += 4 * B; k += 1
    # stings
    for i, n in enumerate([69, 73, 76, 81]): place(buf, pan(I.brass(m2f(n - 12), 0.45, 0.45, r), 0), F(37) + i * 0.07)           # THE OWNER fanfare
    for i, n in enumerate([64, 69, 73, 76]): place(buf, pan(I.glock(m2f(n + 12), 0.25, r, dur=1.0), 0.2), F(95) + i * 0.05)       # feed 20
    for i, n in enumerate([69, 73, 76, 81]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.0), 0.2), F(318) + i * 0.06)      # great recipe
    place(buf, I.timpani(m2f(33), 0.7, r, dur=1.2), F(491)); place(buf, pan(I.brass(m2f(45), 0.5, 0.6, r), 0), F(491))            # 30 BULBS
    for i, n in enumerate([76, 81]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=0.8), 0.2), F(562) + i * 0.08)              # 74 ✓
    place(buf, pan(I.brass(m2f(47), 0.4, 0.5, r), 0), F(630)); place(buf, pan(I.brass(m2f(46), 0.9, 0.5, r, fall=-4), 0), F(640))   # kept going wah-wah
    place(buf, pan(I.brass(m2f(45), 0.5, 0.65, r), 0), F(797)); place(buf, I.timpani(m2f(33), 0.6, r, dur=1.0), F(797))           # MAX
    place(buf, pan(I.brass(m2f(47), 0.4, 0.5, r), 0), F(835)); place(buf, pan(I.brass(m2f(46), 0.9, 0.5, r, fall=-4), 0), F(845))   # split wah-wah
    place(buf, I.timpani(m2f(28), 0.7, r, dur=1.4), F(994))                                                                          # SPLOOSH
    place(buf, pan(I.brass(m2f(47), 0.4, 0.45, r), 0), F(1028)); place(buf, pan(I.brass(m2f(46), 0.9, 0.45, r, fall=-4), 0), F(1038))  # soup wah-wah
    for i, n in enumerate([69, 73, 76, 81]): place(buf, pan(I.brass(m2f(n - 12), 0.5, 0.55, r), 0), F(1177) + i * 0.06)          # SECONDS fanfare
    for i, n in enumerate([69, 73, 76, 81]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.2), 0.2), F(1189) + i * 0.06)
    place(buf, pan(I.brass(m2f(45), 0.55, 0.7, r), 0), F(1282)); place(buf, I.timpani(m2f(33), 0.7, r, dur=1.2), F(1282))         # "meet you"
    for i, n in enumerate([69, 73, 76, 81]): place(buf, pan(I.glock(m2f(n + 12), 0.35, r, dur=1.4), 0.2), F(1318) + i * 0.12)      # 23 days button
    place(buf, I.timpani(m2f(45), 0.5, r, dur=1.4), F(1318) + 0.5)
    env = np.ones(N); tN = np.arange(N) / SR
    for a, b in STOPS: env = np.minimum(env, np.clip(np.maximum((a - tN) / 0.04, (tN - b) / 0.08), 0, 1))
    buf *= env
    for i, n in enumerate([76, 81, 85, 88]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.2), -0.2), DUR - 1.3 + i * 0.1)
    return buf

# ---------------- sfx ----------------
def tick(r): t = tt(0.03); return fades(bp(r.standard_normal(len(t)), 2500, 7000) * np.exp(-t / 0.004) * 0.6, 0.0005, 0.005)
def sizzle(r, dur): t = tt(dur); return fades(hp(colored(len(t), r, 0.0), 3000) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 7 * t))) * 0.25, 0.05, 0.2)
def knob_click(r): return modal(0.08, [(900, 1.0, 0.01), (2400, 0.5, 0.005)], r) * 0.7
def roar(r, dur=1.2): t = tt(dur); return fades(lp(colored(len(t), r, 1.0), 900) * 0.6 + lp(r.standard_normal(len(t)), 300) * 0.25, 0.02, 0.4)
def slurp(r): t = tt(0.45); f = 300 + 900 * (t / 0.45); return fades((np.sin(phase(f)) * 0.3 + bp(r.standard_normal(len(t)), 500, 3000) * 0.3) * (0.5 + 0.5 * np.sin(2 * np.pi * 18 * t)), 0.01, 0.08)
def err_beep(r): y = np.zeros(ns(0.5)); a = beep(400, 0.12); b = beep(300, 0.2); y[:len(a)] += a; s = ns(0.18); y[s:s + len(b)] += b; return y

def sfx():
    buf = np.zeros((2, N)); r = rng(71)
    def P(x, fr, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, F(fr))
    P(gentle_whoosh(r, 0.5, 0.3), 0, 0.4); P(ting(r, 2349), 2, 0.3); P(ding(r), 4, 0.5)                       # title + head chef banner
    P(gentle_whoosh(r, 0.4, 0.25), 32, 0.5); P(click(r, 2200), 37, 0.4); P(ting(r, 3136), 45, 0.2)          # the owner's chair
    P(gentle_whoosh(r, 0.4, 0.25), 66, 0.5); P(click(r, 2200), 90, 0.4); P(click(r, 2600), 112, 0.4)
    for i in range(20): P(blorp(r), 70 + i * 1.5, 0.18, (i % 5 - 2) * 0.25)                                    # crew pops in
    for i, d in enumerate([0, 3, 6]): P(hmm(r, 0.8), 101 + d, 0.3, (i - 1) * 0.5)                             # crowd "mmm"
    P(gentle_whoosh(r, 0.4, 0.25), 138, 0.5); P(G.push_thump(r), 146, 0.3); P(click(r, 2400), 152, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 172, 0.5); P(click(r, 2000), 173, 0.35); P(ding(r), 197, 0.45); P(click(r, 2600), 209, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 264, 0.5); P(click(r, 1800), 268, 0.4); P(send_whoosh(r), 300, 0.35); P(click(r, 2400), 318, 0.4); P(ting(r, 2637), 331, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 358, 0.5); P(G.push_thump(r), 361, 0.25); P(bonk(r), 391, 0.3); P(click(r, 2000), 392, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 405, 0.5); P(click(r, 2200), 414, 0.45); P(blorp(r), 428, 0.35); P(click(r, 2600), 430, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 460, 0.5)
    for i in range(30): P(bonk(r), 473 + i * 1.1, 0.12 + 0.08 * (i % 3 == 0), (i % 5 - 2) * 0.3)              # bulbs land
    P(G.hammer_hit(r, 0.6), 491, 0.45); P(G.push_thump(r), 491, 0.4); P(click(r, 2000), 502, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 518, 0.5); P(sizzle(r, D(518, 588)), 518, 0.7)
    for i in range(12): P(beep(1800, 0.03), 526 + i * 3, 0.25)                                                 # probe counting up
    P(ding(r), 562, 0.5); P(click(r, 2400), 564, 0.35)
    P(sizzle(r, D(588, 658)), 588, 0.9); P(boil(r, D(600, 658)), 600, 0.3)
    for i in range(15): P(beep(1800 + i * 60, 0.03), 602 + i * 3, 0.25)                                        # still counting…
    P(err_beep(r), 648, 0.5); P(click(r, 2000), 630, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 658, 0.5); P(click(r, 2200), 662, 0.45); P(click(r, 2600), 684, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 714, 0.5); P(click(r, 2200), 738, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 764, 0.5); P(knob_click(r), 775, 0.7); P(G.whoosh(0.3, r, peak=0.2, f_lo=500, f_hi=2500), 792, 0.4)
    P(knob_click(r), 798, 0.8); P(roar(r, D(797, 820) + 0.4), 797, 0.6); P(G.hammer_hit(r, 0.6), 797, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 820, 0.4); P(boil(r, D(820, 851)), 820, 0.4); P(slap(r), 835, 0.5); P(splat(r, 0.5), 836, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 851, 0.5); P(click(r, 2200), 856, 0.4); P(ding(r), 920, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 941, 0.5); P(G.whoosh(0.4, r, peak=0.3, f_lo=300, f_hi=1500), 944, 0.4); P(glug(r, D(958, 1004)), 958, 0.5)
    P(splat(r, 1.0), 994, 0.6); P(G.push_thump(r), 994, 0.5); P(click(r, 2000), 1000, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 1016, 0.5); P(glug(r, 1.0), 1022, 0.25); P(click(r, 1800), 1028, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 1076, 0.5); P(click(r, 2200), 1080, 0.35); P(slurp(r), 1100, 0.6)
    for fr in (1128, 1143): P(tick(r), fr, 0.7)                                                                # "went quiet…"
    P(gentle_whoosh(r, 0.4, 0.25), 1155, 0.5); P(scrape(r, 0.4, 8.0), 1158, 0.4); P(G.push_thump(r), 1170, 0.3)
    P(gentle_whoosh(r, 0.3, 0.2), 1188, 0.5); P(chime(r), 1189, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 1205, 0.5); P(click(r, 2000), 1222, 0.35); P(ding(r), 1259, 0.5); P(G.push_thump(r), 1282, 0.5)
    P(G.whoosh(0.3, r, peak=0.2, f_lo=500, f_hi=2500), 1295, 0.5); P(G.hammer_hit(r, 0.6), 1296, 0.5); P(bonk(r), 1298, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 1314, 0.5); P(bonk(r), 1318, 0.45)
    for i in range(4): P(ting(r, [1568, 1760, 1976, 2093][i]), 1352 + i * 7, 0.25)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music_d7.wav", m[:, :N]); write_wav("sfx_d7.wav", s[:, :N]); print("stems", m.shape, DUR)
