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
- Vertical sources are always filled.

## What makes a good clip
1. The first 1-2 seconds must hook: a reaction, a crash, a question, a big claim.
2. Keep it 15-60 seconds. Start right before the action and cut right after the payoff.
3. Keep one moment or idea per clip.
4. The hook banner says what's about to happen, not the video title.
5. Post often: 3-5 clips a day on TikTok, Shorts and Reels.
6. Only clip content you have the right to post: your own gameplay, or creators who
   allow it through paid clipping campaigns.
