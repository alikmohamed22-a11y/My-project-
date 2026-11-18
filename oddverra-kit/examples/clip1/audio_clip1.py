# [CL-audio] Stems for the split-screen Short #1 ("The first speeding ticket was for 8 mph"). Our own synth only (no samples, no
# copyrighted music): a driving 124 BPM chase groove (kick / clap / hats / pluck bass / brass stabs, Am-F-C-G) that drops out for one bar
# on the court beat and lands on a brass hit at the payoff.
# SFX for the STORY panel: putt-putt of the horseless carriage, police whistle, bicycle bell, rubber stamps, a coin, crowd cheer, a whoosh
# at every cut. SFX for the STUNT panel (synced to the stunt library at offset LIB_OFF, events from /root/shorts/stuntlib/out/events.json):
# a modern engine whose pitch follows the library speed, landing booms, near-miss whooshes, a distant siren once the wanted level is up.
# mix.py then locks music and SFX to -6 dB under Jesse's voice (finish_chain sets the whole mix to -14 LUFS).
import json, numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, boom, kick, engine

W = json.load(open('../work/words.json')); import wave as _wv; _v = _wv.open('voice.wav'); NF = int(np.ceil(_v.getnframes() / _v.getframerate() * 30)); _v.close()
DUR = NF / 30.0; N = ns(DUR); m2f = I.m2f
LIB_OFF = float(open('../work/lib_offset.txt').read().strip()) if __import__('os').path.exists('../work/lib_offset.txt') else 12.8
EV = json.load(open('/root/shorts/stuntlib/out/events.json'))
def T(w, k=0):
    h = [x for x in W if ''.join(ch for ch in x['w'].lower() if ch.isalnum()) == w]; return h[min(k, len(h) - 1)]['s'] if h else 0.0
B = 60 / 124
COURT = (T('in', 2) - 0.1, T('in', 2) + B * 2)          # music drops out for the "In court" beat
PAY = T('eight', 2)

def clap(r, vel=0.6):
    t = tt(0.25); n = r.standard_normal(len(t)); env = sum(np.exp(-np.clip(t - d, 0, None) / 0.012) * (t >= d) for d in (0, 0.011, 0.022)) + np.exp(-t / 0.09) * 0.5
    return bp(n, 900, 5000) * env * vel * 0.5
def hat(r, vel=0.3, open_=False):
    t = tt(0.3 if open_ else 0.06); return hp(r.standard_normal(len(t)), 7000) * np.exp(-t / (0.08 if open_ else 0.015)) * vel

def music():
    buf = np.zeros((2, N)); r = rng(1896)
    CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]           # Am F C G
    BASS = [33, 33, 45, 33, 29, 29, 41, 29, 36, 36, 48, 36, 31, 31, 43, 38]
    RIFF = [(0.0, 69), (0.75, 72), (1.5, 76), (2.5, 74), (3.0, 72)]          # brass stab riff (beats within a bar)
    t, k = 0.0, 0
    while t < DUR - 0.1:
        bar, beat = k // 4, k % 4
        mute = COURT[0] <= t < COURT[1]
        intro = t < 1.2
        if not mute:
            place(buf, pan(kick(0.9 if beat in (0, 2) else 0.55, r), 0), t)
            if beat in (1, 3): place(buf, pan(clap(r, 0.55), 0.05), t)
            for h in (0, 0.5): place(buf, pan(hat(r, 0.22 if h else 0.3, open_=(h and beat == 3)), 0.3), t + h * B)
            for e in (0, 0.5): place(buf, pan(I.pluck(m2f(BASS[(bar % 4) * 4 + beat]), 0.75 if not e else 0.5, r, dur=B * 0.45, bright=0.35), -0.05), t + e * B)
            if beat == 0: place(buf, I.pad([m2f(n) for n in CH[bar % 4]], B * 4, 0.12, r, att=0.05, rel=0.4, warm=1500), t)
            if beat == 0 and not intro and bar % 2 == 1:
                for (o, n) in RIFF: place(buf, pan(I.brass(m2f(n - 12), B * 0.4, 0.5, r, kind="horn"), 0.15), t + o * B)
        k += 1; t += B
    # payoff brass hit + cymbal swell
    place(buf, pan(I.brass(m2f(45), 1.2, 0.9, r, kind="tuba") + I.brass(m2f(57), 1.2, 0.8, r, kind="horn"), 0), PAY)
    place(buf, pan(I.cymbal(0.7, r, dur=2.0), 0.2), PAY)
    return buf

def siren(dur, r):
    t = tt(dur); f = 950 + 550 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.33 * t)); y = np.sin(np.cumsum(2 * np.pi * f / SR)) + 0.3 * np.sin(np.cumsum(4 * np.pi * f / SR))
    return fades(lp(y, 3000) * 0.25, 0.8, 1.0)
def motor(dur, r, kmh):  # modern engine: harmonic buzz whose pitch follows speed (gear steps), plus road roar
    t = tt(dur); sp = np.interp(t + LIB_OFF, np.arange(len(kmh)) * 0.5, kmh)
    gear = np.clip(np.floor(sp / 55), 0, 4); rpm = 1700 + (sp - gear * 55) * 70 + gear * 300; f0 = rpm / 60 * 2
    ph = np.cumsum(2 * np.pi * f0 / SR); y = sum(np.sin(ph * h) / h for h in range(1, 7)) * 0.4
    roar = lp(r.standard_normal(len(t)), 400) * (0.3 + sp / 400)
    return fades(lp(y, 1600) * (0.5 + sp / 300) + roar, 0.3, 0.6)

def sfx():
    buf = np.zeros((2, N)); r = rng(1414)
    def P(x, t, g=1.0, p=0.0):
        if t < 0 or t > DUR: return
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    # --- story panel
    cuts = ['january', 'kent', 'walter', 'paddock', 'brandnew', ('his', 1), ('the', 2), 'so', ('on', 0), ('and', 0), 'reportedly', ('and', 1), ('in', 2), 'including', ('the', 3), 'but', ('the', 5), ('and', 2), 'you', 'all']
    for c in cuts: P(gentle_whoosh(r, 0.45, 0.35), (T(*c) if isinstance(c, tuple) else T(c)) - 0.22, 0.18)
    P(engine(T('his', 1) + 3.0, r, rate=9.0), 0.0, 0.28, -0.1)                         # putt-putt through the village scenes
    P(engine(T('in', 2) - T('and', 0), r, rate=10.0), T('and', 0), 0.24, 0.1)            # ... and on the lane chase
    P(engine(DUR - T('all'), r, rate=9.0), T('all'), 0.22)
    for w, k in (('eight', 0), ('eight', 1), ('two', 0), ('catches', 0), ('four', 0), ('shilling', 0), ('fourteen', 0), ('eight', 2)): P(bonk(r), T(w, k) - 0.03, 0.4)
    wh = I.whistle([(0, 0.25, 96, 0.9), (0.3, 0.5, 96, 1.0)], r)                        # police whistle on "constable"
    P(wh[1], T('constable') + wh[0], 0.18, 0.2)
    P(ting(r, 2350), T('bicycle') + 0.05, 0.25, 0.2); P(ting(r, 2350), T('bicycle') + 0.25, 0.2, 0.2)
    P(ting(r, 3136), T('shilling') + 0.15, 0.3)                                         # the coin
    P(paper(r), T('four') + 0.1, 0.2); P(paper(r), T('including') + 0.1, 0.15)
    P(G.hurrah(r, 220, 1.0), T('celebrated'), 0.12); P(G.applause(2.5, r, 30), T('celebrated') + 0.2, 0.1); P(G.hurrah(r, 260, 1.1), T('brighton'), 0.1)
    # --- stunt panel (library time = clip time + LIB_OFF)
    kmh = np.array(EV['speed_kmh'])
    P(motor(DUR, r, kmh), 0.0, 0.16)
    for J in EV['jumps']:
        tl, tt0 = J['landing'] - LIB_OFF, J['takeoff'] - LIB_OFF
        P(G.whoosh(1.2, r, 0.5, 300, 1800), tt0 - 0.1, 0.22); P(boom(r, 0.8 + 0.02 * J['impact'], 1.6), tl, 0.32); P(G.whoosh(0.5, r, 0.2, 2000, 7000), tl + 0.02, 0.12)
    for tp in EV['near_misses']: P(G.whoosh(0.5, r, 0.25, 500, 3500), tp - LIB_OFF - 0.25, 0.14, 0.3 * (1 if r.random() < 0.5 else -1))
    w1 = [t for t, n in EV['wanted'] if n >= 1][0] - LIB_OFF
    if w1 < DUR: P(siren(DUR - max(0, w1), r), max(0, w1), 0.05, 0.4)
    return buf

if __name__ == "__main__":
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape, 'DUR', DUR, 'LIB_OFF', LIB_OFF)
