# [EF-audio] Stems for "The Eiffel Tower was only meant to stand for 20 years": a tense dusk hook (low pad, ticking, timpani on 1909),
# a bright Paris musette waltz (two-reed accordion over oom-pah-pah) for the 1889 fair with a rising run to "300 metres", a ticking
# pizzicato for the permit, a grumpy minor waltz for the Parisians and the 1887 artists, a night pluck for "how do you save it?",
# vibes + pizzicato for "You see" and the science, a pulsing radio bed with morse blips for the wireless beats, a happy waltz reprise
# for the 1910 renewal, a snare march for 1914, a stop + hit for the twist, a light modern groove + rotor for 2022 and a warm golden
# waltz reprise for the payoff. SFX: whooshes at every cut, wind, crowd babble, sledge clang, quill scratches, stamp thumps, the
# anemometer whirr, slide whooshes, radio static + morse, coins, cheers, a helicopter, a final shimmer.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, scratch
DUR = 1892 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 0.4                                                    # 150 bpm; waltz sections count bars of 3
STOPS = [(F(1491), F(1503))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 110, 'hook'), (110, 313, 'waltz'), (313, 423, 'tick'), (423, 674, 'grump'), (674, 744, 'night'), (744, 924, 'yousee'),
       (924, 1240, 'radio'), (1240, 1336, 'waltz'), (1336, 1491, 'march'), (1491, 1721, 'modern'), (1721, 1892, 'gold')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def kickd(vel, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)
def accordion(f, dur, vel, trem=6.0):
    # musette: three slightly detuned reeds (pulse-ish), bellows swell, gentle tremolo
    t = tt(dur + 0.08); x = 0
    for d, w in ((1.0, 1.0), (1.0045, 0.8), (0.9958, 0.8)):
        ph = (t * f * d) % 1; x = x + w * (np.where(ph < 0.32, 1.0, -0.45) + 0.4 * np.sin(2 * np.pi * f * d * 2 * t))
    env = np.clip(t / 0.04, 0, 1) * np.clip((dur + 0.08 - t) / 0.08, 0, 1) * (1 + 0.08 * np.sin(2 * np.pi * trem * t))
    return fades(lp(x * env * vel * 0.25, 3200), 0.004, 0.03)
def blip(f, dur=0.07, vel=0.3):
    t = tt(dur); return fades(np.sin(2 * np.pi * f * t) * vel, 0.003, 0.01)
def morse(t0, buf, pattern, f=880, unit=0.07, g=0.06):
    t = t0
    for c in pattern:
        if c == '.': place(buf, pan(blip(f, unit, g), 0.2), t); t += unit * 2
        elif c == '-': place(buf, pan(blip(f, unit * 3, g), 0.2), t); t += unit * 4
        else: t += unit * 3
    return t

def music():
    buf = np.zeros((2, N)); r = rng(1889)
    MEL = [76, 74, 72, 74, 76, 79, 77, 76, 74, 72, 71, 72, 74, 76, 74, 72]          # C major musette line (our own)
    MELm = [69, 68, 69, 72, 71, 69, 68, 64, 65, 64, 62, 64, 68, 69, 71, 69]        # A minor grump line
    GOLD = [76, 79, 81, 79, 76, 74, 76, 79, 84, 83, 81, 79, 77, 76, 74, 72]
    Cm, G7, F_, Am, Dm, E7 = [48, 52, 55], [43, 47, 50, 53], [41, 45, 48], [45, 48, 52], [38, 41, 45], [40, 44, 47, 50]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = k // 3; beat = k % 3; b4 = k % 4
        if s and not silent(t):
            if s == 'hook':
                if b4 == 0 and (k // 4) % 2 == 0: place(buf, I.pad([m2f(n) for n in (33, 40, 45, 48)], B * 8, 0.08, r, att=0.6, rel=0.9, warm=700), t)
                place(buf, pan(I.pluck(m2f(81), 0.05, r, dur=0.08, bright=0.8, pos=0.05), 0.3 if k % 2 else -0.3), t)          # ticking
                if b4 == 2: place(buf, pan(accordion(m2f([69, 68, 64, 65][(k // 4) % 4]), B * 1.6, 0.6), -0.1), t)
            elif s in ('waltz', 'gold'):
                ch = [Cm, G7, G7, Cm, F_, Cm, G7, Cm][bar % 8]; g = 1.0 if s == 'waltz' else 0.9
                if beat == 0: place(buf, pan(I.brass(m2f(ch[0] - 12 if ch[0] > 44 else ch[0]), B * 0.7, 0.16 * g, r, kind='tuba'), 0), t); place(buf, pan(kickd(0.25), 0), t)
                else:
                    for n in ch[1:3]: place(buf, pan(I.pluck(m2f(n + 12), 0.07 * g, r, dur=0.18, bright=0.6, pos=0.12), 0.25), t)
                    place(buf, pan(I.brush(0.02, r, dur=0.1), 0.1), t)
                mel = MEL if s == 'waltz' else GOLD
                if beat == 0 or (beat == 2 and bar % 2): place(buf, pan(accordion(m2f(mel[(bar * 2 + (beat > 0)) % 16]), B * (1.8 if beat == 0 else 0.9), 0.75 * g), -0.15), t)
                if s == 'gold' and beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in (48, 55, 60, 64, 67)], B * 6, 0.06, r, att=0.6, rel=1.0, warm=1200), t)
                if s == 'gold' and beat == 1: place(buf, pan(I.glock(m2f(mel[bar % 16] + 12), 0.04, r, dur=1.0), 0.2), t)
            elif s == 'tick':
                place(buf, pan(I.pluck(m2f([60, 67][k % 2] + 12), 0.1, r, dur=0.12, bright=0.5, pos=0.1), 0.3 if k % 2 else -0.3), t)
                if b4 == 0: place(buf, pan(I.brass(m2f([36, 31, 33, 31][(k // 4) % 4]), B * 1.5, 0.12, r, kind='tuba'), 0), t)
                if b4 == 0 and (k // 4) % 2 == 0: place(buf, I.pad([m2f(n) for n in (48, 55, 64)], B * 8, 0.05, r, att=0.5, rel=0.8, warm=1000), t)
            elif s == 'grump':
                ch = [Am, E7, E7, Am, Dm, Am, E7, Am][bar % 8]
                if beat == 0: place(buf, pan(I.brass(m2f(ch[0] - 12 if ch[0] > 40 else ch[0]), B * 0.8, 0.2, r, kind='tuba'), 0), t); place(buf, pan(kickd(0.32), 0), t)
                else:
                    for n in ch[1:3]: place(buf, pan(I.pluck(m2f(n + 12), 0.07, r, dur=0.16, bright=0.45, pos=0.15), 0.25), t)
                if beat == 0 or beat == 2: place(buf, pan(accordion(m2f(MELm[(bar * 2 + (beat > 0)) % 16]), B * (1.6 if beat == 0 else 0.8), 0.7), -0.15), t)
            elif s == 'night':
                nn = [57, 60, 64, 63][k % 4]
                if k % 2 == 0: place(buf, pan(I.pluck(m2f(nn), 0.22, r, dur=0.45, bright=0.45, pos=0.25), 0.15), t)
                if b4 == 0 and (k // 4) % 2 == 0: place(buf, I.pad([m2f(45), m2f(52), m2f(60)], B * 8, 0.07, r, att=0.6, rel=0.9, warm=900), t)
                if b4 == 3: place(buf, pan(I.vibes(m2f(76 if (k // 4) % 2 else 75), 0.06, r, dur=1.0), -0.2), t)
            elif s == 'yousee':
                ch = [Am, F_, Cm, G7][(k // 4) % 4]
                if b4 == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.07, r, att=0.4, rel=0.8, warm=1400), t)
                place(buf, pan(I.vibes(m2f(ch[b4 % len(ch)] + 24), 0.07, r, dur=0.9), -0.15), t)
                place(buf, pan(I.pluck(m2f(ch[(b4 + 1) % len(ch)] + 12), 0.1, r, dur=0.25, bright=0.4, pos=0.2), 0.25), t + B / 2)
            elif s == 'radio':
                ch = [Am, F_, Cm, G7][(k // 4) % 4]; up = t > F(1157)
                if b4 == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.08, r, att=0.2, rel=0.6, warm=1800, detune=9), t)
                place(buf, pan(kickd(0.4 if b4 in (0, 2) else 0.2), 0), t)
                for e in range(2): place(buf, pan(blip(m2f(ch[(b4 + e) % len(ch)] + 36), 0.06, 0.05), 0.3 if e else -0.3), t + e * B / 2)
                if up and b4 in (1, 3): place(buf, pan(I.snare(0.12, r, dur=0.18), 0.05), t)
                if up and b4 == 0: place(buf, pan(I.glock(m2f(ch[0] + 36), 0.06, r, dur=0.6), 0.1), t)
            elif s == 'march':
                place(buf, pan(I.snare(0.16 if b4 in (0, 2) else 0.1, r, dur=0.2), 0.05), t)
                if b4 % 2: place(buf, pan(I.snare(0.08, r, dur=0.12), 0.05), t + B / 2)
                if b4 == 0: place(buf, pan(I.brass(m2f([45, 41, 43, 40][(k // 4) % 4]), B * 1.6, 0.18, r, kind='tuba'), 0), t); place(buf, pan(I.timpani(m2f(33), 0.25, r, dur=0.8), 0), t)
                if b4 == 2: place(buf, pan(I.brass(m2f([57, 60, 59, 56][(k // 4) % 4]), B * 1.2, 0.1, r, kind='horn'), -0.2), t)
            elif s == 'modern':
                ch = [Cm, G7, Am, F_][(k // 4) % 4]
                place(buf, pan(kickd(0.45 if b4 in (0, 2) else 0.2), 0), t)
                if b4 in (1, 3): place(buf, pan(I.snare(0.14, r, dur=0.18), 0.05), t)
                if b4 == 0: place(buf, I.pad([m2f(n + 12) for n in ch], B * 4, 0.08, r, att=0.2, rel=0.5, warm=2200, detune=9), t)
                place(buf, pan(I.pluck(m2f(ch[b4 % len(ch)] + 24), 0.07, r, dur=0.2, bright=0.6, pos=0.1), 0.2), t + B / 2)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='stab': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.brass(m2f(40), 0.9, 0.22, r, kind='tuba', fall=-5), 0), F(57)); place(buf, pan(I.timpani(m2f(33), 0.8, r), 0), F(76)); place(buf, I.cymbal(0.1, r, dur=1.4), F(76))   # torn down / 1909
    place(buf, I.cymbal(0.1, r, dur=1.6), F(110)); st([60, 64, 67, 72], F(148), 0.08, 0.16, 'horn')                                                         # 1889 World's Fair
    for i, nn in enumerate(range(60, 84, 2)): place(buf, pan(I.glock(m2f(nn), 0.07, r, dur=0.5), 0), F(218) + i * 0.13)                                 # climbing 0 -> 300 m
    st([60, 64, 67, 72, 76], F(267), 0.08, 0.2, 'horn'); place(buf, I.cymbal(0.14, r, dur=1.8), F(267)); place(buf, pan(I.timpani(m2f(36), 0.7, r), 0), F(267))   # tallest
    place(buf, pan(I.brass(m2f(38), 0.7, 0.18, r, kind='tuba', fall=-4), 0), F(403))                                                                     # pull it down
    place(buf, I.cymbal(0.12, r, dur=1.6), F(478)); place(buf, pan(I.timpani(m2f(33), 0.6, r), 0), F(481))                                                  # 1887
    st([57, 56], F(571), 0.12, 0.18, 'stab'); st([57, 56, 53], F(592), 0.1, 0.2, 'stab'); place(buf, pan(I.brass(m2f(33), 1.0, 0.22, r, kind='tuba', fall=-6), 0), F(654))   # useless / monstrous / chimney
    place(buf, pan(I.vibes(m2f(79), 0.12, r, dur=1.4), 0), F(725))                                                                                       # hates?
    place(buf, pan(I.timpani(m2f(33), 0.5, r), 0), F(744)); _ = [place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.8), 0), F(778) + i * 0.07) for i, nn in enumerate([72, 76, 79, 84])]   # useful!
    place(buf, I.cymbal(0.1, r, dur=1.4), F(924)); st([64, 67, 72], F(959), 0.08, 0.14, 'horn')                                                           # radio / 1898
    for i, nn in enumerate([84, 88, 91, 96, 100]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.8), 0), F(1045) + i * 0.06)                          # Pantheon
    st([60, 64, 67, 72, 76], F(1208), 0.08, 0.2, 'horn'); place(buf, I.cymbal(0.14, r, dur=1.8), F(1208)); place(buf, pan(I.timpani(m2f(36), 0.7, r), 0), F(1208))  # perfect antenna
    place(buf, I.cymbal(0.12, r, dur=1.6), F(1240)); st([60, 64, 67, 72], F(1282), 0.08, 0.18, 'horn')                                                     # 1910 renewed
    place(buf, I.cymbal(0.12, r, dur=1.6), F(1336)); place(buf, pan(I.timpani(m2f(33), 0.7, r), 0), F(1342)); st([57, 60, 64, 69], F(1470), 0.1, 0.2, 'horn')   # 1914 / Marne
    place(buf, pan(I.timpani(m2f(33), 0.7, r), 0), F(1497)); place(buf, I.cymbal(0.1, r, dur=1.8), F(1497))                                                 # THE TWIST
    for i, nn in enumerate([72, 74, 76, 79, 81, 84]): place(buf, pan(I.glock(m2f(nn), 0.08, r, dur=0.6), 0), F(1680) + i * 0.06)                      # +6 m
    st([60, 64, 67, 72, 76], F(1836), 0.09, 0.2, 'horn'); place(buf, I.cymbal(0.14, r, dur=2.2), F(1836)); place(buf, pan(I.timpani(m2f(36), 0.8, r), 0), F(1842))  # RADIO WAVES
    return buf

def rotor(dur, r):
    t = tt(dur); n = r.standard_normal(len(t)); pulse = np.exp(-((t * 11) % 1) * 6)
    return fades(lp(n, 700) * pulse * 0.9 + 0.2 * np.sin(2 * np.pi * 44 * t) * pulse, 0.3, 0.4)
def static(dur, r):
    t = tt(dur); return fades(bp(r.standard_normal(len(t)), 1200, 5200) * 0.25 * (0.6 + 0.4 * np.sin(2 * np.pi * 3.1 * t)), 0.05, 0.2)
def clang(r):
    t = tt(1.2); return fades(sum(np.sin(2 * np.pi * f * t) * np.exp(-t / d) * a for f, d, a in ((520, 0.5, 0.5), (1240, 0.3, 0.3), (2210, 0.15, 0.2))) + bp(r.standard_normal(len(t)), 1500, 6000) * np.exp(-t / 0.01) * 0.6, 0.0, 0.1)
def whirr(dur, r):
    t = tt(dur); return fades(np.sin(2 * np.pi * (140 + 10 * np.sin(2 * np.pi * 7 * t)) * t) * 0.15 + bp(r.standard_normal(len(t)), 400, 1500) * 0.1 * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * t)), 0.2, 0.3)
def sfx():
    buf = np.zeros((2, N)); r = rng(1909)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (110, 214, 313, 423, 478, 610, 674, 744, 801, 924, 1065, 1157, 1240, 1336, 1491, 1630, 1721): P(gentle_whoosh(r), F(f0) - 0.25, 0.28)
    P(G.breeze(3.6, r, 0.5), F(0), 0.12); P(G.babble(3.4, r, 180, 1.0), F(2), 0.03)
    P(clang(r), F(51), 0.22, -0.2); P(clang(r), F(66), 0.16, -0.2); P(G.whoa(r), F(78), 0.1, 0.2); P(G.push_thump(r), F(76), 0.3)                    # sledge on iron / 1909
    P(G.babble(6.6, r, 200, 1.0, rate=4.2), F(112), 0.06); P(G.hurrah(r, 260, 1.0), F(150), 0.08); P(G.flag_flutter(6.0, r), F(110), 0.05)
    P(G.breeze(3.2, r, 0.7, bright=1400), F(214), 0.1); P(G.applause(1.6, r, 30), F(270), 0.08)
    for i in range(3): P(paper(r), F(318) + i * 0.3, 0.1, 0.2)
    P(G.push_thump(r), F(403), 0.26); P(G.babble(1.8, r, 150, 1.0, rate=3.0), F(428), 0.12); P(G.whoa(r), F(446), 0.06)
    for i in range(5): P(scratch(r), F(530) + i * 0.5, 0.08, 0.2)                                                                                     # quills
    P(G.push_thump(r), F(571), 0.28); P(G.push_thump(r), F(592), 0.32); P(G.breeze(1.8, r, 0.6, bright=500), F(620), 0.12)                          # stamps / chimney smoke
    P(G.crickets(2.4, r), F(674), 0.05); P(ting(r, 3136), F(696), 0.14)
    P(G.breeze(5.6, r, 0.8, bright=1200), F(744), 0.1); P(whirr(4.0, r), F(805), 0.12, -0.3)
    for i in range(3): P(G.whoosh(0.9, r, peak=0.6, f_lo=500, f_hi=3200), F(846) + i * 0.73, 0.14, -0.2)                                             # sliding shapes
    P(static(1.4, r), F(926), 0.1, 0.2); morse(F(940), buf, '.-. .- -.. .. ---', 990, 0.06, 0.06); P(G.whoosh(1.6, r, peak=0.7, f_lo=600, f_hi=4000), F(995), 0.14); P(ting(r, 2637), F(1045), 0.14)
    for i in range(4): P(G.clink(r), F(1082) + i * 0.09, 0.12, 0.2)                                                                                 # coins
    P(G.hurrah(r, 230, 0.8), F(1128), 0.08); morse(F(1100), buf, '... --- ...', 880, 0.06, 0.04)
    P(static(1.0, r), F(1160), 0.08); P(G.hurrah(r, 260, 1.0), F(1210), 0.08); P(G.applause(1.6, r, 30), F(1212), 0.08)
    P(G.push_thump(r), F(1282), 0.34); P(paper(r), F(1300), 0.14); P(G.hurrah(r, 280, 1.0), F(1292), 0.08)
    P(static(4.6, r), F(1345), 0.08, -0.2); morse(F(1360), buf, '-.. . .- .-. -- -. . .-.. ...', 760, 0.055, 0.05); P(scratch(r), F(1400), 0.08); P(scratch(r), F(1430), 0.08)
    P(G.babble(4.2, r, 210, 1.0, rate=4.6), F(1505), 0.05); P(G.breeze(4.0, r, 0.6), F(1560), 0.1)
    P(rotor(3.2, r), F(1630), 0.22, 0.2); P(G.push_thump(r), F(1700), 0.22); P(ting(r, 3136), F(1702), 0.12)
    P(G.breeze(5.6, r, 0.4), F(1721), 0.1); P(G.bird_chirps(5, r, 0.3), F(1730), 0.07); P(ting(r, 3136), F(1846), 0.15); P(G.hurrah(r, 260, 1.0), F(1850), 0.06)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
