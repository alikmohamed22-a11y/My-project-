# [VK-audio] Stems for "Vikings never wore horned helmets": a Nordic drone + frame-drum + horn-call theme (D minor) for the fjord,
# a light pizzicato "dig" groove (D dorian, 120 bpm) for the archaeology, a mystery pluck for the question, a Romantic 1876 orchestra
# (string pad, brass) with a short public-domain Wagner "Ride" quote at the curtain, an oompah for "everywhere", a misty bronze-lur
# drone for the bog, and a big opera fanfare for the payoff. Stops on WRONG! and THE TWIST. SFX: waves, gulls/birds, breeze, the
# horns popping off, digging, stamps, crowd, applause, pencil, poster paper, whooshes at the cuts.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, scratch
DUR = 54.70; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 0.5  # 120 bpm
STOPS = [(F(79), F(96)), (F(1164), F(1182))]
def silent(t): return any(a <= t < b for a, b in STOPS)
def sec(t):
    fr = t * 30
    for a, b, n in [(0, 111, 'norse'), (111, 577, 'dig'), (577, 629, 'myst'), (629, 769, 'romance'), (769, 858, 'ride'), (858, 1091, 'romance'), (1091, 1164, 'oompah'), (1164, 1457, 'bog'), (1457, 1641, 'finale')]:
        if a <= fr < b: return n
    return None

def drum(vel, r, f0=70):
    t = tt(0.6); body = np.sin(phase(f0 * (1 + 0.6 * np.exp(-t / 0.02)))) * np.exp(-t / 0.18)
    return fades((body + 0.25 * bp(r.standard_normal(len(t)), 200, 1500) * np.exp(-t / 0.03)) * vel, 0.0, 0.05)
def lur(f, dur, vel, r): return lp(I.brass(f, dur, vel, r, kind='horn', scoop=-30) + 0.5 * I.brass(f / 2, dur, vel * 0.7, r, kind='tuba'), 1600)
def strings(notes, dur, vel, r): return I.pad([m2f(n) for n in notes], dur, vel, r, att=0.5, rel=0.8, warm=1800, detune=9, trem=lambda t: 1 + 0.08 * np.sin(2 * np.pi * 5.5 * t))

def music():
    buf = np.zeros((2, N)); r = rng(793)
    Dm, Bb, C, Am, F_, Gm = [50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 46, 50]
    prog = [Dm, Dm, Bb, C, Dm, Am, Bb, C]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4; ch = prog[bar]
        if s and not silent(t):
            if s in ('norse', 'finale') and (s == 'norse' or t > F(1466)):
                if beat == 0: place(buf, I.pad([m2f(n - 12) for n in ch] + [m2f(38)], B * 4, 0.12, r, att=0.3, rel=0.6, warm=900), t)
                if beat in (0, 2): place(buf, pan(drum(0.7, r), 0), t)
                if beat == 3: place(buf, pan(drum(0.35, r, 90), 0.1), t + B / 2)
                if bar % 2 == 0 and beat == 0: place(buf, pan(lur(m2f([62, 65, 69, 67][(k // 8) % 4]), B * 3, 0.16, r), -0.15), t)
            elif s == 'dig':
                if beat in (0, 2): place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.5, r, dur=0.4, bright=0.25, pos=0.3), 0), t)
                for e in range(2):
                    nn = ch[(beat * 2 + e) % 3] + 12; place(buf, pan(I.pluck(m2f(nn), 0.16 if e == 0 else 0.1, r, dur=0.18, bright=0.8, pos=0.12), 0.3 if e else -0.2), t + e * B / 2)
                place(buf, pan(I.brush(0.08 if beat % 2 else 0.04, r, dur=0.1), -0.1), t)
                if beat == 1 and bar % 2: place(buf, pan(I.glock(m2f(ch[2] + 24), 0.08, r, dur=0.6), 0.2), t + B / 2)
            elif s == 'myst':
                nn = [50, 53, 52, 49][k % 4]
                if beat % 2 == 0: place(buf, pan(I.pluck(m2f(nn + 12), 0.3, r, dur=0.3, bright=0.5, pos=0.25), 0.1), t)
                if beat == 0: place(buf, I.pad([m2f(50), m2f(53), m2f(56)], B * 4, 0.07, r, att=0.4, rel=0.6, warm=1200), t)
            elif s == 'romance':
                if beat == 0: place(buf, strings([n + 12 for n in ch] + [ch[0]], B * 4, 0.1, r), t)
                if beat in (0, 2): place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.4, r, dur=0.7, bright=0.2, pos=0.3), 0), t)
                if bar % 2 == 0 and beat == 0: place(buf, pan(I.brass(m2f(ch[2] + 12), B * 2.5, 0.12, r, kind='horn'), -0.2), t)
            elif s == 'oompah':
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.6, 0.3, r, kind='tuba'), 0), t)
                if beat in (1, 3): [place(buf, pan(I.brass(m2f(n), B * 0.35, 0.08, r, kind='stab'), 0.15), t) for n in ch]
                place(buf, pan(I.fife(m2f([74, 77, 81, 79, 77, 74, 72, 74][k % 8]), B * 0.9, 0.1, r), -0.15), t)
                if beat == 0: place(buf, pan(I.cymbal(0.05, r, dur=0.6), 0), t)
            elif s == 'bog':
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(38), m2f(45), m2f(50), m2f(57)], B * 8, 0.1, r, att=1.2, rel=1.5, warm=700), t)
                if beat == 2 and bar % 2 == 1: place(buf, pan(I.musicbox(m2f([74, 77, 81, 76][(k // 8) % 4]), 0.06, r, dur=1.6), 0.25), t)
        t += B; k += 1
    # Ride quote (Wagner, public domain): dotted 9/8 figure on brass as the curtain opens
    RIDE = [(0, 59, 0.12), (0.18, 54, 0.06), (0.24, 59, 0.12), (0.42, 62, 0.45), (0.9, 59, 0.12), (1.08, 62, 0.06), (1.14, 59, 0.12), (1.32, 62, 0.12), (1.5, 66, 0.12), (1.68, 62, 0.06), (1.74, 66, 0.12), (1.92, 69, 0.6)]
    for rep, t0 in enumerate([F(775), F(775) + 2.7]):
        for dt, nn, d in RIDE: place(buf, pan(I.brass(m2f(nn + (0 if rep == 0 else 2)), d + 0.08, 0.2, r, kind='horn'), -0.1), t0 + dt)
        place(buf, strings([47, 54, 59, 62], 2.6, 0.12, r), t0); place(buf, pan(I.timpani(m2f(35), 0.5, r), 0), t0)
    st = lambda notes, t0, gap=0.1, v=0.2, kind='stab': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.brass(m2f(38), 1.0, 0.22, r, kind='tuba', fall=-5), 0), F(80)); place(buf, I.cymbal(0.08, r, dur=1.0), F(79))          # WRONG!
    for f0 in (150, 174, 191): place(buf, pan(I.glock(m2f(81), 0.14, r, dur=0.6), 0.1), F(f0))                                        # yes yes yes
    place(buf, pan(I.pluck(m2f(38), 0.6, r, dur=1.0, bright=0.2, pos=0.3), 0), F(222)); place(buf, pan(I.brass(m2f(45), 0.6, 0.12, r, kind='tuba', fall=-3), 0), F(223))  # zero
    st([62, 65, 69, 74], F(384), 0.08, 0.16); place(buf, I.cymbal(0.1, r, dur=1.4), F(384))                                            # 1943
    for i, nn in enumerate([74, 77, 81, 86]): place(buf, pan(I.glock(m2f(nn + 12), 0.18, r, dur=1.0), 0), F(441) + i * 0.06)           # find
    place(buf, pan(I.brass(m2f(50), 0.5, 0.16, r, kind='stab'), 0), F(549))                                                             # no horns
    st([57, 62, 65, 69], F(648), 0.1, 0.16, 'horn'); place(buf, I.cymbal(0.1, r, dur=1.6), F(648))                                     # 1876
    st([62, 66, 69, 74], F(833), 0.1, 0.18, 'horn'); place(buf, I.cymbal(0.12, r, dur=1.6), F(833))                                    # Bayreuth
    for i, nn in enumerate([62, 66, 69, 74, 78]): place(buf, pan(I.glock(m2f(nn + 12), 0.18, r, dur=0.8), 0), F(938) + i * 0.05)      # horns grow
    st([65, 69, 72, 77], F(1069), 0.08, 0.16); st([65, 69, 72, 77], F(1134), 0.08, 0.18); place(buf, I.cymbal(0.12, r, dur=1.4), F(1134))
    place(buf, pan(I.timpani(m2f(38), 0.7, r), 0), F(1165)); place(buf, I.cymbal(0.1, r, dur=2.0), F(1165))                            # THE TWIST
    place(buf, pan(lur(m2f(50), 2.4, 0.2, r), -0.1), F(1200)); place(buf, pan(lur(m2f(57), 2.0, 0.16, r), 0.1), F(1282))              # bronze lurs
    for i, nn in enumerate([62, 65, 69, 74]): place(buf, pan(I.glock(m2f(nn + 12), 0.16, r, dur=1.0), 0), F(1412) + i * 0.07)
    st([62, 66, 69, 74, 78], F(1571), 0.09, 0.22, 'horn'); place(buf, I.cymbal(0.18, r, dur=2.2), F(1571)); place(buf, pan(I.timpani(m2f(38), 0.8, r), 0), F(1571))
    place(buf, strings([50, 54, 57, 62, 66], 2.2, 0.16, r), F(1571)); st([62, 74], F(1615), 0.14, 0.2, 'horn'); place(buf, pan(I.timpani(m2f(38), 0.6, r), 0), F(1622))
    return buf

def sfx():
    buf = np.zeros((2, N)); r = rng(794)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (111, 212, 288, 408, 464, 629, 769, 858, 978, 1091, 1279, 1377): P(gentle_whoosh(r), F(f0) - 0.25, 0.28)
    P(G.water_bed(3.7, r, close=0.6, slosh_rate=0.5), 0.0, 0.25); P(G.breeze(3.7, r, 0.5), 0.0, 0.12); P(G.bird_chirps(3.4, r, 0.3), 0.2, 0.08)
    P(bonk(r), F(79), 0.3); P(gentle_whoosh(r, 0.4, 0.5), F(80), 0.3); P(G.push_thump(r), F(81), 0.35)                             # horns pop, WRONG stamp
    P(G.breeze(15.5, r, 0.4), F(111), 0.08); P(G.bird_chirps(15.0, r, 0.4), F(111), 0.08)
    for i in range(10): P(scratch(r), F(120) + i * 0.55, 0.08, -0.2)                                                                  # brushing / trowel
    for f0 in (150, 174, 191): P(ting(r, 2637), F(f0), 0.12)
    P(G.push_thump(r), F(223), 0.35)                                                                                                  # ZERO stamp
    for i in range(6): P(G.boot(r, 0.6), F(300) + i * 0.7, 0.18); P(gentle_whoosh(r, 0.3, 0.3), F(305) + i * 0.7, 0.1)               # shovel
    P(ting(r, 3136), F(441), 0.25)
    P(G.push_thump(r), F(550), 0.35); P(ting(r, 3520), F(556), 0.12)                                                                  # NO HORNS
    P(G.water_bed(1.8, r, close=0.5), F(577), 0.15); P(bonk(r), F(600), 0.15)
    P(G.crickets(4.6, r), F(629), 0.06); P(G.babble(4.6, r, 190, 1.0, rate=4.2), F(629), 0.1); for_ = [P(G.stroll_step(r, 0.6), F(640) + i * 0.45, 0.1, -0.1 if i % 2 else 0.1) for i in range(9)]
    P(G.applause(2.6, r, 40), F(800), 0.16); P(G.babble(1.2, r, 210, 1.0), F(769), 0.08)
    for i in range(12): P(scratch(r), F(870) + i * 0.35, 0.06, 0.2)                                                                    # pencil
    P(G.whoa(r), F(940), 0.12); P(gentle_whoosh(r, 0.5, 0.5), F(934), 0.25)
    P(paper(r), F(1095), 0.25); P(paper(r), F(1120), 0.2); P(G.hurrah(r, 300, 1.2, kid=True), F(1100), 0.12); P(G.bird_chirps(2.4, r, 0.4), F(1091), 0.08)
    P(G.push_thump(r), F(1166), 0.3); P(G.breeze(9.8, r, 0.5), F(1164), 0.14); P(G.bird_chirps(9.6, r, 0.25), F(1170), 0.06); P(G.crickets(9.6, r), F(1164), 0.04)
    P(ting(r, 2637), F(1282), 0.15); P(ting(r, 3136), F(1337), 0.15)
    P(G.babble(3.2, r, 200, 1.0), F(1462), 0.06); P(G.applause(3.0, r, 60), F(1566), 0.25); P(G.hurrah(r, 220, 1.0), F(1572), 0.12); P(G.push_thump(r), F(1571), 0.3)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
