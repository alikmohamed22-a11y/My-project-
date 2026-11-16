#!/usr/bin/env python3
"""Live clipper: record a Twitch stream, watch chat, clip every hype spike.

  python live.py watch caseoh_          # runs until you stop it (Ctrl+C)
  python live.py process rec/caseoh_-20261119-180002   # redo clips afterwards

How it works:
  * streamlink records the stream from the moment it goes live
  * Twitch chat is read anonymously (no account, no token)
  * messages are counted every 10 s; when a window jumps well above the
    recent normal, that's a spike (something just happened on stream)
  * ffmpeg cuts ~30 s around the spike (mostly BEFORE it: chat reacts late),
    whisper writes the captions, and the clip lands in clips/ within minutes

Only works while the streamer is live: you can't rewind a stream that ended.
"""
import argparse
import json
import os
import re
import socket
import ssl
import statistics
import subprocess
import sys
import threading
import time
import urllib.parse
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import clipper  # noqa: E402

HYPE = re.compile(r"\b(LUL|LULW|KEKW|OMEGALUL|LMAO+|LOL+|W+|L|POG\w*|CLIP\w*|"
                  r"HOLY|WTF|NO WAY|BRO+|ICANT|AINTNOWAY|\?{3,})\b", re.I)


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, file=sys.stderr, flush=True)


# ------------------------------------------------------------------ chat
class Chat(threading.Thread):
    """Anonymous Twitch chat reader over the WebSocket endpoint (port 443)."""

    def __init__(self, channel, path):
        super().__init__(daemon=True)
        self.channel, self.path = channel.lower(), path
        self.stop = threading.Event()

    def connect(self):
        import websocket
        kw = {"timeout": 300}
        proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
        if proxy:
            p = urllib.parse.urlparse(proxy)
            kw.update(http_proxy_host=p.hostname, http_proxy_port=p.port,
                      proxy_type="http")
        ca = os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE")
        if ca:
            kw["sslopt"] = {"ca_certs": ca}
        ws = websocket.create_connection("wss://irc-ws.chat.twitch.tv:443", **kw)
        ws.send("PASS SCHMOOPIIE")
        ws.send(f"NICK justinfan{int(time.time()) % 90000 + 10000}")
        ws.send(f"JOIN #{self.channel}")
        return ws

    def run(self):
        while not self.stop.is_set():
            try:
                ws = self.connect()
                log(f"chat connected: #{self.channel}")
                with open(self.path, "a") as f:
                    while not self.stop.is_set():
                        data = ws.recv()
                        now = time.time()
                        for line in data.split("\r\n"):
                            if line.startswith("PING"):
                                ws.send("PONG" + line[4:])
                            m = re.match(r":(\w+)!\S+ PRIVMSG #\w+ :(.*)", line)
                            if m:
                                f.write(json.dumps({"t": round(now, 2), "u": m[1],
                                                    "m": m[2]}) + "\n")
                        f.flush()
            except Exception as e:  # network blip: reconnect
                log(f"chat error: {e!r}, reconnecting in 5s")
                time.sleep(5)


def read_chat(path, t0, t1=None):
    out = []
    if not os.path.exists(path):
        return out
    with open(path) as f:
        for line in f:
            try:
                d = json.loads(line)
            except ValueError:
                continue
            if d["t"] >= t0 and (t1 is None or d["t"] < t1):
                out.append(d)
    return out


# ---------------------------------------------------------------- spikes
def windows(chat, rec_start, win):
    """Weighted message count per window, indexed from the recording start."""
    counts = Counter()
    for d in chat:
        k = int((d["t"] - rec_start) // win)
        if k >= 0:
            counts[k] += 1 + (1 if HYPE.search(d["m"]) else 0)
    return counts


def find_spikes(counts, upto, a):
    """Windows k < upto that are local peaks well above the recent baseline."""
    spikes = []
    for k in range(a.warmup, upto):
        hist = [counts.get(j, 0) for j in range(max(0, k - a.history), k)]
        base = max(statistics.median(hist), 1.0)
        c = counts.get(k, 0)
        if c < a.min_msgs or c < a.mult * base:
            continue
        if c < counts.get(k - 1, 0) or c < counts.get(k + 1, 0):
            continue  # not the top of the spike
        spikes.append({"k": k, "count": c, "base": round(base, 1),
                       "score": round(c / base, 2)})
    # cooldown: keep the strongest spike within each cluster
    kept = []
    for s in sorted(spikes, key=lambda s: -s["score"]):
        if all(abs(s["k"] - o["k"]) * a.window >= a.cooldown for o in kept):
            kept.append(s)
    return sorted(kept, key=lambda s: s["k"])


def hms(t):
    t = int(t)
    return f"{t // 3600}h{t % 3600 // 60:02d}m{t % 60:02d}s"


# ------------------------------------------------------------ make clip
def make_clip(session, spike, a, chat):
    rec, meta = session["video"], session
    t = (spike["k"] + 1) * a.window - a.offset      # end of the spike window
    start = max(0.0, t - a.pre)
    end = t + a.post
    top = Counter(d["m"] for d in chat
                  if meta["start"] + spike["k"] * a.window <= d["t"]
                  < meta["start"] + (spike["k"] + 1) * a.window).most_common(5)
    name = f"{meta['channel']}-{hms(start)}-x{spike['score']}"
    base = os.path.join(a.clips, name)
    log(f"SPIKE {hms(t)}: {spike['count']} msgs vs ~{spike['base']} normal "
        f"(x{spike['score']}) -> {name}")
    try:
        info = clipper.probe(rec)
        words, _, _ = clipper.transcribe_words(rec, a.model, a.language,
                                               start=start, dur=end - start,
                                               verbose=False)
        words = clipper.apply_replacements(
            [dict(w, s=w["s"] + start, e=w["e"] + start) for w in words], a.replace)
        clipper.render_clip(rec, words, {"start": start, "end": end,
                                         "layout": a.layout}, base, info=info)
        with open(base + ".txt", "w") as f:
            f.write(f"stream time {hms(start)} - {hms(end)}\n"
                    f"chat: {spike['count']} (normal ~{spike['base']}), x{spike['score']}\n"
                    "top messages:\n" + "".join(f"  {n}x  {m}\n" for m, n in top) +
                    "transcript: " + " ".join(w["w"] for w in words) + "\n")
    except subprocess.CalledProcessError as e:
        log(f"clip failed: {e}")


def process(session, a, final):
    """Clip any new spikes. While live, only spikes whose post-roll is recorded."""
    chat = read_chat(session["chat"], session["start"])
    elapsed = (session.get("end") or time.time()) - session["start"]
    counts = windows(chat, session["start"], a.window)
    upto = int(elapsed // a.window) - (0 if final else 1)
    if not final:  # need the post-roll on disk + a margin for the segment buffer
        upto = min(upto, int((elapsed - a.post - 15) // a.window))
    for s in find_spikes(counts, max(upto, 0), a):
        if s["k"] in session["done"]:
            continue
        session["done"].append(s["k"])
        save_meta(session)
        make_clip(session, s, a, chat)


def save_meta(session):
    with open(session["base"] + ".json", "w") as f:
        json.dump({k: v for k, v in session.items() if k != "proc"}, f, indent=1)


# ----------------------------------------------------------------- watch
def cmd_watch(a):
    os.makedirs(a.rec, exist_ok=True)
    os.makedirs(a.clips, exist_ok=True)
    ch = a.channel.lower()
    chat_path = os.path.join(a.rec, f"{ch}-chat.jsonl")
    Chat(ch, chat_path).start()
    while True:
        base = os.path.join(a.rec, f"{ch}-{time.strftime('%Y%m%d-%H%M%S')}")
        video = base + ".ts"
        log(f"waiting for {ch} to go live ...")
        proc = subprocess.Popen(
            ["streamlink", "--retry-streams", "30", "--twitch-disable-ads",
             f"twitch.tv/{ch}", a.quality, "-o", video],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        while proc.poll() is None and not (os.path.exists(video) and
                                           os.path.getsize(video) > 0):
            time.sleep(0.5)
        if not os.path.exists(video):
            time.sleep(10)
            continue
        session = {"channel": ch, "base": base, "video": video, "chat": chat_path,
                   "start": time.time(), "end": None, "done": []}
        save_meta(session)
        log(f"LIVE - recording to {video}")
        try:
            while proc.poll() is None:
                time.sleep(a.every)
                process(session, a, final=False)
                if a.minutes and time.time() - session["start"] > a.minutes * 60:
                    log("time limit reached")
                    proc.terminate()
                    proc.wait()
        except KeyboardInterrupt:
            proc.terminate()
            proc.wait()
            session["end"] = time.time()
            process(session, a, final=True)
            save_meta(session)
            return
        session["end"] = time.time()
        log("stream ended - final pass")
        process(session, a, final=True)
        save_meta(session)
        if a.minutes:
            return


def cmd_process(a):
    """Re-run spike detection on a finished recording (e.g. with new settings)."""
    with open(a.session + ".json") as f:
        session = json.load(f)
    session["base"] = a.session
    if not a.keep_done:
        session["done"] = []
    os.makedirs(a.clips, exist_ok=True)
    if not session.get("end"):
        session["end"] = session["start"] + clipper.probe(session["video"])[2]
    if a.dry_run:
        chat = read_chat(session["chat"], session["start"])
        counts = windows(chat, session["start"], a.window)
        upto = int((session["end"] - session["start"]) // a.window)
        for s in find_spikes(counts, upto, a):
            print(f"{hms((s['k'] + 1) * a.window)}  {s['count']} msgs  "
                  f"(normal ~{s['base']})  x{s['score']}")
        return
    process(session, a, final=True)


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = p.add_subparsers(dest="cmd", required=True)

    def common(q):
        q.add_argument("--rec", default="rec", help="recordings folder")
        q.add_argument("--clips", default="clips", help="output folder")
        q.add_argument("--window", type=float, default=10, help="seconds per chat window")
        q.add_argument("--mult", type=float, default=2.5,
                       help="spike = this many times the normal chat rate")
        q.add_argument("--min-msgs", type=int, default=8,
                       help="ignore windows with fewer (weighted) messages")
        q.add_argument("--history", type=int, default=30,
                       help="windows used for the 'normal' rate (30 x 10s = 5 min)")
        q.add_argument("--warmup", type=int, default=6,
                       help="windows to wait before clipping starts")
        q.add_argument("--cooldown", type=float, default=45,
                       help="min seconds between two clips")
        q.add_argument("--pre", type=float, default=25, help="seconds before spike")
        q.add_argument("--post", type=float, default=5, help="seconds after spike")
        q.add_argument("--offset", type=float, default=0,
                       help="extra seconds chat lags the video")
        q.add_argument("--layout", default="blur", choices=["blur", "crop"])
        q.add_argument("--model", default="small", help="whisper model")
        q.add_argument("--language", default="en")
        q.add_argument("--replace", action="append", default=["VI=6"],
                       metavar="OLD=NEW")

    w = sp.add_parser("watch", help="wait for the channel, record and clip live")
    w.add_argument("channel")
    w.add_argument("--quality", default="best")
    w.add_argument("--every", type=float, default=30, help="check chat every N seconds")
    w.add_argument("--minutes", type=float, default=0,
                   help="stop after N minutes of recording (0 = run forever)")
    common(w)
    w.set_defaults(fn=cmd_watch)

    r = sp.add_parser("process", help="clip a finished recording")
    r.add_argument("session", help="recording path without extension, e.g. rec/ch-2026...")
    r.add_argument("--dry-run", action="store_true", help="only list spikes")
    r.add_argument("--keep-done", action="store_true", help="skip already-made clips")
    common(r)
    r.set_defaults(fn=cmd_process)

    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
