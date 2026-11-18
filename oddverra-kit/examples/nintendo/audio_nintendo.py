# [NT-audio] Stems for "Nintendo started as a playing-card company": a bright blippy 8-bit-style arpeggio for the 1985 game-room hook,
# a koto-like plucked pentatonic tune (miyako-bushi flavour) with soft pads for Meiji Kyoto, a jaunty 60s strings-and-brass groove for
# Hiroshi's ventures, a night-blue mystery pluck for the flops and "how?", vibes + pizzicato for "You see", a glockenspiel synth-pop
# groove for Game & Watch / Famicom / NES, a stop + hit for the twist and a warm golden reprise of the koto tune for the payoff.
# SFX: TV blips, pops, street bustle, footsteps, brush strokes, card flicks, laughter, office thumps, a cab engine + horn, steam hiss,
# a picket murmur, a flop bonk, question ting, grabber clicks + boing, LCD beeps, cheers and applause, whooshes at every cut.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, scratch, engine
DUR = 1856 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 120
STOPS = [(F(1499), F(1514))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 104, 'chip'), (104, 458, 'koto'), (458, 774, 'sixties'), (774, 957, 'night'), (957, 1174, 'yousee'), (1174, 1499, 'pop'), (1499, 1632, 'twist'), (1632, 1856, 'gold')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def kickd(vel, r, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)
def sq(f, dur, vel, duty=0.25):
    t = tt(dur); x = np.where((t * f) % 1 < duty, 1.0, -1.0) * vel * np.exp(-t / (dur * 0.6)); return fades(lp(x, 5200), 0.002, 0.02)
def koto(f, vel, r, dur=0.9): return I.pluck(f, vel, r, dur=dur, bright=0.62, pos=0.08)
def blip(f, dur=0.07, vel=0.3): return sq(f, dur, vel, 0.5)

def music():
    buf = np.zeros((2, N)); r = rng(1889)
    PENT = [64, 65, 69, 71, 72, 76, 77, 81]                                  # E F A B C E F A (miyako-bushi flavour)
    KMEL = [5, 4, 2, 3, 2, 1, 0, 2, 3, 5, 6, 5, 4, 2, 3, 2]
    GMEL = [5, 4, 2, 3, 2, 1, 0, 2, 3, 5, 6, 7, 6, 5, 3, 5]
    C, F_, G7, Am, Dm, E7 = [48, 52, 55], [53, 57, 60], [43, 47, 50, 53], [57, 60, 64], [50, 53, 57], [52, 56, 59, 62]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s and not silent(t):
            if s == 'chip':
                ch = [C, Am, F_, G7][bar % 4]
                for e in range(4): place(buf, pan(sq(m2f(ch[(e + beat) % 3] + 24), 0.11, 0.07), 0.15 if e % 2 else -0.15), t + e * B / 4)
                if beat in (0, 2): place(buf, pan(kickd(0.35, r), 0), t)
                if beat == 0: place(buf, pan(sq(m2f(ch[0]), B * 3.5, 0.06, 0.5), 0), t)
            elif s in ('koto', 'gold'):
                g = 1.0 if s == 'koto' else 0.9; mel = KMEL if s == 'koto' else GMEL
                if beat in (0, 2): place(buf, pan(koto(m2f(PENT[mel[(k // 2) % 16]] + (0 if s == 'koto' else 0)), 0.2 * g, r), 0.2), t)
                if beat == 3: place(buf, pan(koto(m2f(PENT[mel[(k // 2 + 3) % 16]] - 12), 0.12 * g, r, 0.6), -0.2), t + B / 2)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in ([45, 52, 57, 64] if s == 'koto' else [48, 55, 60, 64, 67])], B * 8, 0.07, r, att=0.8, rel=1.0, warm=1200), t)
                if beat in (1, 3) and s == 'koto': place(buf, pan(I.brush(0.03, r, dur=0.12), 0.1), t)
                if s == 'gold' and beat == 0: place(buf, pan(I.glock(m2f(PENT[mel[k % 16]] + 12), 0.05, r, dur=1.2), -0.1), t)
            elif s == 'sixties':
                ch = [C, Am, Dm, G7][bar % 4]
                place(buf, pan(kickd(0.45 if beat in (0, 2) else 0.22, r), 0), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.15, r, dur=0.2), 0.05), t)
                place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.15, r, kind='tuba'), 0), t)
                for e in range(2): place(buf, pan(I.pluck(m2f(ch[(beat + e) % len(ch)] + 12), 0.1, r, dur=0.2, bright=0.7, pos=0.12), 0.3), t + e * B / 2)
                if beat == 0 and bar % 2 == 0: place(buf, pan(I.brass(m2f(ch[2] + 12), B * 1.5, 0.11, r, kind='horn'), -0.2), t)
            elif s == 'night':
                nn = [57, 60, 64, 63][k % 4]
                if beat % 2 == 0: place(buf, pan(I.pluck(m2f(nn), 0.24, r, dur=0.4, bright=0.45, pos=0.25), 0.15), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(45), m2f(52), m2f(60)], B * 8, 0.07, r, att=0.6, rel=0.9, warm=900), t)
                if beat == 3: place(buf, pan(I.vibes(m2f(76 if bar % 2 else 75), 0.06, r, dur=1.0), -0.2), t)
            elif s == 'yousee':
                ch = [Am, F_, C, G7][bar % 4]
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.07, r, att=0.4, rel=0.8, warm=1400), t)
                place(buf, pan(I.vibes(m2f(ch[beat % len(ch)] + 24), 0.07, r, dur=0.9), -0.15), t)
                place(buf, pan(I.pluck(m2f(ch[(beat + 1) % len(ch)] + 12), 0.1, r, dur=0.25, bright=0.4, pos=0.2), 0.25), t + B / 2)
            elif s == 'pop':
                ch = [C, G7, Am, F_][bar % 4]
                place(buf, pan(kickd(0.5 if beat in (0, 2) else 0.25, r), 0), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.18, r, dur=0.2), 0.05), t)
                for e in range(4): place(buf, pan(sq(m2f(ch[(e + beat) % len(ch)] + 24), 0.1, 0.05), 0.2 if e % 2 else -0.2), t + e * B / 4)
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.08, r, att=0.2, rel=0.5, warm=2200, detune=9), t)
                place(buf, pan(I.glock(m2f(ch[beat % len(ch)] + 24), 0.06, r, dur=0.5), 0.1), t + B / 2)
            elif s == 'twist':
                if beat == 0: place(buf, I.pad([m2f(45), m2f(52), m2f(57)], B * 4, 0.07, r, att=0.4, rel=0.6, warm=1000), t)
                if beat % 2 == 0: place(buf, pan(koto(m2f(PENT[[5, 4, 2, 3][(k // 2) % 4]]), 0.16, r, 0.5), 0.1), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='stab': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    for i, nn in enumerate([72, 76, 79, 84]): place(buf, pan(blip(m2f(nn), 0.09, 0.12), 0), F(42) + i * 0.07)                               # video games
    place(buf, pan(I.brass(m2f(40), 0.9, 0.22, r, kind='tuba', fall=-5), 0), F(79)); place(buf, I.cymbal(0.08, r, dur=1.0), F(79))     # playing cards?!
    place(buf, I.cymbal(0.1, r, dur=1.6), F(104)); place(buf, pan(I.timpani(m2f(33), 0.6, r), 0), F(114))                              # time jump 1889
    for i, nn in enumerate([76, 77, 81, 83]): place(buf, pan(koto(m2f(nn), 0.16, r), 0), F(242) + i * 0.06)                               # opens a shop
    for i, nn in enumerate([84, 88, 91, 96]): place(buf, pan(I.glock(m2f(nn), 0.12, r, dur=0.9), 0), F(300) + i * 0.06)                  # flower cards
    st([60, 64, 67], F(471), 0.08, 0.14, 'horn'); place(buf, I.cymbal(0.1, r, dur=1.2), F(458))                                           # 1960s
    st([64, 67, 72, 76], F(585), 0.07, 0.16, 'horn'); place(buf, I.cymbal(0.1, r, dur=1.2), F(585))                                       # a lot more
    for f0 in (643, 679, 752): place(buf, pan(I.glock(m2f(84), 0.1, r, dur=0.6), 0.1), F(f0))
    place(buf, pan(I.brass(m2f(38), 0.7, 0.18, r, kind='tuba', fall=-4), 0), F(803)); place(buf, pan(I.brass(m2f(36), 0.9, 0.2, r, kind='tuba', fall=-6), 0), F(837))  # labor trouble / flop
    place(buf, pan(I.vibes(m2f(79), 0.12, r, dur=1.4), 0), F(874))                                                                       # how?
    place(buf, pan(I.timpani(m2f(33), 0.5, r), 0), F(957))                                                                                # you see
    for i, nn in enumerate([72, 76, 79, 84, 88]): place(buf, pan(I.glock(m2f(nn), 0.11, r, dur=0.8), 0), F(1033) + i * 0.08)            # extending
    st([60, 64, 67, 72, 76], F(1139), 0.08, 0.2, 'horn'); place(buf, I.cymbal(0.14, r, dur=1.8), F(1139)); place(buf, pan(I.timpani(m2f(36), 0.7, r), 0), F(1139))  # HIT TOY
    place(buf, I.cymbal(0.1, r, dur=1.4), F(1212)); st([64, 67, 72], F(1251), 0.08, 0.14, 'horn')                                        # 1980 / Game & Watch
    st([60, 64, 67, 72], F(1368), 0.08, 0.16, 'horn'); place(buf, I.cymbal(0.1, r, dur=1.4), F(1368))                                    # Famicom
    st([62, 67, 71, 74, 79], F(1451), 0.08, 0.2, 'horn'); place(buf, I.cymbal(0.14, r, dur=1.8), F(1451)); place(buf, pan(I.timpani(m2f(31), 0.7, r), 0), F(1451))  # NES
    place(buf, pan(I.timpani(m2f(33), 0.7, r), 0), F(1502)); place(buf, I.cymbal(0.1, r, dur=1.8), F(1502))                              # THE TWIST
    for i, nn in enumerate([76, 77, 81, 83, 88]): place(buf, pan(koto(m2f(nn), 0.18, r), 0), F(1575) + i * 0.07)                          # flower cards
    st([60, 64, 67, 72, 76], F(1779), 0.09, 0.2, 'horn'); place(buf, I.cymbal(0.14, r, dur=2.2), F(1779)); place(buf, pan(I.timpani(m2f(36), 0.8, r), 0), F(1786))  # SINCE 1889
    return buf

def hiss(dur, r): return fades(hp(r.standard_normal(ns(dur)), 3000) * 0.3 * np.exp(-tt(dur) / (dur * 0.5)), 0.01, 0.2)
def horn(r, dur=0.35):
    t = tt(dur); x = (np.sin(phase(np.full(len(t), 420.0))) + 0.6 * np.sin(phase(np.full(len(t), 530.0)))) * 0.4; return fades(lp(np.tanh(x * 2.5), 2500), 0.01, 0.05)
def boing(r):
    t = tt(0.5); return fades(np.sin(phase(220 * (1 + 0.6 * np.exp(-t / 0.08) * np.sin(2 * np.pi * 14 * t)))) * np.exp(-t / 0.18) * 0.5, 0.002, 0.05)
def sfx():
    buf = np.zeros((2, N)); r = rng(1985)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (104, 188, 263, 365, 458, 608, 774, 856, 957, 1091, 1319, 1412, 1632): P(gentle_whoosh(r), F(f0) - 0.25, 0.28)
    for i in range(10): P(blip(m2f([72, 76, 79, 76, 84, 79][i % 6]), 0.06, 0.2), F(6) + i * 0.32, 0.12, 0.2)                            # TV game blips
    P(G.whoa(r), F(80), 0.1); P(bonk(r), F(79), 0.2); P(G.push_thump(r), F(83), 0.26)                                                       # card pops in
    P(G.breeze(5.6, r, 0.4), F(104), 0.1); P(G.bird_chirps(5, r, 0.4), F(104), 0.08); P(G.babble(5.2, r, 190, 1.0), F(106), 0.04)
    for i in range(9): P(G.stroll_step(r, 0.5), F(112) + i * 0.45, 0.1, -0.1 if i % 2 else 0.1)
    P(G.hurrah(r, 220, 0.6), F(244), 0.08)
    for i in range(5): P(scratch(r), F(268) + i * 0.6, 0.1, 0.2); P(paper(r), F(300), 0.14); P(paper(r), F(330), 0.12)                    # brush strokes / cards
    for i in range(6): P(paper(r), F(372) + i * 0.5, 0.08, 0.2 - (i % 3) * 0.2)                                                           # card flicks
    P(G.hurrah(r, 260, 1.0), F(377), 0.1); P(G.hurrah(r, 300, 0.8), F(410), 0.08)
    P(G.push_thump(r), F(548), 0.2); P(G.push_thump(r), F(585), 0.3)                                                                        # desk thumps
    P(G.babble(5.4, r, 200, 1.0, rate=4.2), F(608), 0.06); P(engine(2.4, r, 9.0), F(618), 0.16, -0.2); P(horn(r), F(688), 0.2, -0.2)
    P(paper(r), F(675), 0.12, 0.3); P(ting(r, 2637), F(752), 0.1)
    P(G.crickets(6.2, r), F(774), 0.05); P(hiss(1.6, r), F(777), 0.2, -0.2); P(hiss(1.2, r), F(803), 0.16, -0.2)                           # stalled cab steam
    P(G.babble(1.6, r, 150, 1.0, rate=3.0), F(800), 0.1, 0.2); P(bonk(r), F(837), 0.26, 0.3)
    P(ting(r, 3136), F(878), 0.16)
    P(G.crickets(7.2, r), F(957), 0.03)
    for i in range(6): P(G.clink(r), F(1033) + i * 0.12, 0.1, 0.2)                                                                        # grabber clicks
    P(boing(r), F(1060), 0.22, 0.2); P(boing(r), F(1088), 0.16, 0.2)
    for i in range(5): P(G.stroll_step(r, 0.5), F(1094) + i * 0.4, 0.1)
    P(G.applause(1.8, r, 30), F(1142), 0.12)
    for i in range(14): P(blip(m2f([84, 88, 84, 91][i % 4]), 0.05, 0.25), F(1220) + i * 0.38, 0.12)                                     # LCD beeps
    for i in range(16): P(blip(m2f([72, 76, 79, 84][i % 4]), 0.06, 0.2), F(1322) + i * 0.3, 0.1, 0.2)                                    # TV game
    P(G.hurrah(r, 320, 1.2, kid=True), F(1370), 0.1); P(G.hurrah(r, 300, 1.2, kid=True), F(1453), 0.12); P(G.applause(1.6, r, 30), F(1455), 0.08)
    P(G.push_thump(r), F(1502), 0.3); P(paper(r), F(1575), 0.16); P(ting(r, 3136), F(1578), 0.14); P(G.hurrah(r, 260, 1.0), F(1600), 0.08)
    P(G.breeze(7.4, r, 0.4), F(1632), 0.1); P(G.bird_chirps(7, r, 0.3), F(1640), 0.07)
    P(G.push_thump(r), F(1753), 0.2); P(G.push_thump(r), F(1779), 0.26); P(ting(r, 3136), F(1790), 0.15)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
