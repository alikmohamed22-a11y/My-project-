# [BB-audio] Stems for "Big Ben isn't the tower, it's the bell". Music: a bright pizzicato + glock hook, a ceremonial brass-and-glock
# parlour for the tower and the 2012 jubilee (fanfare on "Diamond Jubilee"), sneaky pizzicato for the name mystery (Hall vs Caunt, a
# tuba "oom" for the big man, a boxing-bell ting for the boxer), a rising tremolo to the 1857 test crack, a low forge tuba for
# Whitechapel, a hopeful ragtime for the 1859 bell that stops dead on "cracked too", a night music-box pad for "You see", a warm
# build for the crack's sound, a tick-tock pizzicato over the pendulum and pennies, and a golden waltz with the Westminster Quarters
# (public-domain chime phrase) leading into the final BONG.
# SFX: the signature BONG (synthesised E bell: hum/prime/tierce/quint/nominal partials; the cracked bell gets beating partial pairs and a
# rasp), the 1857 crack (clang + crackle), foundry roar, breaking clinks and the pour sizzle, pigeons/city/river at Westminster,
# fireworks, crowd murmurs, clock ticks locked to the 2 s pendulum, a penny clink, selfie click, whooshes at every cut.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, boom
DUR = 1771 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 108
STOPS = [(F(962), F(1007))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 106, 'hook'), (106, 310, 'parlour'), (310, 586, 'sneak'), (586, 760, 'tense'), (760, 839, 'forge'), (839, 1007, 'rag'), (1007, 1216, 'night'),
       (1216, 1371, 'hope'), (1371, 1572, 'tick'), (1572, 1771, 'gold')]
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
    buf = np.zeros((2, N)); r = rng(1859)
    E, A, B7, Cm, Gm, D = [52, 56, 59], [57, 61, 64], [47, 51, 54, 57], [49, 52, 56], [56, 59, 63], [50, 54, 57]
    MEL = [68, 66, 64, 59, 64, 66, 68, 64, 68, 64, 66, 59, 59, 66, 68, 64]   # Westminster Quarters shapes (G# F# E B ...), public domain
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s and not silent(t):
            if s == 'hook':
                if beat in (0, 2): place(buf, pan(I.pluck(m2f([40, 47, 45, 47][bar % 4]), 0.2, r, dur=0.3, bright=0.4, pos=0.25), -0.1), t)
                place(buf, pan(I.pluck(m2f([64, 68, 71, 68][beat] + 12), 0.08, r, dur=0.2, bright=0.6, pos=0.15), 0.2), t + B / 2)
                if beat == 0: place(buf, pan(I.glock(m2f(MEL[k % 16] + 12), 0.05, r, dur=0.8), 0.1), t)
            elif s in ('parlour', 'gold'):
                ch = [E, A, B7, E][bar % 4]; g = 1.0 if s == 'parlour' else 1.1
                place(buf, pan(I.musicbox(m2f(MEL[k % 16] + 12), 0.1 * g, r, dur=0.9), 0.15), t)
                if beat == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.18 * g, r, dur=0.6, bright=0.4, pos=0.2), 0), t)
                if beat in (1, 2, 3): place(buf, pan(I.pluck(m2f(ch[beat % 3]), 0.08 * g, r, dur=0.3, bright=0.5, pos=0.15), -0.2), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 8, 0.05 * g, r, att=0.6, rel=0.9, warm=1100), t)
                if s == 'parlour' and t > F(199) and beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.1, r, kind='tuba'), 0), t)
                if s == 'gold' and beat == 2: place(buf, pan(I.glock(m2f(MEL[(k + 5) % 16] + 12), 0.05, r, dur=1.2), -0.1), t)
            elif s == 'sneak':
                nn = [45, 48, 52, 51][k % 4]
                place(buf, pan(I.pluck(m2f(nn), 0.2 if beat % 2 == 0 else 0.12, r, dur=0.25, bright=0.35, pos=0.3), 0.15 if beat % 2 else -0.15), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(45), m2f(52), m2f(60)], B * 8, 0.05, r, att=0.6, rel=0.9, warm=900), t)
                if beat == 3: place(buf, pan(I.vibes(m2f(76 if bar % 2 else 75), 0.05, r, dur=0.8), -0.2), t)
            elif s == 'tense':
                if beat == 0 and bar % 2 == 0: place(buf, trem([m2f(40), m2f(47), m2f(52)], B * 8, 0.06 + 0.04 * min(1, (t - F(586)) / 5), r, rate=12 + 4 * min(1, (t - F(586)) / 5)), t)
                if beat in (0, 2) and t < F(717): place(buf, pan(I.timpani(m2f(28 + (k // 8) % 3), 0.14, r, dur=0.8), 0), t)
                if t > F(640) and t < F(717): place(buf, pan(I.pluck(m2f(64 + (k % 4)), 0.07, r, dur=0.2, bright=0.5, pos=0.2), 0.2), t + B / 2)
            elif s == 'forge':
                if beat in (0, 2): place(buf, pan(I.brass(m2f([40, 35][bar % 2] - 12 + 12), B * 0.6, 0.16, r, kind='tuba'), 0), t)
                if beat in (1, 3): place(buf, pan(I.pluck(m2f(59), 0.08, r, dur=0.2, bright=0.6, pos=0.12), 0.25), t)
                if beat == 0: place(buf, I.pad([m2f(40), m2f(47), m2f(52)], B * 4, 0.05, r, att=0.3, rel=0.6, warm=800), t)
            elif s == 'rag':
                ch = [E, Cm, A, B7, E, Gm, A, B7][bar]
                place(buf, pan(kickd(0.28 if beat in (0, 2) else 0.14), 0), t)
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), B * 0.5, 0.14, r, kind='tuba'), 0), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.07, r, dur=0.15), 0.05), t)
                for e in range(2): place(buf, pan(I.pluck(m2f(ch[(beat + e) % len(ch)] + 12), 0.09, r, dur=0.2, bright=0.7, pos=0.12), 0.3), t + e * B / 2)
                place(buf, pan(I.glock(m2f(MEL[(k * 3) % 16] + 12), 0.04, r, dur=0.4), -0.15), t + B / 2)
            elif s == 'night':
                if beat == 0: place(buf, I.pad([m2f(n) for n in ([52, 56, 59, 63] if bar % 2 == 0 else [49, 52, 56, 61])], B * 4, 0.06, r, att=0.8, rel=1.2, warm=900), t)
                if beat in (0, 2): place(buf, pan(I.musicbox(m2f(MEL[(k // 2) % 16] + 12), 0.08, r, dur=1.4), 0.1 if beat else -0.1), t)
                if beat == 3: place(buf, pan(I.pluck(m2f(40), 0.12, r, dur=0.5, bright=0.3, pos=0.25), 0), t)
            elif s == 'hope':
                ch = [E, A, Cm, B7][bar % 4]
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.06, r, att=0.4, rel=0.8, warm=1400), t)
                place(buf, pan(I.vibes(m2f(ch[beat % len(ch)] + 24), 0.05, r, dur=0.8), -0.15), t)
                if beat in (0, 2): place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.14, r, dur=0.5, bright=0.4, pos=0.2), 0), t)
            elif s == 'tick':
                place(buf, pan(I.pluck(m2f(76 if beat % 2 == 0 else 71), 0.08, r, dur=0.15, bright=0.7, pos=0.1), 0.3 if beat % 2 else -0.3), t)
                if beat in (0, 2): place(buf, pan(I.pluck(m2f([40, 45, 47, 40][bar % 4]), 0.16, r, dur=0.4, bright=0.4, pos=0.2), 0), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n + 12) for n in [E, A, B7, E][bar % 4]], B * 8, 0.045, r, att=0.6, rel=0.9, warm=1000), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='horn': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.timpani(m2f(28), 0.5, r), 0), F(33)); place(buf, I.cymbal(0.08, r, dur=1.2), F(33))                                    # NOT the tower
    for i, nn in enumerate([76, 80, 83, 88]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.8), 0), F(147) + i * 0.07)                   # Clock Tower
    st([64, 68, 71, 76], F(217), 0.08, 0.16); place(buf, I.cymbal(0.12, r, dur=1.6), F(217))                                               # Elizabeth Tower
    st([59, 64, 68, 71, 76], F(277), 0.09, 0.2); place(buf, I.cymbal(0.14, r, dur=2.2), F(277)); place(buf, pan(I.timpani(m2f(40), 0.6, r), 0), F(277))  # Diamond Jubilee
    for i, nn in enumerate([71, 75, 78]): place(buf, pan(I.vibes(m2f(nn), 0.08, r, dur=1.2), 0), F(357) + i * 0.09)                      # nobody's sure
    place(buf, pan(I.brass(m2f(28), 0.8, 0.2, r, kind='tuba', fall=-2), 0), F(453))                                                       # the big man
    place(buf, pan(I.timpani(m2f(33), 0.6, r), 0), F(545))                                                                                 # heavyweight
    place(buf, pan(I.timpani(m2f(28), 0.9, r), 0), F(717)); place(buf, I.cymbal(0.16, r, dur=2.6), F(717))                                 # CRACKED
    st([64, 68, 71, 76], F(801), 0.07, 0.15)                                                                                                # recast
    place(buf, pan(I.brass(m2f(40), 0.9, 0.2, r, kind='tuba', fall=-5), 0), F(970))                                                         # cracked too (wah)
    for i, nn in enumerate([68, 66, 64, 59]): place(buf, pan(I.glock(m2f(nn + 12), 0.08, r, dur=1.0), 0), F(1089) + i * 0.12)           # quarter-turn
    st([64, 71, 76], F(1183), 0.08, 0.14)                                                                                                    # lighter hammer
    for i, nn in enumerate([76, 80, 83]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.9), 0), F(1466) + i * 0.07)                      # +1 penny
    st([64, 68, 71, 76, 80], F(1507), 0.08, 0.16)                                                                                            # 2/5 second
    for i, nn in enumerate([68, 66, 64, 59, 64, 68, 66, 64]): place(buf, pan(I.glock(m2f(nn + 12), 0.12, r, dur=1.4), 0), F(1580) + i * 0.42)  # the quarters
    st([64, 68, 71, 76], F(1715), 0.09, 0.18); place(buf, I.cymbal(0.12, r, dur=2.4), F(1715))                                              # it's a tower / the bell
    return buf

# ---- the signature bell: E bell (prime ~164.8 Hz), church-bell partial ratios; crack = beating pairs + a rasp
def bell(r, f0=164.8, dur=6.0, vel=1.0, crack=0.0):
    t = tt(dur); x = np.zeros(len(t))
    for ratio, amp, tau in [(0.5, 0.9, 3.6), (1.0, 0.75, 2.6), (1.19, 0.5, 1.8), (1.5, 0.32, 1.4), (2.0, 0.7, 1.6), (2.52, 0.28, 0.9), (2.67, 0.24, 0.8), (3.01, 0.2, 0.6), (4.07, 0.12, 0.4), (5.2, 0.07, 0.25)]:
        f = f0 * ratio; env = np.exp(-t / tau)
        if crack > 0: x += amp * env * (np.sin(2 * np.pi * (f - 0.9 * crack * ratio) * t) * 0.55 + np.sin(2 * np.pi * (f + 0.9 * crack * ratio) * t + 1.1) * 0.45)
        else: x += amp * env * np.sin(2 * np.pi * f * t + ratio)
    if crack > 0:
        rasp = bp(r.standard_normal(len(t)), 900, 3500) * np.exp(-t / 0.35) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * f0 * 2 * t))) * 0.35 * crack; x += rasp
    hit = bp(r.standard_normal(len(t)), 1500, 6000) * np.exp(-t / 0.02) * 0.9 + np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.05) * 0.6
    x = (x + hit) * vel; x /= np.abs(x).max()
    out = np.stack([lp(x, 7000), lp(np.roll(x, int(0.012 * SR)), 6500)]); return fades(out * vel, 0.001, 0.4)
def crackle(r, dur=0.5):
    t = tt(dur); n = r.standard_normal(len(t)); gate = (r.random(len(t)) < 0.02).astype(float)
    return fades(hp(n * gate * 3 + n * 0.2, 1200) * np.exp(-t / 0.15), 0.001, 0.05)
def tick(r, hi=True):
    t = tt(0.08); x = bp(r.standard_normal(len(t)), 2500 if hi else 1600, 7000) * np.exp(-t / 0.006) + np.sin(2 * np.pi * (1900 if hi else 1400) * t) * np.exp(-t / 0.012) * 0.4; return fades(x * 0.6, 0.0005, 0.02)
def sizzle(r, dur):
    t = tt(dur); return fades(hp(r.standard_normal(len(t)), 3000) * (0.4 + 0.2 * np.sin(2 * np.pi * 7 * t)) * 0.4, 0.1, 0.4)
def roar(dur, r, level):
    n = ns(dur); out = np.zeros((2, n))
    for ch in range(2): x = r.standard_normal(n); out[ch] = (lp(x, 500) * 0.7 + lp(x, 120) * 0.6) * level * (1 + 0.15 * np.sin(np.arange(n) / SR * 6.3 + ch))
    return fades(out, 0.25, 0.25)
def pop(r, big=1.0):
    t = tt(0.9); x = np.sin(phase(70 * (1 + 2 * np.exp(-t / 0.02)))) * np.exp(-t / 0.15) * 0.6 * big + hp(r.standard_normal(len(t)), 1500) * ((r.random(len(t)) < 0.01) * np.exp(-((t - 0.25) / 0.2) ** 2)) * 1.5; return fades(x, 0.001, 0.1)
def click(r):
    t = tt(0.12); x = bp(r.standard_normal(len(t)), 2000, 8000) * (np.exp(-t / 0.004) + 0.6 * np.exp(-((t - 0.05) / 0.004) ** 2)); return fades(x * 0.6, 0.0005, 0.02)
def sfx():
    buf = np.zeros((2, N)); r = rng(2012)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (58, 106, 310, 403, 498, 586, 839, 1007, 1216, 1572): P(gentle_whoosh(r), F(f0) - 0.25, 0.26)
    for f0 in (199, 760, 1371): P(gentle_whoosh(r, dur=0.4), F(f0) - 0.15, 0.2)
    # the BONGs (Big Ben today = cracked; 1859 first rings clean, then cracks)
    P(bell(r, crack=1.0, dur=7.0), F(2), 0.95); P(bell(r, crack=1.0, dur=5.0), F(63), 0.9)
    P(bell(r, crack=0.0, dur=3.2), F(868), 0.85); P(bell(r, crack=1.4, dur=1.8), F(960), 0.85); P(crackle(r, 0.6), F(964), 0.5)
    P(bell(r, crack=1.0, dur=2.4), F(1139), 0.6); P(bell(r, crack=1.0, dur=2.4), F(1305), 0.8); P(bell(r, crack=1.0, dur=4.6), F(1642), 1.0)
    # 1857 first bell: clean test ring that splits
    P(bell(r, f0=155.6, crack=1.6, dur=2.0), F(717), 0.9); P(crackle(r, 0.8), F(718), 0.6); P(G.wood_crack(r), F(718), 0.25)
    # Westminster ambience: city/river bed, birds, crowd
    P(G.water_bed(F(310), r, 0.3), 0, 0.06); P(G.breeze(F(310), r, 0.6), 0, 0.05); P(G.bird_chirps(4, r, 0.4), F(110), 0.04)
    P(G.babble(F(200), r, 200, 1.0), F(106), 0.04); P(G.hurrah(r, 240, 1.0), F(220), 0.06); P(G.hurrah(r, 260, 1.2), F(278), 0.09); P(G.applause(2.0, r, 30), F(280), 0.07)
    for f0 in (277, 284, 292, 298): P(pop(r, 0.8), F(f0), 0.16, (f0 % 3 - 1) * 0.4)                                                    # fireworks
    # yard 1857: crowd murmur, boxing-bell ting for Caunt, hammer rope creak
    P(G.babble(F(450), r, 200, 1.0), F(310), 0.035); P(ting(r, 2637), F(525), 0.14); P(ting(r, 2637), F(531), 0.1); P(bonk(r), F(453), 0.1)
    for i in range(4): P(G.creak(0.4, r), F(690) + i * 0.18, 0.05)
    P(G.whoa(r), F(722), 0.08, -0.3); P(G.whoa(r), F(726), 0.06, 0.3)
    # foundry: fire roar, breaking clinks, pour sizzle
    P(roar(F(79) + 0.3, r, 0.5), F(760) - 0.15, 0.2)
    for i in range(6): P(G.hammer_hit(r, 0.7), F(766) + i * 0.24, 0.1, 0.3); P(G.clink(r), F(770) + i * 0.24, 0.08, 0.3)
    P(sizzle(r, 1.6), F(800), 0.12); P(boom(r, 0.5), F(801), 0.08)
    # belfry: wind through the openings
    P(G.breeze(F(168), r, 0.5), F(839), 0.04); P(G.breeze(F(209), r, 0.4), F(1007), 0.04); P(G.breeze(F(155), r, 0.4), F(1216), 0.04)
    P(G.chain_groan(1.4, r), F(1066), 0.08)                                                                                               # the quarter-turn
    P(G.clink(r), F(1176), 0.1); P(G.clink(r), F(1186), 0.1)                                                                              # hammer swap
    # clock room: ticks locked to the pendulum (beat every 1 s, starting at the shot), the penny clink
    k = 0
    while F(1371) + k < F(1572): P(tick(r, k % 2 == 0), F(1371) + k, 0.22, 0.15 if k % 2 else -0.15); k += 1
    P(G.clink(r, f0=3800), F(1466), 0.22); P(G.clink(r, f0=3200), F(1468), 0.12)
    # payoff: dusk city, selfie click
    P(G.water_bed(F(199), r, 0.3), F(1572), 0.05); P(G.babble(F(199), r, 200, 1.0), F(1572), 0.03); P(click(r), F(1673), 0.2); P(G.hurrah(r, 260, 1.0), F(1716), 0.06)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
