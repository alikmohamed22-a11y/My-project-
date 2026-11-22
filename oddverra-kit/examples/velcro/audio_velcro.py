# [VC-audio] Stems for "Velcro was invented because burrs kept sticking to a dog". Beat frames come from ../web/vc_beats.js (work/beats.py).
# Music: a bouncy pizzicato + glock hook, a Swiss alpine oom-pah with a music-box "yodel" line for the 1941 hunting walk, a warm lamp-lit
# parlour for the study, a deep night music-box pad inside the microscope ("You see"), a hopeful vibes build for the idea, sneaky
# pizzicato for the cotton nightmare, a bouncy ragtime for nylon, a tick-tock pizzicato for the decade, a fanfare for the name, a snooty
# catwalk swing for the fashion world (stops dead on "cheap"), a floating space pad with vibes arpeggios for Apollo, and a golden waltz reprise.
# SFX: the signature hook-and-loop RRRIP (synthesised: a dense train of tiny hook-release clicks, band-passed, swelling then tearing off),
# little "thwip" sticks for every burr that lands on the dog, Burry's boing, meadow birds/breeze/cowbells, the study clock, the micro hum,
# loom clacks, the infrared lamp buzz, scissor snips, calendar page flips, camera flash pops and a snooty murmur, capsule air hiss and
# radio beeps, whooshes at every cut.
import json, re
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, boom
JS = open('../web/vc_beats.js').read()
Bt = json.loads(re.search(r'export const B = (\{.*?\});', JS).group(1)); NFR = int(re.search(r'export const NF = (\d+)', JS).group(1))
DUR = NFR / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
b = lambda k: F(Bt[k])
BPM = 60 / 112
CUTS = ['in41', 'most', 'yousee', 'and', 'so', 'but', 'nylon', 'took', 'named', 'patented', 'then2', 'so3']
STOPS = [(b('cheap') + 0.05, b('then2') - 0.05), (b('sound') + 0.2, b('sound') + 0.75)]
def silent(t): return any(a <= t < c for a, c in STOPS)
SEC = [(0, 'hook'), (Bt['in41'], 'alp'), (Bt['most'], 'parlour'), (Bt['yousee'], 'night'), (Bt['so'], 'hope'), (Bt['but'], 'sneak'), (Bt['nylon'], 'rag'), (Bt['took'], 'tick'),
       (Bt['named'], 'fanfare'), (Bt['patented'], 'catwalk'), (Bt['then2'], 'space'), (Bt['so3'], 'gold')]
def sec(t):
    fr = t * 30; cur = None
    for a, n in SEC:
        if fr >= a: cur = n
    return cur
def kickd(vel, f0=58):
    t = tt(0.4); return fades(np.sin(phase(f0 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.14) * vel, 0.0, 0.03)

def music():
    buf = np.zeros((2, N)); r = rng(1941)
    C, F_, G7, Am, Dm, E7 = [48, 52, 55], [53, 57, 60], [43, 47, 50, 53], [57, 60, 64], [50, 53, 57], [52, 56, 59, 62]
    MEL = [72, 76, 79, 76, 72, 74, 77, 74, 71, 74, 79, 77, 76, 74, 72, 67]   # our own bouncy "burr" tune
    YOD = [79, 84, 79, 76, 77, 81, 77, 74, 79, 83, 79, 76, 72, 76, 79, 84]   # alpine leaps
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4; ch = [C, Am, F_, G7][bar % 4]
        if s and not silent(t):
            if s == 'hook':
                if beat in (0, 2): place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.2, r, dur=0.3, bright=0.4, pos=0.25), -0.1), t)
                place(buf, pan(I.pluck(m2f(ch[beat % 3] + 12), 0.08, r, dur=0.2, bright=0.6, pos=0.15), 0.2), t + BPM / 2)
                place(buf, pan(I.glock(m2f(MEL[k % 16]), 0.05, r, dur=0.6), 0.1), t)
            elif s == 'alp':
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch[0] - 12), BPM * 0.5, 0.15, r, kind='tuba'), 0), t)
                if beat in (1, 3): place(buf, pan(I.pluck(m2f(ch[1] + 12), 0.09, r, dur=0.2, bright=0.7, pos=0.12), 0.25), t); place(buf, pan(I.pluck(m2f(ch[2] + 12), 0.07, r, dur=0.2, bright=0.7, pos=0.12), -0.25), t)
                place(buf, pan(I.musicbox(m2f(YOD[k % 16]), 0.09, r, dur=0.7), 0.1), t)
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], BPM * 4, 0.04, r, att=0.4, rel=0.8, warm=1200), t)
            elif s in ('parlour', 'gold'):
                g = 1.0 if s == 'parlour' else 1.15
                place(buf, pan(I.musicbox(m2f(MEL[k % 16]), 0.09 * g, r, dur=0.9), 0.15), t)
                if beat == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.16 * g, r, dur=0.6, bright=0.4, pos=0.2), 0), t)
                if beat in (1, 2, 3): place(buf, pan(I.pluck(m2f(ch[beat % 3]), 0.07 * g, r, dur=0.3, bright=0.5, pos=0.15), -0.2), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n + 12) for n in ch], BPM * 8, 0.05 * g, r, att=0.6, rel=0.9, warm=1100), t)
                if s == 'gold' and beat == 2: place(buf, pan(I.glock(m2f(MEL[(k + 5) % 16]), 0.05, r, dur=1.2), -0.1), t)
            elif s == 'night':
                if beat == 0: place(buf, I.pad([m2f(n) for n in ([57, 60, 64, 67] if bar % 2 == 0 else [53, 57, 60, 64])], BPM * 4, 0.06, r, att=0.8, rel=1.2, warm=900), t)
                if beat in (0, 2): place(buf, pan(I.musicbox(m2f(MEL[(k // 2) % 16]), 0.08, r, dur=1.4), 0.1 if beat else -0.1), t)
                if beat == 3: place(buf, pan(I.pluck(m2f(45), 0.12, r, dur=0.5, bright=0.3, pos=0.25), 0), t)
            elif s == 'hope':
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], BPM * 4, 0.06, r, att=0.4, rel=0.8, warm=1400), t)
                place(buf, pan(I.vibes(m2f(ch[beat % len(ch)] + 24), 0.05, r, dur=0.8), -0.15), t)
                if beat in (0, 2): place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.14, r, dur=0.5, bright=0.4, pos=0.2), 0), t)
            elif s == 'sneak':
                nn = [45, 48, 52, 51][k % 4]
                place(buf, pan(I.pluck(m2f(nn), 0.2 if beat % 2 == 0 else 0.12, r, dur=0.25, bright=0.35, pos=0.3), 0.15 if beat % 2 else -0.15), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(45), m2f(52), m2f(60)], BPM * 8, 0.05, r, att=0.6, rel=0.9, warm=900), t)
                if beat == 3: place(buf, pan(I.vibes(m2f(76 if bar % 2 else 75), 0.05, r, dur=0.8), -0.2), t)
            elif s == 'rag':
                ch2 = [C, Am, Dm, G7, C, E7, Am, G7][bar]
                place(buf, pan(kickd(0.26 if beat in (0, 2) else 0.12), 0), t)
                if beat in (0, 2): place(buf, pan(I.brass(m2f(ch2[0] - 12), BPM * 0.5, 0.13, r, kind='tuba'), 0), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.06, r, dur=0.15), 0.05), t)
                for e in range(2): place(buf, pan(I.pluck(m2f(ch2[(beat + e) % len(ch2)] + 12), 0.08, r, dur=0.2, bright=0.7, pos=0.12), 0.3), t + e * BPM / 2)
                place(buf, pan(I.glock(m2f(MEL[(k * 3) % 16]), 0.04, r, dur=0.4), -0.15), t + BPM / 2)
            elif s == 'tick':
                place(buf, pan(I.pluck(m2f(76 if beat % 2 == 0 else 71), 0.08, r, dur=0.15, bright=0.7, pos=0.1), 0.3 if beat % 2 else -0.3), t)
                if beat in (0, 2): place(buf, pan(I.pluck(m2f([45, 41, 43, 45][bar % 4]), 0.16, r, dur=0.4, bright=0.4, pos=0.2), 0), t)
            elif s == 'fanfare':
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch], BPM * 4, 0.05, r, att=0.3, rel=0.8, warm=1500), t)
                if beat in (0, 2): place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.16, r, dur=0.4, bright=0.5, pos=0.2), 0), t)
                place(buf, pan(I.musicbox(m2f(MEL[(k * 2) % 16]), 0.07, r, dur=0.6), 0.15), t)
            elif s == 'catwalk':
                ch2 = [Dm, G7, C, Am][bar % 4]
                place(buf, pan(kickd(0.2 if beat in (0, 2) else 0.0 + 0.001), 0), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.05, r, dur=0.12), 0.1), t); place(buf, pan(I.pluck(m2f(ch2[1] + 12), 0.08, r, dur=0.15, bright=0.8, pos=0.1), -0.25), t + BPM * 0.66)
                place(buf, pan(I.pluck(m2f(ch2[(beat) % len(ch2)] - 12), 0.14, r, dur=0.3, bright=0.35, pos=0.3), 0), t)
                if beat == 0: place(buf, pan(I.brass(m2f(ch2[2] + 12), BPM * 1.5, 0.07, r, kind='horn'), 0.1), t)
            elif s == 'space':
                if beat == 0: place(buf, I.pad([m2f(n) for n in ([60, 64, 67, 71] if bar % 2 == 0 else [57, 60, 64, 69])], BPM * 4, 0.06, r, att=0.9, rel=1.4, warm=1800), t)
                for e in range(2): place(buf, pan(I.vibes(m2f(([72, 76, 79, 83] if bar % 2 == 0 else [69, 72, 76, 81])[(beat * 2 + e) % 4]), 0.04, r, dur=1.0), 0.3 if e else -0.3), t + e * BPM / 2)
        t += BPM; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='horn': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    place(buf, pan(I.timpani(m2f(31), 0.4, r), 0), b('burrs')); place(buf, I.cymbal(0.06, r, dur=1.0), b('burrs'))                                  # BURRS!
    st([60, 64, 67], b('nineteen'), 0.08, 0.12)                                                                                                    # 1941
    place(buf, pan(I.brass(m2f(31), 0.8, 0.18, r, kind='tuba', fall=-3), 0), b('full'))                                                           # full of them (wah)
    for i, nn in enumerate([76, 79, 84]): place(buf, pan(I.glock(m2f(nn), 0.09, r, dur=0.9), 0), b('microscope') + i * 0.07)                   # microscope
    for i, nn in enumerate([72, 76, 79, 84]): place(buf, pan(I.vibes(m2f(nn), 0.08, r, dur=1.2), 0), b('hooks') + i * 0.08)                     # tiny hooks
    st([60, 67, 72], b('idea'), 0.07, 0.14); place(buf, I.cymbal(0.06, r, dur=1.2), b('idea'))                                                   # an idea
    place(buf, pan(I.brass(m2f(36), 0.9, 0.18, r, kind='tuba', fall=-5), 0), b('wore'))                                                          # wore out (wah)
    st([60, 64, 67, 72], b('nylon'), 0.07, 0.14)                                                                                                    # nylon worked
    for i, nn in enumerate([84, 79, 76, 72, 67]): place(buf, pan(I.glock(m2f(nn), 0.07, r, dur=0.6), 0), b('decade') + i * 0.09)             # a decade
    st([67, 72, 76, 79, 84], b('velcro2'), 0.08, 0.2); place(buf, I.cymbal(0.12, r, dur=2.2), b('velcro2')); place(buf, pan(I.timpani(m2f(36), 0.6, r), 0), b('velcro2'))  # VELCRO!
    st([60, 64, 67, 72], b('patented'), 0.08, 0.14)                                                                                                # patented
    place(buf, pan(I.brass(m2f(34), 1.0, 0.2, r, kind='tuba', fall=-6), 0), b('cheap'))                                                          # cheap (deflating wah)
    for i, nn in enumerate([72, 76, 79, 84, 88]): place(buf, pan(I.vibes(m2f(nn), 0.08, r, dur=1.4), 0), b('apollo') + i * 0.08)              # Apollo
    st([67, 72, 76, 79, 84], b('weeds'), 0.09, 0.18); place(buf, I.cymbal(0.12, r, dur=2.4), b('weeds'))                                         # the weeds
    return buf

# ---- the signature: hook-and-loop RRRIP (thousands of tiny hooks letting go) and the burr "thwip" stick
def rip(r, dur=0.55, vel=1.0, tear=1.0):
    n = ns(dur); t = np.arange(n) / SR; x = np.zeros(n)
    rate = 900 + 1400 * tear * np.sin(np.pi * np.minimum(1, t / dur)) ** 0.6           # clicks per second swell
    ph = np.cumsum(rate / SR); idx = np.nonzero(np.diff(np.floor(ph + r.random(n) * 0.35)) > 0)[0]
    for i in idx:
        L = int(0.0016 * SR); a = 0.4 + 0.6 * r.random()
        if i + L < n: x[i:i + L] += a * r.standard_normal(L) * np.exp(-np.arange(L) / (0.0004 * SR))
    env = np.minimum(1, t / 0.03) * np.exp(-np.maximum(0, t - dur * 0.75) / 0.05)
    x = bp(x * env, 900, 7000) + 0.25 * bp(r.standard_normal(n), 2000, 5000) * env
    x /= np.abs(x).max() + 1e-9; out = np.stack([x, np.roll(x, int(0.004 * SR))]); return fades(out * vel, 0.002, 0.04)
def thwip(r, vel=1.0):
    t = tt(0.16); x = np.sin(phase(1800 * np.exp(-t / 0.03) + 300)) * np.exp(-t / 0.035) * 0.6 + bp(r.standard_normal(len(t)), 2000, 6000) * np.exp(-t / 0.012) * 0.5
    return fades(x * vel, 0.0005, 0.03)
def boing(r):
    t = tt(0.5); f = 220 * (1 + 0.6 * np.exp(-t / 0.08)) * (1 + 0.08 * np.sin(2 * np.pi * 14 * t)); return fades(np.sin(phase(f)) * np.exp(-t / 0.18) * 0.7, 0.002, 0.08)
def tick(r, hi=True):
    t = tt(0.08); x = bp(r.standard_normal(len(t)), 2500 if hi else 1600, 7000) * np.exp(-t / 0.006) + np.sin(2 * np.pi * (1900 if hi else 1400) * t) * np.exp(-t / 0.012) * 0.4; return fades(x * 0.6, 0.0005, 0.02)
def clack(r):
    t = tt(0.15); x = bp(r.standard_normal(len(t)), 500, 2500) * np.exp(-t / 0.01) + np.sin(2 * np.pi * 220 * t) * np.exp(-t / 0.03) * 0.5; return fades(x * 0.7, 0.0005, 0.03)
def snip(r):
    t = tt(0.12); x = bp(r.standard_normal(len(t)), 3000, 9000) * (np.exp(-t / 0.006) + 0.7 * np.exp(-((t - 0.04) / 0.005) ** 2)); return fades(x * 0.7, 0.0005, 0.02)
def buzz(dur, r):
    t = tt(dur); x = (np.sign(np.sin(2 * np.pi * 100 * t)) * 0.3 + np.sin(2 * np.pi * 200 * t) * 0.3) * (0.8 + 0.2 * np.sin(2 * np.pi * 3 * t)); return fades(lp(x, 1200) * 0.4, 0.15, 0.2)
def beep(r, f=2500, dur=0.25):
    t = tt(dur); return fades(np.sin(2 * np.pi * f * t) * 0.4, 0.005, 0.02)
def pop(r, big=1.0):
    t = tt(0.6); x = np.sin(phase(70 * (1 + 2 * np.exp(-t / 0.02)))) * np.exp(-t / 0.12) * 0.5 * big + bp(r.standard_normal(len(t)), 1500, 8000) * np.exp(-t / 0.02) * 0.8; return fades(x, 0.001, 0.1)
def hiss(dur, r, level=1.0):
    n = ns(dur); out = np.stack([hp(r.standard_normal(n), 3000), hp(r.standard_normal(n), 3000)]) * 0.15 * level; return fades(out, 0.3, 0.3)
def hum(dur, r, f0=55):
    t = tt(dur); x = np.sin(2 * np.pi * f0 * t) * 0.4 + np.sin(2 * np.pi * f0 * 2.01 * t) * 0.2 + lp(r.standard_normal(len(t)), 200) * 0.3; return fades(x * 0.5, 0.4, 0.4)
def cowbell(r, f=520):
    t = tt(1.2); x = (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.48 * t) + 0.3 * np.sin(2 * np.pi * f * 2.1 * t)) * np.exp(-t / 0.35); return fades(x * 0.4, 0.002, 0.2)

def sfx():
    buf = np.zeros((2, N)); r = rng(1955)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for c in CUTS:
        if c in ('most', 'but', 'patented', 'then2'): P(gentle_whoosh(r, dur=0.4), b(c) - 0.15, 0.2)
        else: P(gentle_whoosh(r), b(c) - 0.25, 0.26)
    # cold open: Burry leaps and STICKS (rip), then burrs thwip onto the dog
    P(boing(r), F(0), 0.35); P(rip(r, 0.35, 1.0, 0.8), F(9), 0.75)
    for i, f0 in enumerate([0, 4, 8, 13, 18, 23, 29, 35, 41, 48, 56, 64]): P(thwip(r), F(f0 + 10), 0.38, (i % 3 - 1) * 0.3)
    # meadow: birds, breeze, distant cowbells; walk: footsteps + more thwips; full: a dog whimper-free "boing"
    P(G.bird_chirps(b('most'), r, 0.5), 0, 0.05); P(G.breeze(b('most'), r, 0.5), 0, 0.05)
    for i in range(5): P(cowbell(r, 500 + 40 * (i % 3)), b('in41') + 0.6 + i * 0.9, 0.05, -0.6 + 0.3 * i)
    for i in range(int((b('full') - b('in41')) / 0.5)): P(G.stroll_step(r), b('in41') + 0.3 + i * 0.5, 0.06, 0.1)
    st = max(3, (Bt['full'] - Bt['home']) // 13)
    for i in range(12): P(thwip(r, 0.9), F(Bt['home'] + i * st + 9), 0.3, (i % 3 - 1) * 0.3)
    P(boing(r), b('full'), 0.3)
    # study: clock ticks, tweezer plucks, the microscope push (rising whoosh)
    k = 0
    while b('most') + k < b('yousee'): P(tick(r, k % 2 == 0), b('most') + k, 0.12, 0.3); k += 1
    for i in range(5): P(rip(r, 0.12, 0.6, 0.4), b('pick') + 0.2 + i * 0.35, 0.25, 0.2)
    P(gentle_whoosh(r, dur=0.9, peak=0.6), b('microscope') - 0.1, 0.3)
    # micro: low hum + sparkle; hooks grab (thud + rip pulls)
    P(hum(b('so') - b('yousee'), r), b('yousee'), 0.1)
    for i, nn in enumerate([88, 91, 96]): P(ting(r, 440 * 2 ** ((nn - 69) / 12)), b('tiny') + i * 0.08, 0.06)
    P(boom(r, 0.4), b('grab') + 0.05, 0.12); P(rip(r, 0.7, 1.0), b('loop'), 0.7); P(boom(r, 0.4), b('fabric') + 0.2, 0.1); P(rip(r, 0.6, 1.0), b('fabric') + 0.33, 0.7)
    # idea: night crickets, pinboard pins, strips
    P(G.crickets(b('but') - b('so'), r), b('so'), 0.03)
    for kk in ('idea', 'hooks3', 'loops'): P(G.clink(r, f0=3000), b(kk), 0.1)
    P(rip(r, 0.4, 0.8), b('loops') + 0.4, 0.4)
    # mill: loom clacks (steady), cotton fray (puff + soft tear), IR buzz, scissor snips, page flips
    k = 0
    while b('but') + k * 0.54 < b('named'): P(clack(r), b('but') + k * 0.54, 0.06 if k % 2 else 0.08, -0.4); k += 1
    P(G.timber_tear(r, 0.6), b('wore'), 0.1); P(paper(r), b('wore') + 0.1, 0.15)
    P(buzz(b('took') - b('infrared') + 0.4, r), b('infrared') - 0.2, 0.08)
    for i in range(4): P(snip(r), b('cut') + i * 0.16, 0.25, 0.1)
    for i in range(9): P(paper(r), b('took') + 0.15 + i * (b('decade') + 0.2 - b('took')) / 9, 0.18, -0.2)
    P(rip(r, 0.7, 1.0), b('velcro2'), 0.85)
    # runway: murmur, flash pops, snooty "hmph"s
    P(G.babble(b('then2') - b('patented'), r, 220, 1.0), b('patented'), 0.035)
    for x in ('patented', 'nose', 'cheap'): P(pop(r, 0.7), b(x) + (0.13 if x == 'patented' else 0), 0.16)
    P(G.oof(r, 'ugh'), b('nose') + 0.15, 0.1)
    # capsule: air hiss, radio beeps, gear sticks to the walls
    P(hiss(b('so3') - b('then2'), r), b('then2'), 0.08)
    P(beep(r, 2525, 0.25), b('then2') + 0.3, 0.06); P(beep(r, 2475, 0.25), b('nasa') + 0.6, 0.06)
    for x, d in (('tools', 0.15), ('snacks', 0.1), ('floating', 0.25), ('away', 0.2)): P(rip(r, 0.28, 0.8, 0.6), b(x) + d, 0.5, 0.2)
    # payoff: dawn birds, the big RRRIP in the pause, the dog's leap into the weeds (rustle + thwips)
    P(G.bird_chirps(DUR - b('so3'), r, 0.6), b('so3'), 0.06); P(G.breeze(DUR - b('so3'), r, 0.4), b('so3'), 0.04)
    P(rip(r, 0.75, 1.0, 1.2), b('sound') + 0.27, 1.0)
    P(G.rattle(0.6, r), b('dog3') + 0.4, 0.08)
    for i in range(10): P(thwip(r, 0.9), b('dog3') + (16 + i * 3) / 30, 0.28, (i % 3 - 1) * 0.3)
    P(boing(r), b('weeds'), 0.3); P(G.hurrah(r, 260, 1.0), b('weeds') + 0.4, 0.05)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape, DUR)
