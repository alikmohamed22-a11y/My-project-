# [FC-audio] Stems for "Fortune cookies aren't Chinese": a playful pizzicato hook, a Japanese-pentatonic (in-scale) pluck tune for the
# 1878 book and the Kyoto shop (reprised brighter for "today"), a hopeful pad + vibes for the trip to California, a parlour music box for
# the tea garden and the LA bakery, a comic tuba for the 1983 mock court, a soft, sparse pad for 1942 (no hits, no gags), a bouncy
# ragtime for the 1950s Chinese-American bakeries, sneaky pizzicato for the twist and a warm pentatonic reprise for the payoff.
# SFX: whooshes at the cuts, a slip "pop", page turn, grill sizzle and iron clinks, birds, a steamship horn and waves, tea pour, door
# bell, court babble, gavel knocks, cheer and a groan, quiet wind for 1942, conveyor rattle, crate scrape, stamp thump, a crunchy crack.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, boom, horn, hiss, scratch
DUR = 1777 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 112
STOPS = [(F(1036), F(1042)), (F(1366), F(1371))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 116, 'sneak'), (116, 466, 'koto'), (466, 618, 'hope'), (618, 822, 'parlour'), (822, 1036, 'comic'), (1036, 1214, 'soft'), (1214, 1366, 'rag'), (1366, 1605, 'sneak'), (1605, 1777, 'gold')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def kickd(vel, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)

def music():
    buf = np.zeros((2, N)); r = rng(1878)
    C, F_, G7, Am, Dm, E7, D7 = [48, 52, 55], [53, 57, 60], [43, 47, 50, 53], [57, 60, 64], [50, 53, 57], [52, 56, 59, 62], [50, 54, 57, 60]
    MEL = [67, 69, 67, 64, 65, 67, 72, 71, 69, 67, 65, 64, 62, 64, 65, 67]
    KO = [64, 65, 69, 71, 72, 71, 69, 65, 64, 69, 71, 76, 72, 71, 69, 65]  # in-scale (E F A B C) koto-style line
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s and not silent(t):
            if s == 'koto' or s == 'gold':
                g = 1.0 if s == 'koto' else 1.1
                place(buf, pan(I.pluck(m2f(KO[k % 16] + 12), 0.14 * g, r, dur=0.9, bright=0.75, pos=0.1), 0.15), t)
                if beat in (1, 3): place(buf, pan(I.pluck(m2f(KO[(k + 7) % 16] + 12), 0.06 * g, r, dur=0.5, bright=0.8, pos=0.08), -0.25), t + B / 2)
                if beat == 0: place(buf, pan(I.pluck(m2f([40, 45, 41, 40][bar % 4]), 0.18 * g, r, dur=0.8, bright=0.4, pos=0.2), 0), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in ([52, 57, 64] if bar % 4 == 0 else [53, 57, 64])], B * 8, 0.04 * g, r, att=0.7, rel=1.0, warm=1000), t)
                if s == 'gold' and beat == 2: place(buf, pan(I.glock(m2f(KO[(k + 5) % 16] + 12), 0.05, r, dur=1.2), -0.1), t)
            elif s == 'parlour':
                ch = [C, Am, F_, G7][bar % 4]
                place(buf, pan(I.musicbox(m2f(MEL[k % 16] + 12), 0.12, r, dur=0.9), 0.15), t)
                if beat == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.18, r, dur=0.6, bright=0.4, pos=0.2), 0), t)
                if beat in (1, 2, 3): place(buf, pan(I.pluck(m2f(ch[beat % 3]), 0.08, r, dur=0.3, bright=0.5, pos=0.15), -0.2), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 8, 0.05, r, att=0.6, rel=0.9, warm=1100), t)
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
            elif s == 'hope':
                ch = [Am, F_, C, G7][bar % 4]
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.06, r, att=0.4, rel=0.8, warm=1400), t)
                place(buf, pan(I.vibes(m2f(ch[beat % len(ch)] + 24), 0.05, r, dur=0.8), -0.15), t)
                if t >= F(556) and beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.1, r, kind='tuba'), 0), t)
            elif s == 'comic':
                ch = [C, G7][bar % 2]
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12 + (2 if beat == 2 else 0)), B * 0.6, 0.18, r, kind='tuba'), 0), t)
                if beat == 3: place(buf, pan(I.pluck(m2f(ch[2] + 12), 0.08, r, dur=0.2, bright=0.6, pos=0.15), 0.2), t)
            elif s == 'soft':
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in [57, 60, 64]], B * 8, 0.055, r, att=1.0, rel=1.5, warm=800), t)
                if beat == 2 and bar % 2 == 1: place(buf, pan(I.musicbox(m2f([76, 72, 69, 71][(bar // 2) % 4]), 0.06, r, dur=1.8), 0.1), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='horn': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.timpani(m2f(33), 0.6, r), 0), F(33)); place(buf, I.cymbal(0.08, r, dur=1.2), F(33))                                    # not Chinese?!
    for i, nn in enumerate([76, 81, 83, 88]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.8), 0), F(88) + i * 0.07)                    # Japan
    place(buf, pan(I.timpani(m2f(36), 0.5, r), 0), F(174)); place(buf, I.cymbal(0.07, r, dur=1.2), F(174))                                # 1878
    for i, nn in enumerate([76, 81, 83]): place(buf, pan(I.glock(m2f(nn), 0.09, r, dur=0.9), 0), F(352) + i * 0.07)                       # the fold
    place(buf, I.cymbal(0.1, r, dur=1.6), F(372))                                                                                           # today (time jump)
    st([60, 64, 67, 72], F(600), 0.07, 0.16); place(buf, I.cymbal(0.1, r, dur=1.4), F(600))                                                # California
    for i, nn in enumerate([79, 84, 88]): place(buf, pan(I.glock(m2f(nn), 0.08, r, dur=0.9), 0), F(738) + i * 0.07)                       # tea garden
    place(buf, pan(I.brass(m2f(40), 0.6, 0.16, r, kind='tuba', fall=-3), 0), F(804))                                                       # claimed them too
    st([60, 64, 67, 72, 76], F(931), 0.07, 0.18); place(buf, I.cymbal(0.1, r, dur=1.6), F(931))                                            # ruled for SF
    place(buf, pan(I.brass(m2f(38), 0.7, 0.2, r, kind='tuba', fall=-4), 0), F(997))                                                        # not impressed
    place(buf, I.cymbal(0.1, r, dur=1.6), F(1214)); st([67, 72, 76, 79], F(1250), 0.08, 0.14)                                             # took over
    place(buf, pan(I.timpani(m2f(33), 0.7, r), 0), F(1372)); place(buf, I.cymbal(0.1, r, dur=1.6), F(1372))                               # THE TWIST
    place(buf, pan(I.brass(m2f(40), 0.6, 0.18, r, kind='tuba', fall=-5), 0), F(1593))                                                      # too American
    place(buf, pan(I.timpani(m2f(36), 0.8, r), 0), F(1708)); place(buf, I.cymbal(0.12, r, dur=2.4), F(1708))                              # own past wrong
    for i, nn in enumerate([76, 81, 83, 88]): place(buf, pan(I.glock(m2f(nn), 0.08, r, dur=1.0), 0), F(1730) + i * 0.09)
    return buf

def pop(r):
    t = tt(0.25); return fades(np.sin(phase(400 * (1 + 2 * np.exp(-t / 0.01)))) * np.exp(-t / 0.05) * 0.5, 0.001, 0.05)
def crunch(r):
    t = tt(0.35); return fades(bp(r.standard_normal(len(t)), 1200, 7000) * np.exp(-t / 0.05) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 70 * t))), 0.001, 0.05)
def sizzle(dur, r):
    t = tt(dur); x = hp(r.standard_normal(len(t)), 3500) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * t + r.uniform(0, 6)))) * 0.25; return fades(x, 0.2, 0.3)
def pour(dur, r):
    return G.bubbles(dur, r, 40, f_lo=500, f_hi=1800)
def sfx():
    buf = np.zeros((2, N)); r = rng(1983)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (116, 250, 372, 466, 618, 748, 822, 1214, 1366, 1605): P(gentle_whoosh(r), F(f0) - 0.25, 0.26)
    P(G.crickets(3.6, r), F(0), 0.03); P(bonk(r), F(33), 0.12); P(pop(r), F(88), 0.24)                                                    # hook
    P(paper(r), F(213), 0.12); P(paper(r), F(232), 0.08)                                                                                    # book
    P(sizzle(F(122), r), F(250), 0.12); for_i = [P(G.clink(r), F(f0), 0.1, 0.2) for f0 in (262, 284, 306)]; P(ting(r, 3136), F(352), 0.1)  # grill, irons, the fold
    P(G.bird_chirps(3.0, r, 0.5), F(372), 0.05); P(sizzle(F(94), r), F(372), 0.07); P(G.clink(r), F(443), 0.1)                           # today
    P(G.water_bed(F(152), r, 0.4), F(466), 0.08); P(horn(1.2, r), F(560), 0.12)                                                           # ship
    P(G.bird_chirps(4.0, r, 0.4), F(618), 0.05); P(pour(1.2, r), F(694), 0.1); P(ting(r, 2637), F(738), 0.08)                            # tea garden
    P(ting(r, 3520), F(752), 0.1); P(G.clink(r), F(804), 0.1)                                                                               # LA bakery bell
    P(G.babble(2.8, r, 200, 1.0), F(826), 0.05)
    for i in range(3): P(G.hammer_hit(r, 0.8), F(912) + i * 0.13, 0.22)                                                                   # gavel
    P(G.hurrah(r, 240, 1.0), F(934), 0.08); P(G.whoa(r), F(992), 0.08, 0.3)
    P(G.breeze(F(178), r, 0.6), F(1036), 0.06); P(G.creak(0.8, r), F(1180), 0.04)                                                         # 1942: quiet wind, the door
    P(G.rattle(F(152), r, density=18), F(1214), 0.05); for_j = [P(G.clink(r), F(f0), 0.08, -0.2) for f0 in (1250, 1263, 1275)]          # conveyor
    P(scratch(r), F(1481), 0.1); P(scratch(r), F(1569), 0.1); P(bonk(r), F(1593), 0.16)                                                   # crate out / back / stamp
    P(pop(r), F(1650), 0.18); P(crunch(r), F(1696), 0.3); P(G.bird_chirps(2.5, r, 0.4), F(1700), 0.05)                                   # payoff
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
