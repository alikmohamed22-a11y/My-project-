#!/usr/bin/env python3
"""Pro edit: the stuff that makes a clip feel edited, not just cropped.

  * cold open: the loudest moment plays first ("wait for it"), then it rewinds
  * punch-in zooms + camera shake + white flash on every loud reaction
  * synthesized SFX: whoosh on the rewind, bass boom on the big moment
  * animated captions: words pop in, hype words turn green and bigger
  * animated hook card, streamer name tag, divider, progress bar, color pop

  python fx.py clips.json --src-dir src --words-dir tr -o final
(clips.json entries are the same as clipper.py's, plus optional "streamer")
"""
import argparse
import glob
import json
import os
import subprocess
import sys
import wave

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import clipper  # noqa: E402
from clipper import W, H, FONT_DIR, FONT_NAME, ass_time, ass_escape  # noqa: E402

FPS = 30
SR = 48000
SPLIT_TOP = 640
HYPE_WORDS = {"no", "what", "bro", "yo", "oh", "god", "stop", "wait", "never", "why",
              "help", "run", "go", "dead", "crazy", "insane", "fire", "chat", "yes",
              "nah", "wow", "damn", "hell", "boom", "please", "okay"}


# ------------------------------------------------------------ analysis
def loudness(video, start, dur, hop=0.05):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(start), "-i", video,
                          "-t", str(dur), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    a = np.frombuffer(raw, dtype=np.float32)
    n = int(16000 * hop)
    frames = a[: len(a) // n * n].reshape(-1, n)
    rms = np.sqrt((frames ** 2).mean(axis=1) + 1e-12)
    k = np.ones(4) / 4
    return np.convolve(rms, k, mode="same"), hop


def find_peaks(rms, hop, min_gap=3.5, max_peaks=None):
    """Loud moments: local maxima well above the clip's typical level."""
    thr = max(np.median(rms) * 2.2, np.percentile(rms, 90))
    cand = [i for i in range(1, len(rms) - 1)
            if rms[i] >= thr and rms[i] >= rms[i - 1] and rms[i] >= rms[i + 1]]
    cand.sort(key=lambda i: -rms[i])
    dur = len(rms) * hop
    max_peaks = max_peaks or max(1, int(dur / 6))
    out = []
    for i in cand:
        t = i * hop
        if all(abs(t - o) >= min_gap for o in out):
            out.append(t)
        if len(out) >= max_peaks:
            break
    return sorted(out), (cand[0] * hop if cand else dur / 2)


# ----------------------------------------------------------- jump cuts
def keep_intervals(words, peaks, dur, pad_in=0.35, pad_out=0.55, min_gap=1.0):
    """Keep speech and loud moments, drop the dead air in between."""
    iv = [(max(0, w["s"] - pad_in), min(dur, w["e"] + pad_out)) for w in words]
    iv += [(max(0, p - 1.3), min(dur, p + 1.1)) for p in peaks]
    iv.append((0, min(dur, 1.0)))
    iv.sort()
    out = []
    for a, b in iv:
        if out and a - out[-1][1] < min_gap:
            out[-1][1] = max(out[-1][1], b)
        else:
            out.append([a, b])
    return out


def remap(t, iv):
    """Original time -> time after jump cuts (None if cut out)."""
    acc = 0.0
    for a, b in iv:
        if a <= t <= b:
            return acc + t - a
        acc += b - a
    return None


# ---------------------------------------------------------------- sfx
def synth_boom(sr=SR):
    t = np.arange(int(sr * 1.4)) / sr
    f = 38 + 70 * np.exp(-t * 9)                     # pitch drop
    ph = 2 * np.pi * np.cumsum(f) / sr
    body = np.sin(ph) + 0.35 * np.sin(2 * ph)
    env = np.exp(-t * 3.2) * (1 - np.exp(-t * 400))
    click = np.random.default_rng(1).normal(0, 1, len(t)) * np.exp(-t * 90) * 0.5
    return np.tanh(2.2 * (body * env + click)) * 0.9


def synth_whoosh(sr=SR, dur=0.55, reverse=False):
    n = int(sr * dur)
    noise = np.random.default_rng(2).normal(0, 1, n)
    spec = np.fft.rfft(noise)
    freqs = np.fft.rfftfreq(n, 1 / sr)
    spec *= np.exp(-((np.log(freqs + 1) - np.log(1800)) ** 2) / 0.9)
    x = np.fft.irfft(spec, n)
    x /= np.abs(x).max() + 1e-9
    t = np.linspace(0, 1, n)
    env = np.sin(np.pi * t ** (0.6 if not reverse else 1.6)) ** 2
    return x * env * 0.8


def synth_riser(sr=SR, dur=1.2):
    t = np.arange(int(sr * dur)) / sr
    f = 200 + 900 * (t / dur) ** 2
    ph = 2 * np.pi * np.cumsum(f) / sr
    noise = np.random.default_rng(3).normal(0, 0.3, len(t))
    return (np.sin(ph) * 0.4 + noise * 0.3) * (t / dur) ** 2 * 0.6


def write_sfx(path, total, events):
    mix = np.zeros(int(SR * (total + 2)))
    for t, snd, vol in events:
        i = int(max(t, 0) * SR)
        seg = snd[: len(mix) - i] * vol
        mix[i:i + len(seg)] += seg
    mix = np.clip(mix[: int(SR * total)], -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())


# ------------------------------------------------------------- zoom expr
def pulse(t0, amp, attack=0.06, hold=0.5, release=0.35):
    x = f"(it-{t0:.3f})"
    return (f"{amp}*if(between({x},0,{attack}),{x}/{attack},"
            f"if(between({x},{attack},{attack + hold}),1,"
            f"if(between({x},{attack + hold},{attack + hold + release}),"
            f"1-({x}-{attack + hold})/{release},0)))")


def zoom_expr(peaks, base=1.0, amp=0.18):
    return "+".join([str(base)] + [pulse(t, amp) for t in peaks]) if peaks else str(base)


def shake_expr(peaks, px=14):
    if not peaks:
        return "0"
    return "+".join(f"{px}*sin(it*83)*between(it-{t:.3f},0,0.35)" for t in peaks)


def zp(label_in, label_out, w, h, z, sx="0", sy="0"):
    """Supersampled zoompan: smooth punch-ins centered, with shake offsets."""
    return (f"[{label_in}]scale={w * 2}:{h * 2},setpts=PTS-STARTPTS,"
            f"zoompan=z='{z}':d=1:s={w}x{h}:fps={FPS}:"
            f"x='iw/2-iw/zoom/2+({sx})':y='ih/2-ih/zoom/2+({sy})'[{label_out}]")


def compose(inp, out, c, sw, sh, z, sx, sy, tag):
    """Layout + zoom for one input segment. Returns filter text."""
    trim = int(c.get("trim_bottom", 0)) // 2 * 2
    sh2 = sh - trim
    layout = c.get("layout", "blur")
    pre = f"[{inp}]crop={sw}:{sh2}:0:0,fps={FPS},eq=saturation=1.18:contrast=1.06[{tag}s];"
    if layout == "split":
        x, y, w, h = c["cam"]
        bot = H - SPLIT_TOP
        gw = int(sh2 * W / bot) // 2 * 2
        cx = c.get("crop_x", 0.5)
        return (pre + f"[{tag}s]split[{tag}a][{tag}b];"
                f"[{tag}a]crop={w}:{h}:{x}:{y},scale={W}:{SPLIT_TOP}:"
                f"force_original_aspect_ratio=increase,crop={W}:{SPLIT_TOP},"
                f"unsharp=5:5:0.9[{tag}ca];"
                + zp(f"{tag}ca", f"{tag}top", W, SPLIT_TOP, z, sx, sy) + ";"
                f"[{tag}b]crop={gw}:{sh2}:({sw}-{gw})*{cx}:0,scale={W}:{bot}[{tag}gb];"
                + zp(f"{tag}gb", f"{tag}bot", W, bot,
                     z.replace("0.18*", "0.07*").replace("1.22", "1.08")) + ";"
                f"[{tag}top][{tag}bot]vstack,"
                f"drawbox=x=0:y={SPLIT_TOP - 5}:w={W}:h=10:c=white:t=fill,setsar=1[{out}]")
    if layout == "crop" or sw / sh2 <= W / H + 0.01:
        cx = c.get("crop_x", 0.5)
        return (pre + f"[{tag}s]scale={W}:{H}:force_original_aspect_ratio=increase,"
                f"crop={W}:{H}:(iw-{W})*{cx}:(ih-{H})/2[{tag}f];"
                + zp(f"{tag}f", f"{tag}z", W, H, z, sx, sy) + f";[{tag}z]setsar=1[{out}]")
    fg_h = int(W * sh2 / sw) // 2 * 2
    return (pre + f"[{tag}s]split[{tag}a][{tag}b];"
            f"[{tag}a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
            f"boxblur=30:3,eq=brightness=-0.15[{tag}bg];"
            f"[{tag}b]scale={W}:{fg_h}[{tag}fg0];"
            + zp(f"{tag}fg0", f"{tag}fg", W, fg_h, z, sx, sy) + ";"
            f"[{tag}bg][{tag}fg]overlay=0:(H-h)/2,setsar=1[{out}]")


# ------------------------------------------------------------- captions
def build_ass(events_words, hook, hook_end, cap_y, hook_y, streamer, tag_y, teaser_len):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{FONT_NAME},108,&H00FFFFFF,&H00FFFFFF,&H00000000,&HA0000000,0,0,0,0,100,100,1,0,1,9,6,5,50,50,0,1
Style: Hook,{FONT_NAME},70,&H00000000,&H00000000,&H00FFFFFF,&H00FFFFFF,0,0,0,0,100,100,0,0,3,22,0,5,70,70,0,1
Style: HookRed,{FONT_NAME},70,&H00FFFFFF,&H00FFFFFF,&H003030E8,&H003030E8,0,0,0,0,100,100,0,0,3,22,0,5,70,70,0,1
Style: Tag,{FONT_NAME},40,&H00FFFFFF,&H00FFFFFF,&H00FF4691,&H00FF4691,0,0,0,0,100,100,2,0,3,12,0,4,0,0,0,1
Style: Wait,{FONT_NAME},84,&H0000E5FF,&H0000E5FF,&H00000000,&H90000000,0,0,0,0,100,100,2,0,1,8,5,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    chunks = clipper.chunk_words(events_words, max_words=2, max_gap=0.35)
    colors = ["&H00E5FF&", "&H5BFF3D&", "&HFFD43B&"]  # yellow, green, cyan (BGR)
    for ci, ch in enumerate(chunks):
        nxt = chunks[ci + 1][0]["s"] if ci + 1 < len(chunks) else ch[-1]["e"] + 0.5
        chunk_end = min(nxt, ch[-1]["e"] + 0.5)
        tilt = (-2, 0, 2)[ci % 3]
        for wi, w in enumerate(ch):
            t0 = w["s"]
            t1 = ch[wi + 1]["s"] if wi + 1 < len(ch) else chunk_end
            if t1 <= t0:
                continue
            parts = []
            for k, x in enumerate(ch):
                raw = x["w"].strip(".,!?\"'").lower()
                txt = ass_escape(x["w"].upper().rstrip(",."))
                hype = raw in HYPE_WORDS or x["w"].endswith("!")
                if k == wi:
                    col = colors[1] if hype else colors[0]
                    sc = 125 if hype else 112
                    parts.append(f"{{\\c{col}\\fscx{sc}\\fscy{sc}}}{txt}"
                                 r"{\c&HFFFFFF&\fscx100\fscy100}")
                else:
                    parts.append(txt)
            anim = (r"{\fscx60\fscy60\t(0,70,\fscx112\fscy112)\t(70,140,\fscx100\fscy100)}"
                    if wi == 0 else "")
            ev.append(f"Dialogue: 0,{ass_time(t0)},{ass_time(t1)},Cap,,0,0,0,,"
                      f"{{\\pos({W // 2},{cap_y})\\frz{tilt}}}{anim}{' '.join(parts)}")
    if hook:
        pop = r"\fscx40\fscy40\t(0,120,\fscx108\fscy108)\t(120,200,\fscx100\fscy100)"
        wob = r"\t(1200,1350,\frz-2)\t(1350,1500,\frz0)"
        ev.append(f"Dialogue: 2,{ass_time(0)},{ass_time(hook_end)},Hook,,0,0,0,,"
                  f"{{\\pos({W // 2},{hook_y}){pop}{wob}\\fad(0,200)}}"
                  f"{ass_escape(hook.upper())}")
    if teaser_len:
        ev.append(f"Dialogue: 3,{ass_time(0.1)},{ass_time(teaser_len)},Wait,,0,0,0,,"
                  f"{{\\pos({W // 2},{H - 260})\\fscx70\\fscy70\\t(0,150,\\fscx100\\fscy100)"
                  f"\\t(400,700,\\fscx106\\fscy106)}}WAIT FOR IT...")
    if streamer:
        ev.append(f"Dialogue: 2,{ass_time(0)},{ass_time(9999)},Tag,,0,0,0,,"
                  f"{{\\pos(28,{tag_y})}}{ass_escape(streamer.upper())}")
    return head + "\n".join(ev) + "\n"


# --------------------------------------------------------------- render
def pro_render(video, words, c, base, preset="medium"):
    sw, sh, dur = clipper.probe(video)
    start, end = c["start"], min(c["end"], dur)
    rms, hop = loudness(video, start, end - start)
    peaks, top = find_peaks(rms, hop)
    top_orig = top
    teaser = c.get("teaser", True) and end - start > 12
    T = 0.0
    if teaser:
        ts, te = max(start, start + top - 1.4), min(end, start + top + 0.9)
        T = te - ts
    rel = [dict(w, s=w["s"] - start, e=w["e"] - start)
           for w in words if w["e"] > start and w["s"] < end]
    if c.get("jumpcut", True):
        iv = keep_intervals(rel, peaks, end - start)
    else:
        iv = [[0, end - start]]
    body_len = sum(b - a for a, b in iv)
    total = T + body_len
    cut_peaks = [remap(p, iv) for p in peaks]
    top_cut = remap(top, iv)
    peaks = [p for p in cut_peaks if p is not None]

    def place(t0, t1, shift):
        return [dict(w, s=w["s"] - t0 + shift, e=w["e"] - t0 + shift)
                for w in words if w["e"] > t0 and w["s"] < t1]
    body_ws = []
    for w in rel:
        s0, e0 = remap(w["s"], iv), remap(w["e"], iv)
        if s0 is not None and e0 is not None:
            body_ws.append(dict(w, s=s0 + T, e=e0 + T))
    ws = (place(ts, te, 0) if teaser else []) + body_ws
    if c.get("censor", True):
        ws = [dict(w, w=clipper.censor_word(w["w"])) for w in ws]

    layout = c.get("layout", "blur")
    trim = int(c.get("trim_bottom", 0))
    if layout == "split":
        cap_y, hook_y, tag_y = SPLIT_TOP + 250, SPLIT_TOP, 60
    elif layout == "crop" or sw / (sh - trim) <= W / H + 0.01:
        cap_y, hook_y, tag_y = 1330, 300, 420
    else:
        fg_h = W * (sh - trim) / sw
        cap_y = int(H / 2 + fg_h / 2 + 190)
        hook_y = int(H / 2 - fg_h / 2 - 190)
        tag_y = int(H / 2 + fg_h / 2 - 50)
    ass_path = base + ".ass"
    with open(ass_path, "w") as f:
        f.write(build_ass(ws, c.get("hook"), T + 3.2, cap_y, hook_y,
                          c.get("streamer"), tag_y, T))

    body_peaks = peaks
    top = top_cut if top_cut is not None else (peaks[0] if peaks else 0)
    # alternate a slight zoom on every jump cut so the cuts feel intentional
    acc, alt = 0.0, []
    for i, (a, b) in enumerate(iv):
        if i % 2:
            alt.append(f"0.07*between(it,{acc:.3f},{acc + b - a:.3f})")
        acc += b - a
    zb = "+".join([zoom_expr(body_peaks)] + alt)
    sb = shake_expr([top] if top in body_peaks else [])
    sel = "+".join(f"between(t,{a:.3f},{b:.3f})" for a, b in iv)
    cut_v = f"select='{sel}',setpts=N/FRAME_RATE/TB"
    cut_a = f"aselect='{sel}',asetpts=N/SR/TB"
    vf = (f"[0:v]fps={FPS},{cut_v}[bv];[0:a]{cut_a}[ba];" +
          compose("bv", "body", c, sw, sh, zb, sb, sb.replace("83", "61"), "B"))
    inputs = ["-ss", str(start), "-to", str(end), "-i", video]
    sfx_events = []
    boom, whoosh = synth_boom(), synth_whoosh()
    for p in body_peaks:
        sfx_events.append((T + p, boom if p == top else whoosh, 0.55 if p == top else 0.25))
    if teaser:
        inputs = ["-ss", str(ts), "-to", str(te), "-i", video] + inputs
        tz = f"1.22+{pulse(top_orig - (ts - start), 0.12)}"
        vf = (compose("0:v", "tease", c, sw, sh, tz, shake_expr([top_orig - (ts - start)]),
                      "0", "T") + ";" +
              f"[1:v]fps={FPS},{cut_v}[bv];[1:a]{cut_a}[ba];" +
              compose("bv", "body", c, sw, sh, zb, sb, sb.replace("83", "61"), "B"))
        vf += ";[tease][0:a][body][ba]concat=n=2:v=1:a=1[cv][ca]"
        sfx_events += [(top_orig - (ts - start), boom, 0.45),
                       (max(T - 0.3, 0), synth_whoosh(reverse=True), 0.6)]
        audio_in = "[ca]"
        sfx_idx = 2
    else:
        vf += ";[body]null[cv]"
        audio_in = "[ba]"
        sfx_idx = 1
    sfx_path = base + ".sfx.wav"
    write_sfx(sfx_path, total, sfx_events)
    flashes = "+".join(f"between(t,{T + p:.2f},{T + p + 0.07:.2f})" for p in body_peaks
                       if p == top) or "0"
    if teaser:
        flashes += f"+between(t,{T - 0.08:.2f},{T + 0.05:.2f})"
    vf += (f";[cv]drawbox=x=0:y=0:w=iw:h=ih:c=white@0.55:t=fill:enable='{flashes}',"
           f"drawbox=x=0:y={H - 16}:w='iw*t/{total:.2f}':h=16:c=0x00E5FF:t=fill,"
           f"subtitles='{ass_path}':fontsdir='{FONT_DIR}'[v];"
           f"{audio_in}aresample={SR},loudnorm=I=-14:TP=-1.5:LRA=11[va];"
           f"[{sfx_idx}:a]aresample={SR}[sx];"
           f"[va][sx]amix=inputs=2:normalize=0:duration=first,"
           f"alimiter=limit=0.95[a]")
    clipper.run(["ffmpeg", "-v", "error", "-y", *inputs, "-i", sfx_path,
                 "-filter_complex", vf, "-map", "[v]", "-map", "[a]",
                 "-c:v", "libx264", "-preset", preset, "-crf", "19", "-pix_fmt", "yuv420p",
                 "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
                 "-t", f"{total:.3f}", base + ".mp4"])
    for p in (ass_path, sfx_path):
        os.remove(p)
    print(f"done: {base}.mp4 ({total:.1f}s from {end - start:.1f}s, "
          f"{len(iv) - 1} jump cuts, {len(body_peaks)} punch-ins"
          f"{', cold open' if teaser else ''})", file=sys.stderr)
    return base + ".mp4"


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("clips")
    p.add_argument("--src-dir", default="src")
    p.add_argument("--words-dir", default="tr")
    p.add_argument("-o", "--out", default="final")
    p.add_argument("--only", help="comma list of clip numbers to render")
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    clips = json.load(open(a.clips))
    only = set(a.only.split(",")) if a.only else None
    for i, c in enumerate(clips, 1):
        if only and str(i) not in only:
            continue
        src = c.get("src") or glob.glob(os.path.join(a.src_dir, f"{c['k']}-*"))[0]
        words = clipper.apply_replacements(
            json.load(open(os.path.join(a.words_dir, f"{c['k']}.json"))), ["VI=6"])
        pro_render(src, words, c, os.path.join(a.out, f"{i:02d}-{c['name']}"))


if __name__ == "__main__":
    main()
