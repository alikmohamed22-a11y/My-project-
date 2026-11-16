# Clipper

Turns long videos (streams, gameplay, YouTube videos) into vertical 1080x1920 clips
with word-by-word captions and a hook banner. It does what the "Wizard" tool in the
reference reel does, but with free tools.

## Setup
```
pip install faster-whisper yt-dlp
# ffmpeg must be installed
```

## Workflow
```
# 1. Get a video. YouTube blocks cloud servers, so either run this on your own
#    computer or upload the file to the Claude session.
python clipper.py fetch "https://www.youtube.com/watch?v=..." -o sources

# 2. Transcribe it (word timestamps)
python clipper.py transcribe sources/video.mp4 -o work

# 3. Pick the best moments from work/transcript.txt into work/clips.json
#    (Claude does this step: hook in the first second, 15-60 s, one idea per clip)

# 4. Render
python clipper.py render sources/video.mp4 --clips work/clips.json -o out --replace VI=6
```

`clips.json`:
```json
[
  {"name": "five-stars", "start": 83.2, "end": 121.5,
   "hook": "He got 5 stars in 10 seconds", "layout": "blur"}
]
```
- `layout: "blur"`: the whole 16:9 frame in the middle with a blurred copy behind it.
  This is the safe default for gameplay because nothing gets cut off.
- `layout: "crop"`: fills the screen. `"crop_x": 0.0`-`1.0` picks the part to keep
  (0 = left, 0.5 = center, 1 = right).
- `layout: "split"`: streamer facecam on top, gameplay below, which works best for
  streamer clips. Needs `"cam": [x, y, w, h]`, the webcam box in source pixels
  (Kai Cenat 1080p: `[40, 300, 336, 189]`).
- `"trim_bottom": 150` cuts off burned-in stream captions or game subtitles so they
  don't clash with ours.
- Captions bleep swear words and slurs by default (`"censor": false` to turn off).
  TikTok and Reels push down clips that show them on screen; the audio stays as is.
- Vertical sources are always filled.

## Live mode: clip while the stream is still on (the fast way)
Most clippers wait for the full stream to be uploaded and then scan it. By then the
best moments are already everywhere. `live.py` watches the stream as it happens:

- **streamlink** records from the second the streamer goes live
- **Twitch chat** is read anonymously, with no account or token
- chat messages are counted every 10 seconds; a spike means something just happened
- ~30 s around each spike is cut (25 s before, 5 s after, since chat reacts late),
  captioned with whisper, and saved to `clips/` a minute or two later

```
pip install streamlink websocket-client faster-whisper
python live.py watch caseoh_        # leave it running; Ctrl+C to stop
```
Each clip comes with a `.txt` showing the stream time, how big the spike was, the
top chat messages and the transcript, so you can write the hook and caption fast.

Tuning:
- Too many clips: raise `--mult 3` or `--cooldown 90`
- Too few: lower `--mult 2` or `--min-msgs 5`
- Moment cut off at the start: `--pre 35`
- Re-clip a finished recording with new settings:
  `python live.py process rec/caseoh_-20261119-180002 --dry-run`, then without `--dry-run`

It only works while they're live: you can't rewind a stream that already ended.
On GTA 6 launch night (Nov 19) run one `watch` per streamer.

## Sources that work from the cloud session
- Twitch VODs and clips download fine (yt-dlp). A channel's most-viewed clips
  (`https://www.twitch.tv/<channel>/clips?filter=clips&range=7d`) are moments viewers
  already picked. Re-cut them vertically with a split cam and a hook.
- YouTube is blocked from the cloud server, so upload those files or run `fetch` locally.

## What makes a good clip
1. The first 1-2 seconds must hook: a reaction, a crash, a question, a big claim.
2. Keep it 15-60 seconds. Start right before the action and cut right after the payoff.
3. Keep one moment or idea per clip.
4. The hook banner says what's about to happen, not the video title.
5. Post often: 3-5 clips a day on TikTok, Shorts and Reels.
6. Only clip content you have the right to post: your own gameplay, or creators who
   allow it through paid clipping campaigns.
