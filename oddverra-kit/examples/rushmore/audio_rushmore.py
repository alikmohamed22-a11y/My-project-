# [RS-audio] Stems for "Mount Rushmore was never finished": a gentle Americana fife + horn anthem over a warm pad for the hook at the
# monument, a folksy plucked frontier march with brushes for 1927 and the studio plans, a rugged pizzicato + timpani work groove for the
# bosun chairs and dynamite, low tension pulses for the cracked Jefferson and "why only heads?", a tender night pad + vibes for "You see",
# a slow somber horn march for 1941 / the stopped work / the tunnel, a warm proud swell for "not one worker died", a twinkly glock wonder
# cue for the 1998 vault, and a golden reprise of the anthem for the payoff.
# SFX: breeze + birds + crowd at the terrace, pick taps, paper / plan unrolls, drills, cable creaks, wind on the cliff, two dynamite booms
# with rubble, a rock crack, clock ticks, hammer taps, a winch winding down, cave drips, cheers, panel clinks, the capstone thud.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, boom, hiss
DUR = 1726 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 108
STOPS = [(F(1434), F(1448)), (F(783), F(790))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 139, 'anthem'), (139, 511, 'frontier'), (511, 682, 'work'), (682, 893, 'tense'), (893, 1072, 'yousee'), (1072, 1318, 'somber'), (1318, 1434, 'proud'), (1434, 1600, 'wonder'), (1600, 1726, 'gold')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def kickd(vel, r, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)
def click(r, lo=2500, hi=6000, a=0.6):
    t = tt(0.03); return fades(bp(r.standard_normal(len(t)), lo, hi) * np.exp(-t / 0.006) * a, 0.0005, 0.005)
def drill(dur, r):
    t = tt(dur); x = bp(r.standard_normal(len(t)), 600, 3000) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 22 * t))); return fades(x * 0.35, 0.03, 0.08)
def drip(r, f=1400):
    t = tt(0.25); return fades(np.sin(phase(f * (1 + 0.6 * np.exp(-t / 0.02)))) * np.exp(-t / 0.05) * 0.4, 0.001, 0.05)
def thud(r, f0=48):
    t = tt(0.8); return fades((np.sin(phase(f0 * (1 + 0.8 * np.exp(-t / 0.04)))) * np.exp(-t / 0.25) + lp(r.standard_normal(len(t)), 400) * np.exp(-t / 0.08) * 0.5) * 0.8, 0.0, 0.05)
def winch_down(dur, r):
    t = tt(dur); f = 90 * (1 - 0.7 * t / dur); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + bp(r.standard_normal(len(t)), 300, 1200) * 0.2; return fades(x * (1 - t / dur) * 0.6, 0.02, 0.2)

def music():
    buf = np.zeros((2, N)); r = rng(1927)
    MEL = [67, 71, 74, 72, 71, 69, 67, 71, 69, 67, 64, 66, 67, 71, 74, 79]          # anthem (G major)
    Gm, Cm, Dm, Em = [43, 47, 50], [48, 52, 55], [50, 54, 57], [52, 55, 59]
    Am, Fm = [45, 48, 52], [41, 45, 48]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s and not silent(t):
            if s in ('anthem', 'gold'):
                g = 1.0 if s == 'anthem' else 1.1; ch = [Gm, Cm, Em, Dm][bar % 4]
                if beat in (0, 2): place(buf, pan(I.fife(m2f(MEL[(k // 2) % 16]), B * 1.6, 0.07 * g, r), 0.15), t)
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.07, r, att=0.6, rel=1.0, warm=1300), t)
                if beat == 0 and bar % 2 == 0: place(buf, pan(I.brass(m2f(ch[0]), B * 3, 0.07 * g, r, kind='horn'), -0.2), t)
                if s == 'gold' and beat in (1, 3): place(buf, pan(I.glock(m2f(MEL[(k + 5) % 16] + 12), 0.05, r, dur=0.8), 0.25), t)
            elif s == 'frontier':
                ch = [Gm, Cm, Gm, Dm][bar % 4]
                place(buf, pan(I.pluck(m2f(ch[0] - 12 if beat % 2 == 0 else ch[2] - 12), 0.16, r, dur=0.3, bright=0.35, pos=0.25), 0), t)
                for e in range(2): place(buf, pan(I.pluck(m2f(ch[(beat + e) % 3] + 12), 0.08, r, dur=0.2, bright=0.8, pos=0.08), 0.3), t + e * B / 2)
                if beat in (1, 3): place(buf, pan(I.brush(0.05, r, dur=0.14), 0.1), t)
                if beat == 0 and bar % 2 == 0: place(buf, pan(I.fife(m2f(MEL[(k // 4) % 16] + 0), B * 1.8, 0.04, r), -0.2), t)
            elif s == 'work':
                ch = [Em, Cm, Dm, Em][bar % 4]
                place(buf, pan(kickd(0.4 if beat in (0, 2) else 0.18, r), 0), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.12, r, dur=0.18), 0.05), t)
                for e in range(2): place(buf, pan(I.pluck(m2f(ch[(beat * 2 + e) % 3]), 0.13, r, dur=0.18, bright=0.4, pos=0.25), 0.25 if e else -0.25), t + e * B / 2)
                if beat == 0: place(buf, pan(I.brass(m2f(ch[0] - 12), B * 1.5, 0.12, r, kind='tuba'), 0), t)
                if beat == 0 and bar % 4 == 0: place(buf, pan(I.timpani(m2f(ch[0] - 12), 0.35, r), 0), t)
            elif s == 'tense':
                ch = [Am, Fm, Am, Em][bar % 4]
                place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.14, r, dur=0.25, bright=0.25, pos=0.3), 0), t)
                if beat in (1, 3): place(buf, pan(I.pluck(m2f(ch[1] + 12), 0.07, r, dur=0.15, bright=0.4, pos=0.3), 0.2), t + B / 2)
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.06, r, att=0.4, rel=0.8, warm=900), t)
            elif s == 'yousee':
                ch = [Am, Fm, Cm, Em][bar % 4]
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.08, r, att=0.6, rel=1.0, warm=1100), t)
                if beat in (0, 2): place(buf, pan(I.vibes(m2f(ch[beat % 3] + 24), 0.06, r, dur=1.4), -0.15), t)
            elif s == 'somber':
                ch = [Em, Cm, Gm, Dm][bar % 4]
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.07, r, att=0.5, rel=0.9, warm=1000), t)
                if beat in (0, 2): place(buf, pan(I.snare(0.06, r, dur=0.2), 0.05), t)
                if beat == 0 and bar % 2 == 0: place(buf, pan(I.brass(m2f(ch[2]), B * 3.5, 0.08, r, kind='horn'), -0.1), t)
                if beat == 2: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.12, r, dur=0.5, bright=0.3, pos=0.3), 0), t)
            elif s == 'proud':
                ch = [Gm, Cm, Dm, Gm][bar % 4]
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.09, r, att=0.4, rel=1.0, warm=1500), t)
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[(beat // 2) % 3] + 12), B * 1.8, 0.08, r, kind='horn'), 0.15), t)
                place(buf, pan(kickd(0.25 if beat == 0 else 0.0, r), 0), t)
            elif s == 'wonder':
                ch = [Cm, Am, Fm, Gm][bar % 4]
                for e in range(2): place(buf, pan(I.glock(m2f(ch[(beat + e) % 3] + 24), 0.05, r, dur=0.9), 0.3 if e else -0.3), t + e * B / 2)
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.07, r, att=0.6, rel=1.0, warm=1600, detune=9), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='horn': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.pluck(m2f(55), 0.2, r, dur=0.4, bright=0.4), 0), F(43)); place(buf, pan(I.pluck(m2f(54), 0.2, r, dur=0.6, bright=0.4), 0), F(50))  # never finished
    place(buf, pan(I.vibes(m2f(83), 0.12, r, dur=1.6), 0), F(108)); place(buf, I.cymbal(0.08, r, dur=1.4), F(108))                     # bodies?!
    place(buf, I.cymbal(0.1, r, dur=1.6), F(139)); place(buf, pan(I.timpani(m2f(31), 0.5, r), 0), F(142))                             # 1927
    st([55, 59, 62, 67], F(202), 0.07, 0.14)                                                                                            # Borglum
    for i, nn in enumerate([67, 71, 74, 79]): place(buf, pan(I.glock(m2f(nn + 12), 0.1, r, dur=0.9), 0), F(361) + i * 0.07)          # waist
    place(buf, pan(I.vibes(m2f(79), 0.1, r, dur=1.4), 0), F(412)); place(buf, pan(I.vibes(m2f(83), 0.1, r, dur=1.6), 0), F(468))     # inscription / hall
    place(buf, I.cymbal(0.1, r, dur=1.4), F(511)); st([52, 55, 59, 64], F(592), 0.06, 0.12, 'stab')                                     # 90%
    place(buf, pan(I.timpani(m2f(28), 0.7, r), 0), F(650))                                                                             # dynamite
    place(buf, pan(I.pluck(m2f(64), 0.2, r, dur=0.3, bright=0.5), 0.2), F(752)); place(buf, pan(I.pluck(m2f(63), 0.2, r, dur=0.3, bright=0.5), -0.2), F(757))  # cracked
    place(buf, pan(I.timpani(m2f(28), 0.8, r), 0), F(783)); st([55, 59, 62], F(827), 0.08, 0.14)                                       # boom / left
    place(buf, pan(I.vibes(m2f(76), 0.09, r, dur=1.6), 0), F(884))                                                                    # heads?
    place(buf, pan(I.timpani(m2f(33), 0.35, r), 0), F(893))                                                                            # you see
    place(buf, pan(I.vibes(m2f(64), 0.08, r, dur=2.4), 0), F(1043))                                                                   # Borglum died (gentle)
    place(buf, pan(I.timpani(m2f(31), 0.4, r), 0), F(1167)); place(buf, pan(I.brass(m2f(43), 0.8, 0.12, r, kind='tuba', fall=-3), 0), F(1193)); place(buf, pan(I.brass(m2f(42), 0.8, 0.12, r, kind='tuba', fall=-3), 0), F(1218))  # stop / no / no
    st([55, 59, 62, 67, 71], F(1381), 0.08, 0.18); place(buf, I.cymbal(0.12, r, dur=1.8), F(1381))                                   # not one
    for i, nn in enumerate([72, 76, 79, 84]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=1.0), 0), F(1448) + i * 0.08)              # the twist
    place(buf, pan(I.timpani(m2f(31), 0.45, r), 0), F(1463)); place(buf, I.cymbal(0.1, r, dur=1.8), F(1532))                          # 1998 / sealed
    st([55, 59, 62, 67], F(1643), 0.1, 0.13); place(buf, pan(I.vibes(m2f(79), 0.1, r, dur=2.2), 0), F(1666)); place(buf, I.cymbal(0.1, r, dur=2.4), F(1666))  # still waiting
    return buf

def sfx():
    buf = np.zeros((2, N)); r = rng(1941)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (139, 313, 433, 511, 682, 849, 1072, 1188, 1242, 1318, 1600): P(gentle_whoosh(r), F(f0) - 0.25, 0.28)
    P(G.breeze(4.6, r, 0.5), F(0), 0.12); P(G.bird_chirps(4, r, 0.4), F(4), 0.07); P(G.babble(4.4, r, 210, 1.0, rate=3.6, active=0.5), F(0), 0.025); P(G.whoa(r), F(110), 0.08)
    P(G.breeze(5.8, r, 0.6), F(139), 0.1); P(G.bird_chirps(5, r, 0.3), F(150), 0.05)
    for i in range(6): P(G.hammer_hit(r, 0.4), F(160) + i * 0.7, 0.06, -0.3)                                                          # pick taps
    P(paper(r), F(318), 0.16, 0.2); P(paper(r), F(400), 0.12, -0.2); P(paper(r), F(440), 0.14, 0.1)                                  # plans
    P(G.breeze(5.6, r, 0.9, gust=0.3), F(511), 0.14)                                                                                   # cliff wind
    for f0, d in ((520, 1.4), (548, 1.6), (580, 1.0)): P(drill(d, r), F(f0), 0.12, 0.2)
    P(G.creak(1.2, r), F(530), 0.08, -0.2); P(G.creak(1.0, r), F(600), 0.06, 0.2)
    P(boom(r, 1.0), F(649), 0.55); P(G.rattle(1.6, r, heavy=True), F(655), 0.2)                                                     # dynamite + rubble
    P(G.breeze(5.6, r, 0.6), F(682), 0.1); P(G.wood_crack(r), F(752), 0.25); P(G.timber_tear(r, 0.5), F(758), 0.1)                  # cracked
    P(boom(r, 1.2), F(782), 0.6); P(G.rattle(1.8, r, heavy=True), F(788), 0.22)                                                      # blasted off
    for i in range(5): P(G.hammer_hit(r, 0.5), F(814) + i * 0.22, 0.08, 0.3)                                                          # new start
    P(ting(r, 2637), F(884), 0.08)
    P(G.crickets(6.0, r), F(893), 0.04); [P(click(r, 1800, 4000, 0.4), F(900) + i * 1.0, 0.1, -0.3) for i in range(6)]                # clock
    P(paper(r), F(940), 0.12, 0.2)
    for i in range(6): P(G.hammer_hit(r, 0.5), F(1085) + i * 0.6, 0.07, -0.2)                                                         # finishing taps
    P(winch_down(1.6, r), F(1165), 0.25); P(G.breeze(4.0, r, 0.5), F(1072), 0.1)
    P(bonk(r), F(1193), 0.12); P(bonk(r), F(1218), 0.12)
    P(hiss(r, 2.4), F(1242), 0.02); [P(drip(r, 1200 + 300 * i), F(1250) + i * 0.7, 0.12, (-1) ** i * 0.3) for i in range(3)]          # tunnel
    [P(G.stroll_step(r, 0.3), F(1262) + i * 0.3, 0.06) for i in range(4)]
    P(G.breeze(3.8, r, 0.5), F(1318), 0.1); P(G.hurrah(r, 260, 1.0), F(1383), 0.12); P(G.hurrah(r, 320, 0.9), F(1388), 0.1); P(G.applause(1.6, r, people=12), F(1392), 0.06)
    P(ting(r, 2093), F(1448), 0.1)
    for i in range(5): P(G.clink(r), F(1500) + i * 0.16, 0.12, -0.2 + i * 0.1)                                                       # panels in the box
    P(G.chain_groan(1.2, r), F(1534), 0.06); P(thud(r), F(1571), 0.5); P(G.push_thump(r), F(1572), 0.2)                               # capstone
    P(G.hurrah(r, 300, 0.8), F(1580), 0.06)
    P(G.breeze(4.2, r, 0.5), F(1600), 0.12); P(G.bird_chirps(4, r, 0.3), F(1610), 0.06); P(ting(r, 3136), F(1666), 0.1)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
