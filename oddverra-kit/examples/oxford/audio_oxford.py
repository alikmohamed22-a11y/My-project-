# [OX-audio] Stems for "Oxford University is older than the Aztec Empire": a curious music-box + vibes motif for the night study,
# a lute-and-fife medieval dance (D dorian) with tabor for 1096-1167 Oxford, a slow candle-lit hall pad with plucks, a misty pad and
# then a drum-and-flute pentatonic groove for Tenochtitlan 1325-1428, a ticking clock bed for the timeline, night vibes for
# "You see", a wide desert/arctic swell with horns for the pyramid and the mammoths, and a warm golden reprise of the dance at the end.
# SFX: clock ticks, sand trickle, whooshes at every cut, town birds/breeze/babble, footsteps, a crowd gasp, stone rumble as halls
# rise, candle crackle + murmur, lake water, birds, drums, drawer + paper, card flutter, desert breeze, arctic wind, a mammoth trumpet.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk
DUR = 1878 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 112
SEC = [(0, 149, 'study'), (149, 521, 'dance'), (521, 643, 'hall'), (643, 729, 'mist'), (729, 973, 'drums'), (973, 1119, 'clock'), (1119, 1300, 'yousee'), (1300, 1626, 'wide'), (1626, 1716, 'clock'), (1716, 1878, 'gold')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def kickd(vel, r, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)
def lute(f, vel, r, dur=0.7): return I.pluck(f, vel, r, dur=dur, bright=0.55, pos=0.13)
def drum(f, vel, r):
    t = tt(0.5); return fades(np.sin(phase(f * (1 + 0.5 * np.exp(-t / 0.04)))) * np.exp(-t / 0.16) * vel + lp(r.standard_normal(len(t)), 900) * np.exp(-t / 0.02) * vel * 0.2, 0.0, 0.03)
def rattle(vel, r): return fades(bp(r.standard_normal(ns(0.18)), 3500, 8000) * np.exp(-tt(0.18) / 0.05) * vel, 0.002, 0.03)
def tick(r, hi=True): t = tt(0.05); return fades(bp(r.standard_normal(len(t)), 3200 if hi else 2200, 6000 if hi else 4200) * np.exp(-t / 0.008) * 0.6, 0.0, 0.01)

def music():
    buf = np.zeros((2, N)); r = rng(1096)
    DOR = [62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79]                        # D dorian
    DMEL = [4, 3, 4, 5, 7, 5, 4, 3, 2, 3, 4, 2, 1, 0, 1, 2]
    PENT = [62, 65, 67, 69, 72, 74, 77, 79]                                  # D minor pentatonic (flute)
    PMEL = [4, 3, 2, 3, 4, 5, 4, 2, 1, 2, 3, 2, 0, 1, 2, 0]
    Dm, C, Am, F_, G_, Bb = [50, 57, 62], [48, 55, 60], [45, 52, 57], [41, 48, 53], [43, 50, 55], [46, 53, 58]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s == 'study':
            ch = [Dm, Bb, F_, C][bar % 4]
            if beat % 2 == 0: place(buf, pan(I.musicbox(m2f(DOR[DMEL[(k // 2) % 16]] + 12), 0.1, r, dur=1.0), 0.15), t)
            if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.06, r, att=0.5, rel=0.8, warm=1100), t)
            if beat == 3: place(buf, pan(I.vibes(m2f(ch[2] + 24), 0.05, r, dur=0.9), -0.2), t + B / 2)
        elif s in ('dance', 'gold'):
            g = 1.0 if s == 'dance' else 0.9; ch = [Dm, C, Dm, Am][bar % 4] if s == 'dance' else [F_, C, Dm, Bb][bar % 4]
            place(buf, pan(lute(m2f(ch[0]), 0.16 * g, r), -0.15), t)
            place(buf, pan(lute(m2f(ch[(beat + 1) % 3] + 12), 0.1 * g, r, 0.4), 0.2), t + B / 2)
            if beat in (0, 2): place(buf, pan(drum(110, 0.2 * g, r), 0), t)
            if beat in (1, 3): place(buf, pan(I.brush(0.04, r, dur=0.12), 0.1), t)
            if beat % 2 == 0: place(buf, pan(I.fife(m2f(DOR[DMEL[(k // 2) % 16]] + 12), B * 1.6, 0.07 * g, r), 0.05), t)
            if s == 'gold' and beat == 0: place(buf, pan(I.glock(m2f(DOR[DMEL[k % 16]] + 24), 0.05, r, dur=1.2), -0.1), t)
            if s == 'gold' and beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 8, 0.06, r, att=0.8, rel=1.0, warm=1400), t)
        elif s == 'hall':
            ch = [Dm, Bb, C, Am][bar % 4]
            if beat == 0: place(buf, I.pad([m2f(n) for n in ch] + [m2f(ch[0] + 24)], B * 4, 0.08, r, att=0.6, rel=0.9, warm=800), t)
            if beat % 2 == 0: place(buf, pan(lute(m2f(DOR[DMEL[(k // 2) % 16]]), 0.14, r, 0.9), 0.15), t)
        elif s == 'mist':
            if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(50), m2f(57), m2f(64)], B * 8, 0.07, r, att=1.0, rel=1.0, warm=900), t)
            if beat == 2: place(buf, pan(I.fife(m2f(PENT[PMEL[(k // 2) % 16]] + 12), B * 1.8, 0.06, r), 0.1), t)
        elif s == 'drums':
            place(buf, pan(drum(90 if beat in (0, 2) else 140, 0.28 if beat == 0 else 0.18, r), -0.1), t)
            place(buf, pan(drum(140, 0.12, r), 0.1), t + B / 2)
            place(buf, pan(rattle(0.05, r), 0.3), t + B / 4); place(buf, pan(rattle(0.04, r), 0.3), t + 3 * B / 4)
            if beat % 2 == 0: place(buf, pan(I.fife(m2f(PENT[PMEL[(k // 2) % 16]] + 12), B * 1.6, 0.08, r), 0.05), t)
            if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(50), m2f(57), m2f(62)], B * 8, 0.05, r, att=0.6, rel=0.9, warm=1000), t)
        elif s == 'clock':
            ch = [Dm, F_, C, Am][bar % 4]
            place(buf, pan(I.pluck(m2f(ch[beat % 3] + 12), 0.1, r, dur=0.3, bright=0.45, pos=0.2), 0.2), t)
            if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.06, r, att=0.4, rel=0.7, warm=1200), t)
            if beat == 2: place(buf, pan(I.vibes(m2f(ch[1] + 24), 0.05, r, dur=0.8), -0.2), t)
        elif s == 'yousee':
            ch = [Dm, Bb, F_, C][bar % 4]
            if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.07, r, att=0.4, rel=0.8, warm=1400), t)
            place(buf, pan(I.vibes(m2f(ch[beat % 3] + 24), 0.07, r, dur=0.9), -0.15), t)
            place(buf, pan(I.pluck(m2f(ch[(beat + 1) % 3] + 12), 0.09, r, dur=0.25, bright=0.4, pos=0.2), 0.25), t + B / 2)
        elif s == 'wide':
            ch = [Dm, Bb, F_, C][bar % 4]
            if beat == 0: place(buf, I.pad([m2f(n) for n in ch] + [m2f(ch[0] + 24)], B * 4, 0.09, r, att=0.5, rel=0.9, warm=1300, detune=9), t)
            if beat in (0, 2): place(buf, pan(I.timpani(m2f(ch[0] - 12), 0.2 if beat == 0 else 0.12, r), 0), t)
            if beat == 0 and bar % 2 == 0: place(buf, pan(I.brass(m2f(ch[1] + 12), B * 3, 0.1, r, kind='horn'), -0.2), t)
            place(buf, pan(I.pluck(m2f(ch[beat % 3] + 24), 0.06, r, dur=0.3, bright=0.5, pos=0.15), 0.25), t + B / 2)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='horn': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.brass(m2f(38), 0.9, 0.2, r, kind='tuba', fall=-5), 0), F(69)); place(buf, I.cymbal(0.08, r, dur=1.0), F(69))          # Aztec Empire?!
    place(buf, I.cymbal(0.1, r, dur=1.6), F(149)); place(buf, pan(I.timpani(m2f(38), 0.6, r), 0), F(150))                              # time jump 1096
    for i, nn in enumerate([74, 77, 81, 86]): place(buf, pan(I.glock(m2f(nn), 0.12, r, dur=0.9), 0), F(252) + i * 0.06)                 # 1096
    st([62, 65, 69], F(300), 0.08, 0.14); st([62, 66, 69, 74], F(336), 0.08, 0.16)                                                       # 1167 / King Henry
    place(buf, pan(I.brass(m2f(38), 0.8, 0.22, r, kind='tuba', fall=-4), 0), F(359)); place(buf, I.cymbal(0.1, r, dur=1.2), F(359))       # banned
    place(buf, pan(I.brass(m2f(36), 0.9, 0.2, r, kind='tuba', fall=-6), 0), F(410))                                                     # no Paris
    st([62, 65, 69, 74, 77], F(481), 0.08, 0.18); place(buf, I.cymbal(0.12, r, dur=1.6), F(481))                                           # grew fast
    place(buf, pan(I.vibes(m2f(81), 0.1, r, dur=1.4), 0), F(705)); place(buf, pan(I.brass(m2f(38), 0.7, 0.16, r, kind='tuba', fall=-4), 0), F(705))  # not yet
    for i, nn in enumerate([74, 77, 79, 81]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.8), 0), F(780) + i * 0.07)                   # founded
    st([62, 65, 69, 74], F(934), 0.08, 0.2); place(buf, I.cymbal(0.14, r, dur=1.8), F(934)); place(buf, pan(I.timpani(m2f(38), 0.7, r), 0), F(934))  # 1428
    place(buf, I.cymbal(0.1, r, dur=1.4), F(973)); st([62, 65, 69, 74], F(1045), 0.08, 0.16)                                             # over 300 years
    place(buf, pan(I.vibes(m2f(81), 0.12, r, dur=1.4), 0), F(1084))                                                                       # how?
    place(buf, pan(I.timpani(m2f(38), 0.5, r), 0), F(1119)); place(buf, pan(I.brass(m2f(41), 0.6, 0.14, r, kind='tuba', fall=-3), 0), F(1203))  # you see / ancient
    for i, nn in enumerate([74, 77, 81, 84, 86]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.8), 0), F(1230) + i * 0.08)             # overlaps
    place(buf, I.cymbal(0.12, r, dur=1.8), F(1300)); place(buf, pan(I.timpani(m2f(38), 0.7, r), 0), F(1300))
    st([62, 65, 69, 74], F(1405), 0.08, 0.18); place(buf, I.cymbal(0.12, r, dur=1.6), F(1405))                                           # still alive
    place(buf, I.cymbal(0.16, r, dur=2.2), F(1560)); st([58, 65, 70, 74, 77], F(1600), 0.09, 0.2); place(buf, pan(I.timpani(m2f(34), 0.8, r), 0), F(1600))  # finished
    st([62, 65, 69, 74], F(1682), 0.08, 0.16)                                                                                             # check the dates
    st([65, 69, 72, 77], F(1750), 0.09, 0.18); place(buf, I.cymbal(0.12, r, dur=1.8), F(1750))                                           # already old
    st([62, 65, 69, 74, 77, 81], F(1810), 0.09, 0.22); place(buf, I.cymbal(0.16, r, dur=2.4), F(1810)); place(buf, pan(I.timpani(m2f(38), 0.8, r), 0), F(1816))  # born
    return buf

def trickle(dur, r): x = bp(r.standard_normal(ns(dur)), 3000, 7000) * (0.5 + 0.5 * np.abs(np.sin(tt(dur) * 40))); return fades(x * 0.3, 0.05, 0.2)
def rumble(dur, r): x = lp(r.standard_normal(ns(dur)), 140) * 2.0; return fades(x * np.minimum(1, tt(dur) / 0.3), 0.1, 0.4)
def crackle(dur, r): x = np.zeros(ns(dur)); idx = r.integers(0, len(x), int(dur * 12)); x[idx] = r.uniform(-1, 1, len(idx)); return fades(hp(lp(x, 4000), 800) * 0.8, 0.05, 0.1)
def trumpet(r):
    t = tt(1.1); f = 380 * (1 + 0.25 * np.minimum(1, t / 0.2)) * (1 - 0.1 * np.maximum(0, t - 0.6)); x = np.tanh(np.sin(phase(f)) * 3) * np.exp(-np.maximum(0, t - 0.7) / 0.2) * 0.5
    return fades(lp(x + 0.4 * np.tanh(np.sin(phase(f * 1.5)) * 2), 2600), 0.03, 0.15)
def sfx():
    buf = np.zeros((2, N)); r = rng(1428)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (102, 149, 287, 431, 521, 643, 729, 844, 973, 1077, 1119, 1300, 1422, 1560, 1626, 1716): P(gentle_whoosh(r), F(f0) - 0.25, 0.28)
    for i in range(10): P(tick(r, i % 2 == 0), F(4) + i * 0.5, 0.25, 0.1)                                                                 # study clock
    P(G.whoa(r), F(70), 0.08); P(bonk(r), F(69), 0.18)
    P(trickle(1.2, r), F(118), 0.2); P(G.push_thump(r), F(129), 0.22); P(G.push_thump(r), F(125), 0.24)                                  # sand flip / stamp
    P(G.breeze(12.4, r, 0.4), F(149), 0.1); P(G.bird_chirps(12, r, 0.4), F(152), 0.08); P(G.babble(12, r, 190, 1.0), F(155), 0.035)
    P(paper(r), F(212), 0.1); P(ting(r, 2637), F(252), 0.1)
    P(G.push_thump(r), F(359), 0.3); P(G.whoa(r), F(362), 0.1); P(G.babble(1.4, r, 200, 1.0, rate=5), F(364), 0.07); P(G.push_thump(r), F(410), 0.28); P(paper(r), F(345), 0.12)
    for i in range(12): P(G.stroll_step(r, 0.5), F(436) + i * 0.32, 0.1, -0.15 if i % 2 else 0.15)                                     # scholars arriving
    P(rumble(1.4, r), F(468), 0.3); for_ = [P(G.hammer_hit(r, 0.6), F(472) + i * 0.3, 0.08, 0.2) for i in range(4)]
    P(G.hurrah(r, 240, 0.9), F(484), 0.08)
    P(crackle(4.0, r), F(521), 0.12, 0.1); P(G.babble(4.0, r, 160, 1.0, rate=3.0), F(523), 0.04)
    P(G.babble(0.8, r, 210, 1.0, rate=5.5), F(584), 0.08, -0.2); P(G.babble(0.8, r, 260, 0.9, rate=5.5), F(612), 0.08, 0.2)               # ERGO! / SED...!
    P(G.water_bed(11, r, 0.6), F(643), 0.12); P(G.bird_chirps(10, r, 0.3), F(650), 0.07)
    P(G.push_thump(r), F(705), 0.24); P(ting(r, 3136), F(780), 0.12)
    P(G.hurrah(r, 260, 1.1), F(936), 0.1); P(G.applause(1.6, r, 30), F(940), 0.08)
    for i in range(14): P(tick(r, i % 2 == 0), F(976) + i * 0.5, 0.2, 0.1)                                                               # clock under the timeline
    P(G.push_thump(r), F(1045), 0.26); P(ting(r, 3136), F(1088), 0.15)
    P(G.swing_squeak(r, 0.6), F(1124), 0.12, 0.3)                                                                                         # drawer opens
    for i in range(4): P(paper(r), F(1146) + i * 0.4, 0.12, 0.2)
    P(G.push_thump(r), F(1197), 0.3); P(G.push_thump(r), F(1203), 0.22)                                                                  # drawer shut / ANCIENT
    P(G.swing_squeak(r, 0.9), F(1226), 0.12, 0.3); for_ = [P(paper(r), F(1230) + i * 0.15, 0.14, -0.2 + i * 0.1) for i in range(5)]
    P(G.breeze(2.4, r, 0.5, bright=1400), F(1300), 0.12, -0.3); P(G.push_thump(r), F(1405), 0.22)
    P(G.breeze(8.2, r, 0.8, gust=0.3, bright=600), F(1370), 0.16, 0.3)                                                                  # arctic wind
    for i in range(10): P(G.stroll_step(r, 0.2), F(1430) + i * 0.6, 0.12, 0.2)                                                           # mammoth steps (soft)
    P(trumpet(r), F(1512), 0.22, 0.2)
    P(G.breeze(4, r, 0.5), F(1560), 0.08); P(G.push_thump(r), F(1600), 0.26)
    P(G.push_thump(r), F(1682), 0.26); P(ting(r, 3136), F(1690), 0.12)
    P(G.breeze(5.4, r, 0.4), F(1716), 0.1); P(G.bird_chirps(5, r, 0.3), F(1720), 0.07)
    P(G.push_thump(r), F(1750), 0.24); P(G.push_thump(r), F(1810), 0.28); P(ting(r, 3136), F(1816), 0.15)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
