#!/usr/bin/env python3
"""Clipper: turn a long video into vertical, captioned short clips.

The workflow from the reference reel, done with our own tools:

  1. fetch       download a video (YouTube, Twitch VOD, etc.) with yt-dlp
  2. transcribe  get word-level timestamps with faster-whisper
  3. (pick)      choose the best moments and write them to clips.json
  4. render      cut each clip to 1080x1920 with word-by-word captions

clips.json format:
  [
    {"name": "wanted-5-stars", "start": 83.2, "end": 121.5,
     "hook": "HE GOT 5 STARS IN 10 SECONDS", "layout": "blur"}
  ]
layout: "blur" (full 16:9 frame over a blurred background, best for gameplay),
        "crop" (fill the screen, crop the sides; optional "crop_x" 0..1),
        or omit for vertical sources.
"""
import argparse
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts")
FONT_NAME = "Inter Display Black"
W, H = 1080, 1920


def run(cmd):
    print("+", " ".join(cmd[:6]), "..." if len(cmd) > 6 else "", file=sys.stderr)
    subprocess.run(cmd, check=True)


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height:format=duration",
         "-of", "json", path],
        check=True, capture_output=True, text=True).stdout
    j = json.loads(out)
    s = j["streams"][0]
    return s["width"], s["height"], float(j["format"]["duration"])


# ---------------------------------------------------------------- fetch
def cmd_fetch(a):
    os.makedirs(a.out, exist_ok=True)
    run(["yt-dlp", "-f", "bv*[height<=1080]+ba/b[height<=1080]/b",
         "--merge-output-format", "mp4",
         "-o", os.path.join(a.out, "%(title).80s [%(id)s].%(ext)s"), a.url])


# ----------------------------------------------------------- transcribe
def cmd_transcribe(a):
    import numpy as np
    from faster_whisper import WhisperModel

    os.makedirs(a.out, exist_ok=True)
    # Decode with ffmpeg ourselves (avoids PyAV version issues, handles any input).
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", a.video, "-ac", "1", "-ar", "16000",
         "-f", "f32le", "-"], check=True, capture_output=True).stdout
    audio = np.frombuffer(raw, dtype=np.float32)

    model = WhisperModel(a.model, device="cpu", compute_type="int8")
    segs, info = model.transcribe(audio, language=a.language,
                                  word_timestamps=True, vad_filter=True)
    words, lines = [], []
    for s in segs:
        lines.append(f"[{fmt(s.start)} - {fmt(s.end)}] {s.text.strip()}")
        print(lines[-1], file=sys.stderr)
        for w in s.words:
            words.append({"w": w.word.strip(), "s": round(w.start, 3),
                          "e": round(w.end, 3)})
    with open(os.path.join(a.out, "words.json"), "w") as f:
        json.dump(words, f)
    with open(os.path.join(a.out, "transcript.txt"), "w") as f:
        f.write(f"# language={info.language} duration={info.duration:.1f}s\n")
        f.write("\n".join(lines) + "\n")
    print(f"wrote {len(words)} words to {a.out}", file=sys.stderr)


def fmt(t):
    return f"{int(t // 60):02d}:{t % 60:05.2f}"


# --------------------------------------------------------------- render
def ass_time(t):
    t = max(t, 0)
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def ass_escape(s):
    return s.replace("\\", "").replace("{", "(").replace("}", ")")


def chunk_words(words, max_words=3, max_gap=0.45):
    """Group words into short caption chunks (TikTok style)."""
    chunks, cur = [], []
    for w in words:
        if cur and (len(cur) >= max_words or w["s"] - cur[-1]["e"] > max_gap):
            chunks.append(cur)
            cur = []
        cur.append(w)
        if re.search(r"[.!?,]$", w["w"]):
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    return chunks


def build_ass(words, clip, cap_y, hook_y):
    start, end = clip["start"], clip["end"]
    ws = [dict(w, s=w["s"] - start, e=w["e"] - start)
          for w in words if w["e"] > start and w["s"] < end]
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{FONT_NAME},92,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,7,4,5,60,60,0,1
Style: Hook,{FONT_NAME},72,&H00000000,&H00000000,&H00FFFFFF,&H00FFFFFF,0,0,0,0,100,100,0,0,3,18,0,5,80,80,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    chunks = chunk_words(ws)
    for ci, ch in enumerate(chunks):
        nxt = chunks[ci + 1][0]["s"] if ci + 1 < len(chunks) else ch[-1]["e"] + 0.4
        chunk_end = min(nxt, ch[-1]["e"] + 0.4)
        for wi, w in enumerate(ch):
            t0 = w["s"] if wi else min(w["s"], ch[0]["s"])
            t1 = ch[wi + 1]["s"] if wi + 1 < len(ch) else chunk_end
            parts = []
            for k, x in enumerate(ch):
                txt = ass_escape(x["w"].upper())
                if k == wi:  # active word: yellow and slightly bigger
                    parts.append(r"{\c&H00E5FF&\fscx112\fscy112}" + txt +
                                 r"{\c&HFFFFFF&\fscx100\fscy100}")
                else:
                    parts.append(txt)
            pop = r"{\fad(0,0)\t(0,80,\fscx104\fscy104)}" if wi == 0 else ""
            ev.append(f"Dialogue: 0,{ass_time(t0)},{ass_time(t1)},Cap,,0,0,0,,"
                      f"{{\\pos({W // 2},{cap_y})}}{pop}{' '.join(parts)}")
    if clip.get("hook"):
        dur = clip.get("hook_seconds", 3.0)
        ev.append(f"Dialogue: 1,{ass_time(0)},{ass_time(dur)},Hook,,0,0,0,,"
                  f"{{\\pos({W // 2},{hook_y})\\fad(0,250)}}"
                  f"{ass_escape(clip['hook'].upper())}")
    return head + "\n".join(ev) + "\n"


def video_filter(layout, sw, sh, crop_x, ass_path):
    sub = f"subtitles='{ass_path}':fontsdir='{FONT_DIR}'"
    if sw / sh <= W / H + 0.01 or layout == "crop":
        # Fill the frame; for wide sources choose which part to keep with crop_x.
        return (f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,"
                f"crop={W}:{H}:(iw-{W})*{crop_x}:(ih-{H})/2,setsar=1,fps=30,{sub}[v]")
    fg_h = int(round(W * sh / sw / 2) * 2)
    return (f"[0:v]split=2[a][b];"
            f"[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
            f"boxblur=30:3,eq=brightness=-0.12[bg];"
            f"[b]scale={W}:{fg_h}[fg];"
            f"[bg][fg]overlay=0:(H-h)/2,setsar=1,fps=30,{sub}[v]")


def cmd_render(a):
    sw, sh, dur = probe(a.video)
    with open(a.words) as f:
        words = json.load(f)
    with open(a.clips) as f:
        clips = json.load(f)
    reps = dict(r.split("=", 1) for r in a.replace)
    for w in words:
        core = w["w"].strip(".,!?")
        if core in reps:
            w["w"] = w["w"].replace(core, reps[core])
    os.makedirs(a.out, exist_ok=True)
    vertical = sw / sh <= W / H + 0.01
    for i, c in enumerate(clips, 1):
        layout = c.get("layout", "blur")
        c["end"] = min(c["end"], dur)
        if vertical or layout == "crop":
            cap_y, hook_y = 1300, 330
        else:
            fg_h = W * sh / sw
            cap_y = int(H / 2 + fg_h / 2 + 170)
            hook_y = int(H / 2 - fg_h / 2 - 170)
        name = re.sub(r"[^a-zA-Z0-9_-]+", "-", c.get("name", f"clip{i}")).strip("-")
        base = os.path.join(a.out, f"{i:02d}-{name}")
        ass_path = base + ".ass"
        with open(ass_path, "w") as f:
            f.write(build_ass(words, c, cap_y, hook_y))
        vf = video_filter(layout, sw, sh, c.get("crop_x", 0.5), ass_path)
        run(["ffmpeg", "-v", "error", "-y", "-ss", str(c["start"]), "-to", str(c["end"]),
             "-i", a.video, "-filter_complex", vf, "-map", "[v]", "-map", "0:a?",
             "-c:v", "libx264", "-preset", a.preset, "-crf", "20", "-pix_fmt", "yuv420p",
             "-c:a", "aac", "-b:a", "160k", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
             "-movflags", "+faststart", base + ".mp4"])
        if not a.keep_ass:
            os.remove(ass_path)
        print(f"done: {base}.mp4 ({c['end'] - c['start']:.1f}s)", file=sys.stderr)


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = p.add_subparsers(dest="cmd", required=True)

    f = sp.add_parser("fetch", help="download a video with yt-dlp")
    f.add_argument("url")
    f.add_argument("-o", "--out", default="sources")
    f.set_defaults(fn=cmd_fetch)

    t = sp.add_parser("transcribe", help="word-level transcript")
    t.add_argument("video")
    t.add_argument("-o", "--out", default="work")
    t.add_argument("--model", default="small",
                   help="tiny/base/small/medium/large-v3 (bigger = slower, more accurate)")
    t.add_argument("--language", default=None, help="e.g. en; default auto-detect")
    t.set_defaults(fn=cmd_transcribe)

    r = sp.add_parser("render", help="cut clips with captions")
    r.add_argument("video")
    r.add_argument("--words", default="work/words.json")
    r.add_argument("--clips", default="work/clips.json")
    r.add_argument("-o", "--out", default="out")
    r.add_argument("--preset", default="veryfast")
    r.add_argument("--replace", action="append", default=[], metavar="OLD=NEW",
                   help="fix caption words, e.g. --replace VI=6 (repeatable)")
    r.add_argument("--keep-ass", action="store_true")
    r.set_defaults(fn=cmd_render)

    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
