# Stems for "Ketchup was sold as medicine": jaunty 1830s medicine-show polka (G major: tuba oom-pah, banjo-ish plucks, fife tune),
# stop on "one problem", comic tuba slide on laxatives, triumphant tomato fanfare, glock button.
import numpy as np
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, fades, write_wav, modal, colored
import instruments as I
import sfx_gen as G
from audio import ting, gentle_whoosh, paper, chalk, bonk, kick, boom
DUR = 68.0; N = ns(DUR); m2f = I.m2f
B = 60.0 / 132.0
STOPS = [(46.8, 48.1), (55.4, 56.9)]
def silent(t): return any(a <= t < b for a, b in STOPS)
def music():
    buf = np.zeros((2, N)); r = rng(11)
    prog = [[67, 71, 74], [62, 66, 69], [67, 71, 74], [60, 64, 67], [67, 71, 74], [62, 66, 69], [60, 64, 67], [62, 66, 69]]
    bass = [43, 38, 43, 36, 43, 38, 36, 38]
    tune = [79, 78, 79, 83, 81, 79, 76, 74, 76, 79, 78, 74, 76, 78, 79, 79]
    t, k = 0.1, 0
    while t < 66.2:
        bar = (k // 2) % 8
        dark = 4.8 < t < 8.4 or 48.1 < t < 52.0     # "didn't trust tomatoes" / "when people checked": minor-ish, sparse
        if not silent(t):
            if k % 2 == 0: place(buf, pan(I.brass(m2f(bass[bar] - (1 if dark and bar % 2 else 0)), B * 0.7, 0.45, r, kind='tuba'), 0), t)
            else:
                ch = [n - (1 if dark and n % 12 == 11 else 0) for n in prog[bar]]
                for n in ch: place(buf, pan(I.pluck(m2f(n), 0.16, r, dur=0.22, bright=0.8, pos=0.1), 0.25), t)
            if not dark and k % 4 == 1: place(buf, pan(I.snare(0.12, r, tune=1.2, snappy=0.6), -0.1), t)
            if not dark and t > 9.5 and (k // 16) % 2 == 1:
                place(buf, pan(I.fife(m2f(tune[k % 16]), B * 0.9, 0.18, r), -0.2), t)
        t += B; k += 1
    for j, n in enumerate([43, 42, 41, 38]): place(buf, pan(I.brass(m2f(n), 0.35 if j < 3 else 0.8, 0.4, r, kind='tuba', fall=(-3 if j == 3 else 0)), 0), 6.8 + j * 0.3)    # bad for you
    for i, n in enumerate([67, 71, 74, 79]): place(buf, pan(I.brass(m2f(n), 0.3, 0.4, r, kind='stab'), 0), 28.1 + i * 0.16)                          # Dr Miles' compound
    place(buf, pan(I.brass(m2f(55), 0.5, 0.5, r, kind='stab', fall=-2), 0), 32.9)                                                                    # rival
    for i, n in enumerate([79, 83, 86, 83, 79, 81, 83, 79]): place(buf, pan(I.glock(m2f(n + 12), 0.22, r, dur=0.6), 0.2), 40.8 + i * 0.19)           # jingle
    place(buf, I.pad([m2f(x) for x in [55, 58, 62, 65]], 3.6, 0.14, r, att=0.6, rel=1.0, warm=700), 48.2)                                          # checking
    place(buf, pan(I.brass(m2f(50), 1.6, 0.5, r, kind='tuba', fall=-12), 0), 52.7)                                                                  # laxatives slide
    for i, n in enumerate([74, 72, 69, 66, 62]): place(buf, pan(I.fife(m2f(n), 0.18, 0.16, r), 0), 55.5 + i * 0.18)                                 # fizzled
    for i, n in enumerate([67, 71, 74, 79]): place(buf, pan(I.brass(m2f(n), 0.5 if i < 3 else 1.2, 0.45, r, kind='stab'), 0), 57.6 + i * 0.13)     # tomato won
    place(buf, I.timpani(m2f(43), 0.6, r), 57.6); place(buf, I.cymbal(0.25, r, dur=2.0), 57.9)
    place(buf, I.pad([m2f(x) for x in [55, 62, 67, 71]], 1.8, 0.16, r, att=0.05, rel=1.2, warm=1300), 66.2)
    for i, n in enumerate([67, 71, 74, 79, 83]): place(buf, pan(I.glock(m2f(n + 12), 0.26, r, dur=1.6), 0.1), 66.2 + i * 0.1)
    return buf
def sfx():
    buf = np.zeros((2, N)); r = rng(29)
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float); place(buf, (pan(x, p) if x.ndim == 1 else x) * g, t)
    P(G.clink(r, f0=1800, dur=0.15), 1.7, 0.35); P(ting(r, 2637), 2.75, 0.3)                    # ketchup bottle / medicine
    P(gentle_whoosh(r), 3.6, 0.3)
    P(G.creak(0.6, r), 5.9, 0.25)                                                                # suspicious
    P(gentle_whoosh(r), 8.5, 0.3)
    P(ting(r, 3136), 13.1, 0.3)                                                                  # the opposite
    P(bonk(r), 15.5, 0.25); P(bonk(r), 16.3, 0.2)                                                # diarrhea / indigestion
    P(G.push_thump(r), 17.3, 0.4)                                                                # cholera
    P(G.clink(r, f0=900, dur=0.1), 18.4, 0.3); P(G.clink(r, f0=1100, dur=0.1), 19.5, 0.3)       # raw / cooked
    P(G.bubbles(0.5, r, 30), 20.8, 0.35)                                                         # ketchup squirt
    P(G.hurrah(r, 220, 1.0), 22.8, 0.25)                                                         # tomato crazy
    P(gentle_whoosh(r), 23.8, 0.3)
    P(modal(0.6, [(2400, 1.0, 0.25), (3600, 0.5, 0.2)], r) * 0.4, 26.2, 0.35)                    # cash ding
    P(G.rattle(0.5, r, 40), 27.9, 0.3)                                                           # pill bottle
    P(G.rattle(0.5, r, 40), 34.4, 0.3)                                                           # rival pills
    P(paper(r), 35.4, 0.4); P(paper(r), 36.0, 0.3)                                               # newspapers
    P(G.hammer_hit(r, 0.6), 43.4, 0.35); P(G.hammer_hit(r, 0.6), 43.8, 0.3)                      # signs
    P(G.babble(2.0, r, 180, 1.0), 44.6, 0.2)                                                     # hundreds of thousands
    P(G.push_thump(r), 47.9, 0.5)                                                                # one problem
    P(bonk(r), 51.4, 0.35)                                                                       # no tomato
    P(G.oof(r, 'oof'), 54.1, 0.25)                                                               # laxatives reaction
    P(G.whoosh(1.0, r, peak=0.6, f_lo=1500, f_hi=400), 55.6, 0.3)                               # fizzled
    P(G.applause(2.0, r, people=30), 58.0, 0.15)                                                 # tomato won
    P(G.bubbles(0.6, r, 30), 63.4, 0.4)                                                          # squeeze
    P(ting(r, 2637), 66.3, 0.3)
    return buf
if __name__ == "__main__":
    m, s = music(), sfx(); write_wav("music.wav", m[:, :N]); write_wav("sfx.wav", s[:, :N]); print("stems", m.shape)
