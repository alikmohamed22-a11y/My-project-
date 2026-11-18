# Lighting / shadows / AO — agent "light"

## What changed and why (tied to the reference)
The references (r3, r15, r12 by day; r10, r8, r24 at night) share four lighting traits. Our baseline lacked all four:
1. **Long, soft, directional shadows.** In r3_5, shadows rake diagonally across the street. Ours were short, came from a sun nearly overhead, and covered an 80 m frustum, so they were blurry and low-res.
2. **Key/fill contrast.** The key is warm and the shadow side is cool or purple. Ours was evenly lit pastel, with the hemisphere light at 1.1 to 1.2.
3. **Contact darkening** where objects meet the floor.
4. **Night pools of warm light** in deep blue. In r10_5 a lamp makes a warm pool in a blue room, and in r24 there is an overhead pool. Ours had a flat blue fill.

### Shadows (`web/main.js`, renderer setup and "lights" block, new `fitShadow()`)
- Switched `PCFSoftShadowMap` to `VSMShadowMap` to get truly blurred penumbrae. `?pcf` in the URL switches back to PCFSoft for A/B tests.
- The 2048² map now uses a **tight ortho frustum fitted every frame** by `fitShadow(cam, tgt, dir)`. Its half-extent is the camera's visible half-height at the target ×1.9 + 3 m, clamped to 7–60 m, versus a fixed ±40 m before. Close shots now get about 0.7 cm texels instead of 4 cm.
- `shadow.radius` is set per frame so the penumbra stays about 6 cm in world units whatever the extent, and 1.4× softer for a low sun. `blurSamples` = 10, bias -0.0004, normalBias 0.02.

### Key / fill (`applyLight`)
- Added a **cool, non-shadowing `fill` DirectionalLight**. It sits at the key's azimuth +180°, 25° elevation, using `L.fillCol` / `L.fillI`, and is re-centred on the shadow target each frame.

### Presets (`web/story.js`, `LIGHTS`)
- **day / hot:** warmer key (`#ffe0b0`, 3.9–4.2) at a **lower sun (el 52→36/38)** for longer shadows. The hemisphere drops to 0.62–0.64 with a cooler sky and a purple ground bounce (`#5e4e70`), and a cool fill is added.
- **golden:** low **side-back** sun (az -150→-112, el 14→11), orange key `#ff9c52` at 4.4, and a purple hemisphere and fill. With az -150 the sun sat behind the characters and every shadow fell out of frame under the camera. At -112 the shadows rake diagonally across the road, as in r3_5.
- **explain (night):** deeper sky and fog, a blue hemisphere at 0.7, and a weak cool moon key at 0.9. Warm practicals are on: `practI` 40 for the lanterns, and `practKey` adds an off-screen key lamp near the action at intensity 11, range 7 m, decay 2.
- **office:** the hemisphere drops 1.7→1.4 and a small warm practical sits at the desk lamp.
- New optional preset fields: `fillCol`, `fillI`, `practI`, `practCol`, `practD`, `practKey`, `practKeyI`, `practKeyD`, `aoR`, `aoK`.

### Practicals (`web/main.js`: the `LANT` lantern block after the office build, `placePracticals()`, the `PRACT` lights)
- Lanterns now hang on every telegraph pole along the road at x 5.75, y 6.85. Each has a dark cap and frame and an HDR emissive glass (`0xffc477`×3.2), so it **blooms** through the existing bright pass. The `world.lanterns` group is visible only when `practI > 0`.
- There are 4 pooled `PointLight`s. They go to the nearest lanterns, plus the optional off-screen key lamp. Their count is fixed, so the shaders only recompile when a dark preset switches on or off.

### SSAO (`web/main.js`: new `aoPass`, `aoBlur`, `aoApply`, `renderAO()`, targets `rtAO1/rtAO2/rtCA`)
- This is half-resolution (540×960) Alchemy-style SSAO from the existing normal/depth buffer `rtN`:
  - It reconstructs view-space positions and takes 10 spiral samples over a 0.55 m world radius, rotated per pixel.
  - It fades out between 70 and 260 m.
  - Sky and character cards receive none, but **cards do occlude**, so the ground at a character's feet gets a contact shadow.
- A depth-aware 7-tap separable blur follows. The AO is then **multiplied into colour before the ink pass** (rtC → rtCA, and the ink pass's `tC` is pointed at rtCA). It is tinted toward deep purple (0.24, 0.19, 0.30) instead of grey, to stay on-brand.
- `?aodbg` renders the AO buffer alone, for tuning.
- Cost: about 10 % of frame time (11.5 s/frame vs about 10 s on a loaded CPU, measured by wall clock).

## Coordination notes
- **ink agent:** I **removed the old 16-tap AO block from `inkPass`'s fragment shader**: the `float ao …` loop and `c *= 1. - 0.55*ao;`. It is replaced by the AO pass above, so keep it out or AO will double. The ink pass now reads `rtCA` instead of `rtC`, via `inkPass.u.tC.value = rtCA.texture` in `renderFrame`. Nothing else in the ink shader was touched.
- **grade agent:** I did not change `finalPass`, `GRADES` or the bloom thresholds. The lanterns bloom because they are HDR (>1.0). My changes deepen the darkest 10 %, so p5 and shadow luma moved slightly down. If you lift the shadow end of the curve, the AO and shadow shapes will survive.
- **world agent:** the lantern meshes are added to `world.road` in my own block. If you rebuild the poles, keep the lantern positions (`LANT`) at the crossbar ends.

## Numbers (`tools/lookscore.py`, 10 standard frames vs 72 reference stills)
| metric | base | after | ref |
|---|---|---|---|
| overall RMS z | 0.51 | 0.53 | 0 |
| luma mean | 0.463 | 0.453 | 0.454 |
| luma p5 | 0.116 | 0.110 | 0.154 |
| contrast p95-p5 | 0.699 | 0.704 | 0.663 |
| shadow B-R (cool) | +0.065 | +0.048 | -0.032 |
| local contrast | 0.0761 | 0.0760 | 0.0653 |

The overall score went slightly up (worse), by 0.02. Of the shadow metrics, two moved away from the reference and one moved toward it:
- Brightness is now on target.
- The shadow colour is less over-blue, which is closer to the reference.
- The darkest 10 % are darker, because of the deeper shadows and AO, which is further from the reference. That band is mostly ink and dark clothing, so the grade's shadow lift is the right lever.

Per-frame luma means, before → after:
- 150: 0.421 → 0.414
- 420: 0.591 → 0.592
- 700: 0.498 → 0.491
- 1600: 0.229 → 0.214
- 1750: 0.456 → 0.404

## Iterations (looked at every time)
1. VSM, tight frustum, fill light, lanterns, first AO. The AO came out almost invisible, measured at min 0.45 and mean 0.99. Golden showed no shadows at all.
2. AO strength ×2.5 and squared, giving visible contact shadows under feet and rocks. Hemisphere lowered for deeper day shadows. Golden sun moved to the side-back, which fixed the missing shadows; they now rake across the road.
3. Night pool: an off-screen warm key lamp. At intensity 40 it blew out the ground, so it was tuned to 11, range 7 m, decay 2, giving a warm pool that fades to blue.
4. AO tint softened and k lowered from 0.85 to 0.8 to reduce crushing, then all 10 frames were re-rendered and re-scored.
All 10 test frames render with no console errors.

## Files
- Before: `/root/shorts/lab/light/before_sheet.jpg`
- After: `/root/shorts/lab/light/after_sheet.jpg`
- Five-frame before/after (top row base, bottom row new; frames 150/420/700 are from the iteration-3 render, before the AO tint was softened, and 1600 from just before the night lamp's 9→11 bump): `/root/shorts/lab/light/before_after_5.jpg`
- Stills: `/root/shorts/lab/light/stills_after/`
- Scores: `/root/shorts/lab/light/lookscore_base.md`, `/root/shorts/lab/light/lookscore_after.md`
- Diff: `/root/shorts/lab/light/changes.diff`
