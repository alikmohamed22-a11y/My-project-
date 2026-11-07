# Oddverra Shorts kit

A repeatable pipeline for Oddverra animated history Shorts at the "premium" look. Every video built with it gets the same world quality, lighting, outlines, colour grade, camera grammar and characters.

## What's inside
| Folder | What it is |
|---|---|
| `engine/` | The Three.js engine. `main.js` holds the renderer, post passes (AO → ink → DOF → bloom → rays → grade) and the character cards. `world.js` holds the detailed 1904 sets and the prop kit. `paint.js` holds the hand-painted textures. `oddverra_next.js` draws the Oddverra cast. `story.js` and `story7.js` are the example timeline (the 1904 marathon). |
| `tools/` | Utilities, described below. |
| `audio/` | Procedural music and SFX synth (`dsp.py`, `instruments.py`, `sfx_gen.py`), the cue sheet example (`audio.py`) and the level-locked mix (`mix.py`: music and SFX at −6 dB under the voice). |
| `docs/` | How each part of the look was built and tuned: camera grammar, ink, light, grade, texture, world, character. |

`tools/` contains:
- `render.mjs`: headless Chromium frame renderer
- `finish.sh`: loudness to −14 LUFS, encode, QA sheet and burned-in captions
- `captions.py`: one-word captions with yellow key words
- `lookscore.py`: scores our stills against reference stills
- `framestats.py`: per-frame 30 fps stats
- `camstat.mjs`: shot-size and camera-movement check
- `sheet.py`: contact sheets

Also read these, at the top of `oddverra-style/`:
- `STYLE_GUIDE.md`: signature details, craft rules, measured look targets and script shape
- `STUDY_LOG.md`: what was learned from 22+ reference Shorts

## Setup (once per machine)
```
mkdir myshort && cd myshort
cp -r <repo>/oddverra-kit/engine web
cp <repo>/oddverra-kit/tools/render.mjs <repo>/oddverra-kit/tools/sheet.py .
npm i three@0.160.0 playwright
mkdir -p audio work frames out
```
On a machine with a graphics card (for example a Mac), remove the SwiftShader flags from `render.mjs` so rendering uses the GPU. It is 20–100× faster than the CPU-only cloud box, which takes about 10 s per frame.

## Making a new video
1. **Story.** Follow STYLE_GUIDE "Voice and script" and "Script shape":
   - a paradox hook, then the setup, then 3–5 rising beats
   - "You see," to open the reveal
   - a one-line ironic twist at the end

   Aim for about 150–230 words. Every fact must be checked against reliable sources.
2. **Voice.** Use ElevenLabs "Jesse – Elearning, Casual Friendly Male" (eleven_v4) and generate 2 takes. Speed it up to 1.15× and trim pauses, as in `audio/` notes. Use the take with the best timing.
3. **Word timings.** Run faster-whisper (`small.en`, `word_timestamps=True`) to get `work/words.json`, where each entry is `{w, s, e}`. Build `web/voice_env.js` (per-frame loudness for lip sync), as described in the marathon notes.
4. **Timeline.** Write `web/story.js` with shots, cameras, lights, actors and effects per frame. Use `story7.js` as the pattern, with segments mapped to the beats in `words.json`. Follow the camera grammar (`docs/camera.md`):
   - mostly locked wides
   - slow push-ins
   - close-ups only on the beats
   - zoom-through links between shots, and a white flash for time jumps
5. **World.** Reuse `world.js` kits: rounded boxes, storefronts, trees, fences, props and signs with period text. Every frame should have clutter at three depths.
6. **Check stills before the long render.** Run:
   ```
   WORKERS=4 node render.mjs stills "f1,f2,..."
   python3 sheet.py stills sheet.jpg
   python3 tools/lookscore.py stills
   ```
   Aim for an overall lookscore of about 0.4 or less. Also look at every still by eye: hands on props, nothing clipping, the right signs for the right place and year.
7. **Sound.** Copy `audio/audio.py` and write a cue table for the new beats. Then run `python3 audio.py && python3 mix.py voice.wav music.wav sfx.wav`.
8. **Captions.** Run `CAP_N=1 python3 captions.py work/words.json work/captions.ass "KEY,WORDS" "asr=>fix"`.
9. **Render and finish.**
   ```
   WORKERS=4 node render.mjs frames "0-N"
   bash finish.sh "Title" name
   ```
   This writes `out/name.mp4` and `out/name_captions.mp4`.
10. **Check the finished video.** Run `python3 tools/framestats.py out/name.mp4 stats.npy`. Look at `out/qa_sheet.jpg` and spot-check frames at 30 fps for freezes, pops and wrong text.

## Rules that keep it original
- Our own stories and scripts only. Never remake another channel's topics, scripts, characters or scenes.
- The cast is always Oddverra: bean eyes with the ringed-planet shine, indigo ink, blush, purple-leaning cel shading and rim light. Reference videos are studied only for finish quality (light, contrast, outlines, texture, camera), never for character design.
