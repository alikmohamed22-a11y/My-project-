# ink: world ink and outline pass

## What I saw in the reference (crops in `study/z*.jpg`)
- **Weight.** Lines are about 1 px at 540 wide, so about 2–3 px at 1080. Silhouettes are a touch heavier than inner creases. Far arches and doors keep a thinner, lighter line (r18_8 corridor).
- **Colour.** Lines are not pure black. They are a very dark version of the local colour: dark maroon on red walls, dark green on trees, dark indigo on blue (sampled medians: r18_8 #851e11, r12_8 #4b2d15, r14_8 #111726).
- **Where they go.** Only geometry gets lines: silhouettes, box edges, trim, frames. Plank seams (r15_5) and rug or paving patterns are soft painted grooves, not ink. Background lines get blurred along with the depth of field.

## Changes (all in `web/main.js`)
1. **`inkPass` fragment shader, rewritten world-ink section**
   - **Silhouettes** come from the Laplacian of *inverse* depth, which is exactly zero on any plane in screen space. Flat ground at grazing angles therefore produces no noise lines. Only the near side of a depth step is inked, with a distance-adaptive threshold (`lo` 0.004→0.016 over 10–400 m).
   - **Creases** come from normal discontinuity, cos < 0.86→0.6. They read the nearest texel (`texelFetch`), which removed the false halo the linear filter made around every card.
   - **Weight.** Silhouette half-width is `inkR*(0.75…1.45)`, thinner with distance. Crease radius is `inkR*(0.4…0.62)`, so creases are thinner than silhouettes.
   - **Drawn feel.** A slow screen-space noise varies line weight by ±20% and opacity by ±5%.
   - **Distance fade.** Silhouettes drop to 65% opacity by 500 m. Creases fade sooner, to about 28% by 420 m. Everything fades out from 600 to 1400 m.
   - **DOF-aware width.** I added `focus` and `cInf` uniforms, set each frame from the camera. Lines on out-of-focus surfaces widen by 0.35× the circle of confusion (capped at 3 px), so they survive the later DOF blur as soft strokes.
   - **Colour.** Ink is now `#2b1d4a` (was #150f18), with 15% of a darkened local colour mixed in. Far lines lean further toward a darkened local colour.
   - **Debug view.** `?inkdbg` (`Q='?inkdbg'` for `render.mjs`) shows the raw ink mask.
2. **Normal/depth traverse in `renderFrame`**
   - **Crowd cards.** Any mesh with a map and `alphaTest >= 0.5` (the stadium crowd in `MASS`) is now drawn with `cardND`. Before, they were treated as plain quads and drew rectangle box lines across faces at frame 1300.
   - **FX billboards.** Billboards like the apple trees, barrel, dog and calendar are drawn with the new `fxND` material. It stamps the card marker without changing depth, using alpha-discard and blending that writes RGB only. Before, they were left out of the normal/depth pass, so fences and poles *behind* the orchard trees were inked straight through the trees (frame 700). Now the world behind them is masked, there is no double outline on their own ink, and DOF depth is unchanged.
3. The sky is still excluded (depth 1). Cards and FX get no world outline.

## Numbers (`lookscore.py`, the same 7 frames: 150, 420, 700, 1300, 1600, 1750, 1960)
| | ink coverage | outline darkness |
|---|---|---|
| base | 0.429 | 0.433 |
| ink (final) | 0.445 | 0.433 |
| reference | 0.604 | 0.410 |

Per-frame coverage, base → final:

| Frame | Base | Final |
|---|---|---|
| 150 | 0.48 | 0.43 |
| 420 | 0.58 | 0.61 |
| 700 | 0.33 | 0.38 |
| 1300 | 0.71 | 0.69 |
| 1600 | 0.29 | 0.28 |
| 1750 | 0.33 | 0.37 |
| 1960 | 0.29 | 0.35 |

Frames 150 and 1300 dropped slightly because false lines were removed: the crowd box lines, and the card halos where base drew thick black ink.

**Why coverage is still under the reference.** The `study/diag*.jpg` overlays mark uncovered colour edges in red. Nearly all of them are on **character card art and the FX apple-tree painter**. Their own ink is about 4–9 px at 1080, more than 2 px at 540, so the metric counts it as a blob rather than a line, and the edge just outside it reads as unlined. 3D world geometry is a small share of the edges in 700, 1600, 1750 and 1960. Raising that number needs thinner ink in `oddverra_next.js` and the `FX` painters (the character agent's area), not more world ink. Doubling an outline over cards was ruled out by the brief.

## Iterations
- out1: first detector. Card halos, lines too faint.
- dbg1/dbg2: raw ink masks. Fixed halos with nearest-texel creases, thickened silhouettes.
- out3: darker indigo ink.
- out4: gentler distance fade and threshold. Coverage scored here.
- out5 (final): DOF-aware width, less far tint. All 7 frames render with no errors.

## Paths
- **Before sheet:** `/root/shorts/lab/ink/study/sheet_before.jpg` (base stills), also `/root/shorts/lab/base/base_sheet.jpg`
- **After sheet:** `/root/shorts/lab/ink/study/sheet5.jpg` (stills in `/root/shorts/lab/ink/out5/`)
- **Zoom compares:** `study/ab150_5.jpg`, `study/ab1300.jpg`
- **Raw ink masks:** `study/dbg2.jpg`
- **Diff:** `/root/shorts/lab/ink/changes.diff`
