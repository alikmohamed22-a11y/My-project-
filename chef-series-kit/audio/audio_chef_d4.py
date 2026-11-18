# Stems for "The Chef Résumé" Ep4 (Day 4, the online cooking class): same bouncy pizzicato family as Ep1-3, new key (G), 124 BPM.
# Sections: music drops for the head-chef reveal / Sam's panic and under the chef's "you sound just like my new assistant" line;
# a slow minor tremolo for the crying stretch. Cue times are output frames / 30 from web/story_d4.js. Run: python3 audio_chef_d4.py
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, bonk

LEN = 1480
DUR = round(LEN / 30, 3); N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
D = lambda a, b: (b - a) / 30.0
BPM = 124.0; B = 60.0 / BPM
STOPS = [(F(598), F(641)), (F(1133), F(1224))]   # head-chef reveal + panic, the chef's suspicious line
SAD = (F(940), F(1043))                          # crying: slow minor tremolo instead of glock
CHOP = (F(879), F(906))                          # chopping frenzy: snare doubles
def silent(t): return any(a <= t < b for a, b in STOPS)

def music():
    buf = np.zeros((2, N)); r = rng(17)
    prog = [[55, 59, 62], [52, 55, 59], [48, 52, 55], [50, 54, 57]]     # G  Em  C  D
    bass = [43, 40, 36, 38]; mel = [79, 83, 86, 83, 81, 79, 78, 81, 83, 86, 88, 86, 83, 81, 79, 78]
    sadm = [76, 74, 72, 71, 72, 71, 69, 67]
    t, k = 0.1, 0
    while t < DUR - 1.4:
        bar = k % 4; sad = SAD[0] <= t < SAD[1]; ch = CHOP[0] <= t < CHOP[1]
        for b in range(4):
            tb = t + b * B
            if silent(tb) or tb > DUR - 1.4: continue
            if sad:
                if b in (0, 2): place(buf, pan(I.pluck(m2f([40, 36, 38, 35][bar]), 0.5, r, dur=0.5, bright=0.2), -0.15), tb)
                n = sadm[(b + 4 * k) % 8]
                for q in range(6): place(buf, pan(I.pluck(m2f(n), 0.13, r, dur=0.14, bright=0.7, pos=0.08), 0.3), tb + q * B / 6)
                continue
            place(buf, pan(I.pluck(m2f(bass[bar] + (12 if b % 2 else 0)), 0.55, r, dur=0.25, bright=0.3), -0.15), tb)
            place(buf, pan(I.pluck(m2f(prog[bar][(b + 1) % 3] + 12), 0.3, r, dur=0.18, bright=0.6), 0.2), tb + B / 2)
            if b in (1, 3): place(buf, pan(I.brush(0.25, r, dur=0.15), 0.1), tb)
            if ch: place(buf, pan(I.snare(0.3, r, dur=0.15), 0.05), tb + B / 2)
            if k % 2 == 1 and t > 3.5: place(buf, pan(I.glock(m2f(mel[(b + 4 * (k // 2)) % 16]), 0.15, r, dur=0.5), 0.3), tb)
        t += 4 * B; k += 1
    # stings
    place(buf, pan(I.brass(m2f(43), 0.5, 0.55, r), 0), F(240)); place(buf, pan(I.brass(m2f(42), 0.9, 0.55, r, fall=-4), 0), F(252))   # "scary" wah-wah
    for i, n in enumerate([67, 71, 74, 79]): place(buf, pan(I.brass(m2f(n - 12), 0.45, 0.45, r), 0), F(316) + i * 0.08)            # enrolled fanfare
    for i, n in enumerate([67, 71, 74, 79]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.0), 0.2), F(450) + i * 0.06)          # camera on
    place(buf, pan(I.brass(m2f(38), 0.6, 0.7, r), 0), F(600)); place(buf, I.timpani(m2f(31), 0.7, r, dur=1.4), F(600))               # HEAD CHEF stab
    place(buf, pan(I.brass(m2f(44), 0.4, 0.5, r), 0), F(947)); place(buf, pan(I.brass(m2f(43), 1.1, 0.5, r, fall=-5), 0), F(959))   # cried wah-wah
    for i, n in enumerate([67, 71, 74, 79]): place(buf, pan(I.glock(m2f(n + 12), 0.35, r, dur=1.4), 0.2), F(1330) + i * 0.12)      # 26 days button
    place(buf, I.timpani(m2f(43), 0.5, r, dur=1.4), F(1330) + 0.5)
    env = np.ones(N); tN = np.arange(N) / SR
    for a, b in STOPS: env = np.minimum(env, np.clip(np.maximum((a - tN) / 0.04, (tN - b) / 0.08), 0, 1))
    buf *= env
    for i, n in enumerate([74, 79, 83, 86]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.2), -0.2), DUR - 1.3 + i * 0.1)
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

def sfx():
    buf = np.zeros((2, N)); r = rng(47)
    def P(x, fr, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, F(fr))
    P(gentle_whoosh(r, 0.5, 0.3), 0, 0.4); P(ting(r, 2349), 3, 0.3); P(ding(r), 8, 0.5)                 # title + hook banner
    P(gentle_whoosh(r, 0.4, 0.25), 34, 0.5); P(buzz(r), 42, 0.5); P(ding(r), 44, 0.4)                   # 2nd banner
    P(bonk(r), 58, 0.25)
    P(gentle_whoosh(r, 0.4, 0.25), 83, 0.5)
    for i in range(5): P(click(r, 2600 + 200 * i), 85 + i * 3, 0.35)                                     # comments pop in
    P(G.whoosh(0.25, r, peak=0.06, f_lo=1200, f_hi=4000, tail=0.08), 94, 0.4); P(ting(r, 2637), 110, 0.3)   # highlight, 2.3K
    P(G.whoosh(0.25, r, peak=0.06, f_lo=1200, f_hi=4000, tail=0.08), 156, 0.4); P(bonk(r), 190, 0.4)       # 2nd highlight, !!
    P(gentle_whoosh(r, 0.4, 0.25), 220, 0.5); P(G.push_thump(r), 242, 0.5); P(ting(r, 1760), 244, 0.25)  # thought bubble, YOU'RE FIRED, NOPE
    P(gentle_whoosh(r, 0.4, 0.25), 276, 0.5); P(tap(r), 304, 0.6); P(chime(r), 314, 0.6)               # join press, enrolled
    P(gentle_whoosh(r, 0.4, 0.25), 336, 0.5); P(click(r, 1800), 337, 0.5); P(click(r, 2200), 360, 0.5); P(ting(r, 3136), 362, 0.25)
    P(gentle_whoosh(r, 0.4, 0.25), 388, 0.5)
    for i in range(5): P(blorp(r), 392 + i * 6, 0.35)                                                    # students join
    P(gentle_whoosh(r, 0.4, 0.25), 442, 0.5); P(shutter(r), 443, 0.6)                                    # camera on
    P(gentle_whoosh(r, 0.4, 0.25), 475, 0.5); P(chime(r), 497, 0.6); P(ding(r), 499, 0.35)              # host joined
    P(gentle_whoosh(r, 0.6, 0.15), 523, 0.3)
    P(G.push_thump(r), 560, 0.5); P(bonk(r), 562, 0.3)                                                  # brows
    P(G.whoosh(0.4, r, peak=0.2, f_lo=300, f_hi=1500), 588, 0.4); P(G.hammer_hit(r, 0.6), 601, 0.5)    # stamp
    P(I.timpani(m2f(36), 0.6, r, dur=1.0), 614, 0.6)                                                    # panic
    P(G.whoosh(0.3, r, peak=0.2, f_lo=500, f_hi=2500), 641, 0.5); P(slap(r), 650, 0.9); P(beep(520, 0.15), 654, 0.3)   # SLAP, cam off
    P(gentle_whoosh(r, 0.4, 0.25), 690, 0.5); P(click(r, 1500), 693, 0.3)
    for i in range(7): P(tap(r), 705 + i * 2.6, 0.45)                                                   # typing "Not Sam"
    P(click(r, 3000), 730, 0.5); P(ting(r, 2093), 737, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), 748, 0.5); P(click(r, 1800), 750, 0.4); P(click(r, 2200), 777, 0.4)
    P(gentle_whoosh(r, 0.4, 0.25), 815, 0.5)
    for i in range(10): P(chop(r), 818 + i * 3.2, 0.25, (i % 3 - 1) * 0.4)                             # everyone dicing neatly
    P(ting(r, 3520), 854, 0.35); P(ting(r, 2637), 858, 0.25)
    P(gentle_whoosh(r, 0.4, 0.25), 879, 0.5)
    for i in range(9): P(chop(r), 880 + i * 3, 0.7); P(splat(r, 0.25), 881 + i * 3, 0.25)            # Sam: chop chop squish
    P(G.water_bed(0.6, r, close=0.6), 905, 0.3); P(blorp(r), 915, 0.35); P(blorp(r), 927, 0.3)          # juice drips
    P(gentle_whoosh(r, 0.4, 0.25), 935, 0.5); P(spray(r, D(988, 1043)), 988, 0.6); P(bonk(r), 989, 0.3)    # sob fountain
    P(gentle_whoosh(r, 0.4, 0.25), 1018, 0.4); P(wail(r, 0.85), 1019, 0.7)                              # WAAAAH
    P(gentle_whoosh(r, 0.4, 0.25), 1043, 0.5); P(feedback(r), 1058, 0.5); P(bonk(r), 1061, 0.35)        # UNMUTED
    P(gentle_whoosh(r, 0.6, 0.15), 1083, 0.3)
    for i in range(6): P(I.timpani(m2f(38), 0.22, r, dur=0.4), 1100 + i * 10, 0.6)                      # nervous heartbeat
    for i in range(7): P(I.timpani(m2f(38), 0.18, r, dur=0.4), 1140 + i * 12, 0.5)
    P(G.push_thump(r), 1210, 0.4)                                                                       # "assistant."
    P(gentle_whoosh(r, 0.4, 0.25), 1241, 0.5); P(ting(r, 1976), 1278, 0.2)
    P(gentle_whoosh(r, 0.4, 0.25), 1287, 0.5); P(tap(r), 1292, 0.6); P(endcall(r), 1299, 0.6); P(send_whoosh(r), 1300, 0.6)   # leave
    P(gentle_whoosh(r, 0.4, 0.25), 1322, 0.5); P(bonk(r), 1330, 0.45)                                   # 26 days left
    P(gentle_whoosh(r, 0.4, 0.25), 1368, 0.5)
    for i, fr in enumerate([1380, 1395]): P(click(r, 2200 + 300 * i), fr, 0.45)
    for i in range(4): P(ting(r, [1568, 1760, 1976, 2093][i]), 1428 + i * 9, 0.25)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music_d4.wav", m[:, :N]); write_wav("sfx_d4.wav", s[:, :N]); print("stems", m.shape, DUR)
