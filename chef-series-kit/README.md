# The Chef Résumé: flat 2D series kit (Instagram)

A flat 2D comedy pipeline for "Day N of 30" episodes. It draws with pure Canvas 2D in headless Chromium and takes about 0.2 s per 4K frame.

## What's in it
| File | What it does |
|---|---|
| `web/engine.js` | The engine. Layered parallax camera (snap, crash, whip and rack-focus moves), impact frames, and captions burned in from `words_*.json`. |
| `web/cast2d.js` | The cast: SAM, SAM_SOOT, SAM_CHEF, HEADCHEF, ROOMMATE and MOM. Includes an acting rig (pose blending, head turn, squash/jump, mouth shapes). |
| `web/bg*.js` | The sets: apartment, kitchen (with mess and the ceiling egg), Lumière exterior, dining room, office, photo montage and title cards. |
| `web/phone.js` | Phone screens: email, résumé, alarm, texts and calendar. |
| `web/fx.js` | Effects. |
| `web/story_v2.js` | The Episode 1 timeline. Select it with `?story=v2`. |
| `audio/audio_chef_v2.py` | The music and SFX cue table. `mix.py` puts music and SFX 6 dB under the voice. |

## Making a new episode
1. **Script.** Write it and end on a question that asks viewers to comment.
2. **Voice.** Use Jesse (eleven_v4) and generate 2 takes.
3. **Tighten the voice.** Run `silenceremove`, then `atempo=1.15`.
4. **Word timings.** Run faster-whisper (small.en) to get `words.json`.
5. **Timeline.** Copy `story_v2.js` to `story_epN.js`, then write the shots against the word frames.
6. **Check stills.**
   ```
   Q="?story=epN" WORKERS=2 node tools/render.mjs stills "f1,f2"
   python3 tools/sheet.py stills s.jpg
   ```
7. **Render.** Make one pass with captions and one without:
   ```
   RS=2 WORKERS=2 Q="?story=epN" node tools/render.mjs frames "0-N"
   RS=2 WORKERS=2 Q="?story=epN&nocap=1" node tools/render.mjs frames_nc "0-N"
   ```
8. **Encode.**
   - Video: 1080×1920 (lanczos), 6 Mbps.
   - Audio: loudnorm to −14 LUFS.

**Fonts:** put `Anton-Regular.ttf` and `LuckiestGuy-Regular.ttf` (both OFL) in `web/`.
