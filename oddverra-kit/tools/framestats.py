# Per-frame (30 fps) analysis of a video: light, contrast, colour of shadows/highlights, motion, cuts.
import sys, subprocess, numpy as np, json
src, out = sys.argv[1], sys.argv[2]
W, H = 108, 192
cmd = ['ffmpeg', '-v', 'error', '-i', src, '-vf', f'fps=30,scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
raw = subprocess.run(cmd, capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32) / 255
F = F[:, int(H * 0.11):int(H * 0.86)]          # drop phone UI / caption zone
Y = F @ np.array([0.2126, 0.7152, 0.0722], np.float32)
mx, mn = F.max(-1), F.min(-1); S = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-4), 0)
rows = []
prev = None
for i in range(len(F)):
    y = Y[i]; f = F[i]; flat = y.ravel()
    lo, hi = np.percentile(flat, 5), np.percentile(flat, 95)
    dm, bm = flat <= np.percentile(flat, 10), flat >= np.percentile(flat, 90)
    sh = f.reshape(-1, 3)[dm].mean(0); hl = f.reshape(-1, 3)[bm].mean(0)
    d = float(np.abs(y - prev).mean()) if prev is not None else 0.0
    # global shift via phase correlation (camera pan proxy)
    dx = dy = 0.0
    if prev is not None:
        A = np.fft.fft2(prev - prev.mean()); B = np.fft.fft2(y - y.mean()); Rr = A * np.conj(B); Rr /= np.abs(Rr) + 1e-6
        c = np.abs(np.fft.ifft2(Rr)); py, px = np.unravel_index(c.argmax(), c.shape)
        dy = py if py < c.shape[0] / 2 else py - c.shape[0]; dx = px if px < c.shape[1] / 2 else px - c.shape[1]
    rows.append([float(flat.mean()), float(lo), float(hi), float(S[i].mean()), *map(float, sh), *map(float, hl), d, float(dx), float(dy)])
    prev = y
np.save(out, np.array(rows, np.float32)); print(src, len(rows))
