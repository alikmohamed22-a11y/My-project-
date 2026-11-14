# texture — hand-painted procedural textures and materials

## What changed and why (tied to the reference)
I cropped r3 (western street dirt), r15 (ship deck and wood wall), r10 (night plank floor) and r12. Their surfaces are **calm flat fills with a few structured, drawn marks**: plank seams, butt joints, nail dots, a few grain lines, ruts and the odd pebble. All of those marks are a darker shade of the base colour. None of the surfaces carry pixel noise. I rebuilt our painters on that principle.

- **New module `web/paint.js`** holds pure canvas painters that tile seamlessly. It has periodic value-noise fBm, a per-pixel `modulate`, and colour helpers. `shade()` darkens a colour and pushes it toward the ink colour `#2b1d4a`, so every texture line is an indigo-leaning darker shade of its base.
  - `dirt`: soft macro value and hue blotches and damp patches. It has darker edges where the road meets the grass and a lighter compacted crown. Two wheel ruts wobble along the road with broken drawn track lines. It also has outlined pebbles with a light catch (clustered at the edges), branching cracks, a few hoof divots, long low-contrast scuff strokes, and grass creeping in at the edges.
  - `grass`: large darker clumps with an olive hue shift, tufts drawn as tapered blade fans (mostly darker shade, some sunlit), and sparse wildflowers.
  - `planks`: individual planks with colour and hue variation, staggered butt joints, and wavy grain lines in each plank's own darker shade. It adds knots with grain rings, nail heads at the joints and joists, a worn lighter top edge, darker bevel and ends, seam gaps, and scratches.
  - `siding`: painted clapboard with a lap shadow line and a lip highlight, faint grain under the paint, end joints, peeling to bare wood, and weather streaks.
  - The module also has `shingles` (staggered courses with a cast shadow from the course above, chipped corners, and a rotate option), `brick`, and `stone`.
  - Three more painters: `metal` (soft broad and narrow highlight bands along u, brushed), `fabric` (weave, soft folds, optional stripes and stitched hem), and `barrel` (staves and iron hoops with rivets).
  - Finally `hay`, `bark`, `paper` (aged edges and mottling), and `inkWear` (a worn rubber-stamp look).
- **`web/main.js`**
  - **Toon gradient map:** the gradient is now a 4-step RGB map with deep shadow, shadow, a thin terminator band and lit. The shadow steps lean purple, for example shadow `(128,112,163)`, which keeps luma about 0.47, the same as the old 120/255 step. `THREE.ShaderChunk.gradientmap_pars_fragment` is patched to read `.rgb`.
  - **`macro(mat, amt, scale)`:** this `onBeforeCompile` patch adds world-space low-frequency value and warm/cool hue noise over the albedo. It is applied to the road and stadium dirt and grass, so 200×440 m planes no longer show repeats.
  - **`mkTex`:** anisotropy is now the renderer maximum, not a hard-coded 8. Canvases use `willReadFrequently`, so there are no console warnings.
  - **Repeat settings are physical:** a dirt tile spans exactly the road width and 12.8 m along it, so the ruts and dark edges line up with the road. A grass tile is 4 m.
  - **Painters rewritten:** `P.dirt`, `P.grass`, `P.boards`, `P.banner` (cloth weave, stitched hem, drop-shadowed lettering, soft edge falloff) and `P.doc` (paper, a rule, a fold crease, an inked and worn double-border BANNED stamp).
  - **New painters:** `P.siding`, `P.shingles`, `P.brick`, `P.stone`, `P.metal`, `P.fabric`, `P.barrel`, `P.hay`, `P.bark`.
  - **Call sites changed** (material swaps only, no geometry changes):
    - road: dirt and grass get macro; tree trunks get bark; roadside houses get siding with a shared shingle roof.
    - props: crates use 4 planks per tile; the barrel, the hay with twine, the striped table cloth and the metal cups get their new textures; the bunting uses 4 cached fabric materials instead of 108 flat ones.
    - town and farms: the distant town is brick and siding; farmhouses get siding; farm roofs and silo domes get rotated shingles.
    - stadium: grass and track get macro; the track has softer ruts; the stands are planks; the stand roofs are shingles.
    - office: the floor has 2 joints per plank; the walls are panel boards; the desk is planks.

## Measurements (lookscore, standard frames 150/420/700/1300/1830)
| | before | after |
|---|---|---|
| Texture detail, mean \|Lap\| in flat mid-tones (ref 0.0079) | 0.0100 (+0.86σ) | 0.0099 (+0.84σ) |
| per frame 420 / 700 | 0.0104 / 0.0111 | 0.0097 / 0.0104 |
| luma mean (ref 0.454) | 0.492 | 0.483 |
| overall distance | 0.48 | 0.47 |

The busiest version was iteration 2, at +0.94σ, because of pixel speckle. Following your note, I removed all pixel speckle and fine noise and kept only larger structured marks.

Control experiment: I rendered 420 and 700 with dirt and grass as **plain flat fills**. They scored 0.0096 and 0.0102, while the final textures score 0.0097 and 0.0104. So the ground textures now add almost nothing to the "too busy" score. The remaining +0.84σ comes from somewhere else: characters, cards, ink and post. It is not from the texture painters.

## Sheets and stills
- Before: `/root/shorts/lab/texture/before_sheet.jpg` (`before/`; frame 1830 rendered from the unchanged copy)
- After: `/root/shorts/lab/texture/after_sheet.jpg` (`after/`)
- Iterations: `it1_sheet.jpg` → `it4_sheet.jpg`. I rendered 4 iterations, adding frame 620 from it2 on.
- Texture swatches: `study/sw1.png` and `study/sw2.png`, made by `study/swatch.mjs`, which paints every texture in a grid.
- Reference crops: `study/crops.jpg`.
- Lookscore reports: `study/look_*.md`.

## Notes and risks for merging
- The call-site material swaps in the world build overlap with whoever owns the world. They are one-line `toon({ color })` → `toon({ map: P.x() })` changes.
- The `.rgb` gradient patch is global, so it also affects `char3d` when it is used with `?3d`.
- Cast-shadow regions still take only hemi light, so they are not tinted by the gradient. The purple there has to come from the light or grade agent.
- The office walls and floor are not visible in the standard frames, so I did not check them visually.
- Startup cost: generating all the textures adds about 1 s per page load.
- The render is clean: no page errors or console warnings.
