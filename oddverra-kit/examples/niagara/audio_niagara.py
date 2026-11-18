# [NG-audio] Stems for "The first person over Niagara Falls in a barrel": a tense tremolo + pizzicato hook at the crest, a gentle
# 1900s parlour tune (music box + plucks) for Annie's schoolroom and plan, a bouncy oom-pah for the cooperage, suspense pizzicato for the
# cat's test run with a fanfare for "survived", a jaunty ragtime for the birthday launch, a rising tremolo + boom for the plunge, a
# hopeful build to "alive!", a comic tuba for the verdict, sneaky pizzicato for the twist and the getaway, a soft pad for "died poor"
# and a warm golden waltz reprise for the payoff.
# SFX: the falls' roar (level follows how close each falls shot is), river flow, birds, chalk, coin clink, poster ting, hammer hits on
# hoops, the anvil clang, a pillow poof, the cat's splash and meow-free "boing", crowd murmur and birthday cheer, bicycle pump strokes,
# rope creak, lid pop, cheers and applause, camera flash pops, cart rattle, whooshes at every cut.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, chalk, boom
DUR = 1727 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 112
STOPS = [(F(1263), F(1270))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 151, 'tense'), (151, 379, 'parlour'), (379, 531, 'oompah'), (531, 646, 'sneak'), (646, 862, 'rag'), (862, 977, 'plunge'), (977, 1155, 'hope'),
       (1155, 1263, 'comic'), (1263, 1455, 'sneak'), (1455, 1520, 'soft'), (1520, 1727, 'gold')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def kickd(vel, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)
def trem(freqs, dur, vel, r, rate=11.0):
    x = I.pad(freqs, dur, vel, r, att=0.3, rel=0.4, warm=1600, detune=5); t = np.arange(x.shape[-1]) / SR
    return x * (0.6 + 0.4 * np.sin(2 * np.pi * rate * t))

def music():
    buf = np.zeros((2, N)); r = rng(1901)
    C, F_, G7, Am, Dm, E7, D7 = [48, 52, 55], [53, 57, 60], [43, 47, 50, 53], [57, 60, 64], [50, 53, 57], [52, 56, 59, 62], [50, 54, 57, 60]
    MEL = [67, 69, 67, 64, 65, 67, 72, 71, 69, 67, 65, 64, 62, 64, 65, 67]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s and not silent(t):
            if s == 'tense':
                if beat == 0 and bar % 2 == 0: place(buf, trem([m2f(45), m2f(52), m2f(57)], B * 8, 0.06, r), t)
                if beat in (0, 2): place(buf, pan(I.pluck(m2f([45, 48, 47, 44][bar % 4]), 0.2, r, dur=0.3, bright=0.35, pos=0.25), -0.1), t)
                if beat == 3: place(buf, pan(I.pluck(m2f(57), 0.1, r, dur=0.3, bright=0.4, pos=0.2), 0.2), t + B / 2)
            elif s in ('parlour', 'gold'):
                ch = [C, Am, F_, G7][bar % 4]; g = 1.0 if s == 'parlour' else 1.1
                place(buf, pan(I.musicbox(m2f(MEL[k % 16] + 12), 0.12 * g, r, dur=0.9), 0.15), t)
                if beat == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.18 * g, r, dur=0.6, bright=0.4, pos=0.2), 0), t)
                if beat in (1, 2, 3): place(buf, pan(I.pluck(m2f(ch[beat % 3]), 0.08 * g, r, dur=0.3, bright=0.5, pos=0.15), -0.2), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 8, 0.05 * g, r, att=0.6, rel=0.9, warm=1100), t)
                if s == 'gold' and beat == 2: place(buf, pan(I.glock(m2f(MEL[(k + 5) % 16] + 12), 0.05, r, dur=1.2), -0.1), t)
            elif s == 'oompah':
                ch = [C, G7, C, F_][bar % 4]
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.16, r, kind='tuba'), 0), t)
                if beat in (1, 3): place(buf, pan(I.pluck(m2f(ch[1] + 12), 0.1, r, dur=0.2, bright=0.7, pos=0.12), 0.25), t); place(buf, pan(I.pluck(m2f(ch[2] + 12), 0.08, r, dur=0.2, bright=0.7, pos=0.12), -0.25), t)
                if beat == 0: place(buf, pan(I.glock(m2f(MEL[k % 16] + 12), 0.05, r, dur=0.6), 0.1), t)
            elif s == 'sneak':
                nn = [45, 48, 52, 51][k % 4]
                place(buf, pan(I.pluck(m2f(nn), 0.2 if beat % 2 == 0 else 0.12, r, dur=0.25, bright=0.35, pos=0.3), 0.15 if beat % 2 else -0.15), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(45), m2f(52), m2f(60)], B * 8, 0.05, r, att=0.6, rel=0.9, warm=900), t)
                if beat == 3: place(buf, pan(I.vibes(m2f(76 if bar % 2 else 75), 0.05, r, dur=0.8), -0.2), t)
            elif s == 'rag':
                ch = [C, E7, Am, D7, G7, G7, C, G7][bar]
                place(buf, pan(kickd(0.3 if beat in (0, 2) else 0.15), 0), t)
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.15, r, kind='tuba'), 0), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.08, r, dur=0.15), 0.05), t)
                for e in range(2): place(buf, pan(I.pluck(m2f(ch[(beat + e) % len(ch)] + 12), 0.09, r, dur=0.2, bright=0.7, pos=0.12), 0.3), t + e * B / 2)
                place(buf, pan(I.glock(m2f(MEL[(k * 3) % 16] + 12), 0.04, r, dur=0.4), -0.15), t + B / 2)
            elif s == 'plunge':
                if beat == 0 and bar % 2 == 0: place(buf, trem([m2f(40), m2f(47), m2f(52), m2f(55)], B * 8, 0.08, r, rate=14), t)
                if beat in (0, 2): place(buf, pan(I.timpani(m2f(33 + (k // 8) % 3), 0.2, r, dur=1.0), 0), t)
            elif s == 'hope':
                ch = [Am, F_, C, G7][bar % 4] if t < F(1083) else [C, F_, C, G7][bar % 4]
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.06, r, att=0.4, rel=0.8, warm=1400), t)
                place(buf, pan(I.vibes(m2f(ch[beat % len(ch)] + 24), 0.05, r, dur=0.8), -0.15), t)
                if t >= F(1083) and beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.12, r, kind='tuba'), 0), t)
            elif s == 'comic':
                ch = [C, G7][bar % 2]
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12 + (2 if beat == 2 else 0)), B * 0.6, 0.18, r, kind='tuba'), 0), t)
                if beat == 3: place(buf, pan(I.pluck(m2f(ch[2] + 12), 0.08, r, dur=0.2, bright=0.6, pos=0.15), 0.2), t)
            elif s == 'soft':
                if beat == 0: place(buf, I.pad([m2f(n) for n in [57, 60, 64]], B * 4, 0.06, r, att=0.8, rel=1.2, warm=900), t)
                if beat == 2: place(buf, pan(I.musicbox(m2f([76, 72, 69, 71][bar % 4]), 0.08, r, dur=1.4), 0.1), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='horn': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.timpani(m2f(33), 0.6, r), 0), F(91)); place(buf, I.cymbal(0.08, r, dur=1.2), F(91))                                    # age 63
    for i, nn in enumerate([72, 76, 79, 84]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.8), 0), F(118) + i * 0.07)                   # schoolteacher
    place(buf, pan(I.vibes(m2f(64), 0.1, r, dur=1.6), 0), F(204))                                                                          # widow
    for i, nn in enumerate([79, 84, 88]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.9), 0), F(277) + i * 0.07)                       # famous
    st([60, 64, 67, 72], F(363), 0.07, 0.16); place(buf, I.cymbal(0.1, r, dur=1.4), F(363))                                                # in a barrel!
    place(buf, pan(I.brass(m2f(36), 0.7, 0.2, r, kind='tuba', fall=-3), 0), F(445))                                                        # anvil
    for i, nn in enumerate([84, 88, 91]): place(buf, pan(I.glock(m2f(nn), 0.09, r, dur=0.9), 0), F(495) + i * 0.07)                      # pillow
    place(buf, pan(I.timpani(m2f(33), 0.5, r), 0), F(531))                                                                                 # test run
    st([60, 64, 67, 72, 76], F(614), 0.07, 0.18); place(buf, I.cymbal(0.12, r, dur=1.6), F(614))                                          # survived!
    place(buf, I.cymbal(0.1, r, dur=1.6), F(646)); st([67, 72, 76, 79], F(726), 0.08, 0.16)                                                # 1901 / birthday
    place(buf, I.cymbal(0.14, r, dur=3.0), F(900)); place(buf, pan(I.timpani(m2f(31), 0.8, r), 0), F(949))                                # over the edge / mist
    st([60, 64, 67, 72, 76], F(1083), 0.08, 0.2); place(buf, I.cymbal(0.14, r, dur=1.8), F(1083)); place(buf, pan(I.timpani(m2f(36), 0.7, r), 0), F(1083))  # ALIVE
    place(buf, pan(I.brass(m2f(38), 0.7, 0.2, r, kind='tuba', fall=-4), 0), F(1238))                                                       # again.
    place(buf, pan(I.timpani(m2f(33), 0.7, r), 0), F(1270)); place(buf, I.cymbal(0.1, r, dur=1.6), F(1270))                               # THE TWIST
    place(buf, pan(I.brass(m2f(40), 0.6, 0.18, r, kind='tuba', fall=-5), 0), F(1335))                                                      # she was 63
    st([72, 67, 64, 60], F(1412), 0.06, 0.14)                                                                                               # ran off
    st([60, 64, 67, 72, 76], F(1559), 0.09, 0.18); place(buf, I.cymbal(0.12, r, dur=2.2), F(1559))                                         # first over Niagara
    place(buf, pan(I.timpani(m2f(36), 0.8, r), 0), F(1668)); place(buf, I.cymbal(0.12, r, dur=2.4), F(1668)); st([67, 72, 76, 79], F(1672), 0.08, 0.16)  # don't!
    return buf

def roar(dur, r, level):
    n = ns(dur); out = np.zeros((2, n))
    for ch in range(2): x = r.standard_normal(n); out[ch] = (lp(x, 900) * 0.7 + bp(x, 300, 2400) * 0.25 + lp(x, 120) * 0.6) * level
    return fades(out, 0.25, 0.25)
def pump(r):
    t = tt(0.45); x = bp(r.standard_normal(len(t)), 800, 4000) * np.exp(-((t - 0.18) / 0.12) ** 2) * 0.4; return fades(x, 0.01, 0.05)
def clang(r):
    t = tt(1.4); x = sum(np.sin(phase(np.full(len(t), f))) * a * np.exp(-t / d) for f, a, d in [(620, 0.4, 0.5), (1480, 0.25, 0.3), (2310, 0.15, 0.2), (180, 0.3, 0.15)]); return fades(x, 0.001, 0.1)
def poof(r):
    t = tt(0.4); return fades(lp(r.standard_normal(len(t)), 700) * np.exp(-t / 0.08) * 0.5, 0.005, 0.05)
def pop(r):
    t = tt(0.25); return fades(np.sin(phase(400 * (1 + 2 * np.exp(-t / 0.01)))) * np.exp(-t / 0.05) * 0.5, 0.001, 0.05)
def flash(r):
    t = tt(0.5); return fades((hp(r.standard_normal(len(t)), 2500) * np.exp(-t / 0.03) + np.sin(phase(np.full(len(t), 3200.0))) * 0.15 * np.exp(-t / 0.2)) * 0.5, 0.001, 0.05)
def sfx():
    buf = np.zeros((2, N)); r = rng(1838)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (151, 253, 379, 531, 599, 779, 862, 977, 1155, 1356, 1455, 1520): P(gentle_whoosh(r), F(f0) - 0.25, 0.26)
    # the falls' roar under every falls shot
    for f0, f1, lv in [(0, 151, 0.55), (531, 646, 0.75), (646, 862, 0.22), (862, 977, 0.75), (977, 1263, 0.6), (1520, 1727, 0.35)]: P(roar(F(f1 - f0) + 0.3, r, lv), F(f0) - 0.15, 0.22)
    P(G.water_bed(F(151), r, 0.6), 0, 0.12); P(G.water_bed(F(216), r, 0.5), F(646), 0.14)
    P(G.bird_chirps(5, r, 0.4), F(160), 0.05);
    for i in range(4): P(chalk(r, 0.4), F(158) + i * 0.5, 0.1, -0.2)                                                                     # chalk on the board
    for i in range(3): P(G.clink(r), F(236) + i * 0.13, 0.12, 0.2)                                                                       # coins
    P(ting(r, 2637), F(277), 0.1); P(paper(r), F(321), 0.1)
    for i in range(6): P(G.hammer_hit(r, 0.6), F(390) + i * 0.38, 0.12, 0.2 - (i % 2) * 0.4)                                              # staves + hoops
    for i in range(5): P(G.creak(0.4, r), F(436) + i * 0.15, 0.04)
    P(clang(r), F(462), 0.3); P(G.push_thump(r), F(462), 0.3)                                                                              # anvil in
    P(poof(r), F(510), 0.3)                                                                                                                 # pillow
    P(G.splash_big(r), F(596), 0.18); P(bonk(r), F(610), 0.16); P(G.hurrah(r, 260, 0.8), F(616), 0.06)                                     # cat test
    P(G.babble(4.2, r, 200, 1.0), F(650), 0.06); P(G.hurrah(r, 240, 1.0), F(728), 0.1); P(G.applause(1.6, r, 30), F(730), 0.08)          # birthday crowd
    P(G.creak(0.6, r), F(752), 0.06); P(pop(r), F(774), 0.2)                                                                                 # climbs in, lid
    for i in range(6): P(pump(r), F(790) + i * 0.42, 0.16, -0.2)                                                                          # bicycle pump
    P(G.whoa(r), F(846), 0.06, 0.3)
    P(G.whoosh(1.4, r, 0.4), F(880), 0.18); P(G.whoa(r), F(890), 0.1, -0.3); P(boom(r, 1.0), F(940), 0.28); P(G.splash_big(r), F(944), 0.25)  # over the edge
    for i in range(4): P(G.creak(0.5, r), F(1012) + i * 0.6, 0.06)                                                                       # rope haul
    P(pop(r), F(1048), 0.24); P(G.hurrah(r, 260, 1.2), F(1085), 0.12); P(G.applause(2.0, r, 30), F(1088), 0.1)                            # lid, ALIVE
    P(ting(r, 3136), F(1122), 0.1); P(bonk(r), F(1238), 0.14)
    P(G.babble(6.0, r, 200, 1.0), F(1263), 0.05)
    for f0 in (1272, 1301, 1335): P(flash(r), F(f0), 0.2, 0.2)
    for i in range(10): P(G.rattle(0.3, r), F(1412) + i * 0.15, 0.06, 0.2 + i * 0.05)                                                     # cart getaway
    P(G.whoa(r), F(1416), 0.1, -0.2)
    P(G.crickets(2.2, r), F(1455), 0.04)
    P(G.bird_chirps(6, r, 0.3), F(1530), 0.05); P(ting(r, 3136), F(1668), 0.14); P(G.hurrah(r, 260, 1.0), F(1676), 0.07)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
