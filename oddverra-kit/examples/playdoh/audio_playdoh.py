# Stems for "Play-Doh was invented to clean your walls": bouncy 1950s Americana (C major, 126 bpm: walking upright-ish bass, ukulele
# plucks on the off-beat, brushed snare, whistled / glock tune), stops on the punchlines, a minor sparse stretch for the post-war slump,
# sad trombone on the sales crash, glock button. SFX: squish, scrub, coal rumble, cash register, sad trombone, kids laughing, ting, pops.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored, curve
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, chalk, bonk, kick, boom
DUR = 65.5; N = ns(DUR); m2f = I.m2f
B = 60.0 / 126.0
F = lambda fr: fr / 30.0  # frame -> seconds
# music stops on the punchlines: "to clean your walls", "the problem", "No more soot", "Her idea? Play-Doh", "off-white", the ending
STOPS = [(F(104), F(124)), (F(640), F(672)), (F(772), F(803)), (F(1462), F(1505)), (F(1698), F(1730)), (F(1912), F(1960))]
def silent(t): return any(a <= t < b for a, b in STOPS)
DARK = (F(628), F(1014))   # post-war slump: minor, no tune

def music():
    buf = np.zeros((2, N)); r = rng(1956)
    prog = [[60, 64, 67], [57, 60, 64], [62, 65, 69], [55, 59, 62, 65], [60, 64, 67], [57, 60, 64], [65, 69, 72], [55, 59, 62]]   # C Am Dm G7 C Am F G
    dprog = [[57, 60, 64], [53, 57, 60], [52, 55, 59], [52, 56, 59]]                                                          # Am F Em E (slump)
    walk = [[48, 52, 55, 57], [45, 48, 52, 55], [50, 53, 57, 55], [43, 47, 50, 53], [48, 52, 55, 52], [45, 47, 48, 52], [41, 45, 48, 47], [43, 45, 47, 43]]
    tune = [76, 79, 81, 79, 76, 74, 72, 74, 76, 76, 74, 72, 74, 76, 79, 77]
    t, k = 0.08, 0
    while t < 65.0:
        bar = (k // 4) % 8; beat = k % 4; dark = DARK[0] <= t < DARK[1]
        if not silent(t):
            if dark:
                ch = dprog[(k // 4) % 4]
                if beat == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.4, r, dur=0.9, bright=0.3, pos=0.2), 0), t)
                if beat in (1, 3):
                    for n in ch: place(buf, pan(I.pluck(m2f(n), 0.1, r, dur=0.3, bright=0.4, pos=0.1), 0.2), t)
                if beat == 2 and k % 8 == 6: place(buf, pan(I.glock(m2f(ch[2] + 12), 0.08, r, dur=1.2), -0.2), t)
            else:
                place(buf, pan(I.pluck(m2f(walk[bar][beat]), 0.5, r, dur=0.42, bright=0.35, pos=0.22), 0), t)           # walking bass
                for n in prog[bar]: place(buf, pan(I.pluck(m2f(n + 12), 0.12, r, dur=0.2, bright=0.85, pos=0.12), 0.25), t + B / 2)  # uke off-beats
                place(buf, pan(I.brush(0.22 if beat % 2 else 0.12, r, dur=0.22, swish=beat % 2 == 0), -0.15), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.1, r, tune=1.3, snappy=0.4), -0.1), t)
                if t > F(343) and (k // 16) % 2 == 1: place(buf, pan(I.glock(m2f(tune[k % 16] + 12), 0.14, r, dur=0.7), -0.25), t)   # glock tune
                if t > F(1014) and (k // 16) % 2 == 0 and k % 2 == 0: place(buf, pan(I.fife(m2f(tune[(k // 2) % 16]), B * 1.6, 0.1, r), 0.2), t)  # whistle line, act 3
        t += B; k += 1
    # stingers
    place(buf, pan(I.pluck(m2f(48), 0.6, r, dur=1.4, bright=0.5), 0), F(124)); place(buf, I.cymbal(0.18, r, dur=1.4), F(124))          # ...walls!
    for i, n in enumerate([67, 64, 60]): place(buf, pan(I.glock(m2f(n + 12), 0.2, r, dur=0.7), 0), F(601) + i * 0.12)                 # like crazy
    place(buf, pan(I.brass(m2f(40), 1.4, 0.22, r, kind='tuba', fall=-5), 0), F(650))                                                    # the problem
    place(buf, I.pad([m2f(x) for x in [57, 60, 64]], 2.2, 0.12, r, att=0.4, rel=1.0, warm=800), F(672))                              # after WWII
    for i, n in enumerate([60, 64, 67, 72]): place(buf, pan(I.glock(m2f(n + 12), 0.18, r, dur=0.8), 0.1), F(777) + i * 0.08)          # no more soot
    for j, n in enumerate([55, 54, 53, 50]): place(buf, pan(I.brass(m2f(n), 0.36 if j < 3 else 1.0, 0.24, r, kind='stab', fall=(-4 if j == 3 else 0)), 0), F(978) + j * 0.36)  # sad trombone
    for i, n in enumerate([60, 64, 67, 72, 76]): place(buf, pan(I.glock(m2f(n + 12), 0.2, r, dur=1.2), 0), F(1489) + i * 0.07)        # PLAY-DOH
    place(buf, I.pad([m2f(x) for x in [60, 64, 67, 72]], 1.6, 0.12, r, att=0.05, rel=1.0, warm=1400), F(1489))
    for i, n in enumerate([67, 72, 76, 79]): place(buf, pan(I.brass(m2f(n), 0.3 if i < 3 else 0.9, 0.2, r, kind='stab'), 0), F(1593) + i * 0.12)  # 1956 fanfare
    for f0, n in [(1757, 72), (1769, 76), (1787, 79)]: place(buf, pan(I.glock(m2f(n + 12), 0.24, r, dur=1.0), 0), F(f0))             # red yellow blue
    place(buf, I.pad([m2f(x) for x in [48, 55, 60, 64, 67]], 1.6, 0.16, r, att=0.04, rel=1.2, warm=1300), F(1921))                    # button
    for i, n in enumerate([67, 72, 76, 79, 84]): place(buf, pan(I.glock(m2f(n + 12), 0.24, r, dur=1.4), 0.1), F(1921) + i * 0.09)
    return buf

def squish(r, dur=0.32, f0=900, f1=260, wet=1.0):
    n = ns(dur); x = colored(n, r, slope=-1.0); env = np.exp(-tt(dur) / (dur * 0.35)) * np.minimum(1, tt(dur) / 0.01)
    fc = np.geomspace(f0, f1, n); y = np.zeros(n); seg = 256
    for i in range(0, n, seg): y[i:i + seg] = bp(x[i:i + seg + 512], fc[i] * 0.6, fc[i] * 1.6)[:len(y[i:i + seg])]
    body = modal(dur, [(140, 1.0, 0.06), (210, 0.5, 0.05)], r) * 0.6
    out = y * env * 3.0 * wet + body[:n]
    return fades(out / (np.abs(out).max() + 1e-9))
def scrub(r, dur, rate=5.0):
    n = ns(dur); x = bp(colored(n, r, slope=-0.5), 900, 4200); t = tt(dur); am = 0.55 + 0.45 * np.abs(np.sin(np.pi * rate * t))
    return fades(x * am / (np.abs(x).max() + 1e-9), 0.03, 0.08)
def rumble(r, dur=1.4):
    n = ns(dur); x = lp(colored(n, r, slope=-2.0), 180); t = tt(dur); env = np.minimum(1, t / 0.08) * np.exp(-t / 0.7)
    y = x * env; y = y / (np.abs(y).max() + 1e-9); return fades(y + 0.6 * G.rattle(dur, r, 26.0, heavy=True)[:n])
def register(r):
    bell = modal(1.1, [(1850, 1.0, 0.5), (2780, 0.6, 0.35), (4100, 0.3, 0.2)], r) * 0.6
    slide = bp(colored(ns(0.35), r, slope=-0.3), 300, 2400) * np.exp(-tt(0.35) / 0.15) * 0.5
    clk = G.clink(r, f0=1400, dur=0.08)
    out = np.zeros(ns(1.3)); out[:len(clk)] += clk * 0.7; s0 = ns(0.12); out[s0:s0 + len(slide)] += slide; b0 = ns(0.3); out[b0:b0 + len(bell)] += bell[:len(out) - b0]
    return fades(out / (np.abs(out).max() + 1e-9))
def whoomp(r, dur=0.6):
    n = ns(dur); t = tt(dur); x = colored(n, r, slope=-1.2); fc = 200 + 1600 * np.exp(-t / 0.12)
    y = np.zeros(n); seg = 256
    for i in range(0, n, seg): y[i:i + seg] = lp(x[i:i + seg + 512], fc[i])[:len(y[i:i + seg])]
    return fades(y * np.minimum(1, t / 0.02) * np.exp(-t / 0.25) / (np.abs(y).max() + 1e-9))
def pop(r, f0=900):
    t = tt(0.12); ph = 2 * np.pi * np.cumsum(f0 * np.exp(-t / 0.03) + 200) / SR; return fades(np.sin(ph) * np.exp(-t / 0.035))
def poof(r, dur=0.5):
    n = ns(dur); t = tt(dur); x = lp(colored(n, r, slope=-1.0), 900); return fades(x * np.minimum(1, t / 0.01) * np.exp(-t / 0.15) / (np.abs(x).max() + 1e-9))

def sfx():
    buf = np.zeros((2, N)); r = rng(77)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    P(squish(r), F(8), 0.35); P(pop(r, 1200), F(50), 0.3)                                       # hook: squish, "toy" pop
    P(gentle_whoosh(r), F(62), 0.3)
    P(scrub(r, 2.0, 4.0), F(78), 0.18, -0.2)                                                     # rolling the putty on the wall
    P(ting(r, 2637), F(114), 0.3)                                                                # to clean your walls
    P(gentle_whoosh(r), F(141), 0.3)
    P(rumble(r, 1.6), F(232), 0.45, 0.3); P(poof(r), F(238), 0.35, 0.3)                          # coal dumped
    for f0 in (264, 280, 298): P(poof(r, 0.6), F(f0), 0.2, 0.2)                                  # soot puffs
    P(bonk(r), F(288), 0.2)
    P(gentle_whoosh(r), F(337), 0.3)
    P(G.clink(r, f0=1100, dur=0.12), F(395), 0.25)                                              # Cincinnati
    P(squish(r, 0.4, 700, 200), F(439), 0.45)                                                    # doughy putty
    P(gentle_whoosh(r), F(464), 0.3)
    P(scrub(r, 1.3, 6.0), F(472), 0.3, -0.1)                                                     # rolled it across the wall
    P(squish(r, 0.3, 1100, 300), F(531), 0.35)                                                   # soot stuck
    P(register(r), F(586), 0.4); P(G.hurrah(r, 200, 1.0), F(603), 0.15)                          # sold like crazy
    P(G.push_thump(r), F(650), 0.5)                                                              # the problem
    P(gentle_whoosh(r), F(666), 0.3)
    P(whoomp(r), F(747), 0.4)                                                                    # gas heat
    P(G.hammer_hit(r, 0.8), F(777), 0.35)                                                        # NO MORE SOOT stamp
    P(gentle_whoosh(r), F(796), 0.3)
    P(scrub(r, 1.9, 5.0), F(848), 0.22, -0.2); P(G.bubbles(1.6, r, 18), F(852), 0.25)            # wipe with soap and water
    P(poof(r, 0.7), F(940), 0.2)                                                                 # dust on the can
    P(gentle_whoosh(r), F(956), 0.3)
    P(gentle_whoosh(r), F(1008), 0.3)
    P(ting(r, 3136), F(1063), 0.25)                                                              # Kay Zufall
    P(paper(r), F(1125), 0.35)                                                                   # newspaper
    P(ting(r, 3520), F(1162), 0.22)                                                              # light bulb
    P(gentle_whoosh(r), F(1196), 0.3)
    for f0 in (1222, 1236): P(squish(r, 0.25, 1200, 400), F(f0), 0.25)                           # kids squishing
    P(G.babble(1.4, r, 300, 1.25, rate=5.5), F(1258), 0.12, 0.1); P(G.hurrah(r, 320, 1.3, kid=True), F(1268), 0.22); P(G.hurrah(r, 360, 1.35, kid=True), F(1278), 0.16, -0.3)  # kids laugh
    P(gentle_whoosh(r), F(1298), 0.3)
    P(gentle_whoosh(r), F(1456), 0.3)
    P(chalk(r, 0.5), F(1489), 0.35); P(ting(r, 2637), F(1490), 0.3)                              # PLAY-DOH on the chalkboard
    P(gentle_whoosh(r), F(1501), 0.3)
    P(bonk(r), F(1528), 0.25)                                                                    # no detergent (X)
    P(G.bubbles(0.5, r, 30), F(1556), 0.2)                                                       # nicer smell
    P(gentle_whoosh(r), F(1575), 0.3)
    P(register(r), F(1633), 0.4)                                                                 # hit stores
    P(G.clink(r, f0=900, dur=0.1), F(1708), 0.2)
    for f0, fr in ((1757, 900), (1769, 1100), (1787, 1300)): P(pop(r, fr), F(f0), 0.4)          # red / yellow / blue
    P(gentle_whoosh(r), F(1799), 0.3)
    P(squish(r, 0.5, 800, 180), F(1838), 0.5)                                                    # a kid squishes Play-Doh
    P(ting(r, 2637), F(1921), 0.3)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
