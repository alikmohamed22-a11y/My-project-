# [AL-audio] Stems for "The first American alarm clock could only ring at 4 AM". Every cue is anchored on a word from
# ../web/al_words.js (same anchors as story_alarm.js), so the score follows the voice.
# Music: a ticking pizzicato hook (the clock), a moonlit music-box nocturne for 4 AM Concord, a perky colonial fife jig for Levi
# and the workshop, a clockwork glock/pluck groove for the cutaway, a deadpan tuba "too bad", a night music-box for "You see",
# a Paris musette waltz (accordion-ish pad + pluck) for Redier, and a sunrise fife reprise that ends on the last DING.
# SFX (signature motif): the 4 AM alarm, a small brass bell hammered fast (DING-DING-DING chatter, own modal synthesis), plus
# clock ticks, a gear ratchet click, the lever trip, wood mallet taps, a cabinet door creak, a quill scratch / stamp thud for the
# patent, Paris street murmur, a rooster's (late) crow, crickets at night, birds at dawn, whooshes at every cut.
import json, re, numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, bonk, boom

src = open('../web/al_words.js').read()
WF = json.loads(re.search(r'WF = (\[.*?\]);', src, re.S).group(1)); NF = int(re.search(r'NF = (\d+)', src).group(1))
DUR = NF / 30.0; N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
def w(k, n=0):
    hits = [x for x in WF if norm(x[0]).startswith(k)]
    return hits[n][1] if n < 0 else hits[min(n, len(hits) - 1)][1]
Bk = dict(one=w('one'), four=w('four'), it=w('it'), seventeen=w('seventeen'), concord=w('concord'), young=w('young'), levi=w('levi'), sun=w('sun'), every=w('every'), day=w('day'),
          so=w('so'), pine=w('pine'), mirror=w('mirror'), inside=w('inside'), extra=w('extra'), four2=w('four', 1), morning=w('morning'), want=w('want', 1), toobad=w('too'),
          want2=w('want', 2), five=w('five'), impossible=w('impossible'), yousee=w('you', 1), patented=w('patented'), mass=w('mass'), himself=w('himself', 1), took=w('took') - 4,
          sixty=w('sixty'), french=w('french'), redier=w('redier'), patented2=w('patented', 1), set=w('set'), eighteen=w('eighteen'), fin=w('finally'), pick=w('pick'),
          wake=w('wake', 1), so2=w('so', 1), snooze=w('snooze'), settings=w('settings'), opinion=w('opinion'), get=w('get'), up=w('up', -1))
SH = [0, Bk['four'] - 2, Bk['it'] - 3, Bk['young'] - 3, Bk['so'] - 3, Bk['inside'] - 3, Bk['want'] - 3, Bk['yousee'] - 3, Bk['took'] - 3, Bk['patented2'] - 3, Bk['fin'] - 3, Bk['so2'] - 3, NF]
NAMES = ['hook', 'wake', 'town', 'levi', 'build', 'gear', 'toobad', 'yousee', 'redier', 'patent', 'finally', 'payoff']
SEC = {'hook': 'tick', 'wake': 'none', 'town': 'night', 'levi': 'jig', 'build': 'jig', 'gear': 'clock', 'toobad': 'tick', 'yousee': 'night', 'redier': 'waltz', 'patent': 'waltz', 'finally': 'waltz', 'payoff': 'jig'}
def sec(t):
    fr = t * 30
    for i in range(len(NAMES)):
        if SH[i] <= fr < SH[i + 1]: return SEC[NAMES[i]], NAMES[i]
    return None, None
STOPS = [(F(Bk['four']) - 0.05, F(Bk['four']) + 1.0), (F(Bk['toobad']) - 0.05, F(Bk['toobad']) + 0.5), (F(Bk['impossible']) - 0.05, F(Bk['impossible']) + 0.6), (F(Bk['up']) - 0.05, DUR)]
def silent(t): return any(a <= t < b for a, b in STOPS)
B = 60 / 112
G_MAJ = [55, 59, 62]; C_MAJ = [48, 52, 55]; D_MAJ = [50, 54, 57]; E_MIN = [52, 55, 59]
JIG = [67, 71, 74, 71, 72, 74, 76, 74, 71, 69, 67, 69, 71, 67, 62, 66]   # our own little colonial tune (G major)

def music():
    buf = np.zeros((2, N)); r = rng(1787); t, k = 0.0, 0
    while t < DUR - 0.2:
        s, shot = sec(t); bar = (k // 4) % 8; beat = k % 4
        if s and s != 'none' and not silent(t):
            if s == 'tick':
                place(buf, pan(I.pluck(m2f(79 if beat % 2 == 0 else 74), 0.07, r, dur=0.12, bright=0.7, pos=0.1), 0.3 if beat % 2 else -0.3), t)
                if beat in (0, 2): place(buf, pan(I.pluck(m2f([43, 48, 50, 43][bar % 4]), 0.16, r, dur=0.4, bright=0.4, pos=0.2), 0), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n + 12) for n in [G_MAJ, C_MAJ, D_MAJ, G_MAJ][bar % 4]], B * 8, 0.045, r, att=0.6, rel=0.9, warm=1000), t)
            elif s == 'night':
                if beat == 0: place(buf, I.pad([m2f(n) for n in ([52, 55, 59, 62] if bar % 2 == 0 else [48, 52, 55, 59])], B * 4, 0.06, r, att=0.8, rel=1.2, warm=900), t)
                if beat in (0, 2): place(buf, pan(I.musicbox(m2f(JIG[(k // 2) % 16] + 12), 0.08, r, dur=1.4), 0.1 if beat else -0.1), t)
                if beat == 3: place(buf, pan(I.pluck(m2f(40), 0.12, r, dur=0.5, bright=0.3, pos=0.25), 0), t)
            elif s == 'jig':
                ch = [G_MAJ, C_MAJ, G_MAJ, D_MAJ][bar % 4]; g = 1.15 if shot == 'payoff' else 1.0
                for e in range(2): place(buf, pan(I.fife(m2f(JIG[(k * 2 + e) % 16]), B * 0.42, 0.06 * g, r), 0.15), t + e * B / 2)
                if beat in (0, 2): place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.18 * g, r, dur=0.4, bright=0.4, pos=0.2), 0), t)
                if beat in (1, 3): place(buf, pan(I.pluck(m2f(ch[1]), 0.08 * g, r, dur=0.2, bright=0.6, pos=0.15), -0.25), t); place(buf, pan(I.brush(0.05, r), 0.1), t)
                if beat == 0 and bar % 2 == 0: place(buf, I.pad([m2f(n) for n in ch], B * 8, 0.035 * g, r, att=0.5, rel=0.8, warm=1100), t)
            elif s == 'clock':
                place(buf, pan(I.pluck(m2f([74, 79, 76, 79][beat]), 0.08, r, dur=0.15, bright=0.8, pos=0.1), 0.25 if beat % 2 else -0.25), t)
                place(buf, pan(I.glock(m2f([86, 83, 79, 83][beat]), 0.035, r, dur=0.5), 0.1), t + B / 2)
                if beat in (0, 2): place(buf, pan(I.pluck(m2f([43, 47, 48, 50][bar % 4]), 0.16, r, dur=0.3, bright=0.4, pos=0.2), 0), t)
                if beat == 0: place(buf, I.pad([m2f(n + 12) for n in [G_MAJ, E_MIN, C_MAJ, D_MAJ][bar % 4]], B * 4, 0.04, r, att=0.3, rel=0.6, warm=1200), t)
            elif s == 'waltz':
                # 3/4 musette: bass on 1, chord on 2 and 3; the melody on vibes
                b3 = k % 3; ch = [[50, 54, 57], [45, 49, 52], [50, 54, 57], [43, 47, 50]][(k // 3) % 4]
                if b3 == 0: place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.18, r, dur=0.5, bright=0.35, pos=0.2), 0), t)
                else: place(buf, I.pad([m2f(n + 12) for n in ch], B * 0.7, 0.05, r, att=0.03, rel=0.2, warm=1800, detune=12, trem=lambda tt_: 0.8 + 0.2 * np.sin(2 * np.pi * 6.0 * tt_)), t)
                if b3 == 0: place(buf, pan(I.vibes(m2f([74, 73, 74, 71, 69, 71, 74, 78][(k // 3) % 8] + 12), 0.06, r, dur=1.2), 0.15), t)
        t += B; k += 1
    st = lambda notes, t0, gap=0.08, v=0.18, kind='horn': [place(buf, pan(I.brass(m2f(nn), 0.25 if i < len(notes) - 1 else 0.8, v, r, kind=kind), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    gl = lambda notes, t0, gap=0.07, v=0.1: [place(buf, pan(I.glock(m2f(nn), v, r, dur=0.9), 0), t0 + i * gap) for i, nn in enumerate(notes)]
    gl([79, 83, 86], F(Bk['one']), 0.07, 0.08)                                                             # one time
    place(buf, pan(I.timpani(m2f(31), 0.6, r), 0), F(Bk['four'])); place(buf, I.cymbal(0.1, r, dur=1.6), F(Bk['four']))     # FOUR A.M.
    gl([74, 79, 83, 86], F(Bk['seventeen']), 0.07, 0.09)                                                    # 1787
    st([67, 71, 74, 79], F(Bk['day']), 0.08, 0.14)                                                          # every single day
    gl([79, 83, 86, 91], F(Bk['mirror']), 0.06, 0.08)                                                       # mirror sparkle
    place(buf, pan(I.timpani(m2f(31), 0.5, r), 0), F(Bk['four2'])); place(buf, I.cymbal(0.08, r, dur=1.2), F(Bk['four2']))
    place(buf, pan(I.brass(m2f(31), 0.7, 0.2, r, kind='tuba', fall=-3), 0), F(Bk['toobad']) + 0.1)                  # too bad (wah)
    place(buf, pan(I.brass(m2f(29), 0.9, 0.2, r, kind='tuba', fall=-5), 0), F(Bk['impossible']) + 0.15)             # impossible
    st([62, 66, 69, 74], F(Bk['patented2']), 0.08, 0.15); place(buf, I.cymbal(0.08, r, dur=1.4), F(Bk['patented2']))   # patented 1847
    gl([74, 78, 81, 86], F(Bk['pick']), 0.09, 0.08)                                                          # pick your time
    st([67, 71, 74, 79, 83], F(Bk['opinion']), 0.09, 0.16)                                                   # one opinion
    place(buf, pan(I.timpani(m2f(31), 0.7, r), 0), F(Bk['up'])); place(buf, I.cymbal(0.14, r, dur=2.4), F(Bk['up']))
    return buf

# ---- the signature: a small brass alarm bell hammered fast (modal partials of a little cup bell, A6-ish)
def bellhit(r, f0=1760.0, vel=1.0, dur=1.4):
    t = tt(dur); x = np.zeros(len(t))
    for ratio, amp, tau in [(1.0, 1.0, 0.9), (2.32, 0.5, 0.45), (2.76, 0.35, 0.4), (4.1, 0.25, 0.2), (5.4, 0.12, 0.12)]:
        x += amp * np.exp(-t / tau) * np.sin(2 * np.pi * f0 * ratio * t + ratio)
    x += bp(r.standard_normal(len(t)), 2500, 9000) * np.exp(-t / 0.004) * 0.8
    return fades(x * vel / np.abs(x).max(), 0.0005, 0.2)
def alarm(r, dur=1.2, rate=13.0, vel=1.0, f0=1760.0):
    out = np.zeros(ns(dur + 1.5)); k = 0
    while k / rate < dur:
        h = bellhit(r, f0 * (1 + 0.004 * r.standard_normal()), vel * (0.8 + 0.2 * r.random()) * (1 - 0.3 * k / (rate * dur)), 1.2); i = ns(k / rate); out[i:i + len(h)] += h[:len(out) - i]; k += 1
    out /= np.abs(out).max(); return np.stack([lp(out, 9000), lp(np.roll(out, int(0.008 * SR)), 8500)]) * vel
def tick(r, hi=True):
    t = tt(0.08); x = bp(r.standard_normal(len(t)), 2500 if hi else 1600, 7000) * np.exp(-t / 0.006) + np.sin(2 * np.pi * (1900 if hi else 1400) * t) * np.exp(-t / 0.012) * 0.4; return fades(x * 0.6, 0.0005, 0.02)
def ratchet(r, n=6, rate=18.0):
    out = np.zeros(ns(n / rate + 0.2))
    for i in range(n): h = tick(r, i % 2 == 0); j = ns(i / rate); out[j:j + len(h)] += h
    return out
def crow(r, dur=1.4):
    # rooster: a formant-ish sawtooth glide ("cock-a-doodle-doo" contour, our own synthesis)
    t = tt(dur); pts = [(0, 520), (0.12, 760), (0.24, 640), (0.36, 820), (0.5, 760), (0.7, 900), (1.2, 700), (dur, 600)]
    f = np.interp(t, [p[0] for p in pts], [p[1] for p in pts]); ph = phase(f * (1 + 0.01 * np.sin(2 * np.pi * 28 * t)))
    saw = sum(np.sin(k * ph) / k for k in range(1, 9)); env = np.clip(t / 0.03, 0, 1) * np.clip((dur - t) / 0.2, 0, 1) * (0.7 + 0.3 * np.sin(2 * np.pi * 2.6 * t) ** 2)
    x = bp(saw * env, 500, 3200) + 0.05 * bp(r.standard_normal(len(t)), 1500, 4000) * env; return fades(x / np.abs(x).max(), 0.005, 0.1)
def thud(r):
    t = tt(0.4); x = np.sin(phase(90 * (1 + 1.5 * np.exp(-t / 0.02)))) * np.exp(-t / 0.08) + bp(r.standard_normal(len(t)), 300, 2500) * np.exp(-t / 0.02) * 0.5; return fades(x, 0.0005, 0.05)
def scratch(r, dur=0.7):
    t = tt(dur); x = bp(r.standard_normal(len(t)), 2500, 7000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 7 * t))) * 0.5; return fades(x, 0.02, 0.1)

def sfx():
    buf = np.zeros((2, N)); r = rng(1847)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    for i in range(1, len(NAMES)): P(gentle_whoosh(r, dur=0.4 if i in (2, 8, 11) else 0.6), F(SH[i]) - 0.2, 0.24)
    # THE ALARM: 4 AM in the bedroom, the cutaway trip, the sleep-in, the "five?" snap-back, Redier's alarm, the payoff
    P(alarm(r, 1.3), F(Bk['four']), 1.0); P(alarm(r, 0.9), F(Bk['four2']), 0.85); P(alarm(r, 0.6, f0=1650), F(Bk['morning']) + 1.0, 0.6)
    P(alarm(r, 0.8), F(Bk['toobad']), 0.9); P(alarm(r, 0.5), F(Bk['impossible']), 0.75); P(alarm(r, 0.7, rate=9, f0=2100), F(Bk['wake']) + 0.13, 0.6); P(alarm(r, 1.6), F(Bk['up']), 1.0)
    # ticks: the hook (each second), the cutaway, the sleep-in
    for a, b in [(0, SH[1]), (SH[5], SH[6]), (SH[6], SH[7])]:
        k = 0
        while F(a) + k * 0.5 < F(b): P(tick(r, k % 2 == 0), F(a) + k * 0.5, 0.2, 0.15 if k % 2 else -0.15); k += 1
    P(ratchet(r, 8), F(Bk['extra']), 0.2); P(G.clink(r, f0=3000), F(Bk['four2']) - 0.1, 0.2)                    # gear + lever trip
    P(ratchet(r, 14, 28), F(Bk['morning']) - 0.1, 0.18)                                                        # spin round the day
    # night town: crickets, a dog-less hush; the window lights (a soft match strike); Levi's lantern
    P(G.crickets(F(SH[4] - SH[2]), r), F(SH[2]), 0.05); P(G.breeze(F(SH[4] - SH[2]), r, 0.4), F(SH[2]), 0.04); P(paper(r), F(Bk['concord']), 0.08)
    # workshop: mallet taps, the door creak and click on "mirror"
    for i in range(4): P(G.hammer_hit(r, 0.5), F(SH[4]) + 0.2 + i * 0.32, 0.12, -0.2)
    P(G.creak(0.45, r), F(Bk['mirror']) - 0.3, 0.12); P(G.clink(r, f0=2400), F(Bk['mirror']) + 0.1, 0.12)
    # sleep-in: snore whistle before "too bad", the rooster's squawk
    P(G.whoa(r), F(Bk['toobad']) + 0.2, 0.06, -0.2)
    # "you see": night shop, candle hush; stamps
    for f0 in (Bk['patented'], Bk['mass']): P(thud(r), F(f0), 0.3)
    # Paris 1847: street murmur, carriage clops, the patent quill + stamp, the setting knob ratchet
    P(G.babble(F(SH[10] - SH[8]), r, 200, 1.0), F(SH[8]), 0.025); P(scratch(r), F(Bk['patented2']) - 0.6, 0.12); P(thud(r), F(Bk['patented2']), 0.35)
    P(ratchet(r, 6, 14), F(Bk['set']) - 0.2, 0.18); P(ratchet(r, 10, 18), F(Bk['pick']) - 0.15, 0.2); P(ting(r, 2637), F(Bk['pick']) + 0.6, 0.06)
    # dawn: birds, the rooster crows (late!), then the last alarm
    P(G.bird_chirps(F(NF - SH[11]), r, 0.5), F(SH[11]), 0.05); P(crow(r, 1.3), F(Bk['opinion']) - 0.1, 0.3, -0.3)
    return buf

if __name__ == "__main__":
    print({k: v for k, v in Bk.items()}, 'NF', NF)
    m, s = music(), sfx(); m /= np.abs(m).max() * 1.12; s /= np.abs(s).max() * 1.12; write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
