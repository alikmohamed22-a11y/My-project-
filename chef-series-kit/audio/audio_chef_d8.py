# Stems for "The Chef Résumé" Ep8 (Day 8: a viewer's 3 tips for meeting the owner → the tent-sized suit + rain boots, pasta / garlic bread /
# one-leaf salad, the pasta joins the pizza on the ceiling fan, the bow that headbutts the table, "Your Majesty!", the owner laughs,
# Alfredo soup goes on the menu, tomorrow: the toughest critic, "Bro…", 22 days left).
# Same bouncy pizzicato family as Ep1-7, new key (Bb), 128 BPM. The band stops dead on BONK and for "Bro…".
# Cue times are output frames / 30 from web/story_d8.js. Run: python3 audio_chef_d8.py
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, bonk
from audio_chef_d5 import ding, chime, click, tap, beep, blorp, splat, slap, hmm, send_whoosh, squeak

LEN = 970
DUR = round(LEN / 30, 3); N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
D = lambda a, b: (b - a) / 30.0
BPM = 128.0; B = 60.0 / BPM
STOPS = [(F(591), F(617)), (F(821), F(857))]   # BONK and "Bro…": the band stops dead
def silent(t): return any(a <= t < b for a, b in STOPS)

def music():
    buf = np.zeros((2, N)); r = rng(41)
    prog = [[58, 62, 65], [55, 58, 62], [51, 55, 58], [53, 57, 60]]     # Bb  Gm  Eb  F
    bass = [46, 43, 39, 41]; mel = [82, 86, 89, 86, 84, 82, 81, 84, 86, 89, 91, 89, 86, 84, 82, 81]
    t, k = 0.0, 0
    while t < DUR - 1.4:
        bar = k % 4
        for b in range(4):
            tb = t + b * B
            if silent(tb) or tb > DUR - 1.4: continue
            place(buf, pan(I.pluck(m2f(bass[bar] + (12 if b % 2 else 0)), 0.55, r, dur=0.25, bright=0.3), -0.15), tb)
            place(buf, pan(I.pluck(m2f(prog[bar][(b + 1) % 3] + 12), 0.3, r, dur=0.18, bright=0.6), 0.2), tb + B / 2)
            if b in (1, 3): place(buf, pan(I.brush(0.25, r, dur=0.15), 0.1), tb)
            if k % 2 == 1 and t > 2.0: place(buf, pan(I.glock(m2f(mel[(b + 4 * (k // 2)) % 16] - 12), 0.15, r, dur=0.5), 0.3), tb)
        t += 4 * B; k += 1
    # stings
    for i, n in enumerate([70, 74, 77, 82]): place(buf, pan(I.brass(m2f(n - 12), 0.45, 0.5, r), 0), F(1) + i * 0.06)               # DAY 8 hook
    for i, n in enumerate([70, 74, 77, 82]): place(buf, pan(I.glock(m2f(n + 12), 0.25, r, dur=1.0), 0.2), F(64) + i * 0.05)       # 3 tips
    place(buf, pan(I.brass(m2f(48), 0.4, 0.5, r), 0), F(242)); place(buf, pan(I.brass(m2f(47), 0.9, 0.5, r, fall=-4), 0), F(252))  # too big wah-wah
    place(buf, I.timpani(m2f(34), 0.6, r, dur=1.0), F(378)); place(buf, I.timpani(m2f(34), 0.7, r, dur=1.2), F(399))                 # YEET / SPLAT
    for i, n in enumerate([77, 82, 86]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.2), 0.2), F(440) + i * 0.1)            # roommates heart
    for i, n in enumerate([70, 74, 77, 82]): place(buf, pan(I.brass(m2f(n - 12), 0.5, 0.6, r), 0), F(530) + i * 0.07)             # THE OWNER fanfare
    place(buf, I.timpani(m2f(29), 0.8, r, dur=1.4), F(592))                                                                         # BONK
    for i, n in enumerate([70, 74, 77, 82]): place(buf, pan(I.brass(m2f(n - 12), 0.5, 0.5, r), 0), F(712) + i * 0.06)             # on the menu
    for i, n in enumerate([70, 74, 77, 82]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.2), 0.2), F(724) + i * 0.06)
    place(buf, pan(I.brass(m2f(46), 0.55, 0.7, r), 0), F(797)); place(buf, I.timpani(m2f(34), 0.7, r, dur=1.2), F(807))          # the critic
    for i, n in enumerate([70, 74, 77, 82]): place(buf, pan(I.glock(m2f(n + 12), 0.35, r, dur=1.4), 0.2), F(862) + i * 0.12)      # 22 days button
    place(buf, I.timpani(m2f(46), 0.5, r, dur=1.4), F(862) + 0.5)
    env = np.ones(N); tN = np.arange(N) / SR
    for a, b in STOPS: env = np.minimum(env, np.clip(np.maximum((a - tN) / 0.04, (tN - b) / 0.08), 0, 1))
    buf *= env
    for i, n in enumerate([77, 82, 86, 89]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.2), -0.2), DUR - 1.3 + i * 0.1)
    return buf

# ---------------- sfx ----------------
def fan_hum(r, dur): t = tt(dur); return fades(lp(colored(len(t), r, 1.0), 500) * (0.7 + 0.3 * np.sin(2 * np.pi * 4 * t)) * 0.3, 0.1, 0.2)
def boing(r, f0=220, dur=0.5): t = tt(dur); return fades(np.sin(phase(f0 * (1 + 0.5 * np.sin(2 * np.pi * 12 * t) * np.exp(-t / 0.2)))) * np.exp(-t / 0.25) * 0.5, 0.003, 0.05)

def sfx():
    buf = np.zeros((2, N)); r = rng(73)
    def P(x, fr, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, F(fr))
    P(G.hammer_hit(r, 0.6), 0, 0.35); P(ting(r, 2349), 1, 0.3); P(click(r, 2400), 18, 0.35)                      # hook
    P(gentle_whoosh(r, 0.4, 0.25), 35, 0.5); P(send_whoosh(r), 42, 0.35); P(ting(r, 2637), 62, 0.3); P(click(r, 2200), 64, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 80, 0.5); P(G.push_thump(r), 101, 0.3); P(click(r, 2200), 102, 0.4); P(click(r, 2600), 110, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 130, 0.5); P(click(r, 2200), 140, 0.4); P(click(r, 2000), 150, 0.35); P(click(r, 2600), 162, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 183, 0.5)
    for i in range(4): P(squeak(r, 0.12, 1500, 1900), 186 + i * 4, 0.25, -0.3)                                        # rain boots squeak in
    P(G.push_thump(r), 200, 0.3); P(ding(r), 204, 0.4); P(click(r, 2400), 206, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 232, 0.5); P(G.whoosh(0.3, r, peak=0.15, f_lo=300, f_hi=1500), 236, 0.4); P(bonk(r), 242, 0.35)
    P(ding(r), 253, 0.45); P(squeak(r, 0.2, 1400, 2200), 256, 0.4, 0.3)                                              # Mom text, squeak
    P(gentle_whoosh(r, 0.4, 0.25), 277, 0.5); P(click(r, 2200), 286, 0.4); P(click(r, 2600), 292, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), 316, 0.5); P(blorp(r), 318, 0.4); P(blorp(r), 339, 0.35); P(click(r, 2400), 324, 0.3); P(click(r, 2000), 346, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 361, 0.5); P(G.whoosh(0.4, r, peak=0.3, f_lo=300, f_hi=1500), 372, 0.45); P(G.whoosh(0.4, r, peak=0.15, f_lo=500, f_hi=2600), 378, 0.5)
    P(fan_hum(r, D(392, 468)), 392, 0.5); P(splat(r, 1.0), 399, 0.7); P(slap(r), 399, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 420, 0.4); P(boing(r, 330, 0.4), 432, 0.3); P(chime(r), 440, 0.4); P(click(r, 2400), 446, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 468, 0.5); P(click(r, 2200), 488, 0.4); P(ting(r, 3136), 498, 0.25)
    P(gentle_whoosh(r, 0.4, 0.25), 528, 0.5); P(click(r, 2000), 531, 0.35)
    P(G.whoosh(0.4, r, peak=0.3, f_lo=300, f_hi=1500), 582, 0.4); P(G.hammer_hit(r, 1.0), 592, 0.8); P(bonk(r), 592, 0.6); P(G.clink(r), 594, 0.4)   # BONK
    P(boing(r, 240, 0.7), 596, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 616, 0.5)
    for i in range(4): P(ting(r, [2637, 3136, 2349, 2794][i]), 620 + i * 5, 0.15, (i % 2 - 0.5))                     # dizzy stars
    P(gentle_whoosh(r, 0.4, 0.25), 656, 0.5)
    for i in range(3): P(hmm(r, 0.25), 664 + i * 7, 0.45)                                                             # ho ho ho
    P(gentle_whoosh(r, 0.4, 0.25), 691, 0.5); P(G.push_thump(r), 711, 0.6); P(slap(r), 711, 0.35); P(chime(r), 724, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 752, 0.5); P(click(r, 2000), 753, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 790, 0.5); P(click(r, 2200), 797, 0.4)
    for i in range(3): P(tap(r), 800 + i * 5, 0.4)
    P(G.hammer_hit(r, 0.6), 807, 0.4)
    P(gentle_whoosh(r, 0.3, 0.2), 822, 0.4); P(click(r, 1800), 824, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 858, 0.5); P(bonk(r), 862, 0.45)
    P(gentle_whoosh(r, 0.4, 0.25), 905, 0.5)
    for i in range(3): P(blorp(r), 910 + i * 4, 0.25, (i - 1) * 0.4)
    for i in range(4): P(ting(r, [1568, 1760, 1976, 2093][i]), 918 + i * 7, 0.25)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music_d8.wav", m[:, :N]); write_wav("sfx_d8.wav", s[:, :N]); print("stems", m.shape, DUR)
