# Stems for "The Chef Résumé" Ep9 (Day 9, NO VOICEOVER): the viewer's "serve it with baked bread" → the oven smokes, the loaf comes out
# harder than a brick (CLONK x2, the counter dents) → The Iron Palate walks in (slow-mo: the band drops to a dark half-time pulse) →
# Sam drops the bread in the soup (SPLASH) → stare, dip, soak, bite → SILENCE (record scratch, the band cuts out ~1.2 s: clock + crickets)
# → he writes ONE word (pen scratch) → the notebook SLAMS → "Bro…" → 21 days left.
# The music carries the episode (no voice), same bouncy pizzicato family as Ep1-8, new key (D), 132 BPM.
# Cue frames come from web/beats_d9.js (parsed here). Run: python3 audio_chef_d9.py  → music_d9.wav, sfx_d9.wav, mix_d9.wav
import re, numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored, phase
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, bonk, scratch, chalk, hiss
from audio_chef_d5 import ding, chime, click, tap, beep, blorp, splat, slap, hmm, send_whoosh, squeak
from mix import gated_rms, cap_peaks

_src = open('../web/beats_d9.js').read()
BEATS = [(m.group(1), int(m.group(2))) for m in re.finditer(r"\['(\w+)', (\d+), \[", _src)]
S = {}; _a = 0
for n, d in BEATS: S[n] = _a; _a += d
LEN = _a
DUR = round(LEN / 30, 3); N = ns(DUR); m2f = I.m2f
F = lambda fr: fr / 30.0
BPM = 132.0; B = 60.0 / BPM
STOPS = [(F(S['silence'] - 1), F(S['write']))]                 # the bite → SILENCE: the band cuts out completely
DARK = (F(S['walk']), F(S['panic']))                            # the critic's entrance: half-time dark pulse instead of the bounce
def silent(t): return any(a <= t < b for a, b in STOPS)

def music():
    buf = np.zeros((2, N)); r = rng(91)
    prog = [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]]     # D  Bm  G  A
    bass = [50, 47, 43, 45]; mel = [86, 90, 93, 90, 88, 86, 85, 88, 90, 93, 95, 93, 90, 88, 86, 85]
    t, k = 0.0, 0
    while t < DUR - 1.2:
        bar = k % 4
        for b in range(4):
            tb = t + b * B
            if silent(tb) or tb > DUR - 1.2 or DARK[0] <= tb < DARK[1]: continue
            place(buf, pan(I.pluck(m2f(bass[bar] + (12 if b % 2 else 0)), 0.6, r, dur=0.25, bright=0.3), -0.15), tb)
            place(buf, pan(I.pluck(m2f(prog[bar][(b + 1) % 3] + 12), 0.32, r, dur=0.18, bright=0.6), 0.2), tb + B / 2)
            place(buf, pan(I.pluck(m2f(prog[bar][b % 3] + 12), 0.22, r, dur=0.14, bright=0.7), -0.2), tb + B * 0.75)
            if b in (1, 3): place(buf, pan(I.snare(0.35, r, dur=0.2, snappy=0.6), 0.1), tb)
            else: place(buf, pan(I.brush(0.3, r, dur=0.15), 0.05), tb)
            if t > 1.5: place(buf, pan(I.glock(m2f(mel[(b + 4 * k) % 16] - 12), 0.13, r, dur=0.45), 0.3), tb + (B / 2 if b % 2 else 0))
        t += 4 * B; k += 1
    # the critic: low brass swells + timpani heartbeat, slow
    for i, n in enumerate([38, 38, 37, 36]): place(buf, pan(I.brass(m2f(n), 1.0, 0.6, r), 0), DARK[0] + i * 0.55)
    hb = DARK[0]
    while hb < DARK[1] - 0.2: place(buf, I.timpani(m2f(31), 0.55, r, dur=0.6), hb); place(buf, I.timpani(m2f(31), 0.35, r, dur=0.5), hb + 0.22); hb += 0.75
    place(buf, I.pad([m2f(50), m2f(53), m2f(56)], DARK[1] - DARK[0], 0.35, r, att=0.4, rel=0.4), DARK[0])
    # stings
    for i, n in enumerate([74, 78, 81, 86]): place(buf, pan(I.brass(m2f(n - 12), 0.45, 0.5, r), 0), F(1) + i * 0.06)               # DAY 9
    for i, n in enumerate([74, 78, 81, 86]): place(buf, pan(I.glock(m2f(n + 12), 0.25, r, dur=1.0), 0.2), F(S['phone'] + 64) + i * 0.05)
    place(buf, pan(I.brass(m2f(50), 0.35, 0.5, r), 0), F(S['oven'] + 40)); place(buf, pan(I.brass(m2f(49), 0.7, 0.5, r, fall=-4), 0), F(S['oven'] + 50))
    place(buf, I.timpani(m2f(38), 0.7, r, dur=1.0), F(S['counter'] + 16)); place(buf, I.timpani(m2f(33), 0.9, r, dur=1.4), F(S['counter'] + 44))
    place(buf, I.cymbal(0.5, r, dur=1.6), F(S['counter'] + 44))
    for i, n in enumerate([62, 65, 68]): place(buf, pan(I.brass(m2f(n - 12), 0.9, 0.75, r), 0), F(S['name']) + i * 0.02)      # IRON PALATE chord
    place(buf, I.timpani(m2f(31), 0.9, r, dur=1.6), F(S['name'])); place(buf, I.cymbal(0.45, r, dur=2.0), F(S['name']))
    for tr, vr in I.snare_roll(0, 0.75, 0.1, 0.5, r): place(buf, pan(I.snare(vr, r, dur=0.12, snappy=0.8), 0), F(S['splash']) + tr)
    place(buf, I.timpani(m2f(33), 0.9, r, dur=1.2), F(S['splash'] + 24)); place(buf, I.cymbal(0.6, r, dur=1.8), F(S['splash'] + 24))
    place(buf, I.timpani(m2f(38), 0.5, r, dur=1.0), F(S['bite'] + 20))
    place(buf, pan(I.brass(m2f(50), 0.6, 0.6, r), 0), F(S['write'] + 40)); place(buf, I.timpani(m2f(38), 0.7, r, dur=1.0), F(S['write'] + 40))
    place(buf, I.timpani(m2f(33), 0.8, r, dur=1.0), F(S['cantread'] + 28))
    for i, n in enumerate([74, 78, 81, 86]): place(buf, pan(I.glock(m2f(n + 12), 0.35, r, dur=1.4), 0.2), F(S['days'] + 4) + i * 0.12)
    place(buf, I.timpani(m2f(50), 0.5, r, dur=1.4), F(S['days'] + 4) + 0.5)
    env = np.ones(N); tN = np.arange(N) / SR
    for a, b in STOPS: env = np.minimum(env, np.clip(np.maximum((a - tN) / 0.03, (tN - b) / 0.06), 0, 1))
    buf *= env
    for i, n in enumerate([81, 86, 90, 93]): place(buf, pan(I.glock(m2f(n + 12), 0.3, r, dur=1.2), -0.2), DUR - 1.1 + i * 0.1)
    return buf

# ---------------- sfx ----------------
def fall_whistle(r, dur=0.8): t = tt(dur); return fades(np.sin(phase(1800 * np.exp(-t * 1.4))) * 0.3, 0.02, 0.05)
def knock(r): return modal(0.25, [(180, 1.0, 0.05), (420, 0.5, 0.03), (950, 0.3, 0.015)], r) * 0.8
def clonk(r): return modal(0.5, [(140, 1.0, 0.12), (330, 0.7, 0.07), (610, 0.4, 0.05), (1320, 0.2, 0.02)], r) * 0.9
def pen_scratch(r, dur):
    t = tt(dur); n = bp(r.standard_normal(len(t)), 2500, 7000); g = (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 7 * t + 3 * np.sin(2 * np.pi * 2.3 * t)))) * 0.8 + 0.2
    return fades(n * g * 0.35, 0.01, 0.05)

def sfx():
    buf = np.zeros((2, N)); r = rng(97)
    def P(x, fr, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, F(fr))
    s = S
    P(G.hammer_hit(r, 0.6), 0, 0.35); P(ting(r, 2349), 1, 0.3); P(knock(r), 18, 0.8, 0.3); P(knock(r), 26, 0.8, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), s['phone'], 0.5); P(send_whoosh(r), s['phone'] + 6, 0.35); P(click(r, 2200), s['phone'] + 62, 0.45); P(ting(r, 2637), s['phone'] + 78, 0.3); P(click(r, 2400), s['phone'] + 66, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), s['oven'], 0.5); P(ting(r, 3136), s['oven'] + 4, 0.2); P(hiss(r, 1.6), s['oven'] + 24, 0.5, 0.4)
    for i in range(6): P(beep(3100, 0.12), s['oven'] + 40 + i * 6, 0.35, 0.3)
    P(G.whoosh(0.3, r, peak=0.15, f_lo=300, f_hi=1500), s['oven'] + 34, 0.35)
    P(gentle_whoosh(r, 0.4, 0.25), s['counter'], 0.5)
    P(G.whoosh(0.3, r, peak=0.25, f_lo=200, f_hi=1200), s['counter'] + 8, 0.4)
    P(clonk(r), s['counter'] + 16, 1.0); P(G.hammer_hit(r, 0.8), s['counter'] + 16, 0.5); P(G.wood_crack(r), s['counter'] + 17, 0.35)
    P(G.whoosh(0.3, r, peak=0.2, f_lo=200, f_hi=1200), s['counter'] + 36, 0.4)
    P(clonk(r), s['counter'] + 44, 1.2); P(G.hammer_hit(r, 1.0), s['counter'] + 44, 0.7); P(G.wood_crack(r), s['counter'] + 45, 0.6)
    P(G.stroll_step(r, 1.0), s['counter'] + 54, 0.5, 0.4); P(G.push_thump(r), s['counter'] + 62, 0.5, 0.4); P(click(r, 2200), s['counter'] + 60, 0.3)
    P(G.whoosh(0.8, r, peak=0.4, f_lo=150, f_hi=800), s['walk'] - 4, 0.5)
    for i in range(3): P(G.boot(r, 0.8), s['walk'] + 8 + i * 24, 0.6, (i % 2 - 0.5) * 0.3)
    P(G.hammer_hit(r, 0.7), s['name'], 0.5); P(ting(r, 3520), s['name'] + 8, 0.3, 0.2)
    P(gentle_whoosh(r, 0.4, 0.25), s['panic'], 0.5); P(G.rattle(1.2, r, density=25.0), s['panic'] + 2, 0.25)
    P(G.whoosh(0.4, r, peak=0.2, f_lo=400, f_hi=2000), s['panic'] + 40, 0.5)
    P(fall_whistle(r, 0.8), s['splash'], 0.4); P(G.splash_big(r), s['splash'] + 24, 1.0); P(splat(r, 1.0), s['splash'] + 24, 0.6)
    P(gentle_whoosh(r, 0.4, 0.25), s['stare'], 0.4); P(click(r, 1600), s['stare'] + 19, 0.25); P(blorp(r), s['stare'] + 44, 0.35)
    P(gentle_whoosh(r, 0.3, 0.2), s['soak'], 0.4); P(G.bubbles(0.9, r, 14), s['soak'] + 4, 0.6)
    P(gentle_whoosh(r, 0.3, 0.2), s['bite'], 0.4); P(G.whoosh(0.4, r, peak=0.3, f_lo=400, f_hi=2000), s['bite'] + 4, 0.3)
    P(G.wood_crack(r), s['bite'] + 20, 0.7); P(slap(r), s['bite'] + 20, 0.4)
    for i in range(4): P(tap(r), s['bite'] + 26 + i * 5, 0.35)
    P(scratch(r), s['silence'] - 2, 0.7)                                                                        # record scratch → silence
    for i in range(2): P(click(r, 1500), s['silence'] + 8 + i * 15, 0.5, 0.5)                                   # clock tick
    P(G.crickets(1.1, r, voices=2), s['silence'] + 2, 0.5, -0.2)
    P(gentle_whoosh(r, 0.3, 0.2), s['write'], 0.4)
    P(pen_scratch(r, 1.1), s['write'] + 6, 0.8, 0.2); P(chalk(r, 0.3), s['write'] + 38, 0.4)
    P(G.push_thump(r), s['write'] + 40, 0.5)
    P(gentle_whoosh(r, 0.4, 0.25), s['cantread'], 0.5); P(hmm(r, 0.5), s['cantread'] + 6, 0.35)
    P(G.hammer_hit(r, 0.9), s['cantread'] + 28, 0.6); P(slap(r), s['cantread'] + 28, 0.7); P(G.push_thump(r), s['cantread'] + 28, 0.5)
    P(gentle_whoosh(r, 0.3, 0.2), s['bro'], 0.4); P(click(r, 1800), s['bro'] + 2, 0.3)
    P(gentle_whoosh(r, 0.4, 0.25), s['days'], 0.5); P(bonk(r), s['days'] + 4, 0.45)
    P(gentle_whoosh(r, 0.4, 0.25), s['end'], 0.5)
    for i in range(3): P(blorp(r), s['end'] + 6 + i * 4, 0.25, (i - 1) * 0.4)
    for i in range(4): P(ting(r, [1568, 1760, 1976, 2093][i]), s['end'] + 14 + i * 7, 0.25)
    return buf

if __name__ == "__main__":
    m, s = music()[:, :N], sfx()[:, :N]
    write_wav("music_d9.wav", m); write_wav("sfx_d9.wav", s)
    Mr = gated_rms(m); s *= 0.85 * Mr / gated_rms(s)           # no voice: the music leads, SFX sit just under it but spike on gags
    s = cap_peaks(s, 1.4 * np.abs(m).max())
    mix = m + s; mix *= 0.5 / np.abs(mix).max()
    write_wav("mix_d9.wav", mix); print("stems", m.shape, DUR, "LEN", LEN, S)
