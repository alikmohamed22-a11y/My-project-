# Stems for "Violet Jessop": music.wav (march bed, stops at the twist, low drone after) and sfx.wav (cue table).
# Levels here are relative only; mix.py locks music and SFX to 50 % of the voice.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, st, place, fades, write_wav, modal, phase, colored, smooth_noise
import instruments as I
import sfx_gen as G

DUR = 66.93
N = ns(DUR)
m2f = I.m2f

# ---------------------------------------------------------------- music
BPM = 138.0
B = 60.0 / BPM            # beat
TWIST = 45.93
OUTRO = 61.8

CH_MAJ = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]]        # C Am F G
CH_WAR = [[45, 48, 52], [41, 45, 48], [40, 43, 47], [40, 44, 47]]        # Am F Em E
THEME = [(0, 72, 1), (1, 74, 0.5), (1.5, 76, 0.5), (2, 79, 1), (3, 76, 1),
         (4, 74, 1), (5, 72, 0.5), (5.5, 71, 0.5), (6, 69, 2)]


def kick(vel, r):
    t = tt(0.35)
    return np.sin(phase(52 * (1 + 1.4 * np.exp(-t / 0.03)))) * np.exp(-t / 0.12) * vel


def music():
    buf = np.zeros((2, N))
    r = rng(1)
    t, bar = 0.0, 0
    while t < TWIST - 0.05:
        war = False
        under = False
        chords = CH_WAR if war else CH_MAJ
        ch = chords[bar % 4]
        vel = 0.75 if not under else 0.45
        for b in range(4):
            tb = t + b * B
            if tb >= TWIST - 0.05:
                break
            place(buf, pan(kick(0.9 * vel if b % 2 == 0 else 0.5 * vel, r), 0), tb)
            if b % 2 == 1:
                place(buf, pan(I.snare(0.45 * vel, r, dur=0.25), 0.1), tb)
            place(buf, pan(I.pluck(m2f(ch[0] - 12 + (7 if b % 2 else 0)), 0.8 * vel, r, dur=0.4, bright=0.35), -0.15), tb)
        place(buf, I.pad([m2f(n) for n in ch], 4 * B, 0.28 * vel, r, att=0.2, rel=0.4, warm=1200), t)
        if not under:
            for (o, n, d) in THEME if bar % 2 == 0 else THEME[:5]:
                tn = t + o * B
                if tn < TWIST - 0.1:
                    nn = n - (3 if war and n in (76, 64) else 0)
                    place(buf, pan(I.glock(m2f(nn), 0.32, r, dur=1.2), 0.25), tn)
        t += 4 * B
        bar += 1
    # cut at the twist with a short fade, then a low drone
    i0, i1 = ns(TWIST), ns(TWIST + 0.08)
    buf[:, i1:] = 0
    buf[:, i0:i1] *= np.linspace(1, 0, i1 - i0)
    dr = I.pad([m2f(36), m2f(43)], DUR - TWIST, 0.35, r, att=0.4, rel=1.0, warm=400)
    place(buf, dr, TWIST)
    for (o, n, d) in (THEME[:5] + [(4, 72, 2)] if OUTRO < DUR else []):
        place(buf, pan(I.glock(m2f(n), 0.28, r, dur=1.6), 0.2), OUTRO + 0.3 + o * B * 1.2)
    if OUTRO < DUR: place(buf, I.pad([m2f(n) for n in [48, 52, 55, 60]], DUR - OUTRO, 0.18, r, att=0.8, rel=1.5, warm=1000), OUTRO)
    return buf


# ---------------------------------------------------------------- sfx
def boom(r, big=1.0, dur=2.2):
    t = tt(dur)
    low = np.sin(phase(45 * (1 + 0.8 * np.exp(-t / 0.08)))) * np.exp(-t / 0.5)
    nz = lp(r.standard_normal(len(t)), 900) * np.exp(-t / 0.35) * 0.9
    crack = bp(r.standard_normal(len(t)), 1200, 6000) * np.exp(-t / 0.03) * 0.6
    return fades((low * 1.2 + nz + crack) * big, 0.0, 0.3)


def metal_scrape(dur, r):
    return G.creak(dur, r, rate0=60, rate1=140, modes=G.CHAIN, rough=0.3, noise=0.15)


def horn(dur, r):
    t = tt(dur + 0.3)
    y = I.brass(m2f(38), dur, 0.8, r, kind="tuba") + 0.6 * I.brass(m2f(45), dur, 0.7, r, kind="horn")
    return fades(lp(y, 1400), 0.05, 0.3)


def ting(r, f=2637):
    return I.triangle(0.7, r, dur=1.2, f=f) + 0.6 * I.glock(f, 0.6, r, dur=1.2)


def bonk(r):
    t = tt(0.5)
    return modal(0.5, [(310, 1.0, 0.06), (690, 0.6, 0.04), (1250, 0.3, 0.02)], r, glide=-0.08) + np.exp(-t / 0.02) * np.sin(phase(140 * np.ones(len(t)))) * 0.5


def gentle_whoosh(r, dur=0.6, peak=0.4):
    return G.whoosh(dur, r, peak=peak)


def clop(r):
    t = tt(0.35)
    knock = modal(0.35, [(r.uniform(380, 460), 1.0, 0.03), (r.uniform(820, 980), 0.6, 0.02), (1700, 0.3, 0.012)], r)
    thump = np.sin(phase(120 * (1 + 0.4 * np.exp(-t / 0.01)))) * np.exp(-t / 0.04)
    return fades(knock + 0.8 * thump + bp(r.standard_normal(len(t)), 1500, 6000) * np.exp(-t / 0.004) * 0.5, 0.0, 0.05)


def chalk(r, dur=0.5):
    t = tt(dur); n = r.standard_normal(len(t))
    env = (0.5 + 0.5 * np.sin(2 * np.pi * 7 * t)) * np.clip(t / 0.02, 0, 1) * np.clip((dur - t) / 0.05, 0, 1)
    return bp(n, 2500, 6500) * env * 0.6


def buzzer(r, dur=0.6):
    t = tt(dur)
    y = np.sign(np.sin(2 * np.pi * 98 * t)) + 0.6 * np.sign(np.sin(2 * np.pi * 147 * t))
    return fades(lp(y, 2200) * 0.35, 0.005, 0.05)


def paper(r):
    t = tt(0.4); return bp(r.standard_normal(len(t)), 900, 7000) * np.exp(-t / 0.08) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t))


def engine(dur, r, rate=11.0):
    t = tt(dur); n = r.standard_normal(len(t))
    pulse = (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * rate * t))) * np.exp(-((t * rate) % 1) * 4)
    y = lp(n, 500) * pulse * 1.4 + 0.3 * np.sin(2 * np.pi * rate * 2 * t) * pulse
    return fades(y * 0.6, 0.1, 0.2)


def honk(r):
    t = tt(0.55); f = np.where(t < 0.25, 330, 262)
    y = np.sign(np.sin(np.cumsum(2 * np.pi * f / SR))) * 0.4
    return fades(lp(y, 1800) * np.clip(t / 0.02, 0, 1), 0.005, 0.05)


def scratch(r):
    t = tt(0.45); n = r.standard_normal(len(t))
    f = 400 + 2600 * np.abs(np.sin(2 * np.pi * 3.2 * t))
    y = np.sin(np.cumsum(2 * np.pi * f / SR)) * 0.4 + bp(n, 800, 5000) * 0.5
    return fades(y * np.exp(-t / 0.25), 0.002, 0.05)


def hiss(r, dur):
    t = tt(dur); return fades(hp(r.standard_normal(len(t)), 3000) * 0.3 * np.exp(-t / dur), 0.02, 0.2)


SEG = [(0,187,0,137),(187,275,137,179),(275,330,179,215),(496,556,270,330),(802,910,344,425),(910,962,425,475),(962,1030,475,525),(1030,1075,60,105),
       (1075,1147,525,598),(1147,1221,598,676),(1221,1273,676,727),(1273,1326,727,767),(1326,1378,767,820),(1378,1438,820,900),(1438,1538,900,966),
       (1538,1653,966,1077),(1653,1703,1077,1120),(1703,1801,1120,1208),(1801,1854,1270,1317),(1854,1940,676,727),(1940,2008,767,812)]
def remap(t):
    fo = t * 30
    for (a, b, c, d) in SEG:
        if c <= fo < d: return (a + (fo - c) * (b - a) / (d - c)) / 30
    return None

def sfx():
    buf = np.zeros((2, N))
    r = rng(31)
    def Pn(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float)
        place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    def P(x, t, g=1.0, p=0.0):   # old-timeline cue -> new time (dropped if that moment is unused)
        n = remap(t)
        if n is not None: Pn(x, n, g, p)
    def steps(t0, t1, dt, g, gain, pan_=0.0):
        t = t0
        while t < t1: Pn(G.stroll_step(r, g), t, gain, pan_ if pan_ else r.uniform(-0.4, 0.4)); t += dt
    Pn(G.breeze(66.9, r, 0.5), 0.0, 0.18); Pn(G.bird_chirps(6, r, 0.3), 6.2, 0.15); Pn(G.bird_chirps(6, r, 0.4), 21.7, 0.2)
    # old cues (car, crowd, falls, crash, medal, office) remapped
    P(engine(4.6, r), 0.0, 0.55); P(honk(r), 2.9, 0.5); P(G.applause(1.2, r, people=15), 4.6, 0.2)
    th = tt(0.9); P(np.sin(np.cumsum(2 * np.pi * (600 + 900 * th / 0.9) / SR)) * 0.25 * np.exp(-th / 0.8), 6.0, 0.6); P(ting(r), 6.9, 0.5)
    for tc in (9.5, 10.13, 10.4, 10.67): P(boom(r, 0.25, 0.5), tc, 0.5); P(G.wood_crack(r), tc + 0.01, 0.2)
    tw = tt(0.5); P(np.sin(np.cumsum(2 * np.pi * (520 - 300 * tw / 0.5) / SR)) * 0.35 * np.exp(-tw / 0.3), 13.47, 0.6)
    P(engine(1.6, r), 15.85, 0.5); P(honk(r), 16.7, 0.45); P(engine(1.3, r, 13), 17.6, 0.5)
    P(boom(r, 0.8, 1.6), 18.88, 0.9); P(G.clink(r, 1500), 18.95, 0.5); P(hiss(r, 3.0), 18.95, 0.6)
    P(G.wood_crack(r), 23.25, 0.5); P(G.applause(2.6, r, people=40), 23.3, 0.6)
    P(ting(r), 26.85, 0.6); P(scratch(r), 27.3, 0.9); P(I.pluck(196, 0.6, r, dur=0.6), 29.1, 0.5)
    P(I.pluck(880, 0.6, r, dur=0.3), 34.0, 0.5); P(ting(r, 2093), 34.05, 0.3); P(I.pluck(988, 0.6, r, dur=0.3), 34.92, 0.5); P(ting(r, 2349), 34.97, 0.3); P(ting(r, 2637), 35.97, 0.6)
    P(boom(r, 0.6, 1.0), 43.13, 0.8); P(G.wood_crack(r), 43.14, 0.5); P(I.timpani(m2f(31), 0.7, r, dur=1.0), 43.13, 0.6)
    # car rides past the runners (34.3-35.8)
    Pn(engine(1.6, r), 34.3, 0.5); Pn(gentle_whoosh(r, 0.6, 0.4), 34.9, 0.6)
    # footsteps for running scenes
    steps(11.0, 15.3, 0.3, 0.5, 0.35); steps(16.6, 18.5, 0.3, 0.5, 0.4); steps(26.8, 29.0, 0.3, 0.5, 0.4); steps(38.4, 40.6, 0.33, 0.3, 0.4)
    steps(41.0, 42.3, 0.3, 0.4, 0.35); steps(47.9, 51.2, 0.5, 0.9, 0.35); steps(56.8, 60.0, 0.5, 0.9, 0.35); steps(61.8, 64.5, 0.3, 0.4, 0.35)
    # water stop: empty ladle scrape + sign pop; "on purpose" smug ting
    Pn(G.clink(r, 1200), 13.4, 0.5); Pn(scratch(r), 13.8, 0.3); Pn(I.pluck(523, 0.6, r, dur=0.4), 12.5, 0.5); Pn(ting(r, 2637), 15.4, 0.45)
    # wild dogs: barks + scramble
    steps(18.55, 21.6, 0.18, 0.6, 0.45)
    for k, tb in enumerate(np.arange(18.6, 21.6, 0.53)):
        tb2 = tt(0.22); fb = 520 + 140 * (k % 3)
        bark = (np.sin(np.cumsum(2 * np.pi * (fb * (1 - 0.35 * tb2 / 0.22)) / SR)) + 0.6 * bp(r.standard_normal(len(tb2)), 600, 2400)) * np.exp(-tb2 / 0.07)
        Pn(lp(bark, 3000) * 0.5, tb, 0.7, (k % 3 - 1) * 0.3)
    # orchard: crunch, yuck, snore
    for tc in (22.6, 23.2): tcr = tt(0.18); Pn(bp(r.standard_normal(len(tcr)), 1500, 7000) * np.exp(-tcr / 0.04) * 0.7, tc, 0.7)
    tg = tt(0.6); Pn(np.sin(np.cumsum(2 * np.pi * (300 - 140 * tg / 0.6) / SR)) * 0.3 * np.exp(-tg / 0.4), 24.1, 0.6)
    Pn(G.wood_crack(r), 25.3, 0.3)
    for ts in (25.9, 26.45):
        tz = tt(0.5); Pn(lp(r.standard_normal(len(tz)), 500) * np.sin(np.pi * tz / 0.5) * 0.6, ts, 0.5)
    # flash time-jumps
    for tc in (60.03, 61.8): Pn(gentle_whoosh(r, 0.5, 0.3), tc - 0.25, 0.6); Pn(ting(r, 3520), tc, 0.3)
    # calendar pages + Boston cheer + medal
    for k in range(9): Pn(paper(r), 61.85 + k * 0.19, 0.45)
    Pn(G.applause(3.0, r, people=40), 63.5, 0.5); Pn(ting(r, 2637), 64.9, 0.6); Pn(I.timpani(m2f(31), 0.6, r, dur=1.4), 65.8, 0.5)
    return buf


if __name__ == "__main__":
    m, s = music(), sfx()
    write_wav("music.wav", m[:, :N])
    write_wav("sfx.wav", s[:, :N])
    print("stems written", m.shape, s.shape)
