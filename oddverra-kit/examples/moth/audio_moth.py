# [MT-audio] Stems for "The first computer bug was a real moth": a curious pizzicato + glock hook, a bouncy 1940s swing (walking bass,
# vibes, brushed snare) for the Mark II room, a stop and tense tremolo for "something is wrong", suspense pizzicato for the hunt, a
# tremolo sting + timpani for the moth, a light swing for the logbook and Grace Hopper, a soft question for "actual?", a night music
# box for Edison's 1870s workshop, a bright swing for the joke, a hushed museum pad and a warm reprise for the payoff.
# SFX motif: RELAY CLICKS (bursts of tiny metal clicks whenever the machine runs, single big clicks on beats) and the MOTH FLUTTER
# (soft amplitude-modulated wing noise whenever the moth flies). Plus: typewriter keys and paper-tape chatter, the alarm buzzer,
# flashlight clicks and footsteps, the panel door creak, a tape rip + slap, pencil scratching, laughs, gas lamp hiss, pen scratch,
# museum room tone and murmurs, whooshes at every cut.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, chalk, boom, buzzer
DUR = 1703 / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
B = 60 / 120
STOPS = [(F(398), F(404))]
def silent(t): return any(a <= t < b for a, b in STOPS)
SEC = [(0, 100, 'curious'), (100, 364, 'swing'), (364, 428, 'tense'), (428, 642, 'sneak'), (642, 724, 'sting'), (724, 1053, 'swing'), (1053, 1116, 'soft'),
       (1116, 1285, 'night'), (1285, 1412, 'swing'), (1412, 1518, 'museum'), (1518, 1703, 'gold')]
def sec(t):
    fr = t * 30
    for a, b, n in SEC:
        if a <= fr < b: return n
    return None
def trem(freqs, dur, vel, r, rate=11.0):
    x = I.pad(freqs, dur, vel, r, att=0.3, rel=0.4, warm=1600, detune=5); t = np.arange(x.shape[-1]) / SR
    return x * (0.6 + 0.4 * np.sin(2 * np.pi * rate * t))

def music():
    buf = np.zeros((2, N)); r = rng(1947)
    C, F_, G7, Am, Dm, E7, D7, A7 = [48, 52, 55, 58], [53, 57, 60], [43, 47, 50, 53], [57, 60, 64], [50, 53, 57], [52, 56, 59, 62], [50, 54, 57, 60], [45, 49, 52, 55]
    MEL = [72, 74, 76, 79, 76, 74, 72, 69, 71, 72, 74, 76, 74, 71, 67, 69]
    t, k = 0.0, 0
    while t < DUR - 0.2:
        s = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s and not silent(t):
            if s == 'curious':
                nn = [60, 64, 67, 71][k % 4]
                place(buf, pan(I.pluck(m2f(nn), 0.16 if beat % 2 == 0 else 0.1, r, dur=0.25, bright=0.45, pos=0.25), 0.15 if beat % 2 else -0.15), t)
                if beat == 2: place(buf, pan(I.glock(m2f(nn + 24), 0.05, r, dur=0.8), 0.2), t + B / 2)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(60), m2f(64), m2f(71)], B * 8, 0.04, r, att=0.6, rel=0.9, warm=1000), t)
            elif s in ('swing', 'gold'):
                ch = [C, A7, Dm, G7, C, E7, F_, G7][bar]; g = 1.0 if s == 'swing' else 1.1; sw = B * 0.62
                walk = [ch[0] - 12, ch[1] - 12, ch[2] - 12, ch[1] - 12][beat]
                place(buf, pan(I.pluck(m2f(walk), 0.2 * g, r, dur=0.4, bright=0.3, pos=0.2), 0), t)
                if beat in (1, 3): place(buf, pan(I.snare(0.05, r, dur=0.12), 0.1), t); place(buf, pan(I.snare(0.025, r, dur=0.08), -0.1), t + sw)
                if beat in (0, 2): place(buf, pan(I.vibes(m2f(MEL[k % 16]), 0.07 * g, r, dur=0.7), 0.2), t); place(buf, pan(I.vibes(m2f(MEL[(k + 1) % 16]), 0.05 * g, r, dur=0.5), 0.2), t + sw)
                if beat == 1: place(buf, pan(I.pluck(m2f(ch[1] + 12), 0.06, r, dur=0.2, bright=0.6, pos=0.12), -0.25), t); place(buf, pan(I.pluck(m2f(ch[2] + 12), 0.05, r, dur=0.2, bright=0.6, pos=0.12), -0.25), t)
                if s == 'gold' and beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n + 12) for n in ch[:3]], B * 8, 0.05, r, att=0.6, rel=0.9, warm=1200), t)
            elif s == 'tense':
                if beat == 0 and bar % 2 == 0: place(buf, trem([m2f(45), m2f(51), m2f(57)], B * 8, 0.07, r, rate=13), t)
                if beat in (0, 2): place(buf, pan(I.timpani(m2f(33), 0.12, r, dur=0.6), 0), t)
            elif s == 'sneak':
                nn = [45, 48, 52, 51][k % 4]
                place(buf, pan(I.pluck(m2f(nn), 0.2 if beat % 2 == 0 else 0.12, r, dur=0.25, bright=0.35, pos=0.3), 0.15 if beat % 2 else -0.15), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(45), m2f(52), m2f(60)], B * 8, 0.05, r, att=0.6, rel=0.9, warm=900), t)
                if beat == 3: place(buf, pan(I.vibes(m2f(76 if bar % 2 else 75), 0.05, r, dur=0.8), -0.2), t)
            elif s == 'sting':
                if beat == 0 and bar % 2 == 0: place(buf, trem([m2f(52), m2f(56), m2f(59), m2f(64)], B * 8, 0.07, r, rate=15), t)
            elif s == 'soft':
                if beat == 0: place(buf, I.pad([m2f(n) for n in [57, 60, 64]], B * 4, 0.06, r, att=0.6, rel=1.0, warm=900), t)
                if beat == 2: place(buf, pan(I.musicbox(m2f([76, 74, 72, 71][bar % 4]), 0.08, r, dur=1.2), 0.1), t)
            elif s == 'night':
                ch = [Am, F_, C, E7][bar % 4]
                place(buf, pan(I.musicbox(m2f([69, 72, 76, 72, 71, 74, 76, 74][k % 8] + 12), 0.09, r, dur=1.0), 0.15), t)
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in ch[:3]], B * 4, 0.05, r, att=0.6, rel=0.9, warm=900), t); place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.12, r, dur=0.6, bright=0.3, pos=0.2), 0), t)
            elif s == 'museum':
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in [60, 64, 67, 71]], B * 8, 0.06, r, att=0.9, rel=1.2, warm=1000), t)
                if beat == 1: place(buf, pan(I.glock(m2f([84, 79, 76, 79][bar % 4]), 0.05, r, dur=1.4), -0.1), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.1, v=0.2, kind='horn': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.9, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    for i, nn in enumerate([72, 76, 79, 84]): place(buf, pan(I.glock(m2f(nn), 0.1, r, dur=0.8), 0), F(57) + i * 0.07)                     # actual bug!
    place(buf, I.cymbal(0.08, r, dur=1.2), F(57))
    st([60, 64, 67], F(131), 0.08, 0.14)                                                                                                     # 1947
    st([60, 64, 67, 72], F(206), 0.07, 0.16); place(buf, I.cymbal(0.1, r, dur=1.4), F(206))                                                # Mark II
    place(buf, pan(I.brass(m2f(38), 0.7, 0.22, r, kind='tuba', fall=-4), 0), F(401)); place(buf, pan(I.timpani(m2f(31), 0.6, r), 0), F(401))  # wrong!
    place(buf, pan(I.timpani(m2f(33), 0.6, r), 0), F(586)); place(buf, pan(I.timpani(m2f(36), 0.6, r), 0), F(611))                          # relay 70 / panel F
    place(buf, pan(I.timpani(m2f(31), 0.9, r), 0), F(663)); place(buf, I.cymbal(0.14, r, dur=2.0), F(663)); st([64, 68, 71, 76], F(663), 0.06, 0.18)  # A MOTH!
    for i, nn in enumerate([79, 84, 88]): place(buf, pan(I.glock(m2f(nn), 0.09, r, dur=0.9), 0), F(852) + i * 0.07)                       # found.
    st([67, 72, 76], F(887), 0.08, 0.14)                                                                                                     # Grace Hopper
    place(buf, pan(I.brass(m2f(40), 0.6, 0.16, r, kind='tuba', fall=-5), 0), F(1009))                                                       # wasn't the one
    for i, nn in enumerate([76, 79, 83]): place(buf, pan(I.vibes(m2f(nn), 0.08, r, dur=1.0), 0), F(1082) + i * 0.09)                       # actual?
    place(buf, pan(I.timpani(m2f(36), 0.5, r), 0), F(1251))                                                                                 # 1870s
    st([60, 64, 67, 72], F(1319), 0.07, 0.16); place(buf, I.cymbal(0.1, r, dur=1.4), F(1319))                                               # joke!
    st([67, 72, 76, 79], F(1388), 0.07, 0.16); place(buf, I.cymbal(0.1, r, dur=1.6), F(1388))                                              # real bug
    for i, nn in enumerate([72, 76, 79, 84, 88]): place(buf, pan(I.glock(m2f(nn), 0.08, r, dur=1.0), 0), F(1489) + i * 0.08)              # Smithsonian
    place(buf, pan(I.timpani(m2f(36), 0.8, r), 0), F(1649)); place(buf, I.cymbal(0.12, r, dur=2.4), F(1649)); st([60, 64, 67, 72, 76], F(1652), 0.08, 0.18)  # code.
    return buf

# ---------- motif SFX
def relay_click(r, big=1.0):
    t = tt(0.06); f0 = r.uniform(2600, 4200)
    x = hp(r.standard_normal(len(t)), 2000) * np.exp(-t / 0.0015) * 0.8 + np.sin(phase(np.full(len(t), f0))) * np.exp(-t / 0.006) * 0.35 + np.sin(phase(np.full(len(t), f0 * 0.37))) * np.exp(-t / 0.01) * 0.25 * big
    return fades(x * (0.5 + 0.5 * big), 0.0005, 0.01)
def relay_bank(dur, r, rate=40.0, level=1.0):
    n = ns(dur); out = np.zeros((2, n)); tcur = 0.0
    while tcur < dur - 0.07:
        c = relay_click(r, r.uniform(0.2, 0.7)) * r.uniform(0.3, 1.0) * level; p = r.uniform(-0.7, 0.7); i = int(tcur * SR); m = min(len(c), n - i)
        out[0, i:i + m] += c[:m] * (1 - p) * 0.5; out[1, i:i + m] += c[:m] * (1 + p) * 0.5; tcur += r.exponential(1 / rate)
    return fades(out, 0.2, 0.2)
def flutter(dur, r, rate=24.0, level=1.0):
    t = tt(dur); x = bp(r.standard_normal(len(t)), 250, 2200); am = (0.5 + 0.5 * np.sin(2 * np.pi * rate * t + 0.3 * np.sin(2 * np.pi * 1.7 * t))) ** 3
    return fades(x * am * level * 0.6, 0.08, 0.15)
def footstep(r):
    t = tt(0.18); return fades(lp(r.standard_normal(len(t)), 900) * np.exp(-t / 0.025) * 0.6 + np.sin(phase(np.full(len(t), 90.0))) * np.exp(-t / 0.03) * 0.3, 0.001, 0.03)
def tape_rip(r, dur=0.35):
    t = tt(dur); x = bp(r.standard_normal(len(t)), 1500, 7000) * (0.6 + 0.4 * np.sin(2 * np.pi * 90 * t)) * np.exp(-((t - dur / 2) / (dur / 2.5)) ** 2); return fades(x * 0.5, 0.005, 0.03)
def slap(r):
    t = tt(0.2); return fades(bp(r.standard_normal(len(t)), 400, 3000) * np.exp(-t / 0.012) * 0.8, 0.0005, 0.03)
def pencil(dur, r):
    t = tt(dur); x = bp(r.standard_normal(len(t)), 2500, 8000) * (0.4 + 0.6 * (np.sin(2 * np.pi * 7 * t) > 0)) * 0.25; return fades(x, 0.03, 0.05)
def typekey(r):
    t = tt(0.08); return fades(hp(r.standard_normal(len(t)), 1200) * np.exp(-t / 0.004) * 0.6 + np.sin(phase(np.full(len(t), r.uniform(900, 1400)))) * np.exp(-t / 0.01) * 0.2, 0.0005, 0.01)
def creak_door(r):
    return G.creak(0.6, r, rate0=140, rate1=90)
def hiss(dur, r):
    t = tt(dur); return fades(hp(r.standard_normal(len(t)), 3000) * 0.08, 0.3, 0.3)

def sfx():
    buf = np.zeros((2, N)); r = rng(1545)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for f0 in (100, 204, 364, 428, 568, 642, 724, 864, 1053, 1285, 1334, 1518): P(gentle_whoosh(r), F(f0) - 0.25, 0.26)
    # relay clatter whenever the machine runs (lab shots)
    for f0, f1, lv in [(0, 100, 0.6), (100, 204, 0.3), (204, 380, 1.0), (864, 1053, 0.45), (1285, 1334, 0.45)]: P(relay_bank(F(f1 - f0) + 0.2, r, 34 if lv > 0.5 else 20, lv), F(f0), 0.22)
    for f0 in (30, 72, 344): P(relay_click(r, 1.0), F(f0), 0.5)
    # moth flutter whenever it flies
    for f0, f1, g in [(0, 100, 0.5), (100, 204, 0.2), (230, 364, 0.15), (1518, 1703, 0.35)]: P(flutter(F(f1 - f0), r), F(f0), g, -0.2)
    for i in range(10): P(typekey(r), F(232) + i * 0.14 + r.uniform(0, 0.05), 0.2, 0.3)                                                    # typewriter
    P(buzzer(r, 1.4), F(380), 0.18); P(relay_click(r, 1.0), F(372), 0.4); P(relay_click(r, 1.0), F(376), 0.3)                              # alarm, machine halts
    for i in range(12): P(footstep(r), F(436) + i * 0.5, 0.18, -0.1 + 0.2 * (i % 2))                                                        # footsteps
    P(relay_click(r, 0.6), F(434), 0.4); P(relay_click(r, 0.6), F(440), 0.4)                                                                  # flashlights on
    P(creak_door(r), F(588), 0.12)                                                                                                            # Panel F door
    for i in range(6): P(relay_click(r, 1.0), F(690) + i * 0.2, 0.5, 0.2)                                                                    # stuck relay chatters
    P(G.whoa(r), F(668), 0.06, 0.3); P(flutter(0.8, r, 30), F(692), 0.2, 0.2)                                                                # wing wiggle
    P(G.whoosh(0.5, r, 0.3), F(728), 0.12); P(tape_rip(r), F(740), 0.3); P(slap(r), F(753), 0.4)                                              # drop, tape rip, slap
    P(pencil(F(860 - 788), r), F(788), 0.5)                                                                                                   # writing
    P(G.babble(2.0, r, 200, 1.0), F(940), 0.05); P(G.hurrah(r, 240, 0.8), F(945), 0.06); P(bonk(r), F(1009), 0.14)
    P(pencil(0.6, r), F(1074), 0.5); P(ting(r, 2637), F(1082), 0.1)                                                                            # circle 'actual'
    P(hiss(F(169), r), F(1116), 0.4); P(G.crickets(5.0, r), F(1116), 0.04); P(pencil(1.2, r), F(1220), 0.35)                                  # gas lamp, night, pen
    P(G.babble(3.0, r, 200, 1.0), F(1290), 0.06); P(G.hurrah(r, 260, 1.0), F(1320), 0.08)                                                     # laughs
    P(ting(r, 3136), F(1388), 0.14)
    P(G.babble(3.4, r, 180, 1.0), F(1412), 0.035); for_steps = [P(footstep(r), F(1420) + i * 0.6, 0.06, 0.3) for i in range(5)]
    P(ting(r, 3136), F(1649), 0.14); P(G.hurrah(r, 260, 1.0), F(1655), 0.06)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
