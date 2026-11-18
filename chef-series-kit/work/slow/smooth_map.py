# Smooth the old->new map's slope (gaussian, sigma 4 frames) so pause stretches ease in/out instead of stepping.
# Writes timemap_slow_s.json ([[old_s,new_s]...] every 3 output frames) used by BOTH the story TMAP and audio R().
import json, numpy as np
P = np.array(json.load(open('timemap_slow.json'))); FPS = 30
newlen = P[-1, 1]; NF = int(round(newlen * FPS))
tn = np.arange(NF + 1) / FPS
old = np.interp(tn, P[:, 1], P[:, 0])            # new -> old (exact piecewise)
v = np.diff(old)                                  # story frames advanced per output frame (in sec)
k = np.exp(-0.5 * (np.arange(-12, 13) / 4.0) ** 2); k /= k.sum()
vs = np.convolve(np.pad(v, 12, mode='edge'), k, 'valid')
old_s = np.concatenate([[0], np.cumsum(vs)]); old_s *= old[-1] / old_s[-1]
err = np.abs(old_s - old) * FPS; print('max deviation from exact map: %.2f frames (story time)' % err.max(), ' slope range %.2f..%.2f' % (vs.min() * FPS, vs.max() * FPS))
idx = list(range(0, NF + 1, 3)) + ([NF] if NF % 3 else [])
json.dump([[round(old_s[i], 4), round(tn[i], 4)] for i in idx], open('timemap_slow_s.json', 'w'))
json.dump([[i, round(old_s[i] * FPS, 2)] for i in idx], open('tmap_frames.json', 'w'))
print('NF', NF)
