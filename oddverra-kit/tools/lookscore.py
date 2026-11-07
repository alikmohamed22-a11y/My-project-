#!/usr/bin/env python3
"""lookscore.py - score how close rendered stills are to the reference finish.

Usage:
  python3 lookscore.py <our_stills_dir_or_mp4> [--ref /root/study/refstills]
                       [--out report.md] [--sheet side_by_side.jpg]
                       [--frames 24] [--json metrics.json]

Every image is resized to 540 px wide (the reference resolution), then the top
10 % and bottom 14 % are cropped away (phone UI / captions in the references).
numpy + PIL only.  An .mp4 input is sampled with ffmpeg (--frames evenly
spaced frames).

Distance per metric = (our mean - ref mean) / ref std   (signed z-score).
Overall = RMS of |z| over the scored metrics (0 = indistinguishable on average).

Burned-in captions in the references (always at ~66-71 % of frame height) are
masked out of every image via a fixed band (CAP_Y / CAP_X).

Metrics: luma mean/p5/p95/contrast; saturation; hue entropy over saturated
pixels (palette focus); shadow/highlight colour of darkest/brightest 10 %;
outline density (pixels >0.04 below their 5x5 median and <0.75x it); ink
coverage (share of strong colour edges with a line within 2 px); outline
darkness; depth blur (log10 of top-half median vs centre p75 tile sharpness,
sharpness = sqrt(mean lap^2 / mean |grad|^2) per 16x16 tile); blur area (share
of content tiles with sharpness < 1); texture (mean |Laplacian| in mid-tone,
non-edge pixels); local contrast (mean std of luma in 16x16 tiles).
"""
import argparse, glob, json, os, subprocess, sys, tempfile, time
import numpy as np
from PIL import Image, ImageDraw
from numpy.lib.stride_tricks import sliding_window_view as swv

W = 540
CROP_TOP, CROP_BOT = 0.10, 0.14
# Burned-in captions in the references sit at a fixed spot: rows 0.735-0.805 of
# the cropped image (= 66-71 % of the full frame), horizontally centred.  This
# band is masked out of every image (ours too, so the comparison stays fair).
CAP_Y, CAP_X = (0.735, 0.805), (0.10, 0.90)
TILE = 16

# metric key -> (label, direction hint, scored?)
METRICS = [
    ("luma_mean",      "Brightness: luma mean", True),
    ("luma_p5",        "Brightness: luma p5", True),
    ("luma_p95",       "Brightness: luma p95", True),
    ("contrast",       "Contrast (p95 - p5)", True),
    ("sat_mean",       "Saturation mean", True),
    ("hue_entropy",    "Palette focus: hue entropy, bits (lower = more targeted)", True),
    ("shadow_L",       "Shadow colour: luma of darkest 10 %", True),
    ("shadow_cool",    "Shadow colour: B - R of darkest 10 % (+ = indigo/cool)", True),
    ("hilite_L",       "Highlight colour: luma of brightest 10 %", True),
    ("hilite_warm",    "Highlight colour: R - B of brightest 10 % (+ = warm)", True),
    ("outline_density","Outline density: thin dark-line pixel fraction", True),
    ("ink_coverage",   "Ink coverage: share of colour edges carrying a dark line", True),
    ("outline_dark",   "Outline darkness: 1 - line luma / local median", True),
    ("depth_blur",     "Depth blur: log10 sharpness top-half bg / centre (lower = blurrier bg)", True),
    ("blur_area",      "Blur area: share of content tiles that are soft", True),
    ("texture",        "Texture detail: mean |Laplacian| in flat mid-tones", True),
    ("local_contrast", "Local contrast: mean std of luma in 16x16 tiles", True),
]


# ----------------------------------------------------------------- loading
def load(path):
    # NB: resampling matters for the line metrics; LANCZOS (close to what a
    # video-site downscale does) is used for everything larger than 540 px.
    im = Image.open(path).convert("RGB")
    h = round(im.height * W / im.width)
    im = im.resize((W, h), Image.BILINEAR if im.width < W else Image.LANCZOS)
    a = np.asarray(im, dtype=np.float32) / 255.0
    t, b = int(h * CROP_TOP), int(h * (1 - CROP_BOT))
    return a[t:b]


def frames_from_mp4(mp4, n, tmp):
    dur = float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", mp4]).decode().strip())
    for i in range(n):
        ts = dur * (i + 0.5) / n
        subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{ts:.3f}", "-i", mp4,
                        "-frames:v", "1", "-q:v", "2",
                        os.path.join(tmp, f"t{int(ts*1000):07d}.jpg")], check=True)
    return sorted(glob.glob(os.path.join(tmp, "*.jpg")))


def list_images(d):
    out = []
    for ext in ("jpg", "jpeg", "png", "webp"):
        out += glob.glob(os.path.join(d, f"*.{ext}"))
    return sorted(out)


# ----------------------------------------------------------------- helpers
def luma(a):
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722


def hsv(a):
    mx, mn = a.max(-1), a.min(-1)
    d = mx - mn
    s = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    dd = np.maximum(d, 1e-6)
    h = np.where(mx == r, ((g - b) / dd) % 6,
        np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) / 6.0
    return h, s, mx


def median5(L):
    p = np.pad(L, 2, mode="edge")
    # median of 5x5 window via partition (faster than np.median)
    win = swv(p, (5, 5)).reshape(L.shape[0], L.shape[1], 25)
    return np.partition(win, 12, axis=-1)[..., 12]


def dilate(m, r):
    """binary dilation with a (2r+1)^2 square, separable."""
    h, w = m.shape
    p = np.pad(m, ((0, 0), (r, r)))
    o = np.zeros_like(m)
    for k in range(2 * r + 1):
        o |= p[:, k:k + w]
    p = np.pad(o, ((r, r), (0, 0)))
    o2 = np.zeros_like(m)
    for k in range(2 * r + 1):
        o2 |= p[k:k + h]
    return o2


def laplacian(L):
    p = np.pad(L, 1, mode="edge")
    return p[:-2, 1:-1] + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:] - 4 * L


def tiles(x, t=TILE):
    h, w = (x.shape[0] // t) * t, (x.shape[1] // t) * t
    return x[:h, :w].reshape(h // t, t, w // t, t).swapaxes(1, 2).reshape(h // t, w // t, t * t)


def kmeans(px, k=3, iters=12, seed=0):
    rng = np.random.default_rng(seed)
    c = [px[rng.integers(len(px))]]
    for _ in range(k - 1):  # k-means++ init
        d = np.min(((px[:, None] - np.array(c)[None]) ** 2).sum(-1), 1)
        c.append(px[rng.choice(len(px), p=d / d.sum())])
    c = np.array(c)
    for _ in range(iters):
        lab = ((px[:, None] - c[None]) ** 2).sum(-1).argmin(1)
        for j in range(k):
            if (lab == j).any():
                c[j] = px[lab == j].mean(0)
    cnt = np.bincount(lab, minlength=k)
    o = np.argsort(-cnt)
    return c[o], cnt[o] / cnt.sum()


def hexc(c):
    c = np.clip(np.round(np.asarray(c) * 255), 0, 255).astype(int)
    return "#%02x%02x%02x" % tuple(c)


# ----------------------------------------------------------------- metrics
def caption_mask(shape):
    h, w = shape[:2]
    m = np.zeros((h, w), bool)
    m[int(h * CAP_Y[0]): int(h * CAP_Y[1]), int(w * CAP_X[0]): int(w * CAP_X[1])] = True
    return m


def measure(a):
    m = {}
    L = luma(a)
    V = ~caption_mask(a.shape)
    Lv = L[V]
    p5, p10, p90, p95 = np.percentile(Lv, [5, 10, 90, 95])
    m["luma_mean"], m["luma_p5"], m["luma_p95"] = float(Lv.mean()), float(p5), float(p95)
    m["contrast"] = float(p95 - p5)

    h, s, v = hsv(a)
    m["sat_mean"] = float(s[V].mean())
    sel = (s > 0.25) & (v > 0.15) & V
    if sel.sum() > 50:
        hist = np.bincount((h[sel] * 36).astype(int) % 36, weights=s[sel], minlength=36)
        pr = hist / hist.sum()
        pr = pr[pr > 0]
        m["hue_entropy"] = float(-(pr * np.log2(pr)).sum())
    else:
        m["hue_entropy"] = 0.0

    sh = a[(L <= p10) & V].mean(0)
    hi = a[(L >= p90) & V].mean(0)
    m["shadow_L"] = float(luma(sh)); m["shadow_cool"] = float(sh[2] - sh[0])
    m["hilite_L"] = float(luma(hi)); m["hilite_warm"] = float(hi[0] - hi[2])
    m["_shadow_hex"], m["_hilite_hex"] = hexc(sh), hexc(hi)

    # Thin dark lines: much darker than the 5x5 local median (so only lines up to
    # ~2 px wide at 540 px count; thick blobs and dark areas don't), and dark in
    # relative terms.  Reference ink is often a dark *colour* (brown/indigo plank
    # seams at luma 0.3+), so an absolute luma<0.25 gate misses most of it; we
    # gate on L < 0.75 x local median instead (tuned by eye on r15_2, r11_5, f0620).
    med = median5(L)
    drop = med - L
    lines = (drop > 0.04) & (L < 0.75 * med) & V
    m["outline_density"] = float(lines.sum() / V.sum())
    # darkness = how far below its surroundings a line pixel sits (1 - L/median)
    m["outline_dark"] = float((1 - L[lines] / np.maximum(med[lines], 1e-3)).mean()) if lines.sum() > 20 else 0.0
    m["_lines"] = lines

    # ink coverage: share of strong colour edges that carry a dark line within 2 px
    g = 0
    for c in range(3):
        gy_, gx_ = np.gradient(a[..., c]); g = g + gx_ * gx_ + gy_ * gy_
    E = (np.sqrt(g) > 0.2) & V & ~lines
    near_line = dilate(lines, 2)
    m["ink_coverage"] = float((E & near_line).sum() / max(E.sum(), 1))

    # Depth blur.  Per 16x16 tile: Laplacian energy normalised by gradient energy,
    # sqrt(mean(lap^2)/mean(|grad|^2)) ~ 1/edge-width, so a flat-but-sharp cel
    # area and a busy-but-blurred one aren't confused (raw Laplacian variance
    # mostly measured contrast).  Only tiles with content and clear of captions.
    lap = laplacian(L)
    gy, gx = np.gradient(L)
    g2 = gx * gx + gy * gy
    tok = ~tiles(~V).any(-1)
    ts = tiles(L).std(-1)
    tg = tiles(g2).mean(-1)
    tn = np.sqrt(tiles(lap * lap).mean(-1) / (tg + 1e-9))
    th, tw = tn.shape
    content = (tg > 2e-4) & tok
    bg = np.zeros_like(content); bg[: th // 2] = True
    ce = np.zeros_like(content)
    ce[int(th * .35): int(th * .80), int(tw * .25): int(tw * .75)] = True
    bgv, cev = tn[bg & content], tn[ce & content]
    if bgv.size >= 4 and cev.size >= 4:
        m["depth_blur"] = float(np.log10(np.median(bgv) / np.percentile(cev, 75)))
    else:
        m["depth_blur"] = 0.0
    allv = tn[content]
    m["blur_area"] = float((allv < 1.0).mean()) if allv.size else 0.0

    # texture detail: |lap| in mid-tones away from edges/lines
    gm = np.sqrt(g2)
    edge = gm > 0.04
    near = dilate(edge | lines, 2)
    flat = (~near) & (L > 0.25) & (L < 0.75) & V
    m["texture"] = float(np.abs(lap[flat]).mean()) if flat.sum() > 100 else 0.0

    m["local_contrast"] = float(ts[tok].mean())

    sm = a[::6, ::6][V[::6, ::6]]
    cents, wts = kmeans(sm, 3)
    m["_palette"] = [(hexc(c), float(w)) for c, w in zip(cents, wts)]
    # palette signature for nearest-ref matching: hue(12) x sat(3) x val(3)
    # histogram of chromatic pixels + 4 grey levels, half weight on the greys
    hs, ss, vs = h[::3, ::3][V[::3, ::3]], s[::3, ::3][V[::3, ::3]], v[::3, ::3][V[::3, ::3]]
    chrom = ss > 0.15
    hb = np.minimum((hs * 12).astype(int), 11)
    sb = np.minimum(((ss - 0.15) / 0.85 * 3).astype(int), 2)
    vb = np.minimum((vs * 3).astype(int), 2)
    idx = np.where(chrom, hb * 9 + sb * 3 + vb, 108 + np.minimum((vs * 4).astype(int), 3))
    wgt = np.where(chrom, 1.0, 0.5)
    hh = np.bincount(idx, weights=wgt, minlength=112)
    m["_hist"] = hh / hh.sum()
    return m


VERSION = 4  # bump when a metric changes, to invalidate the reference cache


def _one(p):
    m = measure(load(p)); m["_path"] = p
    m.pop("_lines", None)
    return m


def measure_all(paths, jobs=1, cache=None):
    """Measure images; reference results are cached by (path, mtime, size)."""
    import pickle
    db = {}
    if cache and os.path.exists(cache):
        try:
            db = pickle.load(open(cache, "rb"))
            if db.get("_v") != VERSION:
                db = {}
        except Exception:
            db = {}
    key = lambda p: (p, os.path.getmtime(p), os.path.getsize(p))
    todo = [p for p in paths if key(p) not in db]
    if todo:
        if jobs > 1 and len(todo) > 4:
            from multiprocessing import Pool
            with Pool(jobs) as pool:
                got = pool.map(_one, todo, chunksize=2)
        else:
            got = [_one(p) for p in todo]
        for p, m in zip(todo, got):
            db[key(p)] = m
        if cache:
            db["_v"] = VERSION
            try:
                pickle.dump(db, open(cache, "wb"))
            except OSError:
                pass
    return [db[key(p)] for p in paths]


# ----------------------------------------------------------------- report
def stats(vals):
    v = np.array(vals)
    return dict(mean=v.mean(), std=v.std(ddof=1) if len(v) > 1 else 0.0,
                q1=np.percentile(v, 25), q3=np.percentile(v, 75))


def score(ours, refs):
    rows = []
    for k, label, scored in METRICS:
        o, r = stats([m[k] for m in ours]), stats([m[k] for m in refs])
        z = (o["mean"] - r["mean"]) / max(r["std"], 1e-9)
        inside = sum(r["q1"] <= m[k] <= r["q3"] for m in ours) / len(ours)
        rows.append(dict(key=k, label=label, ours=o["mean"], ref=r["mean"], q1=r["q1"],
                         q3=r["q3"], std=r["std"], z=z, inside=inside, scored=scored))
    zs = [abs(r["z"]) for r in rows if r["scored"]]
    return rows, float(np.sqrt(np.mean(np.square(zs))))


def _pal(m):
    c = np.array([[int(h[i:i + 2], 16) for i in (1, 3, 5)] for h, _ in m["_palette"]]) / 255.0
    w = np.array([w for _, w in m["_palette"]])
    return c, w


def palette_dist(m1, m2):
    """symmetric weighted nearest-colour distance between top-3 k-means palettes,
    blended with the HSV-histogram Hellinger distance."""
    c1, w1 = _pal(m1); c2, w2 = _pal(m2)
    d = np.sqrt(((c1[:, None] - c2[None]) ** 2).sum(-1))
    pd = 0.5 * ((w1 * d.min(1)).sum() + (w2 * d.min(0)).sum())
    hel = np.sqrt(((np.sqrt(m1["_hist"]) - np.sqrt(m2["_hist"])) ** 2).sum() / 2)
    return float(pd + 0.5 * hel)


def nearest(ours, refs):
    out = []
    for m in ours:
        d = np.array([palette_dist(m, r) for r in refs])
        j = int(d.argmin()); out.append((refs[j], float(d[j])))
    return out


def fmt(x):
    return f"{x:.4f}" if abs(x) < 0.1 else f"{x:.3f}"


def write_report(path, src, refdir, ours, refs, rows, overall, pairs, sheet, secs):
    L = [f"# Look score report\n",
         f"- Ours: `{src}` ({len(ours)} images)",
         f"- Reference: `{refdir}` ({len(refs)} images)",
         f"- Crop: top {CROP_TOP:.0%} / bottom {CROP_BOT:.0%}, all images at {W} px wide",
         f"- Run time: {secs:.1f} s\n",
         f"## Overall distance: **{overall:.2f}** ref std (RMS of |z|; 0 = matches reference mean)\n",
         "| Metric | Ours mean | Ref mean | Ref IQR | z (ref std) | Ours in IQR |",
         "|---|---|---|---|---|---|"]
    for r in rows:
        flag = " ⚠" if abs(r["z"]) >= 1 else ""
        L.append(f"| {r['label']} | {fmt(r['ours'])} | {fmt(r['ref'])} | {fmt(r['q1'])} – {fmt(r['q3'])} "
                 f"| {r['z']:+.2f}{flag} | {r['inside']:.0%} |")
    L.append("\n## Biggest gaps (by |z|)\n")
    for i, r in enumerate(sorted(rows, key=lambda r: -abs(r["z"]))[:5], 1):
        d = "higher" if r["z"] > 0 else "lower"
        L.append(f"{i}. **{r['label']}**: ours {fmt(r['ours'])} vs ref {fmt(r['ref'])} "
                 f"({r['z']:+.2f} std, ours is {d})")

    def pal(ms):
        sh = np.mean([[int(m["_shadow_hex"][i:i+2], 16) for i in (1, 3, 5)] for m in ms], 0) / 255
        hi = np.mean([[int(m["_hilite_hex"][i:i+2], 16) for i in (1, 3, 5)] for m in ms], 0) / 255
        return hexc(sh), hexc(hi)
    osh, ohi = pal(ours); rsh, rhi = pal(refs)
    L += ["\n## Shadow / highlight colour (mean)\n",
          "| | Shadow (darkest 10 %) | Highlight (brightest 10 %) |", "|---|---|---|",
          f"| Ours | {osh} | {ohi} |", f"| Reference | {rsh} | {rhi} |"]
    L += ["\n## Per-image (ours)\n",
          "| Image | luma | contrast | sat | hue ent | outlines | ink cov | depth blur | blur area | texture | top-3 palette | shadow | highlight | nearest ref (palette dist) |",
          "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
    for m, (r, d) in zip(ours, pairs):
        p = " ".join(c for c, _ in m["_palette"])
        L.append(f"| {os.path.basename(m['_path'])} | {m['luma_mean']:.3f} | {m['contrast']:.3f} | "
                 f"{m['sat_mean']:.3f} | {m['hue_entropy']:.2f} | {m['outline_density']:.4f} | {m['ink_coverage']:.2f} | "
                 f"{m['depth_blur']:+.2f} | {m['blur_area']:.2f} | {m['texture']:.4f} | {p} | {m['_shadow_hex']} | "
                 f"{m['_hilite_hex']} | {os.path.basename(r['_path'])} ({d:.2f}) |")
    if sheet:
        L.append(f"\nSide-by-side sheet: `{sheet}`")
    L.append("\nDistance z = (ours mean − ref mean) / ref std. |z| ≥ 1 is flagged ⚠.")
    with open(path, "w") as f:
        f.write("\n".join(L) + "\n")


def make_sheet(path, ours, pairs, tw=200):
    th = int(tw * (1 - CROP_TOP - CROP_BOT) * 16 / 9)
    cols = 3  # pairs per row
    rows = (len(ours) + cols - 1) // cols
    lab = 16
    pw = tw * 2 + 8
    sheet = Image.new("RGB", (cols * pw + (cols - 1) * 16, rows * (th + lab + 8)), (24, 22, 30))
    dr = ImageDraw.Draw(sheet)
    for i, (m, (r, d)) in enumerate(zip(ours, pairs)):
        x, y = (i % cols) * (pw + 16), (i // cols) * (th + lab + 8)
        for j, mm in enumerate((m, r)):
            a = load(mm["_path"])
            im = Image.fromarray((a * 255).astype(np.uint8)).resize((tw, th), Image.LANCZOS)
            sheet.paste(im, (x + j * (tw + 8), y + lab))
        dr.text((x + 2, y + 2), f"ours {os.path.basename(m['_path'])}", fill=(240, 240, 240))
        dr.text((x + tw + 10, y + 2), f"ref {os.path.basename(r['_path'])} d={d:.2f}", fill=(200, 200, 255))
    sheet.save(path, quality=88)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src")
    ap.add_argument("--ref", default="/root/study/refstills")
    ap.add_argument("--out", default="report.md")
    ap.add_argument("--sheet", default=None)
    ap.add_argument("--frames", type=int, default=24, help="frames sampled from an mp4")
    ap.add_argument("--json", default=None, help="also dump per-image metrics as JSON")
    ap.add_argument("--jobs", type=int, default=2, help="worker processes (CPU is shared; default 2)")
    ap.add_argument("--no-cache", action="store_true", help="re-measure the references")
    a = ap.parse_args()
    t0 = time.time()
    tmp = None
    if a.src.lower().endswith((".mp4", ".mov", ".webm", ".mkv")):
        tmp = tempfile.mkdtemp(prefix="lookscore_")
        paths = frames_from_mp4(a.src, a.frames, tmp)
    elif os.path.isdir(a.src):
        paths = list_images(a.src)
    else:
        paths = [a.src]
    refp = list_images(a.ref)
    if not paths or not refp:
        sys.exit("no images found")
    cache = None if a.no_cache else os.path.join(os.path.dirname(os.path.abspath(__file__)), ".refcache.pkl")
    ours = measure_all(paths, a.jobs)
    refs = measure_all(refp, a.jobs, cache)
    rows, overall = score(ours, refs)
    pairs = nearest(ours, refs)
    if a.sheet:
        make_sheet(a.sheet, ours, pairs)
    secs = time.time() - t0
    write_report(a.out, a.src, a.ref, ours, refs, rows, overall, pairs, a.sheet, secs)
    if a.json:
        clean = lambda m: {k: v for k, v in m.items() if not k.startswith("_") or k in ("_path", "_palette", "_shadow_hex", "_hilite_hex")}
        json.dump({"ours": [clean(m) for m in ours], "ref": [clean(m) for m in refs]}, open(a.json, "w"), indent=1)
    print(f"overall distance {overall:.2f}  ({len(ours)} ours vs {len(refs)} ref, {secs:.1f} s)")
    for r in sorted(rows, key=lambda r: -abs(r["z"])):
        print(f"  {r['z']:+6.2f}  {r['key']:<16} ours {fmt(r['ours'])}  ref {fmt(r['ref'])}  IQR {fmt(r['q1'])}-{fmt(r['q3'])}")
    print(f"report: {a.out}" + (f"  sheet: {a.sheet}" if a.sheet else ""))


if __name__ == "__main__":
    main()
