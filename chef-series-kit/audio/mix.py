# Level lock: music gated RMS = 50 % (-6 dB) of the voice's, SFX <= 50 % with peaks capped at 0.7 x voice peak.
# No ducking or compression: each stem gets one linear gain (SFX also a peak cap), then they are summed.
import sys, numpy as np
from dsp import read_wav, write_wav, SR

def gated_rms(x, win=0.4, gate_db=-30):
    m = x.mean(0); n = int(win * SR); k = len(m) // n
    r = np.sqrt((m[:k * n].reshape(k, n) ** 2).mean(1) + 1e-20)
    keep = r > r.max() * 10 ** (gate_db / 20)
    return np.sqrt((r[keep] ** 2).mean())

def cap_peaks(x, ceil, look=0.005, rel=0.08):
    a = np.abs(x).max(0); g = np.minimum(1, ceil / np.maximum(a, 1e-9))
    L = int(look * SR)
    g = np.minimum.accumulate(np.lib.stride_tricks.sliding_window_view(np.pad(g, (0, L), constant_values=1), L + 1).min(1)[None], axis=0)[0]
    out = np.empty_like(g); c = 1.0; k = np.exp(-1 / (rel * SR))
    for i in range(len(g)):
        c = g[i] if g[i] < c else c * k + g[i] * (1 - k)
        out[i] = c
    return x * out

if __name__ == "__main__":
    v, _ = read_wav(sys.argv[1]); mu, _ = read_wav(sys.argv[2]); fx, _ = read_wav(sys.argv[3])
    n = v.shape[1]; mu = mu[:, :n]; fx = fx[:, :n]
    V = gated_rms(v); Vp = np.abs(v).max()
    mu *= 0.5 * V / gated_rms(mu)
    fx *= 0.5 * V / gated_rms(fx)
    fx = cap_peaks(fx, 0.7 * Vp)
    if gated_rms(fx) > 0.5 * V: fx *= 0.5 * V / gated_rms(fx)
    db = lambda a, b: 20 * np.log10(a / b)
    print(f"voice gated RMS {20*np.log10(V):.1f} dBFS, peak {20*np.log10(Vp):.1f} dBFS")
    print(f"music vs voice: {db(gated_rms(mu), V):+.1f} dB   sfx vs voice: {db(gated_rms(fx), V):+.1f} dB   sfx peak/voice peak: {np.abs(fx).max()/Vp:.2f}")
    write_wav("mix.wav", v + mu + fx)
