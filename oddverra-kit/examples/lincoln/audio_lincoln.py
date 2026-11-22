# [LN-audio] Stems for "Abraham Lincoln is in the Wrestling Hall of Fame": a playful frontier hoedown (G major, 132 bpm: upright-bass
# root/fifth on 1 & 3, banjo rolls in eighths, chopped chords on 2 & 4, brushes as a washboard, a synthesized bowed fiddle lead),
# a sneaky minor walk for the Clary's Grove Boys, a quiet banjo lullaby in the cabin, a fife-and-snare militia march for 1832,
# a brass-topped hoedown for the president / Hall of Fame, a pizzicato "mystery" bit for Thompson, stops on the punchlines and a
# "shave and a haircut" button. SFX: crowd babble / cheers / applause, body-slam thuds, dust whooshes, bell dings, stamps,
# boots, fire crackle, crickets, a quill scratching tally marks, paper flips.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, kick, boom, scratch
DUR = 64.05; N = ns(DUR); m2f = I.m2f
B = 60.0 / 132.0
F = lambda fr: fr / 30.0
STOPS = [(F(462), F(503)), (F(1447), F(1490)), (F(1843), F(1922))]
def silent(t): return any(a <= t < b for a, b in STOPS)
def sec(t):
    fr = t * 30
    for a, b, name in [(0, 462, 'hoe'), (503, 642, 'sneak'), (642, 954, 'fight'), (954, 1178, 'hoe'), (1178, 1338, 'lull'), (1338, 1447, 'march'), (1490, 1743, 'brass'), (1743, 1843, 'myst')]:
        if a <= fr < b: return name
    return None

def fiddle(f, dur, vel, r, vib=5.6):
    """bowed string: band-limited saw (additive), delayed vibrato, bow noise, body formants"""
    n = ns(dur + 0.08); t = np.arange(n) / SR
    vd = 0.006 * np.clip((t - 0.12) / 0.2, 0, 1); fr = f * (1 + vd * np.sin(2 * np.pi * vib * t + r.uniform(0, 6)))
    ph = np.cumsum(2 * np.pi * fr / SR); y = np.zeros(n)
    for h in range(1, 14):
        if f * h > 9000: break
        y += np.sin(h * ph) / h * (1.0 if h < 4 else 0.8)
    y += 0.08 * bp(r.standard_normal(n), 2000, 7000)
    y = bp(y, 250, 6000); y = y + 0.6 * bp(y, 2400, 3400) + 0.5 * bp(y, 450, 700)
    env = np.clip(t / 0.03, 0, 1) * np.clip((dur + 0.08 - t) / 0.08, 0, 1)
    return fades(y * env * vel * 0.18, 0.002, 0.03)

def banjo(f, vel, r, dur=0.35): return I.pluck(f, vel, r, dur=dur, bright=0.97, pos=0.08)

def music():
    buf = np.zeros((2, N)); r = rng(1831)
    G_, C_, D_, Em = [55, 59, 62, 67], [55, 60, 64, 67], [54, 57, 62, 66], [52, 55, 59, 64]
    prog = [G_, G_, C_, G_, G_, G_, D_, G_]; roots = [43, 43, 48, 43, 43, 43, 50, 43]
    tune = [74, 71, 74, 76, 79, 76, 74, 71, 72, 74, 76, 72, 71, 69, 67, 69, 71, 74, 76, 74, 71, 69, 67, 71, 69, 71, 72, 74, 72, 69, 66, 67]
    roll = [0, 2, 3, 1, 2, 3, 0, 3]
    t, k = 0.05, 0
    while t < DUR - 0.3:
        bar = (k // 4) % 8; beat = k % 4; s = sec(t)
        if not silent(t) and s:
            ch = prog[bar]; rt = roots[bar]
            if s in ('hoe', 'fight', 'brass'):
                if beat in (0, 2): place(buf, pan(I.pluck(m2f(rt - 12 + (7 if beat == 2 else 0)), 0.55, r, dur=0.4, bright=0.25, pos=0.3), 0), t)       # upright bass
                if beat in (1, 3):
                    for nn in ch[1:]: place(buf, pan(I.pluck(m2f(nn), 0.09, r, dur=0.12, bright=0.7, pos=0.2), -0.25), t)                    # chop
                for e in range(2): place(buf, pan(banjo(m2f(ch[roll[(beat * 2 + e) % 8]] + 12), 0.16 if e == 0 else 0.11, r), 0.3), t + e * B / 2)  # banjo roll
                place(buf, pan(I.brush(0.16 if beat % 2 else 0.08, r, dur=0.12), -0.1), t); place(buf, pan(I.brush(0.06, r, dur=0.08), -0.15), t + B / 2)
                if s == 'fight':
                    if beat in (1, 3): place(buf, pan(I.snare(0.16, r, tune=1.3, snappy=0.6), 0.05), t)
                    place(buf, pan(fiddle(m2f(tune[(k * 2) % 32]), B * 0.5, 0.75, r), -0.2), t); place(buf, pan(fiddle(m2f(tune[(k * 2 + 1) % 32]), B * 0.5, 0.6, r), -0.2), t + B / 2)
                elif s == 'hoe' and (k // 16) % 2 == 1 and t > 2.2:
                    place(buf, pan(fiddle(m2f(tune[k % 32]), B * 0.95, 0.7, r), -0.2), t)
                elif s == 'brass':
                    if beat == 0: place(buf, pan(I.brass(m2f(ch[1] + 12), B * 1.6, 0.18, r, kind='horn'), -0.15), t)
                    if beat == 2 and bar % 2: place(buf, pan(I.brass(m2f(ch[2] + 12), B * 1.6, 0.15, r, kind='horn'), 0.15), t)
                    if (k // 8) % 2 == 0: place(buf, pan(fiddle(m2f(tune[k % 32]), B * 0.95, 0.6, r), -0.2), t)
            elif s == 'sneak':
                eb = [40, 40, 43, 45, 47, 45, 43, 42][k % 8]
                place(buf, pan(I.pluck(m2f(eb), 0.5, r, dur=0.35, bright=0.25, pos=0.3), 0), t)
                if beat == 3: place(buf, pan(banjo(m2f(Em[k % 3 + 1] + 12), 0.12, r), 0.3), t + B / 2)
                place(buf, pan(I.brush(0.07, r, dur=0.1), -0.1), t + B / 2)
            elif s == 'lull':
                if beat in (0, 2): place(buf, pan(banjo(m2f(ch[roll[(k // 2) % 8]] + 12), 0.08, r, dur=0.8), 0.25), t)
                if beat == 0: place(buf, I.pad([m2f(nn) for nn in ch[:3]], B * 4, 0.06, r, att=0.4, rel=0.8, warm=700), t)
                if beat == 1 and bar % 2 == 0: place(buf, pan(I.musicbox(m2f(ch[3] + 12), 0.08, r, dur=1.2), -0.2), t)
            elif s == 'march':
                if beat in (0, 2): place(buf, pan(I.pluck(m2f(rt - 12), 0.5, r, dur=0.35, bright=0.25, pos=0.3), 0), t)
                place(buf, pan(I.snare(0.14 if beat % 2 else 0.2, r, tune=1.1, snappy=0.9), 0.05), t)
                if beat == 3: place(buf, pan(I.snare(0.08, r, tune=1.1, snappy=0.9), 0.05), t + B / 2)
                place(buf, pan(I.fife(m2f(tune[k % 32] + 12), B * 0.9, 0.12, r), -0.15), t)
            elif s == 'myst':
                nn = [43, 46, 45, 43, 50, 49, 48, 46][k % 8]
                if beat % 2 == 0: place(buf, pan(I.pluck(m2f(nn + 12), 0.3, r, dur=0.25, bright=0.5, pos=0.25), 0.1), t)
                if beat == 1: place(buf, pan(I.pluck(m2f(nn + 19), 0.12, r, dur=0.2, bright=0.8), -0.2), t + B / 2)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='stab': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    st([67, 71, 74, 79], F(49), 0.08); place(buf, I.cymbal(0.14, r, dur=1.4), F(49))                     # Hall of Fame
    st([74, 79], F(93), 0.12, 0.18)                                                                          # No, really
    for i, nn in enumerate([67, 71, 74, 79, 83]): place(buf, pan(I.glock(m2f(nn + 12), 0.2, r, dur=0.8), 0), F(250) + i * 0.06)   # six-foot-four
    place(buf, pan(I.pluck(m2f(31), 0.7, r, dur=1.2, bright=0.2, pos=0.3), 0), F(465)); place(buf, pan(I.brass(m2f(38), 1.0, 0.2, r, kind='tuba', fall=-4), 0), F(466))  # bad idea
    st([64, 67, 71], F(613), 0.1, 0.2); place(buf, I.timpani(m2f(40), 0.6, r), F(613))                       # Jack Armstrong
    for f0 in (830, 866, 923): place(buf, pan(I.brass(m2f(55 if f0 != 866 else 50), 0.3, 0.16, r, kind='stab'), 0), F(f0))
    st([67, 71, 74, 79, 83], F(1023), 0.08, 0.16, 'horn')                                                    # best friends
    st([74, 79, 83], F(1113), 0.1, 0.16)                                                                     # big buck
    for i, nn in enumerate([79, 83, 86]): place(buf, pan(I.glock(m2f(nn + 12), 0.2, r, dur=1.2), 0), F(1299) + i * 0.08)  # once
    place(buf, pan(I.timpani(m2f(43), 0.7, r), 0), F(1462)); place(buf, I.cymbal(0.12, r, dur=1.4), F(1462))  # thrown (in the stop)
    st([67, 71, 74, 79], F(1526), 0.1, 0.2, 'horn'); place(buf, I.cymbal(0.16, r, dur=1.6), F(1526))        # 16th president
    st([71, 74, 79, 83], F(1580), 0.09, 0.18); st([74, 79, 83, 86], F(1688), 0.09, 0.18); place(buf, I.cymbal(0.16, r, dur=1.8), F(1688))
    # button: "shave and a haircut ... two bits" on banjo + bass after "first name"
    for i, (nn, dt) in enumerate([(67, 0.0), (62, 0.22), (62, 0.33), (64, 0.44), (62, 0.66), (66, 1.32), (67, 1.54)]):
        place(buf, pan(banjo(m2f(nn + 12), 0.24, r, dur=0.5), 0.1), F(1856) + dt)
        if i >= 5: place(buf, pan(I.pluck(m2f(nn - 24), 0.5, r, dur=0.6, bright=0.3, pos=0.3), 0), F(1856) + dt)
    place(buf, I.cymbal(0.1, r, dur=1.2), F(1856) + 1.54)
    return buf

def thud(r, big=1.0):
    t = tt(0.6); body = np.sin(np.cumsum(2 * np.pi * (60 + 50 * np.exp(-t / 0.03)) / SR)) * np.exp(-t / 0.12)
    dust = bp(r.standard_normal(len(t)), 300, 3000) * np.exp(-t / 0.08) * 0.5
    return fades((body + dust) * big / 1.4, 0.0, 0.08)
def crackle(dur, r):
    y = G.rattle(dur, r, 14.0); return hp(y, 900) * 0.6
def quill(r, dur=0.25):
    t = tt(dur); n = r.standard_normal(len(t)); env = np.clip(t / 0.01, 0, 1) * np.clip((dur - t) / 0.04, 0, 1)
    return bp(n, 3000, 9000) * env * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * t)) * 0.7
def bell(r): return ting(r, 3136) * 0.8 + 0.5 * ting(r, 2093)

def sfx():
    buf = np.zeros((2, N)); r = rng(1832)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    W = lambda f0, g=0.3: P(gentle_whoosh(r), F(f0), g)
    for f0 in (54, 134, 194, 282, 338, 399, 497, 604, 636, 695, 749, 779, 813, 843, 866, 948, 1059, 1172, 1250, 1332, 1408, 1484, 1571, 1654, 1799): W(f0)
    P(G.babble(1.8, r, 200, 1.0, rate=4.0), 0.1, 0.05); P(ting(r, 2637), F(49), 0.28)                       # hall hook
    P(G.push_thump(r), F(94), 0.35); P(ting(r, 3520), F(101), 0.15)                                         # NO, REALLY stamp
    P(G.bird_chirps(4.6, r, 0.5), F(140), 0.14); P(G.breeze(4.0, r, 0.4), F(140), 0.12)                     # village
    P(bonk(r), F(229), 0.15); P(ting(r, 2637), F(256), 0.2)                                                  # 22 / 6'4"
    P(bell(r), F(290), 0.3)                                                                                  # store door bell
    P(G.hurrah(r, 140, 0.9), F(357), 0.12); P(G.hurrah(r, 150, 0.9), F(428), 0.16)                           # boss brags
    P(G.push_thump(r), F(466), 0.35)                                                                         # BAD IDEA stamp
    for i in range(14): P(G.stroll_step(r, 0.7), F(510) + i * 0.4 + (0.2 if i % 2 else 0), 0.25, -0.1 if i % 2 else 0.1)   # gang boots
    P(boom(r, 0.5, 1.4), F(613), 0.25)                                                                       # Jack
    P(G.babble(10.4, r, 210, 1.0, rate=4.6), F(642), 0.12); P(G.applause(1.6, r, 30), F(650), 0.18)          # village crowds around
    for f0 in (704, 716, 726, 738): P(thud(r, 0.7), F(f0), 0.35); P(gentle_whoosh(r, 0.5, 0.3), F(f0), 0.18)   # lock up / dust
    P(G.hurrah(r, 200, 1.0), F(705), 0.14)
    P(bonk(r), F(759), 0.2); P(G.babble(1.2, r, 230, 1.05, rate=5.0), F(787), 0.15)                          # who won? / differ
    P(thud(r, 1.2), F(822), 0.5); P(G.applause(1.6, r, 40), F(831), 0.25); P(G.hurrah(r, 210, 1.0), F(832), 0.15)  # body slam: Lincoln won
    P(bonk(r), F(866), 0.2)                                                                                  # draw
    P(G.push_thump(r), F(924), 0.35); P(G.oof(r, 'oof'), F(926), 0.2)                                       # FOUL
    P(G.applause(2.4, r, 30), F(1024), 0.22); P(ting(r, 3136), F(1024), 0.2)                                # best friends
    P(G.hurrah(r, 190, 1.0), F(1114), 0.2); P(G.applause(2.0, r, 36), F(1118), 0.22)                        # big buck
    P(crackle(5.4, r), F(1178), 0.25); P(G.crickets(5.4, r), F(1178), 0.07)                                  # cabin
    for i in range(10): P(quill(r), F(1210) + i * 0.15, 0.3, 0.1)                                            # tally quill/knife scratches
    P(ting(r, 3520), F(1300), 0.25)                                                                          # once
    P(G.breeze(3.8, r, 0.5), F(1338), 0.15); P(crackle(3.6, r), F(1338), 0.12); P(G.flag_flutter(3.6, r), F(1338), 0.08)  # camp
    P(G.babble(1.6, r, 190, 0.95, rate=4.4), F(1414), 0.14); P(G.hurrah(r, 180, 0.95), F(1418), 0.12)
    P(gentle_whoosh(r, 0.6, 0.5), F(1447), 0.35); P(thud(r, 1.5), F(1462), 0.6); P(G.whoa(r), F(1464), 0.18)  # THROWN
    P(G.bird_chirps(2.8, r, 0.5), F(1490), 0.12); P(G.applause(2.2, r, 40), F(1527), 0.24); P(G.hurrah(r, 220, 1.0), F(1528), 0.14)  # president
    P(ting(r, 2637), F(1581), 0.22)                                                                          # 1992
    P(quill(r, 0.6), F(1662), 0.25); P(G.applause(2.4, r, 30), F(1690), 0.22); P(ting(r, 3520), F(1689), 0.22)  # honored
    P(G.crickets(5.9, r), F(1743), 0.1); P(crackle(5.9, r), F(1743), 0.1)                                    # dusk camp
    P(bonk(r), F(1772), 0.18); P(paper(r), F(1827), 0.3); P(paper(r), F(1844), 0.3); P(bonk(r), F(1846), 0.2)  # who? names flip
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
