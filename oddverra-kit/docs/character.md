# character: Oddverra cast redesign (web/oddverra_next.js)

## What changed and why
The reference stills (/root/study/refstills) use thin, clean, even ink with very little shading, and keep the figures small next to a detailed world. Our cast had thick ink of about 9–12 px, near-circular heads taking up about 40 % of the figure, and blobby tube limbs. I rewrote `oddverra_next.js` from scratch. The API, `oddverra(g, o, op)` on a 600×1000 card with soles at y≈965, and every `o` and `op` option name are unchanged. main.js and the story files are untouched. The design is our own Oddverra look, not the reference's white heads and stick limbs: we keep skin-toned sculpted heads, full limbs and clothing silhouettes.

- **Ink:** `cel()` now draws the outline only outside the shape. A second, offset stroke makes the lower-right (shadow side) heavier. Card-space widths:
  - silhouette shapes (head, torso, pants, hair, hats): about 3.3 px on the lit side and 4.3 px on the shadow side
  - inner parts (sleeves, hands, shoes, collars, lapels, props): about 2–2.6 px
  - before: about 8.8 / 12 px
  
  In scene that comes to about 2.5–3.5 px at 1080 for the silhouette and about 1.5–2 px for inner lines, checked on frames 420 and 1600. This follows the ink agent's 2–3 px target. Ink is #2b1d4a mixed 28 % toward a darkened local colour (`inkFor`). Feature lines (brows, mouths, closed eyes, creases) use a new tapered brush stroke (`taper()`), thin at the ends and full in the middle.
- **Heads:** `HEADS` is now a Catmull-Rom contour per type, with a flattened crown and its own jaw and chin:
  - round: soft wide jaw
  - egg: narrow tapering chin
  - wide: square heavy jaw
  - tall: long face and chin
  
  Head height relative to the full figure went from about 1/2.5 (296 of 738 px) to about 1/3.65 for adults (196 of 716 px) and about 1/3 for KID.
- **Body:** the torso has sloped shoulders, a nipped waist and a hip hem, with a belly variant for `stout`. Clothing is chosen from existing fields:
  - jersey with neckline/hem trim, sash, pinned bib and a leather belt for runners
  - jacket with lapels, shirt V, waistcoat, buttons, pocket square and pocket flaps for suits
  - T-shirt with suspenders and a knee patch for KID
  - blouse with puff sleeves, high collar and brooch, plus a long pleated skirt, for `lashes` passers-by
  
  Sleeves are their own shapes, short or long, with cuffs. Pants have front creases, knee folds and hem lines.
- **Limbs:** `limb()` builds tapered capsule chains (shoulder–elbow–wrist, hip–knee–ankle) with narrower joints, so elbows and knees read. Elbow and knee crease ticks appear when a limb bends. Hands are a mitten plus a thumb with one shared outline. Laced boots have a sole and a heel.
- **Shading:**
  - a crisp two-tone cel shade: a multiply with a purple-leaning tint (#a796d8; #d0aad4 on skin), cut by the shape shifted toward the light
  - a soft two-step blue-violet rim light on the shadow edge, using screen
  - a fine low-contrast twill texture on plain cloth
  
  I removed the muddy overlays: the chin-shadow ellipse, the translucent sheen gradient, the 35 %-alpha seams and the angry face gradient.
- **1904 / character details:** DRIVER's motoring goggles on the cap and leather driving gloves; OFFICIAL's gold watch chain with fob and a red boutonnière; watch chains on the trainers; bowler, top-hat and flat-cap redraws with bands and seams.
- **Kept:** bean eyes with the ringed-planet shine, blush, all 16 expressions plus talk, every pose (stand, run/march, sit, fall, drive with both hands on the rim, cheer, wave, hip, relaxed) and all props (stick, medal, bottle, spoon, apple, rotten, ladle, megaphone). Props were redrawn with cel shading and scaled to the smaller figure. Brows are heavier and have more distinct shapes per expression.

## Functions / regions touched (web/oddverra_next.js only)
- Rewritten: `cel`, `line`, `HEADS`, `BUILD`, `HOLD`, `oddverra`
- New helpers: `cr`, `polyPath`, `smooth`, `ellP`, `limb`, `taper`, `arcPts`, `twill`, `lum`, `lt`
- `op.face` is still accepted, but every face is now drawn as the bean face. Nothing in the story files sets it.

## Verification
- Test sheet harness (re-runnable):
  - harness: `sheet/sheet.html`, `sheet/cast.js` (a copy of ODD and oddOf from main.js), `sheet/shoot.mjs`
  - command: `node sheet/shoot.mjs out.png <cols> <rows> [module] [scale]`
- Iterations: v1, then z1–z3 (shading, bowler, brows, period details), then z4 (closer look; arms moved in front and thickened, belt fixed), then v2, then final. That is 5 rounds.
- In-scene: frames 150, 420, 1300 and 1600 all rendered through render.mjs with no page errors. Frames 420 and 1600 were re-rendered after the final ink thinning.
- Ink crop check: `sheet/inkcheck.jpg`

## Sheets
- After (8 expressions/poses × 13 cast: FRED, HICKS, DRIVER, OFFICIAL, KID, RUN1-3, TRN0-1, PASS1/2/4): `/root/shorts/lab/character/sheet/final_sheet_A.jpg`
- After (other 8 expressions and all props/drive): `/root/shorts/lab/character/sheet/final_sheet_B.jpg`
- Before (old drawer, same grid as A): `/root/shorts/lab/character/sheet/before.jpg`
- In-scene before (top) / after (bottom), frames 150/420/1300/1600: `/root/shorts/lab/character/scene_compare.jpg` (stills in `stills/`)

## Notes for integration
- Characters now look smaller and slimmer in frame at the same card scale, which matches the brief's "small in frame" goal. The camera agent may want to retune framing.
- Rendering cost is slightly higher, because there are more clip and composite passes per shape. In-scene frames took about 60 s each, but other agents were sharing the CPU at the time.
- Diff: `/root/shorts/lab/character/changes.diff`
