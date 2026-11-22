# [LB-audio] Stems for "Lamborghini started as a tractor maker": a dark showroom sting for the hook, a bouncy Italian mandolin/accordion
# tarantella-style groove (A minor -> C major, 132 bpm) on the farm, a night-blue mystery pluck in the works, a tense low pulse in the
# office, a driving 60s strings-and-brass groove for the factory, a glamorous fanfare at the 1966 show, a stop + hit for the twist and a
# warm golden reprise of the farm tune for the payoff. SFX: tractor putter, clanks, cheering farmers, engine stall + sputter, bench
# clinks, desk thump, factory hum, camera flashes, crowd gasp + applause, sheet whoosh, whooshes at the cuts.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, scratch, engine
DUR = 49.50; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 132
STOPS = [(F(1160), F(1176)), (F(1252), F(1263))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 99, 'hook'), (99, 411, 'farm'), (411, 654, 'night'), (654, 850, 'office'), (850, 1058, 'factory'), (1058, 1160, 'show'), (1160, 1278, 'twist'), (1278, 1485, 'gold')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def accord(notes, dur, vel, r): return lp(I.pad([m2f(n) for n in notes], dur, vel, r, att=0.03, rel=0.12, warm=2600, detune=12, trem=lambda t: 1 + 0.12 * np.sin(2 * np.pi * 6.2 * t)), 3800)
def mando(f, vel, r): return I.pluck(f, vel, r, dur=0.22, bright=0.85, pos=0.1)
def kickd(vel, r, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)

def music():
    buf = np.zeros((2, N)); r = rng(1963)
    Am, Dm, E7, C, G7, F_ = [57, 60, 64], [50, 53, 57], [52, 56, 59, 62], [48, 52, 55], [43, 47, 50, 53], [53, 57, 60]
    progF = [Am, Am, Dm, E7, Am, Dm, E7, Am]; progG = [C, F_, G7, C, C, F_, G7, C]
    MEL = [76, 74, 72, 71, 72, 69, 71, 72, 74, 76, 77, 76, 74, 72, 71, 69]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s and not silent(t):
            if s in ('farm', 'gold'):
                ch = (progF if s == 'farm' else progG)[bar]; g = 1.0 if s == 'farm' else 0.85
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.18 * g, r, kind='tuba'), 0), t)
                if beat in (1, 3): place(buf, accord([n + 12 for n in ch[:3]], B * 0.45, 0.07 * g, r), t)
                for e in range(2): place(buf, pan(mando(m2f(MEL[(k * 2 + e) % 16] + (0 if s == 'farm' else 3)), (0.13 if e == 0 else 0.09) * g, r), 0.25), t + e * B / 2)
                place(buf, pan(I.brush(0.05, r, dur=0.1), 0.1), t + B / 2)
                if s == 'gold' and beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.06, r, att=0.4, rel=0.8, warm=1600), t)
            elif s == 'hook':
                if beat == 0: place(buf, I.pad([m2f(45), m2f(52), m2f(57), m2f(60)], B * 4, 0.1, r, att=0.2, rel=0.6, warm=1100), t)
                place(buf, pan(kickd(0.4 if beat in (0, 2) else 0.2, r), 0), t)
            elif s == 'night':
                nn = [57, 60, 64, 63][k % 4]
                if beat % 2 == 0: place(buf, pan(I.pluck(m2f(nn), 0.24, r, dur=0.4, bright=0.45, pos=0.25), 0.15), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(45), m2f(52), m2f(60)], B * 8, 0.07, r, att=0.6, rel=0.9, warm=900), t)
                if beat == 3: place(buf, pan(I.vibes(m2f(76 if bar % 2 else 75), 0.06, r, dur=1.0), -0.2), t)
            elif s == 'office':
                place(buf, pan(I.pluck(m2f(40), 0.3 if beat in (0, 2) else 0.18, r, dur=0.3, bright=0.2, pos=0.3), 0), t)
                if beat == 0: place(buf, I.pad([m2f(52), m2f(55), m2f(58)], B * 4, 0.06, r, att=0.3, rel=0.5, warm=900), t)
            elif s == 'factory':
                ch = [C, C, F_, G7][bar % 4]
                place(buf, pan(kickd(0.5 if beat in (0, 2) else 0.25, r), 0), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.18, r, dur=0.2), 0.05), t)
                for e in range(2): place(buf, pan(I.pluck(m2f(ch[(beat + e) % len(ch)] + 12), 0.1, r, dur=0.2, bright=0.7, pos=0.12), 0.3), t + e * B / 2)
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.08, r, att=0.2, rel=0.5, warm=2000, detune=9), t)
                if beat == 0 and bar % 2 == 0: place(buf, pan(I.brass(m2f(ch[2] + 12), B * 1.5, 0.12, r, kind='horn'), -0.2), t)
            elif s == 'show':
                ch = [C, F_, G7, C][bar % 4]
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch] + [m2f(ch[0])], B * 4, 0.12, r, att=0.3, rel=0.8, warm=2400, detune=10), t)
                place(buf, pan(I.cymbal(0.03, r, dur=0.3), 0.2), t + B / 2)
            elif s == 'twist':
                if beat == 0: place(buf, I.pad([m2f(45), m2f(48), m2f(52)], B * 4, 0.07, r, att=0.4, rel=0.6, warm=1000), t)
                if beat % 2 == 0: place(buf, pan(I.pluck(m2f([69, 72, 71, 68][(k // 2) % 4]), 0.18, r, dur=0.3, bright=0.6, pos=0.2), 0.1), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='stab': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.timpani(m2f(33), 0.6, r), 0), F(3)); st([57, 60, 64, 69], F(3), 0.07, 0.14, 'horn')                                    # LAMBORGHINI
    place(buf, pan(I.brass(m2f(40), 0.9, 0.24, r, kind='tuba', fall=-5), 0), F(58)); place(buf, I.cymbal(0.08, r, dur=1.0), F(57))       # tractor clutch?!
    for f0 in (214, 230, 246, 262, 276): place(buf, pan(I.glock(m2f(84 - (f0 - 214) // 16 * -2), 0.12, r, dur=0.6), 0.1), F(f0))       # parts pop on
    st([69, 72, 76, 81], F(341), 0.07, 0.16); place(buf, I.cymbal(0.1, r, dur=1.2), F(341))                                              # RICH!
    for i, nn in enumerate([72, 76, 79, 84]): place(buf, pan(I.glock(m2f(nn), 0.14, r, dur=0.9), 0), F(385) + i * 0.05)                   # Ferraris
    place(buf, pan(I.brass(m2f(38), 0.7, 0.18, r, kind='tuba', fall=-4), 0), F(498))                                                     # failing
    for i, nn in enumerate([76, 79, 83, 88]): place(buf, pan(I.glock(m2f(nn), 0.16, r, dur=1.0), 0), F(597) + i * 0.06)                  # much like
    st([52, 55, 58], F(791), 0.12, 0.16, 'tuba'); place(buf, pan(I.timpani(m2f(40), 0.7, r), 0), F(833)); place(buf, I.cymbal(0.12, r, dur=1.4), F(833))  # stick to tractors / BIG MISTAKE
    st([60, 64, 67, 72], F(872), 0.08, 0.16, 'horn'); place(buf, I.cymbal(0.1, r, dur=1.4), F(872))                                     # 1963
    st([64, 67, 72], F(999), 0.08, 0.16, 'horn')                                                                                          # 350 GT
    st([60, 64, 67, 72, 76], F(1112), 0.08, 0.22, 'horn'); place(buf, I.cymbal(0.16, r, dur=2.0), F(1112)); place(buf, pan(I.timpani(m2f(36), 0.8, r), 0), F(1112))  # MIURA
    place(buf, pan(I.timpani(m2f(33), 0.7, r), 0), F(1162)); place(buf, I.cymbal(0.1, r, dur=1.8), F(1162))                              # THE TWIST
    st([57, 60, 64, 69, 72], F(1262), 0.06, 0.22, 'horn'); place(buf, I.cymbal(0.16, r, dur=2.0), F(1262)); place(buf, pan(I.brass(m2f(33), 1.0, 0.25, r, kind='tuba'), 0), F(1262))  # TRACTOR!
    for i, nn in enumerate([72, 76, 79, 84]): place(buf, pan(I.glock(m2f(nn), 0.14, r, dur=1.0), 0), F(1386) + i * 0.06)                  # bad clutch
    st([60, 64, 67, 72, 76], F(1419), 0.09, 0.2, 'horn'); place(buf, I.cymbal(0.14, r, dur=2.2), F(1419)); place(buf, pan(I.timpani(m2f(36), 0.8, r), 0), F(1428))
    return buf

def putter(dur, r, rate=7.0):
    t = tt(dur); x = np.zeros_like(t); k = 0.0
    while k < dur: i = int(k * SR); n = min(len(t) - i, int(0.06 * SR)); x[i:i + n] += np.exp(-np.arange(n) / SR / 0.012) * (0.6 + 0.4 * r.random()); k += 1 / rate * (0.9 + 0.2 * r.random())
    return fades(lp(x * r.standard_normal(len(t)) * 0.4 + lp(x, 200), 1400), 0.1, 0.3)
def sfx():
    buf = np.zeros((2, N)); r = rng(1964)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (99, 202, 294, 362, 411, 517, 571, 654, 971, 1058, 1278): P(gentle_whoosh(r), F(f0) - 0.25, 0.28)
    P(G.babble(3.2, r, 200, 1.0), 0.0, 0.05); P(G.whoa(r), F(58), 0.1); P(bonk(r), F(58), 0.2); P(G.push_thump(r), F(61), 0.3)          # hook
    P(G.breeze(10.4, r, 0.4), F(99), 0.1); P(G.bird_chirps(10, r, 0.4), F(99), 0.08)
    for i in range(7): P(G.stroll_step(r, 0.5), F(106) + i * 0.42, 0.1, -0.1 if i % 2 else 0.1)
    for f0 in (214, 230, 246, 262, 276): P(G.hammer_hit(r, 0.7), F(f0), 0.22); P(G.clink(r), F(f0) + 0.05, 0.12)                     # assembly
    P(putter(2.2, r), F(294), 0.14, 0.2); P(G.hurrah(r, 220, 1.0), F(300), 0.12); P(G.hurrah(r, 300, 1.2, kid=True), F(312), 0.08)
    P(ting(r, 3136), F(341), 0.2); P(ting(r, 2637), F(345), 0.15)
    P(engine(1.4, r, 9.0), F(366), 0.12, -0.2)
    P(G.crickets(3.6, r), F(411), 0.05)
    for f0 in (481, 490, 498, 506): P(putter(0.35, r, 12.0), F(f0), 0.2, -0.1); P(G.creak(0.3, r), F(f0) + 0.1, 0.06)                # sputter / slipping clutch
    P(bonk(r), F(498), 0.2)
    for i, f0 in enumerate((530, 545, 560)): P(G.clink(r), F(f0), 0.14, 0.2 - i * 0.2); P(scratch(r), F(f0) + 0.15, 0.06)            # opening it up
    P(G.clink(r, dur=0.3), F(581), 0.18); P(ting(r, 2637), F(597), 0.2)
    P(G.push_thump(r), F(664), 0.22); P(paper(r), F(700), 0.12); P(G.push_thump(r), F(791), 0.18); P(G.push_thump(r), F(834), 0.32)  # desk thumps
    P(lp(r.standard_normal(ns(6.8)) * 0.3, 260), F(850), 0.1); for_ = [P(G.hammer_hit(r, 0.4), F(880) + i * 0.9, 0.06, 0.3) for i in range(6)]
    P(engine(2.0, r, 10.0), F(990), 0.14, 0.1)
    P(G.babble(3.4, r, 190, 1.0, rate=4.2), F(1058), 0.1)
    for f0 in (1112, 1121, 1130, 1142): P(ting(r, 4186), F(f0), 0.08); P(hp(r.standard_normal(ns(0.05)) * np.exp(-tt(0.05) / 0.01), 2000), F(f0), 0.15)
    P(G.whoa(r), F(1114), 0.14); P(G.applause(2.4, r, 50), F(1124), 0.18)
    P(G.push_thump(r), F(1162), 0.3); P(G.babble(2.6, r, 210, 1.0), F(1180), 0.05)
    P(G.whoosh(0.6, r, peak=0.4), F(1250), 0.3); P(G.flag_flutter(0.5, r), F(1252), 0.12); P(G.hurrah(r, 230, 1.0), F(1264), 0.12); P(G.applause(1.6, r, 30), F(1264), 0.12)
    P(G.breeze(6.9, r, 0.4), F(1278), 0.1); P(G.bird_chirps(6.5, r, 0.25), F(1290), 0.06); P(G.crickets(6.9, r), F(1278), 0.03)
    P(G.push_thump(r), F(1386), 0.22); P(G.push_thump(r), F(1419), 0.28); P(ting(r, 3136), F(1428), 0.15)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
