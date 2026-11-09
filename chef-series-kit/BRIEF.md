# Brief: "The Chef Résumé" — flat 2D phone-story series (Instagram)

## What we're making
A new comedy series for Instagram Reels, **separate from the Oddverra YouTube channel**. The format follows a reference "Day 1 of 30" series the owner likes:
- a narrated story told in quick 1.5–3 s shots;
- flat 2D vector illustration;
- phone screens (chats, emails, posts) as story beats;
- big bold condensed captions with key words in colour.

Reference frames: `/root/shorts/chef2d/work/ref_01.jpg … ref_60.jpg` (1 per second) and the contact sheet `work/reference_sheet.jpg`. **Study them closely for finish quality and format only.**

Never copy the reference's characters, designs, scenes, text or jokes. Our characters and world are original.

## Look (what to match from the reference)
- **Flat colour fills** with **one hard-edged shadow tone** per material. Where it helps, add small graphic accents: halftone dots, simple highlights, speckles, grain.
- **Thick, even, near-black outlines.**
  - About 7–9 px at 1080 width for characters at medium size, a bit thinner on background objects.
  - Rounded joins. Ink colour `#1c1530` (very dark indigo-black).
- **Bold saturated backgrounds**, often a strong single colour (navy, burnt orange, teal, plum, mustard). Simple shapes with lots of detail props: posters, shelves, window blinds, clutter.
- **Characters**
  - Big heads (head ≈ 1/3–1/4 of body height), chunky simple bodies.
  - Big expressive eyes: white sclera with dark pupils, plus thick eyebrows that do most of the acting.
  - Clear silhouettes, and readable expressions at phone size.
- **Phone UIs**: clean, modern and realistic (our own invented app look), shown big in frame on a coloured background.
- **Camera**: mostly static frames with a slow push or zoom, quick cuts, an occasional snap-zoom on a reaction, and a small screen-shake on impacts.
- **Captions** (burned in by the engine):
  - Anton font (`web/Anton-Regular.ttf`), white with a dark outline and drop shadow, positioned at about 72 % of frame height.
  - 1–3 words at a time.
  - Key word in yellow `#ffd43b` or red `#ff4d4d`.

## Tech
- **1080×1920, 30 fps.** Pure HTML5 Canvas 2D: no WebGL and no npm packages beyond what exists. `node_modules` has playwright.
- `web/index.html` loads `web/engine.js`, which imports `web/story.js`. It exposes `window.renderFrame(f)` (draws frame f) and `window.ready`.
- `tools/render.mjs <outdir> "0-1290"|"5,40,90"` uses headless Chromium (`require('playwright')`, `chromium.launch()`, flags `--disable-gpu`). It serves `web/` over a tiny local http server and screenshots the canvas to `outdir/f%04d.jpg` (quality 92).
  - `WORKERS=n` splits the frames across pages.
  - `RS=2` renders at 2160×3840 by scaling the canvas transform, so everything stays vector-sharp.
- `tools/sheet.py <dir> <out.jpg>` makes a contact sheet (copy it from `/root/shorts/booth/sheet.py`).

## The episode (Ep 1, "Day 1 of 30")
- **Voice:** `audio/voice.wav`, 42.8 s, 1,284 frames.
- **Word timings:** `work/words.json` (`{w, s, e}` in seconds), with frame numbers in `work/words_frames.txt`.

**Beats** (frame ranges):
| Frames | Narration | What we see |
|---|---|---|
| 0–114 | "Day one. Sam just landed his dream job." | Title "DAY 1 of 30". Sam on his couch at night, phone lighting his face; phone insert of the email "You're hired!" from Lumière. Sam leaps up cheering. |
| 114–219 | "Assistant chef at Lumière, the fanciest restaurant in the city." | Lumière exterior/dining room: chandeliers, white tablecloths, candles, gold. |
| 219–304 | "There's one problem. Sam can't cook." | Snap-zoom on Sam's frozen smile. Sweat drop. |
| 304–414 | "On his résumé he wrote 'ten years of fine dining experience.'" | Phone/laptop résumé insert. A yellow highlighter swipes "10 YEARS OF FINE DINING EXPERIENCE". |
| 414–547 | "His real experience? Microwaving noodles. Sometimes with the lid still on." | Sam at the microwave with a noodle cup; the lid sparks inside the microwave and Sam's face is lit by the sparks. |
| 547–721 | "The interview went perfectly… because the head chef only asked one question. 'Can you start in thirty days?'" | Office at Lumière. The stern HEAD CHEF (tall toque) behind a desk; Sam sweating, then nodding. Speech bubble "Can you start in 30 days?" |
| 721–829 | "Sam said yes. Then he went home… and tried to boil an egg." | Sam's tiny kitchen, a pot, Sam holding up an egg confidently. |
| 829–912 | "First try: the egg exploded." | Egg bursts; yolk on the ceiling and Sam's face. |
| 912–971 | "Second try: he forgot the water." | Dry pot glowing and smoking; Sam staring. |
| 971–1051 | "Third try… the smoke alarm texted his mom." | Smoke-alarm notification, then Mom's texts: "why is your SMOKE ALARM texting me??", "SAM.", typing dots. |
| 1051–1186 | "His roommate walks in, looks at the kitchen, and goes, 'Bro… what happened?'" | ROOMMATE in the doorway, holding a grocery bag. Wide shot of the destroyed, smoky kitchen. |
| 1186–1245 | "Sam says, 'I'm a chef now.'" | Sam, sooty, frizzed hair, proudly wearing a too-big toque. |
| 1245–1284 | "Twenty-nine days left." | "29 DAYS LEFT" card with a calendar. |

Characters only mouth their own quoted lines; there is no narrator lip-sync.
