# [ZZ-audio] Stems for "The shortest war in history" (Anglo-Zanzibar War, 27 Aug 1896): a ticking-clock pizzicato hook, a warm harbour
# morning (harp-like plucks + pad), a hushed pad for the sultan's death, a bold pluck + low brass for the claim, a light snare-and-fife
# British office cue, a tightening ticking pulse to nine o'clock, timpani + low brass for the bombardment (no fanfare), a falling cue for
# the wreck, near-silence for the casualties (one soft sustained pad only), a music-box clock cue for the duration, a hushed "You see",
# and a dry, ironic pizzicato for the bill with a final music-box tick.
# SFX: clock ticks (hook / nine / void / end), a bell chime for 9:00, sea + gulls, hall murmur, pen + paper, distant booms + splashes,
# rowing, smoke rumble, garden crickets, coins + shell casings, a rubber stamp, whooshes at the cuts. Never comic over the casualties.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, boom, scratch
DUR = 1871 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 112
STOPS = [(F(1205), F(1372))]                     # casualties: no beat-driven music at all
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 138, 'tick'), (138, 226, 'harbor'), (226, 300, 'mourn'), (300, 478, 'claim'), (478, 650, 'brit'), (650, 873, 'tense'), (873, 1080, 'battle'),
       (1080, 1205, 'after'), (1205, 1372, 'toll'), (1372, 1497, 'clock'), (1497, 1690, 'yousee'), (1690, 1871, 'bill')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def tick(r, f0=1800, a=0.45):
    t = tt(0.05); return fades(bp(r.standard_normal(len(t)), f0, f0 * 2.4) * np.exp(-t / 0.007) * a, 0.0005, 0.005)
def tock(r): return tick(r, 1100, 0.4)
def bell(f, vel, r, dur=3.5):
    t = tt(dur); x = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / (dur * d)) for k, a, d in [(1, 1.0, 0.5), (2.0, 0.5, 0.3), (2.76, 0.35, 0.22), (5.4, 0.15, 0.1)])
    return fades(x * vel, 0.002, 0.3)
def thud(r, big=1.0):
    t = tt(1.6); x = np.sin(phase(42 * (1 + 1.2 * np.exp(-t / 0.05)))) * np.exp(-t / 0.35) + lp(r.standard_normal(len(t)), 300) * np.exp(-t / 0.25) * 0.6
    return fades(x * 0.7 * big, 0.002, 0.4)
def clinkc(r, f0=3200): return G.clink(r, f0=f0, dur=0.15)

def music():
    buf = np.zeros((2, N)); r = rng(1896)
    Dm, Gm, A7, F_, C_, Bb = [50, 53, 57], [55, 58, 62], [45, 49, 52, 55], [53, 57, 60], [48, 52, 55], [46, 50, 53]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s and not silent(t):
            if s == 'tick':
                ch = [Dm, Dm, Gm, A7][bar % 4]
                place(buf, pan(I.pluck(m2f(ch[beat % len(ch)] + 12), 0.1, r, dur=0.2, bright=0.4, pos=0.2), 0.2 if beat % 2 else -0.2), t)
                if beat == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.16, r, dur=0.5, bright=0.3, pos=0.3), 0), t)
            elif s == 'harbor':
                ch = [Dm, C_, Bb, A7][bar % 4]
                for e in range(4): place(buf, pan(I.pluck(m2f(ch[e % len(ch)] + 12 + (12 if e == 3 else 0)), 0.09, r, dur=0.7, bright=0.55, pos=0.12), -0.3 + e * 0.2), t + e * B / 4)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 8, 0.06, r, att=0.8, rel=1.0, warm=1300), t)
            elif s == 'mourn':
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in [50, 57, 62, 65]], B * 8, 0.07, r, att=1.0, rel=1.4, warm=900), t)
            elif s == 'claim':
                ch = [Dm, Bb, Gm, A7][bar % 4]
                place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.18, r, dur=0.3, bright=0.3, pos=0.3), 0), t)
                if beat in (1, 3): place(buf, pan(I.brush(0.04, r, dur=0.14), 0.1), t)
                if beat == 0 and bar % 2 == 0: place(buf, pan(I.brass(m2f(ch[0]), B * 1.8, 0.1, r, kind='horn'), -0.2), t)
                if beat == 2: place(buf, pan(I.pluck(m2f(ch[2] + 12), 0.08, r, dur=0.4, bright=0.6, pos=0.15), 0.25), t)
            elif s == 'brit':
                ch = [F_, C_, Bb, C_][bar % 4]
                place(buf, pan(I.snare(0.08 if beat % 2 else 0.12, r, dur=0.15), 0.05), t)
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.12, r, kind='tuba'), 0), t)
                if beat == 0: place(buf, pan(I.fife(m2f(ch[2] + 24), B * 0.9, 0.05, r), 0.2), t)
                if beat == 2: place(buf, pan(I.fife(m2f(ch[1] + 24), B * 0.9, 0.045, r), 0.2), t)
            elif s == 'tense':
                fr = t * 30; up = min(1, max(0, (fr - 650) / 220))
                ch = [Dm, Dm, Bb, A7][bar % 4]
                for e in range(2): place(buf, pan(I.pluck(m2f(ch[(beat + e) % len(ch)]), 0.08 + 0.06 * up, r, dur=0.18, bright=0.35, pos=0.3), -0.2 + 0.4 * e), t + e * B / 2)
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.04 + 0.04 * up, r, att=0.3, rel=0.4, warm=1100), t)
                if beat in (0, 2): place(buf, pan(I.timpani(m2f(38), 0.12 + 0.2 * up, r, dur=0.8), 0), t)
            elif s == 'battle':
                if beat == 0: place(buf, I.pad([m2f(n) for n in [38, 45, 50, 53]], B * 4, 0.06, r, att=0.2, rel=0.6, warm=700), t)
                if beat in (0, 3): place(buf, pan(I.timpani(m2f(38 if beat == 0 else 33), 0.3, r, dur=1.0), 0), t)
            elif s == 'after':
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in [43, 50, 55, 58]], B * 8, 0.06, r, att=0.6, rel=1.2, warm=800), t)
                if beat == 0: place(buf, pan(I.pluck(m2f([50, 48, 46, 45][bar % 4]), 0.1, r, dur=1.0, bright=0.25, pos=0.3), 0), t)
            elif s == 'clock':
                ch = [F_, C_, Dm, Bb][bar % 4]
                place(buf, pan(I.musicbox(m2f(ch[beat % len(ch)] + 24), 0.08, r, dur=1.0), 0.25 if beat % 2 else -0.25), t)
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.05, r, att=0.4, rel=0.6, warm=1600, detune=8), t)
            elif s == 'yousee':
                ch = [Dm, Bb, F_, A7][bar % 4]
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.07, r, att=0.6, rel=1.0, warm=1100), t)
                if beat in (0, 2): place(buf, pan(I.vibes(m2f(ch[beat % len(ch)] + 24), 0.05, r, dur=1.4), -0.15), t)
            elif s == 'bill':
                ch = [Dm, A7, Dm, A7][bar % 4]
                place(buf, pan(I.pluck(m2f(ch[beat % len(ch)]), 0.13, r, dur=0.16, bright=0.35, pos=0.3), 0.2 if beat % 2 else -0.2), t)
                if beat == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.16, r, dur=0.4, bright=0.25, pos=0.3), 0), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.16, kind='horn': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.timpani(m2f(38), 0.4, r), 0), F(94)); place(buf, I.cymbal(0.08, r, dur=1.6), F(94))               # before ten!
    place(buf, pan(I.vibes(m2f(74), 0.08, r, dur=2.2), 0), F(141))                                                       # Zanzibar
    place(buf, pan(I.vibes(m2f(62), 0.06, r, dur=2.8), 0), F(267))                                                       # died suddenly (soft)
    st([62, 65, 69], F(441), 0.08, 0.13)                                                                                  # without Britain's OK
    place(buf, pan(I.snare(0.2, r, dur=0.3), 0), F(561)); place(buf, pan(I.timpani(m2f(41), 0.4, r), 0), F(601))         # ultimatum / 9:00
    st([57, 62], F(783), 0.1, 0.12)                                                                                       # Glasgow
    place(buf, pan(I.timpani(m2f(33), 0.5, r), 0), F(846))                                                                # he stayed
    place(buf, pan(I.brass(m2f(38), 0.9, 0.16, r, kind='tuba', fall=-5), 0), F(1023))                                    # sunk
    place(buf, pan(I.timpani(m2f(31), 0.35, r, dur=3.0), 0), F(1178))                                                     # flag down
    place(buf, I.pad([m2f(n) for n in [38, 45, 50, 57]], F(1372) - F(1208), 0.05, r, att=1.6, rel=1.6, warm=700), F(1208))   # casualties: one quiet sustained chord
    for i, nn in enumerate([74, 77, 81, 86]): place(buf, pan(I.musicbox(m2f(nn), 0.1, r, dur=1.2), 0), F(1474) + i * 0.07)   # 38-45 minutes
    place(buf, pan(I.timpani(m2f(38), 0.3, r), 0), F(1497))                                                               # you see
    place(buf, pan(I.vibes(m2f(69), 0.07, r, dur=2.0), 0), F(1645))                                                       # boat
    place(buf, pan(I.pluck(m2f(62), 0.2, r, dur=0.3, bright=0.5), 0.2), F(1748)); place(buf, pan(I.pluck(m2f(61), 0.2, r, dur=0.5, bright=0.5), -0.2), F(1760))  # reportedly...
    st([50, 57, 62], F(1795), 0.09, 0.15); place(buf, I.cymbal(0.08, r, dur=1.8), F(1795))                              # pay for the shells
    place(buf, pan(I.musicbox(m2f(86), 0.1, r, dur=1.4), 0), F(1830)); place(buf, pan(I.musicbox(m2f(81), 0.09, r, dur=1.6), 0), F(1845))
    return buf

def sfx():
    buf = np.zeros((2, N)); r = rng(1827)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (138, 300, 478, 650, 873, 967, 1080, 1372, 1497, 1604, 1690): P(gentle_whoosh(r), F(f0) - 0.25, 0.26)
    for i in range(9): P(tick(r) if i % 2 == 0 else tock(r), F(2) + i * 0.5, 0.5, 0.1)                                   # hook clock ticks
    for i in range(14): P(tick(r), F(44) + i * 0.1, 0.35, 0.1)                                                           # hands race 9:02 -> 9:40
    P(G.water_bed(4.6, r, close=0.6), F(138), 0.12); P(G.bird_chirps(2.6, r, 0.3, kind='sparrow'), F(150), 0.04)        # harbour dawn
    P(G.babble(5.6, r, 180, 1.0, rate=3.6), F(300), 0.03); for_ = [P(G.stroll_step(r, 0.4), F(306) + i * 0.42, 0.08, -0.2) for i in range(5)]
    P(scratch(r), F(500), 0.08); P(paper(r), F(585), 0.12, 0.2)                                                          # pen, ultimatum
    for i in range(10): P(tick(r, 1500, 0.3), F(480) + i * 1.0, 0.18, -0.3)                                             # office wall clock
    P(G.water_bed(5.2, r, close=0.5), F(650), 0.1); P(G.flag_flutter(2.0, r), F(650), 0.05)
    for i in range(16): P(tick(r) if i % 2 == 0 else tock(r), F(650) + i * 0.45, 0.22 + 0.02 * i, 0.1)                # tension ticks build
    for i in range(4): P(tick(r), F(800) + i * 0.27, 0.6)                                                                 # last ticks
    P(bell(m2f(69), 0.25, r), F(808)); P(bell(m2f(62), 0.2, r), F(820))                                                  # 9 o'clock chime
    P(G.water_bed(3.5, r, close=0.6), F(873), 0.1)
    for i, (f0, g) in enumerate([(951, 1.0), (954, 0.8), (958, 0.9), (962, 0.7), (975, 0.6), (992, 0.5), (1006, 0.55), (1019, 0.5), (1050, 0.35), (1066, 0.3), (1085, 0.25)]):
        P(thud(r, g), F(f0), 0.32, -0.3 + 0.12 * (i % 6))                                                                 # distant booms (no explosions up close)
    for f0 in (990, 1003, 1015, 1030): P(G.splash_big(r), F(f0), 0.08, 0.2)
    P(G.bubbles(1.6, r, 18), F(1018), 0.08); P(G.creak(1.2, r), F(1012), 0.06)
    for i in range(4): P(G.splash_big(r), F(1042) + i * 0.7, 0.03, -0.2)                                                  # oars
    P(G.breeze(4.2, r, 0.5), F(1080), 0.12); P(G.flag_flutter(1.2, r), F(1160), 0.06)
    P(G.breeze(5.6, r, 0.4), F(1205), 0.1); P(G.water_bed(5.6, r, close=0.4), F(1205), 0.08)                            # quiet sea, nothing else
    for i in range(8): P(tick(r), F(1380) + i * 0.5, 0.26, 0.15)                                                        # the giant clock
    P(ting(r, 2637), F(1430), 0.1); P(ting(r, 3136), F(1454), 0.1)
    P(G.breeze(3.6, r, 0.4), F(1497), 0.08); for_ = [P(G.stroll_step(r, 0.6), F(1510) + i * 0.3, 0.09, 0.2) for i in range(10)]
    P(G.crickets(2.9, r), F(1604), 0.04); P(G.water_bed(2.9, r, close=0.8), F(1604), 0.1); P(G.stroll_step(r, 0.3), F(1645), 0.1)
    for i in range(6): P(tick(r, 1500, 0.3), F(1692) + i * 1.0, 0.16, -0.3)
    P(paper(r), F(1772), 0.14)
    for i in range(5): P(clinkc(r, 2800 + i * 300), F(1798) + i * 0.08, 0.1, 0.1 * i)     # coins / casings
    P(G.push_thump(r), F(1795), 0.28)                                                                                     # stamp
    for i in range(6): P(tick(r), F(1830) + i * 0.5, 0.4, 0.1)                                                           # the last ticks
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
