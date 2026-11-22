# Stems for "The Titanic's baker": tense-but-playful sea-shanty (D minor, 108 bpm: pizzicato bass + off-beat plucks, brushes,
# glock/fife shanty tune) for the galley + deck; a darker pulse (timpani, low brass swells) as the ship sinks; a cold sparse pad in
# the water; silence for the memorial line; hopeful pad for the rescue; playful D-major button. Stops on the key lines.
# SFX: ice scrape + groan, bread thumps, deck chairs thrown + splashes, hull groans/creaks, stern plunge, wind + water bed, chattering.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored, curve
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, boom, metal_scrape
DUR = 61.2; N = ns(DUR); m2f = I.m2f
B = 60.0 / 108.0
F = lambda fr: fr / 30.0
# music stops: "a drop of liqueur", the memorial line, "swollen feet", "doctors say no", the final tag
STOPS = [(F(598), F(649)), (F(1150), F(1240)), (F(1442), F(1470)), (F(1540), F(1563)), (F(1770), F(1830))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SINK = (F(649), F(985))    # deck chairs + stern: darker driving pulse
COLD = (F(985), F(1240))   # in the water: sparse cold pad only
HOPE = (F(1240), F(1475))  # rescue: warm pad + gentle plucks

def music():
    buf = np.zeros((2, N)); r = rng(1912)
    prog = [[62, 65, 69], [60, 64, 67], [58, 62, 65], [57, 61, 64]]           # Dm C Bb A (shanty)
    bass = [[50, 57, 50, 57], [48, 55, 48, 55], [46, 53, 46, 53], [45, 52, 45, 49]]
    tune = [74, 74, 72, 69, 70, 69, 67, 65, 64, 65, 67, 69, 69, 67, 65, 64]
    t, k = 0.1, 0
    while t < 60.8:
        bar = (k // 4) % 4; beat = k % 4; ch = prog[bar]
        if not silent(t):
            if t < F(112):   # hook: low drone + ticking glock
                if beat == 0: place(buf, pan(I.pluck(m2f(38), 0.45, r, dur=1.6, bright=0.25), 0), t)
                if k % 2 == 0: place(buf, pan(I.glock(m2f(ch[2] + 12), 0.08, r, dur=0.6), -0.3), t)
            elif SINK[0] <= t < SINK[1]:
                place(buf, pan(I.pluck(m2f(bass[bar][beat] - 12), 0.5, r, dur=0.3, bright=0.3), 0), t)
                place(buf, pan(I.pluck(m2f(bass[bar][beat] - 12), 0.3, r, dur=0.2, bright=0.3), 0), t + B / 2)
                if beat == 0: place(buf, pan(I.timpani(m2f(38), 0.5, r, dur=1.4), 0), t)
                if beat == 0 and bar % 2 == 0: place(buf, pan(I.brass(m2f(ch[0] - 12), B * 3.5, 0.18, r, kind='tuba'), 0.1), t)
                place(buf, pan(I.snare(0.06 + 0.04 * (beat % 2), r, tune=1.2, snappy=0.3), -0.1), t + B / 2)
            elif COLD[0] <= t < COLD[1]:
                if k % 8 == 0: place(buf, I.pad([m2f(x) for x in [50, 57, 62, 65]], B * 8.2, 0.1, r, att=1.2, rel=1.6, warm=700), t)
                if k % 4 == 2: place(buf, pan(I.glock(m2f([81, 77, 76, 74][(k // 4) % 4]), 0.07, r, dur=1.6), 0.3), t)
            elif HOPE[0] <= t < HOPE[1]:
                hp_ = [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]][bar]   # D Bm G A
                if beat == 0: place(buf, I.pad([m2f(x) for x in hp_], B * 4.2, 0.1, r, att=0.4, rel=1.0, warm=1100), t)
                place(buf, pan(I.pluck(m2f(hp_[beat % 3] + 12), 0.12, r, dur=0.4, bright=0.6), 0.2), t + B / 2)
            else:            # playful shanty (galley, deck, cabin, ending)
                major = t > F(1563)
                c2 = [[62, 66, 69], [57, 61, 64], [59, 62, 66], [55, 59, 62]][bar] if major else ch
                b2 = [[50, 57, 50, 57], [45, 52, 45, 52], [47, 54, 47, 54], [43, 50, 43, 50]][bar] if major else bass[bar]
                place(buf, pan(I.pluck(m2f(b2[beat]), 0.5, r, dur=0.4, bright=0.35, pos=0.22), 0), t)
                for n in c2: place(buf, pan(I.pluck(m2f(n + 12), 0.1, r, dur=0.2, bright=0.85, pos=0.12), 0.25), t + B / 2)
                place(buf, pan(I.brush(0.2 if beat % 2 else 0.11, r, dur=0.22, swish=beat % 2 == 0), -0.15), t)
                if (k // 16) % 2 == 1: place(buf, pan(I.glock(m2f(tune[k % 16] + (4 if major and tune[k % 16] % 12 in (5,) else 0) + 12), 0.12, r, dur=0.7), -0.25), t)
                elif k % 2 == 0 and t > F(292): place(buf, pan(I.fife(m2f(tune[(k // 2) % 16] + (1 if major and tune[(k // 2) % 16] % 12 == 5 else 0)), B * 1.6, 0.08, r), 0.2), t)
        t += B; k += 1
    # stingers
    place(buf, pan(I.brass(m2f(38), 1.6, 0.24, r, kind='tuba', fall=-3), 0), F(132)); place(buf, I.cymbal(0.12, r, dur=1.4), F(132))   # ...drinking
    for i, n in enumerate([62, 69, 74]): place(buf, pan(I.glock(m2f(n + 12), 0.2, r, dur=0.8), 0), F(179) + i * 0.1)                 # Charles Joughin
    place(buf, I.pad([m2f(x) for x in [50, 56, 62]], 2.0, 0.16, r, att=0.02, rel=1.2, warm=900), F(243))                             # iceberg hit (tritone)
    for i, n in enumerate([62, 66, 69, 74]): place(buf, pan(I.glock(m2f(n + 12), 0.16, r, dur=0.8), 0.1), F(374) + i * 0.07)          # 4 loaves
    place(buf, I.pad([m2f(x) for x in [62, 65, 69, 72]], 1.8, 0.1, r, att=0.05, rel=1.2, warm=1300), F(612))                          # a drop of liqueur
    place(buf, pan(I.brass(m2f(38), 2.2, 0.26, r, kind='tuba', fall=-7), 0), F(959)); place(buf, I.cymbal(0.16, r, dur=2.0), F(959)) # like an elevator
    for i, n in enumerate([74, 77, 81]): place(buf, pan(I.glock(m2f(n + 12), 0.14, r, dur=1.0), 0), F(1025) + i * 0.1)              # head barely wet
    place(buf, I.pad([m2f(x) for x in [50, 57, 62, 66]], 3.0, 0.12, r, att=0.6, rel=1.4, warm=900), F(1240))                          # rescue begins
    place(buf, pan(I.brass(m2f(45), 0.9, 0.22, r, kind='tuba', fall=-4), 0), F(1447))                                                  # swollen feet (honk)
    place(buf, pan(I.brass(m2f(41), 0.7, 0.22, r, kind='tuba', fall=-5), 0), F(1554))                                                  # doctors say no
    place(buf, I.pad([m2f(x) for x in [50, 57, 62, 66, 69]], 2.0, 0.16, r, att=0.04, rel=1.4, warm=1300), F(1775))                    # button
    for i, n in enumerate([62, 66, 69, 74, 78]): place(buf, pan(I.glock(m2f(n + 12), 0.22, r, dur=1.4), 0.1), F(1775) + i * 0.09)
    g = np.ones(N); a0, a1, fd = ns(F(1150)), ns(F(1238)), ns(0.35); g[a0:a1] = 0; g[a0 - fd:a0] = np.linspace(1, 0, fd)  # memorial: true silence
    return buf * g
    

def groan(r, dur=2.5, lo=40, hi=70): return G.creak(dur, r, rate0=lo, rate1=hi, modes=G.CHAIN, rough=0.25, noise=0.08, scale=0.5)
def thud(r, f0=120, dur=0.25):
    t = tt(dur); return fades(np.sin(2 * np.pi * np.cumsum(f0 * (1 + 0.6 * np.exp(-t / 0.02))) / SR) * np.exp(-t / 0.07) + 0.3 * lp(r.standard_normal(len(t)), 900) * np.exp(-t / 0.03))
def splash(r, dur=0.9, big=1.0):
    t = tt(dur); n = len(t); slap = bp(r.standard_normal(n), 300, 6000) * np.exp(-t / 0.05); bub = G.bubbles(dur, r, 300 * np.exp(-t / 0.3) + 10, 300, 2600, (0.006, 0.02), np.exp(-t / 0.4))
    return fades((slap * 1.2 + bub[:n] * 0.8 + 0.6 * np.sin(2 * np.pi * 70 * t) * np.exp(-t / 0.1)) * big)
def chatter(r, dur=1.2, rate=14):
    out = np.zeros(ns(dur)); k = 0
    for i in range(int(dur * rate)):
        c = G.clink(r, f0=2400 + 400 * r.uniform(), dur=0.03, bright=0.6); s0 = ns(i / rate + r.uniform(0, 0.01)); out[s0:s0 + len(c)] += c[:len(out) - s0] * (0.5 + 0.5 * r.uniform())
    return fades(out / (np.abs(out).max() + 1e-9))
def ice_scrape(r, dur=2.0):
    t = tt(dur); n = len(t); x = bp(colored(n, r, slope=-0.6), 200, 3000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * t + r.uniform(0, 6))))
    env = np.minimum(1, t / 0.15) * np.exp(-t / 0.9); y = x * env + 0.6 * groan(r, dur, 30, 55)[:n]; return fades(y / (np.abs(y).max() + 1e-9))
def pour(r, dur=0.9):
    t = tt(dur); n = len(t); x = G.bubbles(dur, r, 60 + 40 * np.sin(np.pi * t / dur), 600, 2400, (0.004, 0.012), np.minimum(1, t / 0.05) * np.exp(-t / 0.6)); return fades(x[:n])

def sfx():
    buf = np.zeros((2, N)); r = rng(1515)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    def bed(f0, f1, g=0.18):
        d = F(f1 - f0); w = G.water_bed(d, r, close=0.8, slosh_rate=0.6); wi = G.breeze(d, r, level=1.0, gust=0.3, bright=700)
        n = min(w.shape[1], wi.shape[1]); x = (w[:, :n] * 0.8 + wi[:, :n] * 0.7); k = ns(0.12); x[:, :k] *= np.linspace(0, 1, k); x[:, -k:] *= np.linspace(1, 0, k); P(x, F(f0), g)
    for a, b in [(0, 112), (735, 795), (985, 1150), (1240, 1475), (1563, 1652)]: bed(a, b)
    bed(1150, 1240, 0.12)                                                                        # memorial: just wind + water
    P(chatter(r, 1.4), F(20), 0.12)                                                              # teeth chattering (hook)
    P(gentle_whoosh(r), F(106), 0.3)
    P(G.clink(r, f0=1500, dur=0.1), F(126), 0.25); P(pour(r), F(128), 0.2)                      # bottle + glass
    P(gentle_whoosh(r), F(152), 0.3)
    P(ting(r, 2637), F(179), 0.25)
    P(gentle_whoosh(r), F(212), 0.3)
    P(ice_scrape(r, 2.2), F(240), 0.55); P(boom(r, 0.6), F(243), 0.35)                           # iceberg
    P(gentle_whoosh(r), F(256), 0.3)
    P(gentle_whoosh(r), F(286), 0.3)
    for i in range(6): P(G.stroll_step(r, 0.3), F(300 + i * 9), 0.18, -0.2 + 0.08 * i)           # bakers marching out
    P(gentle_whoosh(r), F(359), 0.3)
    for f0 in (374, 386, 398, 410): P(thud(r, 140 + (f0 % 7) * 6), F(f0), 0.3)                    # loaves into the boat
    P(gentle_whoosh(r), F(419), 0.3)
    P(G.creak(1.4, r, rate0=90, rate1=150, scale=0.8), F(430), 0.18, 0.3)                        # davit ropes creak
    P(gentle_whoosh(r), F(509), 0.3)
    for i in range(4): P(G.stroll_step(r, 0.4), F(522 + i * 12), 0.16, 0.1 * i)                  # walking to the cabin
    P(G.creak(0.8, r, rate0=120, rate1=200), F(566), 0.15)                                      # cabin door
    P(G.clink(r, f0=1800, dur=0.12), F(606), 0.3)                                               # glass raised
    P(gentle_whoosh(r), F(643), 0.3)
    P(groan(r, 2.2), F(652), 0.35, -0.3)                                                         # hull groan
    for f0 in (668, 686, 704): P(G.whoosh(0.5, r, peak=0.25), F(f0), 0.3, 0.3); P(G.wood_crack(r)[:ns(0.4)], F(f0 + 4), 0.18, 0.3)  # chairs flung
    for f0 in (694, 712, 730): P(splash(r, 0.8, 0.6), F(f0), 0.22, 0.4)                          # ...far below
    P(gentle_whoosh(r), F(729), 0.3)
    for f0, x in ((738, -0.4), (752, 0.4), (766, 0.0)): P(splash(r, 0.9), F(f0), 0.3, x)         # chairs hit the water
    P(gentle_whoosh(r), F(789), 0.3)
    P(groan(r, 3.0, 30, 50), F(796), 0.5); P(G.timber_tear(r, 1.0), F(816), 0.25)                # the ship sinks
    P(G.creak(1.4, r, rate0=60, rate1=110, modes=G.CHAIN), F(840), 0.25, 0.2)
    P(gentle_whoosh(r), F(874), 0.3)
    P(G.creak(0.9, r, rate0=150, rate1=230), F(884), 0.18)                                      # grip on the rail
    P(gentle_whoosh(r), F(906), 0.3)
    P(groan(r, 2.6, 25, 45), F(918), 0.45); P(G.splash_big(r), F(964), 0.4)                       # stern plunges
    P(splash(r, 0.7, 0.7), F(988), 0.3)                                                          # pops up
    P(ting(r, 3136), F(1025), 0.22)
    P(chatter(r, 1.6), F(1090), 0.12); P(G.whoosh(1.2, r, peak=0.4, f_lo=200, f_hi=900), F(1128), 0.25)  # shivering + icy gust
    P(G.creak(1.0, r, rate0=80, rate1=120, scale=0.7), F(1270), 0.12, -0.3)                      # collapsible
    P(splash(r, 0.5, 0.5), F(1329), 0.25)                                                        # grabs his hand
    for i in range(4): P(splash(r, 0.4, 0.35), F(1350 + i * 11), 0.18, 0.3)                      # oars
    P(splash(r, 0.9), F(1380), 0.3)                                                              # pulled in
    P(G.boot(r, 0.6), F(1398), 0.2)
    P(gentle_whoosh(r), F(1434), 0.3)
    P(gentle_whoosh(r), F(1469), 0.3)
    P(G.clink(r, f0=1500, dur=0.12), F(1490), 0.2)
    P(bonk(r), F(1554), 0.3)                                                                     # NO (big X)
    P(gentle_whoosh(r), F(1557), 0.3)
    P(G.whoosh(1.0, r, peak=0.4, f_lo=300, f_hi=1200), F(1585), 0.22); P(chatter(r, 1.2), F(1621), 0.14)  # heat escaping
    P(gentle_whoosh(r), F(1646), 0.3)
    P(ting(r, 2637), F(1775), 0.3)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
